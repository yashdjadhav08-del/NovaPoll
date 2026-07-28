# 🚀 NovaPoll

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Rust](https://img.shields.io/badge/Rust-Soroban-000000?style=for-the-badge&logo=rust)
![Stellar](https://img.shields.io/badge/Stellar-Soroban_Testnet-14B8A6?style=for-the-badge&logo=stellar)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

NovaPoll is a decentralized polling and governance platform built on the **Stellar Soroban Smart Contract Platform**. It enables users to create, discover, vote on, and close community governance polls securely using blockchain technology and Freighter Wallet integration, ensuring transparent, tamper-proof, fast, and low-cost on-chain polling.

---

## 🌐 Live Demo & Smart Contracts

- **Live Application Link**: [https://frontend-chi-cyan-kcgbz3wiwy.vercel.app](https://frontend-chi-cyan-kcgbz3wiwy.vercel.app)
- **GitHub Repository**: [https://github.com/yashdjadhav08-del/NovaPoll](https://github.com/yashdjadhav08-del/NovaPoll)

### 📜 Contract Deployment Addresses & Transaction Hashes

| Smart Contract / Resource | Address / Hash |
|---|---|
| **User Profile Contract ID** | `CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR` |
| **Poll Governance Contract ID** | `CAEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQTD2L` |
| **Contract Interaction Tx Hash** | `e2a48b9c1d0f5e3a8c7b6a4d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f` |
| **Stellar Testnet RPC** | `https://soroban-testnet.stellar.org` |
| **Stellar Explorer** | [https://stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |

---

## 🎥 Demo Video

Watch Here (1–2 Minutes):  
👉 [https://drive.google.com/file/d/1Dpf37Atd3y0BDSgG7txaX9o8-lQ9-24V/view?usp=sharing](https://drive.google.com/file/d/1Dpf37Atd3y0BDSgG7txaX9o8-lQ9-24V/view?usp=sharing)

---

## ✨ Features

- 🔐 **Freighter & Mobile Wallet Integration**: Connect seamlessly using Freighter Browser Extension on Desktop or Mobile Web Wallet adapter on smartphones.
- 🌍 **Explore Crowdfunding & Governance Polls**: Discover active, trending, and finalized community polls across multiple categories.
- 🚀 **Create New On-Chain Polls**: Launch custom multi-option polls stored directly on Soroban WASM smart contracts.
- 🗳️ **Cast Tamper-Proof On-Chain Votes**: Vote securely with one-vote-per-wallet enforcement and real-time ledger verification.
- 🏆 **Community Leaderboard**: Track top poll authors, active voters, and governance reputation scores.
- 📊 **Per-Account Dashboard**: View your created polls, voting history, active vs closed poll filters, and user profile settings.
- 📡 **Live Blockchain Event Stream**: Persistent real-time audit feed recording all on-chain poll creations, votes, profile updates, and closures.
- ⚡ **Powered by Stellar Soroban**: Sub-second ledger confirmation times with minimal gas fees on Testnet.
- 📱 **Fully Responsive UI**: Modern dark-mode glassmorphism design optimized for desktop, tablet, and mobile devices.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM v6

### Blockchain & Smart Contracts
- **Network**: Stellar Soroban Testnet
- **SDK**: `@stellar/stellar-sdk` v12
- **Wallet Provider**: Freighter Wallet (`@stellar/freighter-api`) & Mobile Adapter
- **Smart Contract Language**: Rust
- **Smart Contract Framework**: Soroban SDK (`soroban-sdk`)

---

## 📸 Screenshots

### 🏠 Home Page & Mobile Responsive UI
![Home Page Mobile Responsive](screenshots/home.png)

### 🌍 Explore & Browse Polls
![Explore Polls](screenshots/browse.png)

### 🚀 Create Soroban Community Poll
![Create Poll](screenshots/create.png)

### ⚙️ CI/CD Pipeline Running (GitHub Actions)
![CI CD Pipeline](screenshots/cicd.png)

### 🧪 Test Output (14 Passing Unit & Integration Tests)
![Test Output](screenshots/test_output.png)

---

## 📂 Project Structure

```text
NovaPoll/
│
├── contracts/
│   ├── poll/                  # Soroban Rust Smart Contract for Polls & Voting
│   │   ├── src/
│   │   │   ├── lib.rs         # Poll creation, voting, and closure logic
│   │   │   └── test.rs        # Contract unit & integration tests
│   │   └── Cargo.toml
│   │
│   └── user/                  # Soroban Rust Smart Contract for User Profiles
│       ├── src/
│       │   ├── lib.rs         # User registration & profile management logic
│       │   └── test.rs        # User contract unit tests
│       └── Cargo.toml
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, PollCard, LeaderboardTable, ActivityFeed, etc.
│   │   ├── contexts/          # SorobanContext, WalletContext
│   │   ├── pages/             # HomePage, BrowsePollsPage, PollDetailsPage, LeaderboardPage, etc.
│   │   ├── services/          # soroban.ts, freighter.ts, events.ts
│   │   ├── tests/             # Vitest frontend unit tests
│   │   ├── utils/             # constants.ts, formatters.ts
│   │   ├── index.css          # Tailwind CSS design system
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── screenshots/               # Application UI & CI/CD screenshots
│   ├── home.png
│   ├── browse.png
│   ├── create.png
│   ├── cicd.png
│   └── test_output.png
│
├── docs/                      # Architecture, Installation, API & Testing documentation
├── .github/workflows/         # GitHub Actions CI/CD Pipeline
├── deploy.sh                  # Soroban Testnet Contract Deployment Script
├── vercel.json
└── README.md
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yashdjadhav08-del/NovaPoll.git
```

### 2. Navigate to the project directory

```bash
cd NovaPoll/frontend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in your browser

```text
http://localhost:3000
```

---

## 🧪 Testing

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

### Smart Contract Tests (Rust)
```bash
cargo test --package novapoll-poll --package novapoll-user
```

---

## 👨‍💻 Author

**Yash Jadhav**

- GitHub: [@yashdjadhav08-del](https://github.com/yashdjadhav08-del)

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ **Star** on [GitHub](https://github.com/yashdjadhav08-del/NovaPoll)!