#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Env, String};

#[test]
fn test_register_and_get_user() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserContract);
    let client = UserContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let username = String::from_str(&env, "alice_crypto");
    let bio = String::from_str(&env, "Web3 enthusiast");
    let avatar = String::from_str(&env, "https://avatar.com/alice.png");

    let profile = client.register_user(&user, &username, &bio, &avatar);
    assert_eq!(profile.username, username);
    assert_eq!(profile.polls_created, 0);
    assert_eq!(profile.votes_cast, 0);

    assert!(client.user_exists(&user));

    let fetched = client.get_user(&user);
    assert_eq!(fetched.username, username);
    assert_eq!(fetched.bio, bio);
}

#[test]
fn test_register_duplicate_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserContract);
    let client = UserContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let username = String::from_str(&env, "alice_crypto");
    let bio = String::from_str(&env, "Web3 enthusiast");
    let avatar = String::from_str(&env, "https://avatar.com/alice.png");

    client.register_user(&user, &username, &bio, &avatar);

    let res = client.try_register_user(&user, &username, &bio, &avatar);
    assert_eq!(res, Err(Ok(UserError::AlreadyRegistered)));
}

#[test]
fn test_update_profile() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserContract);
    let client = UserContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let username = String::from_str(&env, "alice");
    let bio = String::from_str(&env, "Original bio");
    let avatar = String::from_str(&env, "https://old.png");

    client.register_user(&user, &username, &bio, &avatar);

    let new_username = String::from_str(&env, "alice_updated");
    let new_bio = String::from_str(&env, "Updated bio");
    let new_avatar = String::from_str(&env, "https://new.png");

    let updated = client.update_profile(&user, &new_username, &new_bio, &new_avatar);
    assert_eq!(updated.username, new_username);
    assert_eq!(updated.bio, new_bio);
}

#[test]
fn test_delete_user() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserContract);
    let client = UserContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let username = String::from_str(&env, "alice");
    let bio = String::from_str(&env, "Bio");
    let avatar = String::from_str(&env, "https://img.png");

    client.register_user(&user, &username, &bio, &avatar);
    assert!(client.user_exists(&user));

    client.delete_user(&user);
    assert!(!client.user_exists(&user));
}

#[test]
fn test_increment_counters() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, UserContract);
    let client = UserContractClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    let username = String::from_str(&env, "bob");
    let bio = String::from_str(&env, "Bio");
    let avatar = String::from_str(&env, "https://img.png");

    client.register_user(&user, &username, &bio, &avatar);
    client.increment_polls_created(&user);
    client.increment_votes_cast(&user);
    client.increment_votes_cast(&user);

    let profile = client.get_user(&user);
    assert_eq!(profile.polls_created, 1);
    assert_eq!(profile.votes_cast, 2);
}
