let WALLET_CONNECTED = "";
let contractAddress = "0x272D16561CaB87f827907a43F43347d5c3817DCd";
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

const connectMetamask = async() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    WALLET_CONNECTED = await signer.getAddress();
    var element = document.getElementById("metamasknotification");
    element.innerHTML = "Metamask is connected " + WALLET_CONNECTED;

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
      }
    }
  } catch (err) {
    console.error("Failed to auto-load candidates:", err);
  }
}

const getCandidateNames = async() => {
  if(WALLET_CONNECTED != 0) {
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
    if (p3) p3.innerHTML = "Please connect metamask first";
  }
}

const addVote = async() => {
    if(WALLET_CONNECTED != 0) {
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
        var p3 = document.getElementById("p3");
        p3.innerHTML = "Please connect metamask first";
    }
}

let votingStatusInterval = null;

const startVotingStatusUpdates = async() => {
    // Update immediately
    await voteStatus();
    
    // Then update every 5 seconds
    if (votingStatusInterval) {
        clearInterval(votingStatusInterval);
    }
    
    votingStatusInterval = setInterval(async () => {
        await voteStatus();
    }, 5000); // Update every 5 seconds
}

const checkAndDisplayResults = async() => {
    if(WALLET_CONNECTED != 0) {
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
    if(WALLET_CONNECTED != 0) {
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
        remainingTime.innerHTML = `Remaining time is ${parseInt(time, 16)} seconds`;
    }
    else {
        var status = document.getElementById("status");
        status.innerHTML = "Please connect metamask first";
    }
}

const getAllCandidates = async() => {
    if(WALLET_CONNECTED != 0) {
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
            statusCell.innerHTML = candidates[i].voteCount;
        }

        p3.innerHTML = "The tasks are updated"
    }
    else {
        var p3 = document.getElementById("p3");
        p3.innerHTML = "Please connect metamask first";
    }
}