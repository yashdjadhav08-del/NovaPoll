# Installation & Local Setup Guide

Follow this guide to install prerequisites and run NovaPoll locally.

---

## 🛠️ System Prerequisites

1. **Rust & Cargo**:
   - Install Rust via [rustup.rs](https://rustup.rs).
   - Add WASM compilation target:
     ```bash
     rustup target add wasm32-unknown-unknown
     ```

2. **Node.js & npm**:
   - Install Node.js (v18.0 or higher).

3. **Stellar CLI**:
   - Install `stellar-cli` for deploying contracts:
     ```bash
     cargo install --locked stellar-cli --features opt
     ```

4. **Freighter Wallet Extension**:
   - Install Freighter from [freighter.app](https://www.freighter.app/).
   - Set network to **Testnet** in Freighter settings.
   - Fund your testnet wallet using [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet).

---

## 🚀 Step-by-Step Local Setup

### 1. Clone Repository & Install Dependencies
```bash
# Navigate to workspace
cd d:\project

# Install frontend packages
cd frontend
npm install
```

### 2. Compile Soroban Contracts
```bash
# Run tests
cargo test

# Build WASM binaries
cargo build --target wasm32-unknown-unknown --release
```

### 3. Launch Development Server
```bash
cd frontend
npm run dev
```

App will be available at `http://localhost:3000`.
