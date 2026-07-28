#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum UserError {
    AlreadyRegistered = 1,
    UserNotFound = 2,
    InvalidUsername = 3,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct UserProfile {
    pub wallet_address: Address,
    pub username: String,
    pub bio: String,
    pub profile_image_url: String,
    pub joined_at: u64,
    pub polls_created: u32,
    pub votes_cast: u32,
}

#[contracttype]
pub enum UserDataKey {
    User(Address),
}

#[contract]
pub struct UserContract;

#[contractimpl]
impl UserContract {
    /// Registers a new user profile on-chain.
    pub fn register_user(
        env: Env,
        user: Address,
        username: String,
        bio: String,
        profile_image_url: String,
    ) -> Result<UserProfile, UserError> {
        user.require_auth();

        let key = UserDataKey::User(user.clone());
        if env.storage().persistent().has(&key) {
            return Err(UserError::AlreadyRegistered);
        }

        if username.is_empty() || username.len() > 32 {
            return Err(UserError::InvalidUsername);
        }

        let now = env.ledger().timestamp();
        let profile = UserProfile {
            wallet_address: user.clone(),
            username,
            bio,
            profile_image_url,
            joined_at: now,
            polls_created: 0,
            votes_cast: 0,
        };

        env.storage().persistent().set(&key, &profile);

        // Emit Soroban Event
        env.events()
            .publish((symbol_short!("user"), symbol_short!("register")), user);

        Ok(profile)
    }

    /// Updates an existing user profile.
    pub fn update_profile(
        env: Env,
        user: Address,
        username: String,
        bio: String,
        profile_image_url: String,
    ) -> Result<UserProfile, UserError> {
        user.require_auth();

        let key = UserDataKey::User(user.clone());
        let mut profile: UserProfile = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(UserError::UserNotFound)?;

        if username.is_empty() || username.len() > 32 {
            return Err(UserError::InvalidUsername);
        }

        profile.username = username;
        profile.bio = bio;
        profile.profile_image_url = profile_image_url;

        env.storage().persistent().set(&key, &profile);

        // Emit Soroban Event
        env.events()
            .publish((symbol_short!("user"), symbol_short!("updated")), user);

        Ok(profile)
    }

    /// Retrieves profile for given user address.
    pub fn get_user(env: Env, user: Address) -> Result<UserProfile, UserError> {
        let key = UserDataKey::User(user);
        env.storage()
            .persistent()
            .get(&key)
            .ok_or(UserError::UserNotFound)
    }

    /// Deletes a user profile.
    pub fn delete_user(env: Env, user: Address) -> Result<(), UserError> {
        user.require_auth();

        let key = UserDataKey::User(user.clone());
        if !env.storage().persistent().has(&key) {
            return Err(UserError::UserNotFound);
        }

        env.storage().persistent().remove(&key);

        // Emit Soroban Event
        env.events()
            .publish((symbol_short!("user"), symbol_short!("deleted")), user);

        Ok(())
    }

    /// Checks if a user is registered.
    pub fn user_exists(env: Env, user: Address) -> bool {
        let key = UserDataKey::User(user);
        env.storage().persistent().has(&key)
    }

    /// Increments polls created counter for a user profile.
    pub fn increment_polls_created(env: Env, user: Address) -> Result<(), UserError> {
        let key = UserDataKey::User(user);
        let mut profile: UserProfile = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(UserError::UserNotFound)?;

        profile.polls_created += 1;
        env.storage().persistent().set(&key, &profile);
        Ok(())
    }

    /// Increments votes cast counter for a user profile.
    pub fn increment_votes_cast(env: Env, user: Address) -> Result<(), UserError> {
        let key = UserDataKey::User(user);
        let mut profile: UserProfile = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(UserError::UserNotFound)?;

        profile.votes_cast += 1;
        env.storage().persistent().set(&key, &profile);
        Ok(())
    }
}

#[cfg(test)]
mod test;
