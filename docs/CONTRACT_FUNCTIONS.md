# NovaPoll — Contract Functions & Frontend Integration

This document maps every Soroban smart contract function to its corresponding frontend service call, demonstrating the complete contract–frontend integration.

---

## Smart Contract Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                       NovaPoll Frontend                        │
│                     (React + TypeScript)                       │
│                                                                │
│  WalletContext.tsx          soroban.ts          freighter.ts   │
│  ─────────────────          ──────────          ─────────────  │
│  connectWallet()     ──►   checkUserRegistered()               │
│  refreshProfile()    ──►   fetchUserProfile()                  │
│  connectWallet()     ──►   connectFreighterWallet()            │
│  disconnectWallet()  ──►   disconnectFreighterWallet()         │
└──────────────────────────────────┬─────────────────────────────┘
                                   │  Stellar RPC (simulateTransaction / sendTransaction)
                                   ▼
┌────────────────────────────────────────────────────────────────┐
│                    Stellar Soroban Testnet                      │
│                                                                │
│   ┌──────────────────────┐     ┌──────────────────────────┐   │
│   │   UserContract       │◄───►│    PollContract           │   │
│   │  (novapoll-user)     │     │   (novapoll-poll)         │   │
│   │                      │     │                           │   │
│   │  register_user()     │     │  init()                   │   │
│   │  update_profile()    │     │  create_poll()            │   │
│   │  get_user()          │     │  vote()                   │   │
│   │  user_exists() ◄─────┼─────│  (cross-contract check)  │   │
│   │  increment_polls ◄───┼─────│  create_poll() callback  │   │
│   │  increment_votes ◄───┼─────│  vote() callback         │   │
│   │  delete_user()       │     │  close_poll()             │   │
│   └──────────────────────┘     │  delete_poll()            │   │
│                                │  get_poll()               │   │
│                                │  get_all_polls()          │   │
│                                │  get_results()            │   │
│                                │  search_polls()           │   │
│                                │  get_trending_polls()     │   │
│                                └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## Wallet Connection Flow

| Step | Location | Function | Description |
|------|----------|----------|-------------|
| 1 | `Navbar.tsx` | `connectWallet()` button | User clicks "Connect Freighter" |
| 2 | `WalletContext.tsx` | `connectWallet()` | Calls `connectFreighterWallet()` |
| 3 | `freighter.ts` | `connectFreighterWallet()` | Calls `@stellar/freighter-api: getUserInfo()` |
| 4 | Freighter Extension | — | Extension prompts user to approve connection |
| 5 | `freighter.ts` | `checkFreighterAvailable()` | Returns `true` if extension is installed |
| 6 | `WalletContext.tsx` | `setAddress(pubKey)` | Stores wallet public key in React state |
| 7 | `WalletContext.tsx` | `refreshProfile()` | Triggers profile lookup after address is set |
| 8 | `soroban.ts` | `checkUserRegistered(address)` | Calls `UserContract::user_exists()` on-chain |
| 9 | `soroban.ts` | `fetchUserProfile(address)` | Calls `UserContract::get_user()` on-chain |
| 10 | `Navbar.tsx` | — | Wallet button changes to show username + address |

### Disconnect Flow

| Step | Location | Function | Description |
|------|----------|----------|-------------|
| 1 | `Navbar.tsx` | `disconnectWallet()` | User clicks "Disconnect Wallet" in dropdown |
| 2 | `WalletContext.tsx` | `disconnectWallet()` | Calls `disconnectFreighterWallet()` |
| 3 | `freighter.ts` | `disconnectFreighterWallet()` | Clears localStorage mobile wallet state |
| 4 | `WalletContext.tsx` | `setAddress(null)` | Clears all React wallet state |

---

## User Contract (`contracts/user/src/lib.rs`)

Contract ID: `CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR` (Testnet)

| Contract Function | Signature | Frontend Call | Frontend File |
|---|---|---|---|
| `register_user` | `(user: Address, username: String, bio: String, profile_image_url: String) -> Result<UserProfile, UserError>` | `registerUserProfile()` | `soroban.ts:L180` |
| `update_profile` | `(user: Address, username: String, bio: String, profile_image_url: String) -> Result<UserProfile, UserError>` | `updateUserProfile()` | `soroban.ts:L266` |
| `get_user` | `(user: Address) -> Result<UserProfile, UserError>` | `fetchUserProfile()` | `soroban.ts:L151` |
| `delete_user` | `(user: Address) -> Result<(), UserError>` | *(admin-only, contract CLI)* | — |
| `user_exists` | `(user: Address) -> bool` | `checkUserRegistered()` | `soroban.ts:L129` |
| `increment_polls_created` | `(user: Address) -> Result<(), UserError>` | *(cross-contract call from PollContract)* | `poll/lib.rs:L144` |
| `increment_votes_cast` | `(user: Address) -> Result<(), UserError>` | *(cross-contract call from PollContract)* | `poll/lib.rs:L157` |

### UserProfile Data Structure

```rust
pub struct UserProfile {
    pub wallet_address: Address,
    pub username: String,
    pub bio: String,
    pub profile_image_url: String,
    pub joined_at: u64,
    pub polls_created: u32,
    pub votes_cast: u32,
}
```

Matching TypeScript interface in `constants.ts`:
```typescript
export interface UserProfile {
  wallet_address: string;
  username: string;
  bio: string;
  profile_image_url: string;
  joined_at: number;
  polls_created: number;
  votes_cast: number;
}
```

---

## Poll Contract (`contracts/poll/src/lib.rs`)

Contract ID: `CAEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQTD2L` (Testnet)

