require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const fileUpload = require('express-fileupload');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: '⚠️ Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

app.use(
    fileUpload({
        extended:true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const fs = require('fs');
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Load contract address from env or config.json
let CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
if (!CONTRACT_ADDRESS) {
    try {
        const config = require('./config.json');
        CONTRACT_ADDRESS = config.contractAddress;
        console.log('📋 Contract address loaded from config.json');
    } catch (e) {
        console.warn('⚠️ Failed to load config.json, using env variable');
    }
}

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// QR Code Generation
const { generateQRBuffer, generateQRDataURL } = require('./scripts/generate-qr');

// ==== Automatic Results Logger (saves when voting ends) ====
const LOG_PATH = path.join(__dirname, 'contract-addresses.txt');
let lastVotingActive = null;
let resultsSavedForThisContract = false;

function hasResultsLogged(address) {
    try {
        if (!fs.existsSync(LOG_PATH)) {
            console.log('[Results Logger] Log file does not exist yet');
            return false;
        }
        const content = fs.readFileSync(LOG_PATH, 'utf8');
        
        // Split by separator blocks to avoid cross-matching
        const blocks = content.split('='.repeat(80));
        
        // Look for a block that has BOTH "Results Date" AND the specific contract address
        const found = blocks.some(block => {
            const hasResultsDate = /Results Date:/i.test(block);
            const hasAddress = block.includes(address);
            return hasResultsDate && hasAddress;
        });
        
        console.log(`[Results Logger] Checked if results logged for ${address}: ${found}`);
        return found;
    } catch (err) {
        console.error('[Results Logger] Error checking log file:', err.message);
        return false;
    }
}

function appendResultsToLog(address, results, votingActive, winners) {
    const timestamp = new Date().toISOString();
    const localTime = new Date().toLocaleString();
    const resultsLines = results.map(r => ` - ${r.name}: ${r.voteCount}`).join('\n');
    const winnersLine = winners.length ? winners.map(w => `${w.name} (${w.voteCount})`).join(', ') : 'N/A';
    const block = `\n${'='.repeat(80)}\nResults Date: ${localTime}\nTimestamp: ${timestamp}\nContract Address: ${address}\nVoting Active: ${votingActive ? 'Yes' : 'No'}\nResults:\n${resultsLines}\nWinners: ${winnersLine}\n${'='.repeat(80)}\n`;
    fs.appendFileSync(LOG_PATH, block);
    console.log('✅ Election results appended to contract-addresses.txt');
}

async function fetchResults(address) {
    const readOnly = new ethers.Contract(address, abi, provider);
    const [candidates, votingActive] = await Promise.all([
        readOnly.getAllVotesOfCandidates(),
        readOnly.getVotingStatus()
    ]);
    const parsed = candidates.map(c => ({ name: c.name, voteCount: Number(c.voteCount.toString()) }));
    const maxVotes = parsed.reduce((m, c) => Math.max(m, c.voteCount), 0);
    const winners = parsed.filter(c => c.voteCount === maxVotes && maxVotes > 0);
    return { results: parsed, votingActive, winners };
}

async function checkVotingAndMaybeSave() {
    try {
        console.log(`[Results Logger] Checking voting status for ${CONTRACT_ADDRESS}...`);
        const status = await contractInstance.getVotingStatus();
        console.log(`[Results Logger] Current status: ${status ? 'ACTIVE' : 'ENDED'}, Last status: ${lastVotingActive === null ? 'UNKNOWN' : (lastVotingActive ? 'ACTIVE' : 'ENDED')}`);

        // Initialize flags on first run
        if (lastVotingActive === null) {
            console.log('[Results Logger] First run - initializing...');
            lastVotingActive = status;
            // If already ended on startup, mark from log to avoid duplicate writes
            resultsSavedForThisContract = hasResultsLogged(CONTRACT_ADDRESS);
            console.log(`[Results Logger] Results already logged: ${resultsSavedForThisContract}`);
            if (!status && !resultsSavedForThisContract) {
                console.log('[Results Logger] Voting already ended and not logged - saving results now...');
                const { results, votingActive, winners } = await fetchResults(CONTRACT_ADDRESS);
                appendResultsToLog(CONTRACT_ADDRESS, results, votingActive, winners);
                resultsSavedForThisContract = true;
            }
            return;
        }

        // Transition from active -> ended
        if (lastVotingActive === true && status === false && !resultsSavedForThisContract) {
            console.log('[Results Logger] 🎉 Voting just ended! Saving results...');
            const { results, votingActive, winners } = await fetchResults(CONTRACT_ADDRESS);
            appendResultsToLog(CONTRACT_ADDRESS, results, votingActive, winners);
            resultsSavedForThisContract = true;
        } else if (lastVotingActive === false && status === false && !resultsSavedForThisContract) {
            console.log('[Results Logger] ⚠️ Voting already ended but results not saved yet - saving now...');
            const { results, votingActive, winners } = await fetchResults(CONTRACT_ADDRESS);
            appendResultsToLog(CONTRACT_ADDRESS, results, votingActive, winners);
            resultsSavedForThisContract = true;
        }

        // Update last known state
        lastVotingActive = status;
    } catch (err) {
        console.error('❌ Automatic results logger error:', err.message || err);
        console.error('Full error:', err);
    }
}

// Start a 10s poller to detect end of voting and save results once
setInterval(checkVotingAndMaybeSave, 10_000);
// Also run once shortly after boot
setTimeout(() => {
    console.log('[Results Logger] Starting initial check in 3 seconds...');
    checkVotingAndMaybeSave();
}, 3_000);

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

// ==== QR Code Generation Endpoints ====

/**
 * Generate QR code for current election
 * GET /api/qr/generate?election=<name>
 */
app.get("/api/qr/generate", async (req, res) => {
    try {
        const electionName = req.query.election || 'Current Election';
        const baseUrl = req.query.baseUrl || 'https://vot-eth.vercel.app';
        
        const votingUrl = `${baseUrl}?contract=${CONTRACT_ADDRESS}&election=${encodeURIComponent(electionName)}`;
        
        const qrBuffer = await generateQRBuffer(votingUrl);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `inline; filename="qr_${electionName.replace(/[^a-z0-9]/gi, '_')}.png"`);
        res.send(qrBuffer);
        
        console.log(`✅ QR code generated for: ${electionName}`);
    } catch (error) {
        console.error("Error generating QR code:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate QR code as data URL (base64) for inline display
 * GET /api/qr/data?contract=<address>&election=<name>
 */
app.get("/api/qr/data", async (req, res) => {
    try {
        const contractAddress = req.query.contract || CONTRACT_ADDRESS;
        const electionName = req.query.election || 'Election';
        const baseUrl = req.query.baseUrl || 'https://vot-eth.vercel.app';
        
        // Validate contract address
        if (!contractAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
            return res.status(400).json({ error: 'Invalid contract address format' });
        }
        
        const votingUrl = `${baseUrl}?contract=${contractAddress}&election=${encodeURIComponent(electionName)}`;
        
        const dataUrl = await generateQRDataURL(votingUrl);
        
        res.json({ 
            success: true,
            dataUrl,
            votingUrl,
            electionName,
            contractAddress
        });
        
        console.log(`✅ QR data URL generated for: ${electionName}`);
    } catch (error) {
        console.error("Error generating QR data URL:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, function () {
    console.log("=".repeat(80));
    console.log("🚀 Voting DApp Server Started");
    console.log("=".repeat(80));
    console.log(`📡 Server listening on: http://localhost:${port}`);
    console.log(`📝 Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`🔍 Automatic results logger: ENABLED (checking every 10 seconds)`);
    console.log("=".repeat(80));
});