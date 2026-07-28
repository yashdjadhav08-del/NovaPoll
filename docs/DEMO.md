# NovaPoll Stellar Testnet Walkthrough & Demo Guide

Follow this step-by-step walkthrough to demonstrate NovaPoll's features on Stellar Testnet for Level 3 certification assessment.

---

## 🎯 Step-by-Step Demo Walkthrough

### Step 1: Connect Freighter Wallet
1. Open NovaPoll in your browser (`http://localhost:3000`).
2. Click **"Connect Freighter"** in the top right navigation bar.
3. Approve the connection request in the Freighter popup window.
4. Verify your truncated public key and the active **Stellar Testnet Ledger Sequence** appear in the header.

---

### Step 2: Register User Profile (Inter-Contract Prerequisite)
1. Navigate to **My Profile** via the user menu.
2. Enter your username (e.g., `Alice_Stellar`), bio, and avatar image URL.
3. Click **"Register On-Chain Profile"**.
4. Observe the **PendingTxModal** showing simulation -> wallet signature -> ledger confirmation.
5. Notice your profile now displays **"Verified On-Chain"** badge.

---

### Step 3: Create a Community Poll
1. Click **"Create Poll"** in the top navbar.
2. Fill in:
   - **Title**: *Should Stellar Soroban adopt EVM compatibility?*
   - **Description**: *Community referendum on adding optional EVM bytecode execution.*
   - **Category**: *Blockchain*
   - **Options**: *Option A: Yes, adopt EVM*, *Option B: No, remain pure Rust/WASM*.
3. Review the **Live Poll Card Preview** on the right side of the screen.
4. Click **"Publish Poll On-Chain"** and sign the transaction in Freighter.
5. The Poll Contract cross-calls the User Contract to verify your registration, stores the poll on-chain, and emits a `PollCreated` event.

---

### Step 4: Cast an On-Chain Vote & Observe Real-Time RPC Streaming
1. Navigate to **Browse Polls** or **Dashboard**.
2. Click **"Vote"** on your newly created poll.
3. Select an option and click **"Confirm Vote"**.
4. Sign the transaction in Freighter.
5. Observe:
   - Vote count increments immediately.
   - Animated progress bars adjust percentages automatically.
   - The **Live Blockchain Event Stream** ticker records the `VoteCast` event without refreshing the page!

---

### Step 5: Duplicate Voting Protection Test
1. Attempt to click **"Vote"** again on the same poll with the same wallet.
2. Notice the smart contract rejects the attempt, demonstrating the **One Vote Per Wallet** storage lock (`DataKey::Voted`).

---

### Step 6: Explore Dashboard Analytics & Leaderboard
1. Click **Dashboard** to view updated KPIs: Total Polls, Total Votes, Active Polls, and Closed Polls.
2. View the **Trending Poll Spotlight** highlighting top-voted proposals.
3. Check the **Community Leaderboard** tab to view top creators and voters with calculated reputation points.
