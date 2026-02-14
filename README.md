# 🗳️ VotEth — Decentralized Voting with Face Verification

**VotEth** is a decentralized voting application that combines the security and transparency of the **Ethereum Blockchain** with the identity assurance of **AI-Powered Face Verification**, solving the "one person, one vote" problem without centralized KYC.

---

## 🌟 Key Features

- **Blockchain Core** — All votes recorded on **Ethereum Sepolia Testnet**, immutable and tamper-proof
- **Smart Access Control** — Role-based admin, election manager, and voter roles via OpenZeppelin
- **Face Verification Gate** — AI-powered identity verification with liveness detection to prevent spoofing
- **Privacy Preserving** — Stores mathematical face embeddings, not actual photos
- **Real-Time Analytics** — Live vote counts, election status, and results dashboard
- **Multi-Language** — English and Hindi (extensible)
- **Dark/Light Themes** — Toggle between themes
- **MetaMask Integration** — Seamless wallet connection

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Smart Contract** | Solidity 0.8.20, OpenZeppelin (AccessControl, Pausable, ReentrancyGuard, ECDSA) |
| **Development** | Hardhat, Ethers.js v5 |
| **AI Backend** | Python, FastAPI, InsightFace (buffalo_l), ONNX Runtime, SQLite |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Server** | Node.js, Express |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+)
- **Python** (v3.10+)
- **MetaMask** browser extension
- **Sepolia ETH** (testnet faucet: [sepoliafaucet.com](https://sepoliafaucet.com))

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Mhrsh0129/voting-dapp-sepolia.git
   cd voting-dapp-sepolia
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your keys (see .env.example for details)
   ```

3. **Start Everything**

   **Windows:**
   ```bash
   start.bat
   ```

   **Any OS:**
   ```bash
   node start.js
   ```

   The startup script will:
   - Install dependencies
   - Compile smart contracts
   - Prompt for election duration
   - Deploy the contract to Sepolia
   - Start the face verification service (port 8000)
   - Start the web server (port 3000)

4. **Access the App**
   - **Voting App**: [http://localhost:3000](http://localhost:3000)
   - **Face Enrollment**: [http://localhost:8000/enroll.html](http://localhost:8000/enroll.html)
   - **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📖 How to Use

### 1️⃣ Enroll Your Face (One-Time)
1. Go to the **Enrollment Page**
2. Enter your **Wallet Address**
3. Capture your face via webcam
4. Success — you are now a verified voter

### 2️⃣ Cast Your Vote
1. Go to the **Main App**
2. Connect your **MetaMask Wallet**
3. Click **"Verify Face"** — the system scans and matches your face
4. Once verified, select a candidate and click **"Vote"**
5. Confirm the transaction in MetaMask

### 3️⃣ View Results
- Once the election timer ends, results are automatically tallied
- Visit the **Results** page or verify on [Sepolia Etherscan](https://sepolia.etherscan.io)

---

## 🧪 Testing

Run the contract test suite (34 tests):

```bash
npx hardhat test test/Voting.js --network hardhat
```

**Tests cover:** deployment, voting, voter registration, access control, pausing, face verification signatures, time management, candidate management, and results.

---

## 📂 Project Structure

```
VotEth/
├── contracts/
│   └── Voting.sol              # Main smart contract
├── scripts/
│   ├── deploy.js                # Simple deployment
│   └── deploy-and-update.js     # Full deployment + config update
├── test/
│   └── Voting.js                # Contract test suite (34 tests)
├── face-service/                # Python AI backend
│   ├── main.py                  # FastAPI application
│   ├── face_processor.py        # InsightFace logic
│   ├── liveness.py              # Anti-spoofing detection
│   ├── auth.py                  # JWT authentication
│   ├── config.py                # Service configuration
│   ├── models.py                # Database models
│   └── enroll.html              # Face enrollment UI
├── js/
│   ├── face-verification.js     # Frontend face verification
│   └── theme.js                 # Theme toggling
├── css/                         # Stylesheets
├── assets/                      # Images, QR codes, branding
├── index.html                   # Main voting page
├── ListVoters.html              # Results page
├── analytics.html               # Analytics dashboard
├── main.js                      # Frontend logic
├── index.js                     # Express backend server
├── start.js                     # Master startup script
├── start.bat                    # Windows quick start
├── hardhat.config.js            # Hardhat configuration
├── config.json                  # Deployed contract config
├── .env.example                 # Environment variable template
└── package.json                 # Node.js dependencies
```

---

## 🔐 Security

- **ECDSA Signature Verification** — Face service signs voter identity; contract verifies on-chain
- **Reentrancy Protection** — OpenZeppelin `ReentrancyGuard` on vote function
- **Pausable** — Admin can emergency-pause voting
- **Rate Limiting** — Both Express and FastAPI have rate limiters
- **Liveness Detection** — Prevents photo/video spoofing attacks
- **Encrypted Embeddings** — Face data encrypted at rest

---

## ⚙️ Configuration

Key environment variables (see `.env.example`):

| Variable | Description |
|----------|------------|
| `API_URL` | Sepolia RPC URL (Alchemy/Infura) |
| `PRIVATE_KEY` | Deployer wallet private key |
| `SIGNER_PRIVATE_KEY` | Face verification signer key |
| `JWT_SECRET_KEY` | JWT token signing secret |
| `DB_ENCRYPTION_KEY` | Face embedding encryption key |

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
