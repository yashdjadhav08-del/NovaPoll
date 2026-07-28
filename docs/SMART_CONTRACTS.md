# Soroban Smart Contract Documentation

NovaPoll implements two Soroban Rust smart contracts designed for performance, auditability, and inter-contract security.

---

## 📜 1. User Contract (`contracts/user`)

### Function Signatures

#### `register_user`
```rust
pub fn register_user(
    env: Env,
    user: Address,
    username: String,
    bio: String,
    profile_image_url: String,
) -> Result<UserProfile, UserError>
```
Registers a new user profile. Requires authorization from `user`. Returns `UserError::AlreadyRegistered` if key exists.

#### `update_profile`
```rust
pub fn update_profile(
    env: Env,
    user: Address,
    username: String,
    bio: String,
    profile_image_url: String,
) -> Result<UserProfile, UserError>
```
Updates profile details for an existing user.

#### `get_user`
```rust
pub fn get_user(env: Env, user: Address) -> Result<UserProfile, UserError>
```
Returns profile data or `UserError::UserNotFound`.

#### `user_exists`
```rust
pub fn user_exists(env: Env, user: Address) -> bool
```
Cross-contract query entrypoint returning true if user is registered.

---

## 📜 2. Poll Contract (`contracts/poll`)

### Function Signatures

#### `init`
```rust
pub fn init(env: Env, admin: Address, user_contract: Address) -> Result<(), PollError>
```
Initializes Poll contract instance with Admin address and User Contract address.

#### `create_poll`
```rust
pub fn create_poll(
    env: Env,
    creator: Address,
    title: String,
    description: String,
    category: u32,
    options: Vec<String>,
    end_time: u64,
) -> Result<u32, PollError>
```
Cross-calls `UserContract::user_exists(&creator)`. If false, returns `PollError::UserNotRegistered`.

#### `vote`
```rust
pub fn vote(
    env: Env,
    voter: Address,
    poll_id: u32,
    option_index: u32,
) -> Result<PollResults, PollError>
```
Enforces:
1. User registration check via User Contract cross-call.
2. Active status & expiration check.
3. One-vote-per-wallet lock (`PollDataKey::Voted(poll_id, voter)`).
4. Automatic leading winner update.

---

## 🚨 Custom Contract Errors

| Error Code | Enum Variant | Description |
|---|---|---|
| `1` | `NotInitialized` | Contract init function has not been executed |
| `2` | `UserNotRegistered` | Creator or voter is not registered in User contract |
| `3` | `AlreadyVoted` | Wallet has already submitted a vote on this poll |
| `4` | `PollClosed` | Poll status is closed or expired |
| `5` | `PollExpired` | Provided end_time is in the past |
| `6` | `InvalidOptions` | Options count must be between 2 and 6 |
| `7` | `Unauthorized` | Caller lacks creator or admin permissions |
| `8` | `PollNotFound` | Specified poll_id does not exist |
| `9` | `ActivePollCannotBeDeleted` | Active polls with cast votes cannot be deleted |
