const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Dynamic import for ESM module
let open;
(async () => {
  open = (await import('open')).default;
})();

console.log("=".repeat(60));
console.log("🎯 VOTING DAPP - AUTOMATIC STARTUP");
console.log("=".repeat(60));
console.log("");

// Function to run a command and wait for it to complete
function runCommand(command, args, cwd = __dirname) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️  Running: ${command} ${args.join(' ')}`);
    console.log("-".repeat(60));
    
    const child = spawn(command, args, {
      cwd: cwd,
      shell: true,
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
    
    child.on('error', (err) => {
      reject(err);
    });
  });
}

// Function to open URL in default browser (safe, no command injection)
async function openBrowser(url) {
  try {
    if (!open) {
      // If open is not loaded yet, load it dynamically
      open = (await import('open')).default;
    }
    await open(url);
  } catch (err) {
    console.log(`⚠️  Could not auto-open browser. Please visit: ${url}`);
    console.error('Error details:', err.message);
  }
}

// Function to start the server (doesn't wait)
function startServer() {
  return new Promise((resolve, reject) => {
    console.log("\n▶️  Starting Express Server...");
    console.log("-".repeat(60));
    
    const server = spawn('node', ['index.js'], {
      cwd: __dirname,
      shell: true,
      stdio: 'inherit'
    });
    
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      reject(err);
    });
    
    // Give server a moment to start, then open browser
    setTimeout(async () => {
      console.log("\n✅ Server started successfully!");
      console.log("\n🌐 Local: http://localhost:3000");
      console.log("🌐 Live:  https://vot-eth.vercel.app");
      console.log("\n📝 Press Ctrl+C to stop the server");
      console.log("=".repeat(60));
      
      // Auto-open live website in browser
      console.log("\n🚀 Opening live website in browser...");
      await openBrowser('https://vot-eth.vercel.app');
      
      resolve(server);
    }, 2000);
  });
}

// Main startup sequence
async function start() {
  try {
    // Step 1: Check if node_modules exists
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log("📦 Installing dependencies...");
      await runCommand('npm', ['install']);
    }
    
    // Step 2: Compile contracts
    console.log("\n🔨 Compiling smart contracts...");
    await runCommand('npx', ['hardhat', 'compile']);
    
    // Step 3: Deploy contract and update addresses
    console.log("\n🚀 Deploying contract and updating addresses...");
    await runCommand('npx', ['hardhat', 'run', 'scripts/deploy-and-update.js', '--network', 'sepolia']);
    
    // Step 4: Start the server
    await startServer();
    
  } catch (error) {
    console.error('\n❌ Startup failed:', error.message);
    process.exit(1);
  }
}

// Start the application
start();
