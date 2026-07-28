# API & Event Streaming Reference

This document details the Soroban RPC API calls and event streaming subscription topics used by NovaPoll.

---

## 📡 Soroban RPC Integration

NovaPoll interfaces directly with the official Stellar Testnet RPC endpoint:
`https://soroban-testnet.stellar.org`

### Simulated Read-Only Invocations
To fetch data without incurring gas costs or requesting wallet signatures, NovaPoll builds simulated read-only transactions:
- `get_user(Address)` -> Returns `UserProfile` struct
- `user_exists(Address)` -> Returns `bool`
- `get_all_polls()` -> Returns `Vec<Poll>`
- `get_poll(u32)` -> Returns `Poll` struct
- `get_results(u32)` -> Returns `PollResults` struct

---

## 🔔 Event Streaming Topics

NovaPoll frontend subscribes to Soroban contract event topics using RPC `getEvents`:

```json
{
  "filters": [
    {
      "type": "contract",
      "contractIds": ["USER_CONTRACT_ID", "POLL_CONTRACT_ID"]
    }
  ]
}
```

### Published Event Topics
1. `(symbol_short!("user"), symbol_short!("register"))`: Published when new profile registers.
2. `(symbol_short!("user"), symbol_short!("updated"))`: Published on profile updates.
3. `(symbol_short!("poll"), symbol_short!("create"))`: Published on new poll creation.
4. `(symbol_short!("poll"), symbol_short!("vote"))`: Published when a vote is recorded.
5. `(symbol_short!("poll"), symbol_short!("closed"))`: Published when poll closes.
6. `(symbol_short!("poll"), symbol_short!("winner"))`: Published with final calculated winner index.
