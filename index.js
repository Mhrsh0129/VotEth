require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended:true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.post("/vote", async (req, res) => {
    try {
        const candidateIndex = req.body.candidateIndex;
        console.log("Voting for candidate index:", candidateIndex);
        
        const votingStatus = await contractInstance.getVotingStatus();
        if (!votingStatus) {
            return res.status(400).json({ error: "Voting is not active" });
        }
        
        const tx = await contractInstance.vote(candidateIndex);
        await tx.wait();
        
        res.json({ success: true, message: "Vote cast successfully", transactionHash: tx.hash });
    } catch (error) {
        console.error("Error voting:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/addCandidate", async (req, res) => {
    try {
        const candidateName = req.body.name;
        console.log("Adding candidate:", candidateName);
        
        const tx = await contractInstance.addCandidate(candidateName);
        await tx.wait();
        
        res.json({ success: true, message: "Candidate added successfully", transactionHash: tx.hash });
    } catch (error) {
        console.error("Error adding candidate:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/getCandidates", async (req, res) => {
    try {
        const candidates = await contractInstance.getAllVotesOfCandidates();
        const formattedCandidates = candidates.map((candidate, index) => ({
            index: index,
            name: candidate.name,
            voteCount: candidate.voteCount.toString()
        }));
        res.json({ candidates: formattedCandidates });
    } catch (error) {
        console.error("Error getting candidates:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/getVotingStatus", async (req, res) => {
    try {
        const status = await contractInstance.getVotingStatus();
        res.json({ votingActive: status });
    } catch (error) {
        console.error("Error getting voting status:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/getRemainingTime", async (req, res) => {
    try {
        const remainingTime = await contractInstance.getRemainingTime();
        res.json({ remainingTime: remainingTime.toString() });
    } catch (error) {
        console.error("Error getting remaining time:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, function () {
    console.log("App is listening on port 3000")
});