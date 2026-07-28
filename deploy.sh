#!/bin/bash
set -e

echo "===================================================="
echo "      NovaPoll Soroban Testnet Deployment Script    "
echo "===================================================="

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"

# Step 1: Build Soroban Contracts
echo "[1/4] Building release WASM binaries..."
cargo build --target wasm32-unknown-unknown --release

USER_WASM="target/wasm32-unknown-unknown/release/novapoll_user.wasm"
POLL_WASM="target/wasm32-unknown-unknown/release/novapoll_poll.wasm"

# Step 2: Deploy User Contract
echo "[2/4] Deploying User Contract to Stellar Testnet..."
USER_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$USER_WASM" \
  --source alice \
  --network "$NETWORK")

echo "User Contract Deployed: $USER_CONTRACT_ID"

# Step 3: Deploy Poll Contract
echo "[3/4] Deploying Poll Contract to Stellar Testnet..."
POLL_CONTRACT_ID=$(stellar contract deploy \
  --wasm "$POLL_WASM" \
  --source alice \
  --network "$NETWORK")

echo "Poll Contract Deployed: $POLL_CONTRACT_ID"

# Step 4: Initialize Poll Contract with User Contract Address
echo "[4/4] Initializing Poll contract cross-contract reference..."
ADMIN_ADDR=$(stellar keys address alice)

stellar contract invoke \
  --id "$POLL_CONTRACT_ID" \
  --source alice \
  --network "$NETWORK" \
  -- \
  init \
  --admin "$ADMIN_ADDR" \
  --user_contract "$USER_CONTRACT_ID"

echo "===================================================="
echo "Deployment Complete!"
echo "User Contract ID: $USER_CONTRACT_ID"
echo "Poll Contract ID: $POLL_CONTRACT_ID"
echo "===================================================="