| Contract Function | Signature | Frontend Call | Frontend File |
|---|---|---|---|
| `init` | `(admin: Address, user_contract: Address) -> Result<(), PollError>` | *(deploy script only)* | `deploy.sh:L41` |
| `create_poll` | `(creator: Address, title: String, description: String, category: u32, options: Vec<String>, end_time: u64) -> Result<u32, PollError>` | `createSorobanPoll()` | `soroban.ts:L433` |
| `vote` | `(voter: Address, poll_id: u32, option_index: u32) -> Result<PollResults, PollError>` | `voteSorobanPoll()` | `soroban.ts:L536` |
| `close_poll` | `(creator: Address, poll_id: u32) -> Result<PollResults, PollError>` | `closeSorobanPoll()` | `soroban.ts:L660` |
| `delete_poll` | `(creator: Address, poll_id: u32) -> Result<(), PollError>` | *(available via CLI)* | — |
| `get_poll` | `(poll_id: u32) -> Result<Poll, PollError>` | `fetchPollById()` | `soroban.ts:L428` |
| `get_all_polls` | `() -> Vec<Poll>` | `fetchAllPolls()` | `soroban.ts:L354` |
| `get_results` | `(poll_id: u32) -> Result<PollResults, PollError>` | *(embedded in PollDetailsPage)* | — |
| `search_polls` | `(query: String) -> Vec<Poll>` | *(BrowsePollsPage client-side search)* | — |
| `get_trending_polls` | `() -> Vec<Poll>` | *(embedded in fetchAllPolls)* | — |
| `set_user_contract` | `(admin: Address, user_contract: Address) -> Result<(), PollError>` | *(admin-only)* | — |

### Poll Data Structure

```rust
pub struct Poll {
    pub poll_id: u32,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub category: u32,
    pub options: Vec<String>,
    pub vote_counts: Vec<u32>,
    pub total_votes: u32,
    pub status: u32,      // 0 = Active, 1 = Closed
    pub created_at: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub winner: u32,      // Option index, or 9999 for no winner / tie
}
```

Matching TypeScript interface in `constants.ts`:
```typescript
export interface Poll {
  poll_id: number;
  creator: string;
  title: string;
  description: string;
  category: number;
  options: string[];
  vote_counts: number[];
  total_votes: number;
  status: number;
  created_at: number;
  start_time: number;
  end_time: number;
  winner: number;
}
```

---

## Cross-Contract Communication

The critical Level 3 feature — the PollContract directly calls the UserContract via Soroban inter-contract communication:

```rust
// contracts/poll/src/lib.rs — check_user_exists() helper

fn check_user_exists(env: &Env, user: &Address) -> Result<bool, PollError> {
    let user_contract: Address = env
        .storage()
        .instance()
        .get(&PollDataKey::UserContract)
        .ok_or(PollError::NotInitialized)?;

    // Cross-contract call: PollContract -> UserContract::user_exists()
    let exists: bool = env.invoke_contract(
        &user_contract,
        &Symbol::new(env, "user_exists"),
        vec![env, user.to_val()],
    );

    Ok(exists)
}
```

This `check_user_exists()` is called by both:
- `create_poll()` — only registered users can create polls
- `vote()` — only registered users can cast votes

Additionally, the PollContract notifies the UserContract to update stats:
- After `create_poll()` calls `UserContract::increment_polls_created(user)`
- After `vote()` calls `UserContract::increment_votes_cast(user)`

---

## Soroban Events Emitted

| Contract | Event | Topics | Data |
|---|---|---|---|
| PollContract | `poll:create` | `(poll_id, creator)` | on successful `create_poll()` |
| PollContract | `poll:vote` | `(poll_id, voter, option_index)` | on successful `vote()` |
| PollContract | `poll:closed` | `(poll_id, creator)` | on successful `close_poll()` |
| PollContract | `poll:winner` | `(poll_id, winner_index)` | on poll close with winner |
| PollContract | `poll:delete` | `(poll_id, creator)` | on successful `delete_poll()` |
| UserContract | `user:register` | `(user)` | on successful `register_user()` |
| UserContract | `user:updated` | `(user)` | on successful `update_profile()` |
| UserContract | `user:deleted` | `(user)` | on successful `delete_user()` |

These events are captured and displayed in the **Activity Feed** component (`ActivityFeed.tsx`) via `services/events.ts`.

---

## Error Codes

### PollError

| Code | Name | Trigger |
|------|------|---------|
| 1 | `NotInitialized` | Contract not yet initialized via `init()` |
| 2 | `UserNotRegistered` | Caller is not registered in UserContract |
| 3 | `AlreadyVoted` | User already voted on this poll |
| 4 | `PollClosed` | Poll status is 1 (Closed) |
| 5 | `PollExpired` | `end_time` is in the past |
| 6 | `InvalidOptions` | Options count < 2 or > 6 |
| 7 | `Unauthorized` | Caller is not creator or admin |
| 8 | `PollNotFound` | No poll found for given `poll_id` |
| 9 | `ActivePollCannotBeDeleted` | Active poll with votes cannot be deleted |
| 10 | `InvalidCategory` | Category index > 7 |
| 11 | `AlreadyInitialized` | `init()` called more than once |
| 12 | `InvalidOptionIndex` | `option_index` >= options count |

### UserError

| Code | Name | Trigger |
|------|------|---------|
| 1 | `AlreadyRegistered` | Wallet already has a profile |
| 2 | `UserNotFound` | No profile for given address |
| 3 | `InvalidUsername` | Username empty or > 32 chars |
