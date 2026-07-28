#![cfg(test)]

use super::*;
use novapoll_user::UserContract;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

fn setup_contracts<'a>(
    env: &'a Env,
) -> (
    PollContractClient<'a>,
    novapoll_user::UserContractClient<'a>,
    Address,
) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let user_contract_id = env.register_contract(None, UserContract);
    let user_client = novapoll_user::UserContractClient::new(env, &user_contract_id);

    let poll_contract_id = env.register_contract(None, PollContract);
    let poll_client = PollContractClient::new(env, &poll_contract_id);

    poll_client.init(&admin, &user_contract_id);

    (poll_client, user_client, admin)
}

#[test]
fn test_create_poll_unregistered_user_fails() {
    let env = Env::default();
    let (poll_client, _user_client, _admin) = setup_contracts(&env);

    let unregistered_user = Address::generate(&env);
    let title = String::from_str(&env, "Best Web3 L1?");
    let desc = String::from_str(&env, "Choose your top layer 1 network");
    let category = 0u32;

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Stellar"));
    options.push_back(String::from_str(&env, "Ethereum"));

    let end_time = env.ledger().timestamp() + 3600;

    // Inter-contract call check should fail with UserNotRegistered
    let res = poll_client.try_create_poll(
        &unregistered_user,
        &title,
        &desc,
        &category,
        &options,
        &end_time,
    );
    assert_eq!(res, Err(Ok(PollError::UserNotRegistered)));
}

#[test]
fn test_create_poll_registered_user_success() {
    let env = Env::default();
    let (poll_client, user_client, _admin) = setup_contracts(&env);

    let creator = Address::generate(&env);
    let username = String::from_str(&env, "creator_alice");
    let bio = String::from_str(&env, "Creator Bio");
    let avatar = String::from_str(&env, "https://avatar.png");

    // Register user first
    user_client.register_user(&creator, &username, &bio, &avatar);

    let title = String::from_str(&env, "Best Web3 L1?");
    let desc = String::from_str(&env, "Choose your top layer 1 network");
    let category = 0u32;

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Stellar"));
    options.push_back(String::from_str(&env, "Ethereum"));
    options.push_back(String::from_str(&env, "Solana"));

    let end_time = env.ledger().timestamp() + 3600;

    let poll_id = poll_client.create_poll(&creator, &title, &desc, &category, &options, &end_time);
    assert_eq!(poll_id, 1);

    let poll = poll_client.get_poll(&1);
    assert_eq!(poll.title, title);
    assert_eq!(poll.creator, creator);
    assert_eq!(poll.options.len(), 3);
    assert_eq!(poll.status, 0);

    // Verify User contract stats incremented!
    let user_prof = user_client.get_user(&creator);
    assert_eq!(user_prof.polls_created, 1);
}

#[test]
fn test_voting_and_one_vote_per_wallet_limit() {
    let env = Env::default();
    let (poll_client, user_client, _admin) = setup_contracts(&env);

    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    user_client.register_user(
        &creator,
        &String::from_str(&env, "creator"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );
    user_client.register_user(
        &voter,
        &String::from_str(&env, "voter1"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );

    let title = String::from_str(&env, "Favorite Programming Language?");
    let desc = String::from_str(&env, "Vote for your primary language");
    let category = 1u32;

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Rust"));
    options.push_back(String::from_str(&env, "TypeScript"));

    let end_time = env.ledger().timestamp() + 3600;
    let poll_id = poll_client.create_poll(&creator, &title, &desc, &category, &options, &end_time);

    // Voter votes for Rust (option 0)
    let results = poll_client.vote(&voter, &poll_id, &0);
    assert_eq!(results.total_votes, 1);
    assert_eq!(results.vote_counts.get(0).unwrap(), 1);
    assert_eq!(results.winner, 0);

    // Double voting attempt must fail with AlreadyVoted error
    let res_double = poll_client.try_vote(&voter, &poll_id, &1);
    assert_eq!(res_double, Err(Ok(PollError::AlreadyVoted)));

    // Verify voter stats updated
    let voter_prof = user_client.get_user(&voter);
    assert_eq!(voter_prof.votes_cast, 1);
}

#[test]
fn test_close_poll_and_winner_calculation() {
    let env = Env::default();
    let (poll_client, user_client, _admin) = setup_contracts(&env);

    let creator = Address::generate(&env);
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    user_client.register_user(
        &creator,
        &String::from_str(&env, "creator"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );
    user_client.register_user(
        &voter1,
        &String::from_str(&env, "voter1"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );
    user_client.register_user(
        &voter2,
        &String::from_str(&env, "voter2"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Option A"));
    options.push_back(String::from_str(&env, "Option B"));

    let poll_id = poll_client.create_poll(
        &creator,
        &String::from_str(&env, "Poll Title"),
        &String::from_str(&env, "Poll Description"),
        &2u32,
        &options,
        &(env.ledger().timestamp() + 5000),
    );

    // Both voters vote for Option B (index 1)
    poll_client.vote(&voter1, &poll_id, &1);
    poll_client.vote(&voter2, &poll_id, &1);

    // Close poll
    let final_res = poll_client.close_poll(&creator, &poll_id);
    assert_eq!(final_res.total_votes, 2);
    assert_eq!(final_res.winner, 1);

    let poll = poll_client.get_poll(&poll_id);
    assert_eq!(poll.status, 1);

    // Cannot vote on closed poll
    let voter3 = Address::generate(&env);
    user_client.register_user(
        &voter3,
        &String::from_str(&env, "voter3"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );
    let res_closed = poll_client.try_vote(&voter3, &poll_id, &0);
    assert_eq!(res_closed, Err(Ok(PollError::PollClosed)));
}

#[test]
fn test_get_all_and_trending_polls() {
    let env = Env::default();
    let (poll_client, user_client, _admin) = setup_contracts(&env);

    let creator = Address::generate(&env);
    user_client.register_user(
        &creator,
        &String::from_str(&env, "creator"),
        &String::from_str(&env, "bio"),
        &String::from_str(&env, "img"),
    );

    let mut options = Vec::new(&env);
    options.push_back(String::from_str(&env, "Yes"));
    options.push_back(String::from_str(&env, "No"));

    poll_client.create_poll(
        &creator,
        &String::from_str(&env, "Poll 1"),
        &String::from_str(&env, "Desc 1"),
        &0u32,
        &options,
        &(env.ledger().timestamp() + 1000),
    );
    poll_client.create_poll(
        &creator,
        &String::from_str(&env, "Poll 2"),
        &String::from_str(&env, "Desc 2"),
        &1u32,
        &options,
        &(env.ledger().timestamp() + 2000),
    );

    let all = poll_client.get_all_polls();
    assert_eq!(all.len(), 2);

    let trending = poll_client.get_trending_polls();
    assert_eq!(trending.len(), 2);
}
