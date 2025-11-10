let WALLET_CONNECTED = "";
let contractAddress = "0x38B18Ea22E36B4a6cAd43AB2c7a32FB68f4d50df"; // Default fallback
let currentElectionName = "Current Election"; // Track which election we're viewing
let configLoaded = false; // Track if config has been loaded

// ========================================
// THEME SWITCHING FUNCTIONALITY
// ========================================
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  body.classList.toggle('light-theme');
  
  // Update icon and text
  if (body.classList.contains('light-theme')) {
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Light';
    localStorage.setItem('theme', 'light');
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Dark';
    localStorage.setItem('theme', 'dark');
  }
}

// Load saved theme preference on page load
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Light';
  } else {
    // Dark theme (default or explicitly saved)
    body.classList.remove('light-theme');
    if (themeIcon) themeIcon.textContent = '🌙';
    if (themeText) themeText.textContent = 'Dark';
  }
}

// Load theme as soon as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSavedTheme);
} else {
  loadSavedTheme();
}

// Load contract address from config.json
async function loadConfig() {
  try {
    // Add cache-busting timestamp to prevent browser caching
    const cacheBuster = new Date().getTime();
    const response = await fetch(`/config.json?v=${cacheBuster}`);
    const config = await response.json();
    contractAddress = config.contractAddress;
    configLoaded = true;
    console.log("✅ Loaded contract address from config:", contractAddress);
    console.log("📅 Config last updated:", config.lastUpdated);
    
    // Update contract address display if element exists
    const fullEl = document.getElementById("fullContractAddress");
    if (fullEl) fullEl.textContent = contractAddress;
    
    return config;
  } catch (error) {
    console.warn("⚠️ Failed to load config.json, using fallback address:", error);
    configLoaded = true; // Mark as loaded even if failed, to not block operations
    return null;
  }
}

// Initialize app - load config then update UI
async function initializeApp() {
  await loadConfig();
}
// Call initialization on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Network configuration
const SEPOLIA_CHAIN_ID = 11155111; // Sepolia testnet
const NETWORK_NAME = "Sepolia";

