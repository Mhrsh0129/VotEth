# VotEth — Decentralized Voting DApp (Sepolia)

VotEth is a simple, time-bound Ethereum voting dApp with a clean dark UI, MetaMask integration, and a Solidity smart contract deployed on Sepolia.

- Frontend: Vanilla HTML/CSS + Ethers.js (MetaMask)
- Smart contract: Solidity (Hardhat)
- Optional backend: Express.js helpers for admin tasks
- Network: Sepolia via Alchemy

Live site: https://app.voteth.xyz (GitHub Pages)

> Branding: This project is branded as VotEth. Add your logo at `assets/branding/logo.png` if desired, and I can wire it into the UI.

## Features

- Vote for a candidate by index (0-based)
- Read-only candidate list on homepage (index + name)
- Voting status + remaining time
- Admin-only: Add candidates outside the voting window (via code/CLI, not the UI)

## Project Structure

- `index.html` – Homepage: connect wallet, vote, see status, list candidates
- `ListVoters.html` – Read-only list page (admin UI removed as requested)
- `main.js` – Frontend logic using Ethers + MetaMask
- `contracts/Voting.sol` – Smart contract (time-limited voting)
- `scripts/deploy.js` – Hardhat deploy script
- `index.js` – Optional Express server with helper endpoints (admin-only)
- `screenshots/` – Optional automated screenshots output (Puppeteer)

## Prerequisites

- Node.js 18+
- MetaMask installed in your browser
- Alchemy (or other) RPC URL for Sepolia
- A funded Sepolia account to deploy/execute admin txs

## Quick Start

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

## Troubleshooting

- Ethers.js not defined: ensure the CDN `<script>` is loaded before `main.js`
- Wrong network: switch MetaMask to Sepolia
- Contract address wrong: update `CONTRACT_ADDRESS` in `.env` and ensure `main.js`’s address matches

## License

This project is provided under a custom “Permission-Required” license. See `LICENSE` for full terms.

Summary: You may view and clone this project for personal evaluation. Any use, modification, distribution, or commercial activity requires prior written permission from the Admin. Branding must be retained. No warranty.

## Contact / Permission Requests

- Admin: VotEth Admin (Mhrsh0129)
- Contact: Open a GitHub Issue on the repository

---

If you’d like, I can also wire GitHub Pages for the frontend (static host) while keeping admin endpoints private.
