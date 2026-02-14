/**
 * Voting Contract — Comprehensive Test Suite
 * Tests: deployment, voting, access control, pausing, face verification, edge cases
 * 
 * Uses ethers v5 + vanilla Chai (no hardhat-chai-matchers)
 */

const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

/**
 * Helper: assert a transaction reverts with a specific reason string.
 * Works without @nomicfoundation/hardhat-chai-matchers.
 */
async function expectRevert(txPromise, reasonSubstring) {
    try {
        const tx = await txPromise;
        if (tx.wait) await tx.wait();
        throw new Error("Expected transaction to revert, but it succeeded");
    } catch (error) {
        if (error.message === "Expected transaction to revert, but it succeeded") {
            throw error;
        }
        // The revert reason can be in different places depending on the error type
        const errorMessage = error.message || "";
        if (reasonSubstring) {
            expect(errorMessage).to.include(reasonSubstring,
                `Expected revert with "${reasonSubstring}" but got: ${errorMessage.substring(0, 200)}`);
        }
    }
}

/**
 * Helper: assert a transaction succeeds (does not revert).
 */
async function expectSuccess(txPromise) {
    const tx = await txPromise;
    if (tx.wait) await tx.wait();
    return tx;
}

describe("Voting", function () {
    const CANDIDATES = ["Alice", "Bob", "Charlie"];
    const DURATION_MINUTES = 60; // 1 hour

    async function deployVotingFixture() {
        const [deployer, voter1, voter2, voter3, nonAdmin] = await ethers.getSigners();

        const Voting = await ethers.getContractFactory("Voting");
        const voting = await Voting.deploy(CANDIDATES, DURATION_MINUTES);
        await voting.deployed();

        const ADMIN_ROLE = await voting.ADMIN_ROLE();
        const ELECTION_MANAGER_ROLE = await voting.ELECTION_MANAGER_ROLE();

        return { voting, deployer, voter1, voter2, voter3, nonAdmin, ADMIN_ROLE, ELECTION_MANAGER_ROLE };
    }

    // Helper to deploy with face verification signer
    async function deployWithSignerFixture() {
        const { voting, deployer, voter1, voter2, voter3, nonAdmin, ADMIN_ROLE, ELECTION_MANAGER_ROLE } =
            await loadFixture(deployVotingFixture);

        // Create a dedicated signer wallet for face verification
        const signerWallet = ethers.Wallet.createRandom();

        // Set signer on contract
        await voting.setVerificationSigner(signerWallet.address);

        return { voting, deployer, voter1, voter2, voter3, nonAdmin, signerWallet, ADMIN_ROLE, ELECTION_MANAGER_ROLE };
    }

    // ==================== DEPLOYMENT ====================
    describe("Deployment", function () {
        it("Should deploy with correct number of candidates", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            const count = await voting.getCandidateCount();
            expect(count.toNumber()).to.equal(CANDIDATES.length);
        });

        it("Should set correct candidate names", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            const candidates = await voting.getAllVotesOfCandidates();
            for (let i = 0; i < CANDIDATES.length; i++) {
                expect(candidates[i].name).to.equal(CANDIDATES[i]);
                expect(candidates[i].voteCount.toNumber()).to.equal(0);
            }
        });

        it("Should set correct voting period", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            const start = await voting.votingStart();
            const end = await voting.votingEnd();
            expect(end.sub(start).toNumber()).to.equal(DURATION_MINUTES * 60);
        });

        it("Should grant all roles to deployer", async function () {
            const { voting, deployer, ADMIN_ROLE, ELECTION_MANAGER_ROLE } = await loadFixture(deployVotingFixture);
            expect(await voting.hasRole(ADMIN_ROLE, deployer.address)).to.be.true;
            expect(await voting.hasRole(ELECTION_MANAGER_ROLE, deployer.address)).to.be.true;
        });

        it("Should start with voting active", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            expect(await voting.getVotingStatus()).to.be.true;
        });

        it("Should start with zero total votes", async function () {
            const { voting } = await loadFixture(deployVotingFixture);
            expect((await voting.getTotalVotes()).toNumber()).to.equal(0);
        });
    });

    // ==================== VOTING ====================
    describe("Voting", function () {
        it("Should allow a valid vote", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            await expectSuccess(voting.connect(voter1).vote(0, "0x"));

            expect(await voting.hasVoted(voter1.address)).to.be.true;
            expect((await voting.getTotalVotes()).toNumber()).to.equal(1);

            const candidates = await voting.getAllVotesOfCandidates();
            expect(candidates[0].voteCount.toNumber()).to.equal(1);
        });

        it("Should reject double voting", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);
            await expectSuccess(voting.connect(voter1).vote(0, "0x"));

            await expectRevert(
                voting.connect(voter1).vote(1, "0x"),
                "You have already voted"
            );
        });

        it("Should reject invalid candidate index", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.connect(voter1).vote(99, "0x"),
                "Invalid candidate index"
            );
        });

        it("Should reject voting after period ends", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            // Fast-forward past voting end
            await time.increase(DURATION_MINUTES * 60 + 1);

            await expectRevert(
                voting.connect(voter1).vote(0, "0x"),
                "Voting is not active"
            );
        });

        it("Should allow multiple voters to vote for different candidates", async function () {
            const { voting, voter1, voter2, voter3 } = await loadFixture(deployVotingFixture);

            await expectSuccess(voting.connect(voter1).vote(0, "0x"));
            await expectSuccess(voting.connect(voter2).vote(1, "0x"));
            await expectSuccess(voting.connect(voter3).vote(0, "0x"));

            expect((await voting.getTotalVotes()).toNumber()).to.equal(3);

            const candidates = await voting.getAllVotesOfCandidates();
            expect(candidates[0].voteCount.toNumber()).to.equal(2); // Alice: 2 votes
            expect(candidates[1].voteCount.toNumber()).to.equal(1); // Bob: 1 vote
            expect(candidates[2].voteCount.toNumber()).to.equal(0); // Charlie: 0 votes
        });
    });

    // ==================== VOTER REGISTRATION ====================
    describe("Voter Registration", function () {
        it("Should block unregistered voters when registration is required", async function () {
            const { voting, deployer, voter1 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).enableVoterRegistration(true);

            await expectRevert(
                voting.connect(voter1).vote(0, "0x"),
                "You are not registered to vote"
            );
        });

        it("Should allow registered voters to vote", async function () {
            const { voting, deployer, voter1 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).enableVoterRegistration(true);
            await voting.connect(deployer).registerVoter(voter1.address);

            await expectSuccess(voting.connect(voter1).vote(0, "0x"));
        });

        it("Should register voters in batch", async function () {
            const { voting, deployer, voter1, voter2 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).registerVotersBatch([voter1.address, voter2.address]);

            expect(await voting.getVoterRegistrationStatus(voter1.address)).to.be.true;
            expect(await voting.getVoterRegistrationStatus(voter2.address)).to.be.true;
        });

        it("Should allow unregistering a voter", async function () {
            const { voting, deployer, voter1 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).registerVoter(voter1.address);
            await voting.connect(deployer).unregisterVoter(voter1.address);

            expect(await voting.getVoterRegistrationStatus(voter1.address)).to.be.false;
        });
    });

    // ==================== ACCESS CONTROL ====================
    describe("Access Control", function () {
        it("Should prevent non-admin from pausing", async function () {
            const { voting, nonAdmin } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.connect(nonAdmin).pauseVoting(),
                "Caller is not an admin"
            );
        });

        it("Should prevent non-manager from adding candidates", async function () {
            const { voting, nonAdmin } = await loadFixture(deployVotingFixture);

            // First end voting so addCandidate time check passes
            await time.increase(DURATION_MINUTES * 60 + 1);

            await expectRevert(
                voting.connect(nonAdmin).addCandidate("Dave"),
                "Caller is not an election manager"
            );
        });

        it("Should prevent non-admin from setting verification signer", async function () {
            const { voting, nonAdmin } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.connect(nonAdmin).setVerificationSigner(nonAdmin.address),
                "Caller is not an admin"
            );
        });

        it("Should prevent non-manager from registering voters", async function () {
            const { voting, nonAdmin, voter1 } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.connect(nonAdmin).registerVoter(voter1.address),
                "Caller is not an election manager"
            );
        });
    });

    // ==================== PAUSING ====================
    describe("Pausing", function () {
        it("Should block voting when paused", async function () {
            const { voting, deployer, voter1 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).pauseVoting();

            await expectRevert(
                voting.connect(voter1).vote(0, "0x"),
                "EnforcedPause"
            );
        });

        it("Should allow voting after unpause", async function () {
            const { voting, deployer, voter1 } = await loadFixture(deployVotingFixture);

            await voting.connect(deployer).pauseVoting();
            await voting.connect(deployer).unpauseVoting();

            await expectSuccess(voting.connect(voter1).vote(0, "0x"));
        });
    });

    // ==================== FACE VERIFICATION ====================
    describe("Face Verification Signatures", function () {
        it("Should require signature when signer is set", async function () {
            const { voting, voter1 } = await loadFixture(deployWithSignerFixture);

            // Empty signature should fail
            await expectRevert(
                voting.connect(voter1).vote(0, "0x"),
                "Face verification signature required"
            );
        });

        it("Should reject invalid signature", async function () {
            const { voting, voter1 } = await loadFixture(deployWithSignerFixture);

            // Random 65-byte signature — ECDSA.recover will throw before our require
            const fakeSignature = "0x" + "ab".repeat(65);

            await expectRevert(
                voting.connect(voter1).vote(0, fakeSignature),
                "ECDSAInvalidSignature"
            );
        });

        it("Should accept valid signature from authorized signer", async function () {
            const { voting, voter1, signerWallet } = await loadFixture(deployWithSignerFixture);

            // Reproduce the signing logic from face-service:
            // keccak256(abi.encodePacked(voterAddress))
            const messageHash = ethers.utils.solidityKeccak256(["address"], [voter1.address]);
            const messageBytes = ethers.utils.arrayify(messageHash);
            const signature = await signerWallet.signMessage(messageBytes);

            await expectSuccess(voting.connect(voter1).vote(0, signature));
            expect(await voting.hasVoted(voter1.address)).to.be.true;
        });

        it("Should reject signature meant for a different voter", async function () {
            const { voting, voter1, voter2, signerWallet } = await loadFixture(deployWithSignerFixture);

            // Sign for voter2's address
            const messageHash = ethers.utils.solidityKeccak256(["address"], [voter2.address]);
            const messageBytes = ethers.utils.arrayify(messageHash);
            const signature = await signerWallet.signMessage(messageBytes);

            // voter1 tries to use voter2's signature
            await expectRevert(
                voting.connect(voter1).vote(0, signature),
                "Invalid face verification signature"
            );
        });

        it("Should not require signature when signer is address(0)", async function () {
            const { voting, voter1 } = await loadFixture(deployVotingFixture);

            // Default: no signer set, empty sig works
            await expectSuccess(voting.connect(voter1).vote(0, "0x"));
        });
    });

    // ==================== TIME MANAGEMENT ====================
    describe("Time Management", function () {
        it("Should extend voting period", async function () {
            const { voting, deployer } = await loadFixture(deployVotingFixture);

            const endBefore = await voting.votingEnd();
            await voting.connect(deployer).extendVoting(30); // extend 30 min
            const endAfter = await voting.votingEnd();

            expect(endAfter.sub(endBefore).toNumber()).to.equal(30 * 60);
        });

        it("Should reject extending after voting ends", async function () {
            const { voting, deployer } = await loadFixture(deployVotingFixture);

            await time.increase(DURATION_MINUTES * 60 + 1);

            await expectRevert(
                voting.connect(deployer).extendVoting(30),
                "Voting has already ended"
            );
        });

        it("Should return 0 remaining time after voting ends", async function () {
            const { voting } = await loadFixture(deployVotingFixture);

            await time.increase(DURATION_MINUTES * 60 + 1);

            expect((await voting.getRemainingTime()).toNumber()).to.equal(0);
        });
    });

    // ==================== CANDIDATE MANAGEMENT ====================
    describe("Candidate Management", function () {
        it("Should prevent adding candidates during active voting", async function () {
            const { voting, deployer } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.connect(deployer).addCandidate("Dave"),
                "Cannot add candidates during active voting"
            );
        });

        it("Should allow adding candidates after voting ends", async function () {
            const { voting, deployer } = await loadFixture(deployVotingFixture);

            await time.increase(DURATION_MINUTES * 60 + 1);

            await expectSuccess(voting.connect(deployer).addCandidate("Dave"));

            expect((await voting.getCandidateCount()).toNumber()).to.equal(CANDIDATES.length + 1);
        });
    });

    // ==================== RESULTS ====================
    describe("Results", function () {
        it("Should return correct winner", async function () {
            const { voting, voter1, voter2, voter3 } = await loadFixture(deployVotingFixture);

            // Vote: Alice=2, Bob=1
            await expectSuccess(voting.connect(voter1).vote(0, "0x"));
            await expectSuccess(voting.connect(voter2).vote(0, "0x"));
            await expectSuccess(voting.connect(voter3).vote(1, "0x"));

            // End voting
            await time.increase(DURATION_MINUTES * 60 + 1);

            const result = await voting.getWinningCandidate();
            expect(result.winnerName).to.equal("Alice");
            expect(result.winnerVoteCount.toNumber()).to.equal(2);
        });

        it("Should revert getWinningCandidate during active voting", async function () {
            const { voting } = await loadFixture(deployVotingFixture);

            await expectRevert(
                voting.getWinningCandidate(),
                "Voting is still active"
            );
        });

        it("Should return false for voting status after period ends", async function () {
            const { voting } = await loadFixture(deployVotingFixture);

            await time.increase(DURATION_MINUTES * 60 + 1);

            expect(await voting.getVotingStatus()).to.be.false;
        });
    });
});
