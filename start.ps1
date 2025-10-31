# Voting DApp - Automatic Startup Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  VOTING DAPP - AUTOMATIC STARTUP" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Compile contracts
Write-Host ""
Write-Host "🔨 Compiling smart contracts..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to compile contracts" -ForegroundColor Red
    exit 1
}

# Deploy and update
Write-Host ""
Write-Host "🚀 Deploying contract and updating addresses..." -ForegroundColor Yellow
npx hardhat run scripts/deploy-and-update.js --network sepolia
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy contract" -ForegroundColor Red
    exit 1
}

# Start server
Write-Host ""
Write-Host "▶️  Starting Express Server..." -ForegroundColor Yellow
Write-Host "------------------------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Server starting..." -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your application is running at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

node index.js
