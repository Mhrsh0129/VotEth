# VotEth — Decentralized Voting DApp (Sepolia)

VotEth is a simple, time-bound Ethereum voting dApp with a clean dark UI, MetaMask integration, and a Solidity smart contract deployed on Sepolia.

- Frontend: Vanilla HTML/CSS + Ethers.js (MetaMask)
- Smart contract: Solidity (Hardhat)
- Optional backend: Express.js helpers for admin tasks
- Network: Sepolia via Alchemy

**Live Site:** https://vot-eth.vercel.app

🚀 **Auto-Deploy:** Every deployment automatically pushes to GitHub and updates the live site via Vercel!

## Features

- Vote for a candidate by index (0-based)
- Read-only candidate list on homepage (index + name)
- Voting status + remaining time
- Admin-only: Add candidates outside the voting window (via code/CLI, not the UI)
- **NEW:** Access previous elections by contract address
- **NEW:** Election history management with localStorage
- **NEW:** Quick switch between multiple elections
- **NEW:** Automated startup script for deployment and server start
- **NEW:** Automatic contract address logging to text file
- **NEW:** Contract address management utilities
- **NEW:** Contract address shown on homepage
- **NEW:** Save election results to contract-addresses.txt
- **NEW:** Auto-push to GitHub after deployment (Vercel auto-deploy) 🚀

## Recent Updates

### 🌐 Vercel Integration & Auto-Deploy
- **Automatic GitHub Push:** Deployment script now auto-commits and pushes changes
- **Vercel Auto-Deploy:** Live site updates automatically when you deploy new elections
- **Auto-Launch Browser:** Opens https://vot-eth.vercel.app after deployment
- **Zero Manual Steps:** Just run `npm start` and your site updates everywhere!

### 🎯 Automated Startup System
- One-click deployment and server start
- Automatic contract address updates across all files

### 🗳️ Previous Elections Access
- Load and view any previous election by contract address
- Maintain history of up to 20 recent elections
- Easy switching between current and past elections

### 📝 Contract Address Logging
- Automatic logging of all deployed contract addresses
- Plain text file with complete deployment details
- Management utilities to view, list, and export addresses

### 📚 Complete Documentation
- All guides combined in one comprehensive document
- Development timeline with dates

## Project Structure

- `index.html` – Homepage: connect wallet, vote, see status, list candidates
- `ListVoters.html` – Results page: view voting results
- `main.js` – Frontend logic using Ethers + MetaMask
- `contracts/Voting.sol` – Smart contract (time-limited voting)
- `scripts/deploy.js` – Hardhat deploy script
- `index.js` – Optional Express server with helper endpoints (admin-only)
- `screenshots/` – Optional automated screenshots output (Puppeteer)
- `contract-addresses.txt` – Automatic log of all deployed contract addresses
- `scripts/manage-addresses.js` – Utility to manage contract addresses

## Pages

### 🗳️ Vote (index.html)
- Main voting interface
- Connect MetaMask
- Cast your vote
- View candidates
- Check voting status

### 📊 Results (ListVoters.html)
- View election results
- See vote counts
- Check if voting is ongoing
- Quick switch between elections

## Useful Commands

### Deployment & Server
```powershell
npm start                    # Auto-deploy and start server
npm run deploy              # Deploy contract only
npm run server              # Start server only
```

### Contract Address Management
```powershell
npm run addresses           # List all contract addresses
npm run addresses:latest    # Show latest address
npm run addresses:list      # Show all deployments with details
npm run addresses:export    # Export to JSON
```

### Save Election Results to Log
Append current or final results to `contract-addresses.txt` for a given contract.

```powershell
# Save results for the latest deployed contract
npm run results:save

# Save results for a specific address
npm run results:save:addr -- 0xYourContractAddressHere
```

Notes:
- If voting is still active, a snapshot of current counts will be saved.
- Results are appended as a separate block with timestamp and winners.

## Prerequisites

- Node.js 18+
- MetaMask installed in your browser
- Alchemy (or other) RPC URL for Sepolia
- A funded Sepolia account to deploy/execute admin txs

## Quick Start

### Automated Startup (Recommended)

Simply run one of these commands to automatically compile, deploy, and start the server:

```powershell
# Using the start script
npm start

# Or double-click start.bat
# Or run PowerShell script
.\start.ps1
```

This will automatically:
1. Install dependencies (if needed)
2. Compile smart contracts
3. Deploy to Sepolia network
4. Update contract addresses in all files
5. **Auto-commit and push to GitHub** 🆕
6. **Trigger Vercel auto-deployment** 🆕
7. Start the Express server
8. **Open live site in browser** 🆕

**New:** Changes are automatically pushed to GitHub, triggering Vercel to redeploy your live site at https://vot-eth.vercel.app with the new contract address!

### Manual Setup

1) Install dependencies

```powershell
npm install
```

2) Configure environment

- Copy `.env.example` to `.env` and fill values.
- Required variables:
  - `API_URL` – Sepolia RPC (e.g., Alchemy)
  - `PRIVATE_KEY` – Admin wallet private key (never commit)
  - `CONTRACT_ADDRESS` – Deployed Voting.sol address

3) Run the optional backend (for admin endpoints)

```powershell
node index.js
```

4) Open the frontend

- Open `index.html` in your browser (or serve statically)
- Click “Connect Metamask”, switch to Sepolia, and interact

Note: The frontend talks to the blockchain directly via MetaMask; the backend is optional and intended for admin helpers.

## Contract Deployment (Hardhat)

1) Configure Hardhat (network set to Sepolia) and `.env`
2) Deploy

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

3) Update `CONTRACT_ADDRESS` in `.env` and ensure `main.js` references it.

## Admin: Add Candidates (no UI)

Per your request, the frontend no longer exposes an add-candidate form. To add candidates:

- Use a Hardhat script/console to call `addCandidate(name)` outside the voting window, or
- Temporarily use the Express endpoint (`POST /addCandidate`) from `index.js` if desired.

Be sure to keep admin operations off the public UI.

## Branding

- Project Name: VotEth
- Logo: Add `assets/branding/logo.png` and reference it in README or HTML (optional)
- HTML Titles/Headers updated to VotEth

## Security Notes

- Do NOT commit your `.env` or private keys
- Verify the chain ID (Sepolia) in MetaMask before any transaction
- Contract only allows adding candidates before start or after end of voting

## Documentation

For complete documentation including:
- Detailed setup guides
- Feature walkthroughs
- Command reference
- Troubleshooting
- Best practices
- Development timeline

## Quick Troubleshooting

- Ethers.js not defined: ensure the CDN `<script>` is loaded before `main.js`
- Wrong network: switch MetaMask to Sepolia
- Contract address wrong: update `CONTRACT_ADDRESS` in `.env` and ensure `main.js`'s address matches

## License

This project is licensed under the MIT License. See `LICENSE` for full terms.

You are free to use, modify, distribute, and build upon this project. Contributions are welcome!

## Contributing

Contributions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Fork and build your own version

## Contact

- Maintainer: VotEth (Mhrsh0129)
- Issues/Questions: Open a GitHub Issue on the repository

See **[COMPLETE_DOCUMENTATION.md](COMPLETE_DOCUMENTATION.md)**
