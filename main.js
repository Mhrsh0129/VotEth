let WALLET_CONNECTED = "";
let contractAddress = "0xeb40D8763B817E627BCe443BAE320a11D9Ab34A3";
let currentElectionName = "Current Election"; // Track which election we're viewing
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
    alert("Please enter a contract address!");
    return;
  }
  
  const name = prompt("Enter a name for this election (optional):", "Previous Election");
  await switchContract(address, name || "Previous Election");
  input.value = ""; // Clear input
};

const connectMetamask = async() => {
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
  if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
    var p3 = document.getElementById("p3");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
    p3.innerHTML = "Please wait, getting all the candidates from the voting smart contract";
    var candidates = await contractInstance.getAllVotesOfCandidates();
    var table = document.getElementById("candidatesTable");

    if (!table) {
      p3.innerHTML = "Candidates table not found on this page.";
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

    p3.innerHTML = "Candidates updated";
  }
  else {
    var p3 = document.getElementById("p3");
    if (p3 && !p3.innerHTML) p3.innerHTML = "Connect MetaMask to view candidates";
  }
}

const addVote = async() => {
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        var candidateIndex = document.getElementById("vote");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        var cand = document.getElementById("cand");
        cand.innerHTML = "Please wait, adding a vote in the smart contract";
        const tx = await contractInstance.vote(candidateIndex.value);
        await tx.wait();
        cand.innerHTML = "Vote added !!!";
    }
    else {
        var cand = document.getElementById("cand");
        cand.innerHTML = "Please connect MetaMask first";
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
    if(WALLET_CONNECTED && WALLET_CONNECTED !== "") {
        var p3 = document.getElementById("p3");
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
            p3.innerHTML = "";
        } else {
            // Voting has ended, show results
            votingOngoingMessage.classList.add("hidden");
            resultsTableContainer.classList.remove("hidden");
            if (showResultsBtn) showResultsBtn.classList.add("hidden");
            await getAllCandidates();
        }
    } else {
        var p3 = document.getElementById("p3");
        if (p3) p3.innerHTML = "Please connect metamask first";
    }
}

const voteStatus = async() => {
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