// Check if user is on correct network
const checkNetwork = async() => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      alert(`⚠️ Wrong Network!\n\nPlease switch to ${NETWORK_NAME} testnet in MetaMask.\n\nCurrent: ${network.name}\nRequired: ${NETWORK_NAME}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Network check failed:", err);
    return false;
  }
};

let contractAbi = [
    {
      "inputs": [
        {
          "internalType": "string[]",
          "name": "_candidateNames",
          "type": "string[]"
        },
        {
          "internalType": "uint256",
          "name": "_durationInMinutes",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        }
      ],
      "name": "addCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "candidates",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "voteCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVotesOfCandidates",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "voteCount",
              "type": "uint256"
            }
          ],
          "internalType": "struct Voting.Candidate[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRemainingTime",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getVotingStatus",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_candidateIndex",
          "type": "uint256"
        }
      ],
      "name": "vote",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "voters",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingEnd",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "votingStart",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

// Load saved elections from localStorage
const getSavedElections = () => {
  const saved = localStorage.getItem('savedElections');
  return saved ? JSON.parse(saved) : [];
};

// Save election to localStorage
const saveElection = (address, name) => {
  const elections = getSavedElections();
  // Check if already exists
  const exists = elections.find(e => e.address.toLowerCase() === address.toLowerCase());
  if (!exists) {
    elections.unshift({ address, name, timestamp: Date.now() });
    // Keep only last 20 elections
    if (elections.length > 20) elections.pop();
    localStorage.setItem('savedElections', JSON.stringify(elections));
  }
};

// Switch to a different contract address
const switchContract = async(newAddress, electionName = "Previous Election") => {
  if (!ethers.utils.isAddress(newAddress)) {
    alert("Invalid contract address!");
    return;
  }
  
  contractAddress = newAddress;
  currentElectionName = electionName;
  
  // Save to history
  saveElection(newAddress, electionName);
  
  // Update UI to show which election
  updateElectionDisplay();
  
  // Refresh data if wallet is connected
  if (WALLET_CONNECTED) {
    try {
      const basicTable = document.getElementById("candidatesTable");
      if (basicTable) {
        await getCandidateNames();
        await voteStatus();
      } else {
        const resultsTableContainer = document.getElementById("resultsTableContainer");
        if (resultsTableContainer) {
          await checkAndDisplayResults();
        }
      }
    } catch (err) {
      console.error("Failed to load data for this contract:", err);
      alert("Failed to load election data. Make sure this is a valid Voting contract.");
    }
  }
};

// Update UI to show current election
const updateElectionDisplay = () => {
  const electionDisplay = document.getElementById("currentElectionDisplay");
  if (electionDisplay) {
    electionDisplay.innerHTML = `
      <strong>Election:</strong> ${currentElectionName}<br>
      <small>Contract: ${contractAddress.substring(0, 6)}...${contractAddress.substring(38)}</small>
    `;
    // If a dedicated full-address element exists (homepage), populate it as well
    const fullEl = document.getElementById('contractFullAddress');
    if (fullEl) fullEl.textContent = contractAddress;
  }
};

// Show saved elections modal
const showElectionsHistory = () => {
  const elections = getSavedElections();
  const modal = document.getElementById("electionsModal");
  const list = document.getElementById("electionsList");
  
  list.innerHTML = '';
  
  if (elections.length === 0) {
    list.innerHTML = '<p style="text-align: center; padding: 20px;">No saved elections yet.</p>';
  } else {
    elections.forEach((election, index) => {
      const item = document.createElement('div');
      item.className = 'election-item';
      const date = new Date(election.timestamp).toLocaleString();
      item.innerHTML = `
        <div>
          <strong>${election.name}</strong><br>
          <small>${election.address}</small><br>
          <small style="color: #999;">Added: ${date}</small>
        </div>
        <button onclick="loadElection('${election.address}', '${election.name}')" class="load-btn">Load</button>
      `;
      list.appendChild(item);
    });
  }
  
  modal.style.display = "block";
};

// Load a specific election
const loadElection = async(address, name) => {
  document.getElementById("electionsModal").style.display = "none";
  await switchContract(address, name);
  alert(`Switched to: ${name}`);
};

// Close modal
const closeModal = () => {
  document.getElementById("electionsModal").style.display = "none";
};

// Manual switch from input field
const switchContractManual = async() => {
  const input = document.getElementById("contractAddressInput");
  const address = input.value.trim();
  
  if (!address) {
    alert("❌ Please enter a contract address!");
    return;
  }
  
  // Validate Ethereum address format
  if (!ethers.utils.isAddress(address)) {
    alert("❌ Invalid Ethereum address format!\n\nPlease enter a valid address starting with '0x' followed by 40 hexadecimal characters.");
    return;
  }
  
  // Check if it's a contract (has code)
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const code = await provider.getCode(address);
    
    if (code === '0x') {
      alert("⚠️ This address has no contract code!\n\nPlease make sure you're using a deployed Voting contract address.");
      return;
    }
  } catch (err) {
    console.error("Contract validation error:", err);
    alert("⚠️ Could not verify contract. Proceeding anyway...");
  }
  
  const name = prompt("Enter a name for this election (optional):", "Previous Election");
  await switchContract(address, name || "Previous Election");
  input.value = ""; // Clear input
};

const connectMetamask = async() => {
    // Check network first
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return; // Stop if wrong network
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    WALLET_CONNECTED = await signer.getAddress();
    
    // Update UI notification
    updateWalletConnectionUI();
    
    // Update election display on connect
    updateElectionDisplay();

  // Auto-refresh candidates list on pages that have the table
  try {
    const basicTable = document.getElementById("candidatesTable");
    if (basicTable) {
      await getCandidateNames();
      // Start auto-updating voting status on homepage
      startVotingStatusUpdates();
    } else {
      const resultsTableContainer = document.getElementById("resultsTableContainer");
      if (resultsTableContainer) {
        await checkAndDisplayResults();
        startResultsUpdates();
      }
    }
  } catch (err) {
    console.error("Failed to auto-load candidates:", err);
  }
}

// Centralized UI update for wallet connection
const updateWalletConnectionUI = () => {
  const element = document.getElementById("metamasknotification");
  if (element) {
    if (WALLET_CONNECTED) {
      const truncated = WALLET_CONNECTED.substring(0, 6) + "..." + WALLET_CONNECTED.substring(38);
      element.textContent = "Metamask is connected " + truncated;
    } else {
      element.textContent = "";
    }
  }
};

const getCandidateNames = async() => {
  var p3 = document.getElementById("p3");
  
  // Wait for config to load
  if (!configLoaded) {
    await loadConfig();
  }
  
  if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
    try {
      p3.innerHTML = '⏳ Loading candidates<span class="spinner"></span>';
      p3.className = "loading-text";
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
      
      var candidates = await contractInstance.getAllVotesOfCandidates();
      var table = document.getElementById("candidatesTable");

      if (!table) {
        p3.innerHTML = "❌ Candidates table not found on this page.";
        p3.style.color = "red";
        return;
      }

      // Clear existing rows (except header)
      var rowCount = table.rows.length;
      for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
      }

      for (let i = 0; i < candidates.length; i++) {
        var row = table.insertRow();
        var idCell = row.insertCell();
        var nameCell = row.insertCell();

        idCell.innerHTML = i;
        nameCell.innerHTML = candidates[i].name;
      }

      p3.innerHTML = "✅ Candidates loaded successfully";
      p3.className = "success-text";
    } catch (err) {
      console.error("Error loading candidates:", err);
      p3.innerHTML = "❌ Failed to load candidates. Please refresh the page.";
      p3.className = "error-text";
    }
  }
  else {
    if (p3 && !p3.innerHTML) {
      p3.innerHTML = "⚠️ Connect MetaMask to view candidates";
      p3.style.color = "orange";
    }
  }
}

const addVote = async() => {
    // Wait for config to load
    if (!configLoaded) {
        await loadConfig();
    }
    
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        var candidateIndexInput = document.getElementById("vote");
        var cand = document.getElementById("cand");
        
        // Input validation
        const indexValue = candidateIndexInput.value.trim();
        
        if (indexValue === "") {
            cand.innerHTML = "❌ Please enter a candidate number";
            cand.style.color = "red";
            return;
        }
        
        const candidateIndex = parseInt(indexValue);
        
        if (isNaN(candidateIndex)) {
            cand.innerHTML = "❌ Please enter a valid number";
            cand.style.color = "red";
            return;
        }
        
        if (candidateIndex < 0) {
            cand.innerHTML = "❌ Candidate number must be 0 or greater";
            cand.style.color = "red";
            return;
        }
        
        // Check network before voting
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork) {
            cand.innerHTML = "❌ Please switch to Sepolia network";
            cand.style.color = "red";
            return;
        }
        
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
            
            cand.innerHTML = '⏳ Submitting vote<span class="spinner"></span>';
            cand.className = "loading-text";
            
            const tx = await contractInstance.vote(candidateIndex);
            
            cand.innerHTML = '⏳ Confirming transaction<span class="spinner"></span>';
            await tx.wait();
            
            cand.innerHTML = "✅ Vote successfully recorded!";
            cand.className = "success-text";
        } catch (err) {
            console.error("Voting error:", err);
            
            // Better error messages
            if (err.code === 4001) {
                cand.innerHTML = "❌ Transaction rejected by user";
            } else if (err.message.includes("already voted")) {
                cand.innerHTML = "❌ You have already voted!";
            } else if (err.message.includes("Voting is finished")) {
                cand.innerHTML = "❌ Voting period has ended";
            } else if (err.message.includes("Invalid candidate")) {
                cand.innerHTML = `❌ Invalid candidate number. Please choose 0-${await getMaxCandidateIndex()}`;
            } else {
                cand.innerHTML = "❌ Transaction failed. Please try again.";
            }
            cand.style.color = "red";
        }
    }
    else {
        var cand = document.getElementById("cand");
        if (cand) {
            cand.innerHTML = "❌ Please connect MetaMask first";
            cand.style.color = "red";
        }
    }
}

let votingStatusInterval = null;
let resultsInterval = null;

const stopVotingStatusUpdates = () => {
  if (votingStatusInterval) {
    clearInterval(votingStatusInterval);
    votingStatusInterval = null;
  }
};

const stopResultsUpdates = () => {
  if (resultsInterval) {
    clearInterval(resultsInterval);
    resultsInterval = null;
  }
};

const startVotingStatusUpdates = async () => {
  // Clean any previous interval before starting a new one
  stopVotingStatusUpdates();

  // Update immediately with error isolation
  try {
    await voteStatus();
  } catch (err) {
    console.error('Initial voteStatus update failed:', err);
  }

  // Then update every 5 seconds with error isolation
  votingStatusInterval = setInterval(async () => {
    try {
      await voteStatus();
    } catch (err) {
      console.error('voteStatus interval update failed:', err);
    }
  }, 5000);
};

// Cleanup on navigation/unload/background
if (typeof window !== 'undefined') {
  // Consolidated cleanup handler for all intervals
  const cleanupAllIntervals = () => {
    stopVotingStatusUpdates();
    stopResultsUpdates();
  };
  
  window.addEventListener('beforeunload', cleanupAllIntervals);
  window.addEventListener('pagehide', cleanupAllIntervals);
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    try {
      if (document.hidden) {
        // Page moved to background — stop updates
        stopVotingStatusUpdates();
      } else {
        // Page returned to foreground — restart only on voting (homepage) where candidates table exists
        const basicTable = typeof document !== 'undefined' ? document.getElementById('candidatesTable') : null;
        if (basicTable) {
          startVotingStatusUpdates();
        }
        const resultsTableContainer = typeof document !== 'undefined' ? document.getElementById('resultsTableContainer') : null;
        if (resultsTableContainer) {
          startResultsUpdates();
        }
        // Refresh election display if present
        updateElectionDisplay();
      }
    } catch (err) {
      console.error('visibilitychange handler error:', err);
    }
  });
}

// Ensure the current election/contract is shown as soon as the page loads
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    try { 
      updateElectionDisplay();
      
      // Auto-load candidates and status on homepage without requiring MetaMask first
      const basicTable = document.getElementById('candidatesTable');
      const statusEl = document.getElementById('status');
      
      if (basicTable && statusEl) {
        // Homepage detected - try to load data if user already connected before
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({ method: 'eth_accounts' })
            .then(async accounts => {
              if (accounts && accounts.length > 0) {
                // User is already connected - reuse proper connection flow
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                WALLET_CONNECTED = await signer.getAddress();
                
                // Use centralized UI update for consistency
                updateWalletConnectionUI();
                
                // Load data
                try {
                  await getCandidateNames();
                  await startVotingStatusUpdates();
                  console.log('Auto-connected to wallet:', WALLET_CONNECTED);
                } catch (err) {
                  console.error('Auto-load data failed:', err);
                }
              }
            })
            .catch(err => {
              console.log('No prior wallet connection:', err);
              // Optionally show a subtle hint to connect
              const notificationEl = document.getElementById('metamasknotification');
              if (notificationEl && !notificationEl.innerHTML) {
                notificationEl.innerHTML = 'Click "Connect Metamask" to get started';
              }
            });
        }
      }
    } catch (e) {
      console.error('Page load initialization error:', e);
    }
  });
}

const startResultsUpdates = async () => {
  // Clean previous interval
  stopResultsUpdates();

  try {
    await checkAndDisplayResults();
  } catch (err) {
    console.error('Initial results update failed:', err);
  }

  resultsInterval = setInterval(async () => {
    try {
      await checkAndDisplayResults();
    } catch (err) {
      console.error('Results interval update failed:', err);
    }
  }, 5000);
};

const checkAndDisplayResults = async() => {
    var p3 = document.getElementById("p3");
    
    // Wait for config to load
    if (!configLoaded) {
        await loadConfig();
    }
    
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
            
            // Check voting status
            const currentStatus = await contractInstance.getVotingStatus();
            const votingOngoingMessage = document.getElementById("votingOngoingMessage");
            const resultsTableContainer = document.getElementById("resultsTableContainer");
            const showResultsBtn = document.getElementById("showResultsBtn");
            
            if (currentStatus) {
                // Voting is still ongoing
                votingOngoingMessage.classList.remove("hidden");
                resultsTableContainer.classList.add("hidden");
                if (p3) p3.innerHTML = "";
            } else {
                // Voting has ended, show results
                votingOngoingMessage.classList.add("hidden");
                resultsTableContainer.classList.remove("hidden");
                if (showResultsBtn) showResultsBtn.classList.add("hidden");
                await getAllCandidates();
            }
        } catch (err) {
            console.error("Error checking results:", err);
            if (p3) {
                p3.innerHTML = "❌ Failed to load results. Please refresh the page.";
                p3.style.color = "red";
            }
        }
    } else {
        if (p3) {
            p3.innerHTML = "⚠️ Please connect MetaMask first";
            p3.style.color = "orange";
        }
    }
}

const voteStatus = async() => {
    // Wait for config to load
    if (!configLoaded) {
        await loadConfig();
    }
    
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        var status = document.getElementById("status");
        var remainingTime = document.getElementById("time");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        const currentStatus = await contractInstance.getVotingStatus();
  const time = await contractInstance.getRemainingTime();
  console.log(time);
        status.innerHTML = currentStatus == 1 ? "Voting is currently open" : "Voting is finished";
  const seconds = Number(time.toString());
  remainingTime.innerHTML = `Remaining time is ${seconds} seconds`;
    }
    else {
        var status = document.getElementById("status");
        if (status && !status.innerHTML) {
            status.innerHTML = "Connect MetaMask to view voting status";
        }
    }
}

const getAllCandidates = async() => {
    // Wait for config to load
    if (!configLoaded) {
        await loadConfig();
    }
    
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        var p3 = document.getElementById("p3");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
        var candidates = await contractInstance.getAllVotesOfCandidates();
        console.log(candidates);
        var table = document.getElementById("myTable");

        // Clear existing rows (except header)
        var rowCount = table.rows.length;
        for (var i = rowCount - 1; i > 0; i--) {
            table.deleteRow(i);
        }

        for (let i = 0; i < candidates.length; i++) {
            var row = table.insertRow();
            var idCell = row.insertCell();
            var descCell = row.insertCell();
            var statusCell = row.insertCell();

            idCell.innerHTML = i;
            descCell.innerHTML = candidates[i].name;
            statusCell.innerHTML = candidates[i].voteCount.toString();
        }

        p3.innerHTML = "The tasks are updated"
    }
    else {
        var p3 = document.getElementById("p3");
        p3.innerHTML = "Please connect metamask first";
    }
}