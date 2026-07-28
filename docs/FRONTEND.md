# Frontend React & Web3 Architecture Document

NovaPoll frontend is built with React 18, TypeScript, Vite, Tailwind CSS, and `@stellar/freighter-api`.

---

## 🎨 Design System & Aesthetics
- **Theme**: Dark Web3 aesthetic (`#090D16` base background).
- **Gradients**: Custom HSL gradients (`from-brand-purple via-brand-pink to-brand-cyan`).
- **Glassmorphism**: Backdrop blur filters (`backdrop-blur-xl`), semi-transparent borders (`rgba(255,255,255,0.08)`).
- **Typography**: Inter Google font family with mono font numbers for ledger sequence.

---

## 🧩 React Contexts & Custom Hooks

1. **`WalletContext`**:
   - Manages Freighter connection state, public key address, network pass, on-chain user registration status, and profile info.

2. **`SorobanContext`**:
   - Fetches on-chain polls data, computes platform analytics (`totalVotes`, `activePolls`, `closedPolls`), monitors active ledger sequence, and handles live event stream updates.

3. **`usePolls`**:
   - Computes live search queries, category filters (Blockchain, Technology, AI, Gaming, Sports, Education, Business, General), and sorting tabs (Newest, Oldest, Most Votes, Trending, Active, Closed).

4. **`useSorobanEvents`**:
   - Subscribes to Soroban RPC `getEvents` for instant UI state invalidation without page refresh.
