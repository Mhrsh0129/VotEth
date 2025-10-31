const fs = require('fs');
const path = require('path');

// Script to manage contract addresses log

const logPath = path.join(__dirname, '..', 'contract-addresses.txt');

// Function to read all contract addresses
function getAllAddresses() {
  if (!fs.existsSync(logPath)) {
    console.log("❌ No contract addresses log file found.");
    return [];
  }
  
  const content = fs.readFileSync(logPath, 'utf8');
  const addresses = [];
  
  // Extract contract addresses using regex
  const matches = content.matchAll(/Contract Address: (0x[a-fA-F0-9]{40})/g);
  for (const match of matches) {
    addresses.push(match[1]);
  }
  
  return addresses;
}

// Function to get latest address
function getLatestAddress() {
  const addresses = getAllAddresses();
  return addresses.length > 0 ? addresses[addresses.length - 1] : null;
}

// Function to display all deployments
function displayAllDeployments() {
  if (!fs.existsSync(logPath)) {
    console.log("❌ No contract addresses log file found.");
    return;
  }
  
  const content = fs.readFileSync(logPath, 'utf8');
  console.log("\n" + "=".repeat(80));
  console.log("📜 ALL DEPLOYED CONTRACTS");
  console.log("=".repeat(80));
  console.log(content);
}

// Function to get deployment count
function getDeploymentCount() {
  return getAllAddresses().length;
}

// Function to export addresses as JSON
function exportAsJSON() {
  if (!fs.existsSync(logPath)) {
    console.log("❌ No contract addresses log file found.");
    return;
  }
  
  const content = fs.readFileSync(logPath, 'utf8');
  const deployments = [];
  
  // Split by separator
  const entries = content.split('='.repeat(80)).filter(e => e.trim());
  
  entries.forEach(entry => {
    const addressMatch = entry.match(/Contract Address: (0x[a-fA-F0-9]{40})/);
    const dateMatch = entry.match(/Deployment Date: (.+)/);
    const timestampMatch = entry.match(/Timestamp: (.+)/);
    const candidatesMatch = entry.match(/Candidates: (.+)/);
    const durationMatch = entry.match(/Voting Duration: (.+)/);
    const etherscanMatch = entry.match(/Etherscan: (.+)/);
    
    if (addressMatch) {
      deployments.push({
        address: addressMatch[1],
        deploymentDate: dateMatch ? dateMatch[1].trim() : null,
        timestamp: timestampMatch ? timestampMatch[1].trim() : null,
        candidates: candidatesMatch ? candidatesMatch[1].trim().split(', ') : [],
        duration: durationMatch ? durationMatch[1].trim() : null,
        etherscan: etherscanMatch ? etherscanMatch[1].trim() : null
      });
    }
  });
  
  const jsonPath = path.join(__dirname, '..', 'contract-addresses.json');
  fs.writeFileSync(jsonPath, JSON.stringify(deployments, null, 2));
  console.log(`\n✅ Exported ${deployments.length} deployments to contract-addresses.json`);
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'list':
  case 'all':
    displayAllDeployments();
    break;
    
  case 'latest':
    const latest = getLatestAddress();
    if (latest) {
      console.log("\n📍 Latest Contract Address:", latest);
    } else {
      console.log("\n❌ No deployments found.");
    }
    break;
    
  case 'count':
    const count = getDeploymentCount();
    console.log(`\n📊 Total Deployments: ${count}`);
    break;
    
  case 'addresses':
    const addresses = getAllAddresses();
    console.log("\n📋 All Contract Addresses:");
    addresses.forEach((addr, index) => {
      console.log(`${index + 1}. ${addr}`);
    });
    break;
    
  case 'export':
    exportAsJSON();
    break;
    
  case 'help':
  default:
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           CONTRACT ADDRESSES MANAGER                           ║
╚════════════════════════════════════════════════════════════════╝

Usage: node scripts/manage-addresses.js [command]

Commands:
  list, all       Show all deployments with full details
  latest          Show the most recent contract address
  count           Show total number of deployments
  addresses       Show only the contract addresses (numbered list)
  export          Export all deployments to JSON file
  help            Show this help message

Examples:
  node scripts/manage-addresses.js latest
  node scripts/manage-addresses.js list
  node scripts/manage-addresses.js export

File Location:
  ${logPath}
`);
    break;
}
