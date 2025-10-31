const fs = require('fs');
const path = require('path');

// Function to log contract address to history file
function logContractAddress(address, candidates, duration) {
  const logPath = path.join(__dirname, '..', 'contract-addresses.txt');
  const timestamp = new Date().toISOString();
  const localTime = new Date().toLocaleString();
  
  const logEntry = `
${'='.repeat(80)}
Deployment Date: ${localTime}
Timestamp: ${timestamp}
Contract Address: ${address}
Network: Sepolia
Candidates: ${candidates.join(', ')}
Voting Duration: ${duration} minutes
Etherscan: https://sepolia.etherscan.io/address/${address}
${'='.repeat(80)}
`;
  
  // Append to file (create if doesn't exist)
  fs.appendFileSync(logPath, logEntry);
  console.log("✅ Contract address logged to contract-addresses.txt");
}

async function main() {
  console.log("🚀 Starting deployment process...\n");
  
  // Deploy the contract
  const Voting = await ethers.getContractFactory("Voting");
  console.log("📝 Deploying Voting contract...");
  
  const candidates = ["BJP", "NDA", "AAP", "BSPA", "INC"];
  const duration = 2;
  
  const Voting_ = await Voting.deploy(candidates, duration);
  await Voting_.deployed();
  
  const contractAddress = Voting_.address;
  console.log("✅ Contract deployed to:", contractAddress);
  
  // Log contract address to history file
  logContractAddress(contractAddress, candidates, duration);
  
  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add CONTRACT_ADDRESS
    if (envContent.includes('CONTRACT_ADDRESS=')) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`);
    } else {
      envContent += `\nCONTRACT_ADDRESS=${contractAddress}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Updated .env file with new contract address");
  } else {
    console.log("⚠️  Warning: .env file not found");
  }
  
  // Update main.js file
  const mainJsPath = path.join(__dirname, '..', 'main.js');
  
  if (fs.existsSync(mainJsPath)) {
    let mainJsContent = fs.readFileSync(mainJsPath, 'utf8');
    
    // Update contractAddress variable
    mainJsContent = mainJsContent.replace(
      /let contractAddress = "0x[a-fA-F0-9]{40}";/,
      `let contractAddress = "${contractAddress}";`
    );
    
    fs.writeFileSync(mainJsPath, mainJsContent);
    console.log("✅ Updated main.js with new contract address");
  } else {
    console.log("⚠️  Warning: main.js file not found");
  }
  
  console.log("\n🎉 Deployment and update complete!");
  console.log("📍 Contract Address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
