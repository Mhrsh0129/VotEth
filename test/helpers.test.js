/**
 * Frontend Helper Tests
 * Tests for pure utility functions used in main.js
 * Run with: npx hardhat test test/helpers.test.js --network hardhat
 */
const { expect } = require("chai");

describe("Frontend Helpers", function () {

    // ==========================================
    //  Contract ABI Completeness
    // ==========================================
    describe("Contract ABI", function () {
        let contractAbi;

        before(function () {
            // Load the ABI from the compiled artifact
            const artifact = require("../artifacts/contracts/Voting.sol/Voting.json");
            contractAbi = artifact.abi;
        });

        it("should contain the vote function", function () {
            const voteFn = contractAbi.find(
                (item) => item.type === "function" && item.name === "vote"
            );
            expect(voteFn).to.not.be.undefined;
            expect(voteFn.inputs).to.have.lengthOf(2); // candidateIndex + signature
        });

        it("should contain getAllVotesOfCandidates", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getAllVotesOfCandidates"
            );
            expect(fn).to.not.be.undefined;
            expect(fn.stateMutability).to.equal("view");
        });

        it("should contain getVotingStatus", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getVotingStatus"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain getRemainingTime", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getRemainingTime"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain addCandidate", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "addCandidate"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain getCandidateCount", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getCandidateCount"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain getWinningCandidate", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getWinningCandidate"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain getTotalVotes", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "getTotalVotes"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain setVerificationSigner", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "setVerificationSigner"
            );
            expect(fn).to.not.be.undefined;
        });

        it("should contain hasVoted", function () {
            const fn = contractAbi.find(
                (item) => item.type === "function" && item.name === "hasVoted"
            );
            expect(fn).to.not.be.undefined;
            expect(fn.inputs[0].internalType).to.equal("address");
        });
    });

    // ==========================================
    //  Address Validation
    // ==========================================
    describe("Address Validation", function () {
        it("should accept valid Ethereum addresses", function () {
            const validAddress = "0x1234567890abcdef1234567890abcdef12345678";
            expect(ethers.utils.isAddress(validAddress)).to.be.true;
        });

        it("should reject non-hex strings", function () {
            expect(ethers.utils.isAddress("not_an_address_at_all")).to.be.false;
        });

        it("should reject addresses that are too short", function () {
            expect(ethers.utils.isAddress("0x12345")).to.be.false;
        });

        it("should reject empty strings", function () {
            expect(ethers.utils.isAddress("")).to.be.false;
        });

        it("should accept checksum addresses", function () {
            // Valid EIP-55 checksum address
            const checksumAddress = ethers.utils.getAddress("0x1234567890abcdef1234567890abcdef12345678");
            expect(ethers.utils.isAddress(checksumAddress)).to.be.true;
        });
    });

    // ==========================================
    //  Candidate Input Validation
    // ==========================================
    describe("Candidate Input Validation", function () {
        // Replicates the validation logic from main.js addVote()
        function validateCandidateIndex(value) {
            if (value === "" || value === undefined || value === null) {
                return { valid: false, error: "Please enter a candidate number" };
            }
            const index = parseInt(value);
            if (isNaN(index)) {
                return { valid: false, error: "Please enter a valid number" };
            }
            if (index < 0) {
                return { valid: false, error: "Candidate number must be 0 or greater" };
            }
            return { valid: true, value: index };
        }

        it("should accept valid index 0", function () {
            const result = validateCandidateIndex("0");
            expect(result.valid).to.be.true;
            expect(result.value).to.equal(0);
        });

        it("should accept valid index 5", function () {
            const result = validateCandidateIndex("5");
            expect(result.valid).to.be.true;
            expect(result.value).to.equal(5);
        });

        it("should reject empty string", function () {
            expect(validateCandidateIndex("").valid).to.be.false;
        });

        it("should reject null", function () {
            expect(validateCandidateIndex(null).valid).to.be.false;
        });

        it("should reject non-numeric input", function () {
            expect(validateCandidateIndex("abc").valid).to.be.false;
        });

        it("should reject negative numbers", function () {
            expect(validateCandidateIndex("-1").valid).to.be.false;
        });

        it("should handle string with spaces", function () {
            const result = validateCandidateIndex(" 3 ");
            expect(result.valid).to.be.true;
            expect(result.value).to.equal(3);
        });
    });

    // ==========================================
    //  Candidate Name Validation (from index.js /addCandidate)
    // ==========================================
    describe("Candidate Name Validation", function () {
        // Replicates the regex from index.js
        const NAME_REGEX = /^[a-zA-Z0-9\s\-\.]+$/;

        function validateCandidateName(name) {
            if (!name || typeof name !== "string") {
                return { valid: false, error: "Name is required" };
            }
            const trimmed = name.trim();
            if (trimmed.length === 0 || trimmed.length > 100) {
                return { valid: false, error: "Name must be 1-100 characters" };
            }
            if (!NAME_REGEX.test(trimmed)) {
                return { valid: false, error: "Invalid characters" };
            }
            return { valid: true, value: trimmed };
        }

        it("should accept simple names", function () {
            expect(validateCandidateName("Alice").valid).to.be.true;
        });

        it("should accept names with spaces", function () {
            expect(validateCandidateName("John Doe").valid).to.be.true;
        });

        it("should accept names with hyphens", function () {
            expect(validateCandidateName("Mary-Jane").valid).to.be.true;
        });

        it("should accept names with periods", function () {
            expect(validateCandidateName("Dr. Smith").valid).to.be.true;
        });

        it("should reject empty strings", function () {
            expect(validateCandidateName("").valid).to.be.false;
        });

        it("should reject names with special characters", function () {
            expect(validateCandidateName("Alice<script>").valid).to.be.false;
        });

        it("should reject names over 100 characters", function () {
            expect(validateCandidateName("A".repeat(101)).valid).to.be.false;
        });

        it("should trim whitespace", function () {
            const result = validateCandidateName("  Bob  ");
            expect(result.valid).to.be.true;
            expect(result.value).to.equal("Bob");
        });
    });

    // ==========================================
    //  Election Storage Helpers (localStorage simulation)
    // ==========================================
    describe("Election Storage Helpers", function () {
        // Simulates getSavedElections / saveElection from main.js
        let storage = {};

        function getSavedElections() {
            const saved = storage["savedElections"];
            return saved ? JSON.parse(saved) : [];
        }

        function saveElection(address, name) {
            const elections = getSavedElections();
            const exists = elections.find(
                (e) => e.address.toLowerCase() === address.toLowerCase()
            );
            if (!exists) {
                elections.unshift({ address, name, timestamp: Date.now() });
                if (elections.length > 20) elections.pop();
                storage["savedElections"] = JSON.stringify(elections);
            }
        }

        beforeEach(function () {
            storage = {};
        });

        it("should return empty array when no elections saved", function () {
            expect(getSavedElections()).to.deep.equal([]);
        });

        it("should save and retrieve an election", function () {
            saveElection("0xabc123", "Test Election");
            const elections = getSavedElections();
            expect(elections).to.have.lengthOf(1);
            expect(elections[0].name).to.equal("Test Election");
        });

        it("should not duplicate elections with same address", function () {
            saveElection("0xabc123", "Election 1");
            saveElection("0xabc123", "Election 1 Again");
            expect(getSavedElections()).to.have.lengthOf(1);
        });

        it("should be case-insensitive for addresses", function () {
            saveElection("0xABC123", "Election A");
            saveElection("0xabc123", "Election B");
            expect(getSavedElections()).to.have.lengthOf(1);
        });

        it("should add newest elections first", function () {
            saveElection("0xaaa", "First");
            saveElection("0xbbb", "Second");
            const elections = getSavedElections();
            expect(elections[0].name).to.equal("Second");
        });

        it("should cap at 20 elections", function () {
            for (let i = 0; i < 25; i++) {
                saveElection(`0x${i.toString(16).padStart(40, "0")}`, `Election ${i}`);
            }
            expect(getSavedElections()).to.have.lengthOf(20);
        });
    });
});
