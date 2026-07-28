# Comprehensive Testing Guide

NovaPoll implements double-testing across both the smart contract layer (Rust Unit & Integration Tests) and the React frontend layer (Vitest + Testing Library).

---

## 🦀 1. Smart Contract Tests (`contracts/`)

### Running Rust Contract Tests
```bash
cargo test
```

### Covered Test Cases

#### User Contract (`contracts/user/src/test.rs`):
- `test_register_and_get_user`: Registers profile, validates storage persistence, checks `user_exists` returns true.
- `test_register_duplicate_fails`: Verifies that registering an already registered address returns `UserError::AlreadyRegistered`.
- `test_update_profile`: Ensures profile attributes (username, bio, avatar) update properly.
- `test_delete_user`: Ensures user deletion clears storage.
- `test_increment_counters`: Verifies `polls_created` and `votes_cast` increment as expected.

#### Poll Contract (`contracts/poll/src/test.rs`):
- `test_create_poll_unregistered_user_fails`: Inter-Contract Verification Test! Verifies that an unregistered wallet address fails with `PollError::UserNotRegistered`.
- `test_create_poll_registered_user_success`: Validates poll creation and verifies that User contract `polls_created` counter increments.
- `test_voting_and_one_vote_per_wallet_limit`: Tests vote recording and asserts that duplicate voting attempts return `PollError::AlreadyVoted`.
- `test_close_poll_and_winner_calculation`: Tests closing poll, automatic winner option calculation, and verifies voting on closed poll returns `PollError::PollClosed`.

---

## ⚛️ 2. Frontend Component & Unit Tests (`frontend/`)

### Running Frontend Vitest Tests
```bash
cd frontend
npm test
```

### Covered Test Cases
- `Validators.test.ts`: Zod schema rules for title length, minimum 2 options, duration range.
- `PollCard.test.tsx`: Component rendering of titles, percentages, category tags, and vote progress bars.
