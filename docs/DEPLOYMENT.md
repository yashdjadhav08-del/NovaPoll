# Stellar Testnet Smart Contract Deployment Guide

This guide details how to deploy `novapoll-user` and `novapoll-poll` smart contracts to Stellar Testnet and configure cross-contract initialization.

---

## 🛠️ Automated Deployment Script

You can execute the automated deployment script included in the workspace:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📋 Manual Deployment Steps

### Step 1: Configure Testnet Network & Identity
```bash
stellar network add --global testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

stellar keys generate alice --network testnet
```

### Step 2: Build WASM Binaries
```bash
cargo build --target wasm32-unknown-unknown --release
```

### Step 3: Deploy User Contract
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/novapoll_user.wasm \
  --source alice \
  --network testnet
```
Save the returned Contract ID (e.g. `CB62ZFXP...`).

### Step 4: Deploy Poll Contract
```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/novapoll_poll.wasm \
  --source alice \
  --network testnet
```
Save the returned Contract ID (e.g. `CC72ZFXP...`).

### Step 5: Initialize Inter-Contract Connection
```bash
stellar contract invoke \
  --id <POLL_CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- \
  init \
  --admin <ALICE_ADDRESS> \
  --user_contract <USER_CONTRACT_ID>
```

### Step 6: Update Frontend Environment Variables
In `frontend/.env` or `frontend/src/utils/constants.ts`:
```env
VITE_USER_CONTRACT_ID=CB62ZFXP...
VITE_POLL_CONTRACT_ID=CC72ZFXP...
```
