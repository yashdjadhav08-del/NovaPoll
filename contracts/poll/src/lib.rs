#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, vec, Address, Env, String,
    Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PollError {
    NotInitialized = 1,
    UserNotRegistered = 2,
    AlreadyVoted = 3,
    PollClosed = 4,
    PollExpired = 5,
    InvalidOptions = 6,
    Unauthorized = 7,
    PollNotFound = 8,
    ActivePollCannotBeDeleted = 9,
    InvalidCategory = 10,
    AlreadyInitialized = 11,
    InvalidOptionIndex = 12,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Poll {
    pub poll_id: u32,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub category: u32,
    pub options: Vec<String>,
    pub vote_counts: Vec<u32>,
    pub total_votes: u32,
    pub status: u32, // 0 = Active, 1 = Closed
    pub created_at: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub winner: u32, // Option index of winner, or 9999 if no winner/tie
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct PollResults {
    pub poll_id: u32,
    pub options: Vec<String>,
    pub vote_counts: Vec<u32>,
    pub total_votes: u32,
    pub winner: u32,
}

#[contracttype]
pub enum PollDataKey {
    Admin,
    UserContract,
    PollCount,
    Poll(u32),
    Voted(u32, Address),
}

#[contract]
pub struct PollContract;

#[contractimpl]
impl PollContract {
    /// Initializes the Poll contract with Admin and User Contract address.
    pub fn init(env: Env, admin: Address, user_contract: Address) -> Result<(), PollError> {
        if env.storage().instance().has(&PollDataKey::Admin) {
            return Err(PollError::AlreadyInitialized);
        }

        admin.require_auth();

        env.storage().instance().set(&PollDataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&PollDataKey::UserContract, &user_contract);
        env.storage().instance().set(&PollDataKey::PollCount, &0u32);

        Ok(())
    }

    /// Sets/updates the User Contract address for cross-contract authorization check.
    pub fn set_user_contract(
        env: Env,
        admin: Address,
        user_contract: Address,
    ) -> Result<(), PollError> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&PollDataKey::Admin)
            .ok_or(PollError::NotInitialized)?;

        if admin != stored_admin {
            return Err(PollError::Unauthorized);
        }

        admin.require_auth();

        env.storage()
            .instance()
            .set(&PollDataKey::UserContract, &user_contract);
        Ok(())
    }

    /// Gets the registered User Contract address.
    pub fn get_user_contract(env: Env) -> Result<Address, PollError> {
        env.storage()
            .instance()
            .get(&PollDataKey::UserContract)
            .ok_or(PollError::NotInitialized)
    }

    /// Helper to check if a user exists in the User Contract via Inter-Contract Communication.
    fn check_user_exists(env: &Env, user: &Address) -> Result<bool, PollError> {
        let user_contract: Address = env
            .storage()
            .instance()
            .get(&PollDataKey::UserContract)
            .ok_or(PollError::NotInitialized)?;

        // Cross-contract call to User Contract: user_exists(user)
        let exists: bool = env.invoke_contract(
            &user_contract,
            &Symbol::new(env, "user_exists"),
            vec![env, user.to_val()],
        );

        Ok(exists)
    }

    /// Helper to increment poll count in User Contract.
    fn notify_user_poll_created(env: &Env, user: &Address) {
        if let Some(user_contract) = env
            .storage()
            .instance()
            .get::<PollDataKey, Address>(&PollDataKey::UserContract)
        {
            env.invoke_contract::<()>(
                &user_contract,
                &Symbol::new(env, "increment_polls_created"),
                vec![env, user.to_val()],
            );
        }
    }

    /// Helper to increment vote count in User Contract.
    fn notify_user_vote_cast(env: &Env, user: &Address) {
        if let Some(user_contract) = env
            .storage()
            .instance()
            .get::<PollDataKey, Address>(&PollDataKey::UserContract)
        {
            env.invoke_contract::<()>(
                &user_contract,
                &Symbol::new(env, "increment_votes_cast"),
                vec![env, user.to_val()],
            );
        }
    }

    /// Creates a new poll. Checks registration via User Contract cross-call.
    pub fn create_poll(
        env: Env,
        creator: Address,
        title: String,
        description: String,
        category: u32,
        options: Vec<String>,
        end_time: u64,
    ) -> Result<u32, PollError> {
        creator.require_auth();

        // Level 3 Requirement: Inter-Contract Communication check!
        let is_registered = Self::check_user_exists(&env, &creator)?;
        if !is_registered {
            return Err(PollError::UserNotRegistered);
        }

        if options.len() < 2 || options.len() > 6 {
            return Err(PollError::InvalidOptions);
        }

        let now = env.ledger().timestamp();
        if end_time <= now {
            return Err(PollError::PollExpired);
        }

        if category > 7 {
            return Err(PollError::InvalidCategory);
        }

        let mut poll_count: u32 = env
            .storage()
            .instance()
            .get(&PollDataKey::PollCount)
            .unwrap_or(0);

        poll_count += 1;

        let mut vote_counts = Vec::new(&env);
        for _ in 0..options.len() {
            vote_counts.push_back(0);
        }

        let poll = Poll {
            poll_id: poll_count,
            creator: creator.clone(),
            title,
            description,
            category,
            options,
            vote_counts,
            total_votes: 0,
            status: 0, // Active
            created_at: now,
            start_time: now,
            end_time,
            winner: 9999,
        };

        env.storage()
            .persistent()
            .set(&PollDataKey::Poll(poll_count), &poll);
        env.storage()
            .instance()
            .set(&PollDataKey::PollCount, &poll_count);

        // Notify user contract
        Self::notify_user_poll_created(&env, &creator);

        // Emit Soroban Event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("create")),
            (poll_count, creator),
        );

        Ok(poll_count)
    }

    /// Updates poll details (only title/description, by creator).
    pub fn update_poll(
        env: Env,
        creator: Address,
        poll_id: u32,
        title: String,
        description: String,
    ) -> Result<Poll, PollError> {
        creator.require_auth();

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)?;

        if poll.creator != creator {
            return Err(PollError::Unauthorized);
        }

        if poll.status != 0 {
            return Err(PollError::PollClosed);
        }

        poll.title = title;
        poll.description = description;

        env.storage()
            .persistent()
            .set(&PollDataKey::Poll(poll_id), &poll);

        Ok(poll)
    }

    /// Casts a vote on a poll.
    pub fn vote(
        env: Env,
        voter: Address,
        poll_id: u32,
        option_index: u32,
    ) -> Result<PollResults, PollError> {
        voter.require_auth();

        // Level 3 Requirement: Inter-Contract Communication check!
        let is_registered = Self::check_user_exists(&env, &voter)?;
        if !is_registered {
            return Err(PollError::UserNotRegistered);
        }

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)?;

        let now = env.ledger().timestamp();
        if poll.status != 0 || now >= poll.end_time {
            // Auto close if expired
            if poll.status == 0 && now >= poll.end_time {
                poll.status = 1;
                env.storage()
                    .persistent()
                    .set(&PollDataKey::Poll(poll_id), &poll);
            }
            return Err(PollError::PollClosed);
        }

        // Check if user already voted on this poll
        let voted_key = PollDataKey::Voted(poll_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            return Err(PollError::AlreadyVoted);
        }

        if option_index >= poll.options.len() {
            return Err(PollError::InvalidOptionIndex);
        }

        // Update vote counts
        let mut current_votes = poll.vote_counts.get(option_index).unwrap();
        current_votes += 1;
        poll.vote_counts.set(option_index, current_votes);
        poll.total_votes += 1;

        // Calculate current winner
        let mut max_votes: u32 = 0;
        let mut leading_winner: u32 = 9999;
        let mut is_tie = false;

        for i in 0..poll.options.len() {
            let count = poll.vote_counts.get(i).unwrap();
            if count > max_votes {
                max_votes = count;
                leading_winner = i;
                is_tie = false;
            } else if count == max_votes && count > 0 {
                is_tie = true;
            }
        }

        poll.winner = if is_tie { 9999 } else { leading_winner };

        // Save updated poll state & voter lock
        env.storage()
            .persistent()
            .set(&PollDataKey::Poll(poll_id), &poll);
        env.storage().persistent().set(&voted_key, &true);

        // Notify user contract stats
        Self::notify_user_vote_cast(&env, &voter);

        // Emit Soroban Vote Event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("vote")),
            (poll_id, voter, option_index),
        );

        Ok(PollResults {
            poll_id,
            options: poll.options,
            vote_counts: poll.vote_counts,
            total_votes: poll.total_votes,
            winner: poll.winner,
        })
    }

    /// Manually closes a poll (by creator or admin). Calculates final winner.
    pub fn close_poll(env: Env, creator: Address, poll_id: u32) -> Result<PollResults, PollError> {
        creator.require_auth();

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)?;

        let admin: Address = env
            .storage()
            .instance()
            .get(&PollDataKey::Admin)
            .ok_or(PollError::NotInitialized)?;

        if poll.creator != creator && creator != admin {
            return Err(PollError::Unauthorized);
        }

        if poll.status == 1 {
            return Err(PollError::PollClosed);
        }

        poll.status = 1; // Closed

        // Final winner calculation
        let mut max_votes: u32 = 0;
        let mut winner_idx: u32 = 9999;
        let mut is_tie = false;

        for i in 0..poll.options.len() {
            let count = poll.vote_counts.get(i).unwrap();
            if count > max_votes {
                max_votes = count;
                winner_idx = i;
                is_tie = false;
            } else if count == max_votes && count > 0 {
                is_tie = true;
            }
        }

        poll.winner = if is_tie { 9999 } else { winner_idx };

        env.storage()
            .persistent()
            .set(&PollDataKey::Poll(poll_id), &poll);

        // Emit Soroban Events
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("closed")),
            (poll_id, creator),
        );

        env.events().publish(
            (symbol_short!("poll"), symbol_short!("winner")),
            (poll_id, poll.winner),
        );

        Ok(PollResults {
            poll_id,
            options: poll.options,
            vote_counts: poll.vote_counts,
            total_votes: poll.total_votes,
            winner: poll.winner,
        })
    }

    /// Deletes a poll. Only allowed if closed or zero total votes.
    pub fn delete_poll(env: Env, creator: Address, poll_id: u32) -> Result<(), PollError> {
        creator.require_auth();

        let poll: Poll = env
            .storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)?;

        let admin: Address = env
            .storage()
            .instance()
            .get(&PollDataKey::Admin)
            .ok_or(PollError::NotInitialized)?;

        if poll.creator != creator && creator != admin {
            return Err(PollError::Unauthorized);
        }

        // Cannot delete active poll with votes
        if poll.status == 0 && poll.total_votes > 0 {
            return Err(PollError::ActivePollCannotBeDeleted);
        }

        env.storage()
            .persistent()
            .remove(&PollDataKey::Poll(poll_id));

        // Emit Soroban Event
        env.events().publish(
            (symbol_short!("poll"), symbol_short!("delete")),
            (poll_id, creator),
        );

        Ok(())
    }

    /// Gets single poll by ID.
    pub fn get_poll(env: Env, poll_id: u32) -> Result<Poll, PollError> {
        env.storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)
    }

    /// Gets all registered polls.
    pub fn get_all_polls(env: Env) -> Vec<Poll> {
        let count: u32 = env
            .storage()
            .instance()
            .get(&PollDataKey::PollCount)
            .unwrap_or(0);

        let mut polls = Vec::new(&env);
        for id in 1..=count {
            if let Some(poll) = env
                .storage()
                .persistent()
                .get::<PollDataKey, Poll>(&PollDataKey::Poll(id))
            {
                polls.push_back(poll);
            }
        }
        polls
    }

    /// Gets formatted results for a poll.
    pub fn get_results(env: Env, poll_id: u32) -> Result<PollResults, PollError> {
        let poll: Poll = env
            .storage()
            .persistent()
            .get(&PollDataKey::Poll(poll_id))
            .ok_or(PollError::PollNotFound)?;

        Ok(PollResults {
            poll_id,
            options: poll.options,
            vote_counts: poll.vote_counts,
            total_votes: poll.total_votes,
            winner: poll.winner,
        })
    }

    /// Searches polls by matching query against title or category index.
    pub fn search_polls(env: Env, query: String) -> Vec<Poll> {
        let all_polls = Self::get_all_polls(env.clone());
        let mut matches = Vec::new(&env);

        for i in 0..all_polls.len() {
            let poll = all_polls.get(i).unwrap();
            // Matching check: title equals query or query matches category
            if poll.title == query {
                matches.push_back(poll);
            }
        }
        matches
    }

    /// Gets trending polls (active polls with total_votes > 0).
    pub fn get_trending_polls(env: Env) -> Vec<Poll> {
        let all_polls = Self::get_all_polls(env.clone());
        let mut trending = Vec::new(&env);

        for i in 0..all_polls.len() {
            let poll = all_polls.get(i).unwrap();
            if poll.status == 0 {
                trending.push_back(poll);
            }
        }
        trending
    }
}

#[cfg(test)]
mod test;
