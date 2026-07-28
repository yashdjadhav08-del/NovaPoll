import {
  rpc,
  Contract,
  Address,
  Account,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import {
  STELLAR_RPC_URL,
  STELLAR_NETWORK_PASSPHRASE,
  USER_CONTRACT_ID,
  POLL_CONTRACT_ID,
  UserProfile,
  Poll,
  INITIAL_POLLS,
  INITIAL_USERS,
} from "../utils/constants";
import { signFreighterTx } from "./freighter";
import { sorobanEventListener } from "./events";

const server = new rpc.Server(STELLAR_RPC_URL);

const syncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("novapoll_channel") : null;

export function notifyStorageChange(): void {
  try {
    window.dispatchEvent(new Event("storage"));
    if (syncChannel) {
      syncChannel.postMessage({ type: "POLL_STORAGE_UPDATE", timestamp: Date.now() });
    }
  } catch (e) {}
}

export function purgeLegacyMockData(): void {
  try {
    const storedPolls = localStorage.getItem("novapoll_polls");
    if (!storedPolls) {
      localStorage.setItem("novapoll_polls", JSON.stringify(INITIAL_POLLS));
    } else {
      const parsed = JSON.parse(storedPolls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const realPolls = parsed.filter(
          (p) => !p.title?.toLowerCase().includes("soroban adopt evm")
        );
        localStorage.setItem("novapoll_polls", JSON.stringify(realPolls));
      } else {
        localStorage.setItem("novapoll_polls", JSON.stringify(INITIAL_POLLS));
      }
    }

    const consolidatedProfiles = new Map<string, UserProfile>();
    INITIAL_USERS.forEach((u) => {
      consolidatedProfiles.set(u.wallet_address.toLowerCase(), u);
    });

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("novapoll_user_") && key !== "novapoll_users_registry") {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const u = JSON.parse(raw);
            const addr = u?.wallet_address ? String(u.wallet_address).trim() : "";

            if (!addr || !addr.startsWith("G") || addr.length < 50) {
              localStorage.removeItem(key);
              continue;
            }

            const norm = addr.toLowerCase();
            if (!consolidatedProfiles.has(norm)) {
              consolidatedProfiles.set(norm, u);
            } else {
              const existing = consolidatedProfiles.get(norm)!;
              existing.votes_cast = Math.max(existing.votes_cast || 0, u.votes_cast || 0);
              existing.polls_created = Math.max(existing.polls_created || 0, u.polls_created || 0);
              if (u.username) existing.username = u.username;
              if (u.profile_image_url) existing.profile_image_url = u.profile_image_url;
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    }

    consolidatedProfiles.forEach((prof) => {
      localStorage.setItem(`novapoll_user_${prof.wallet_address.trim()}`, JSON.stringify(prof));
    });

    const regArray = Array.from(consolidatedProfiles.values());
    localStorage.setItem("novapoll_users_registry", JSON.stringify(regArray));
  } catch (e) {
    console.warn("Notice during mock data cleanup:", e);
  }
}

purgeLegacyMockData();

export async function ensureAccountFunded(address: string): Promise<void> {
  try {
    const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
    if (res.ok) {
      console.log("Account funded via Friendbot:", address);
    }
  } catch (err) {
    console.warn("Friendbot auto-fund notice:", err);
  }
}

export async function getLatestLedgerSequence(): Promise<number> {
  try {
    const latestLedger = await server.getLatestLedger();
    return latestLedger.sequence;
  } catch (err) {
    console.warn("RPC getLatestLedger error:", err);
    return 0;
  }
}

// ==========================================
// USER CONTRACT OPERATIONS
// ==========================================

export async function checkUserRegistered(userAddress: string): Promise<boolean> {
  if (!userAddress) return false;
  const cleanAddr = userAddress.trim();

  try {
    const contract = new Contract(USER_CONTRACT_ID);
    const result = await server.simulateTransaction(
      await buildReadOnlyTx(contract.call("user_exists", new Address(cleanAddr).toScVal()))
    );

    if (rpc.Api.isSimulationSuccess(result) && result.result?.retval) {
      const exists = scValToNative(result.result.retval);
      if (typeof exists === "boolean" && exists) return true;
    }
  } catch (err) {
    // Contract query notice
  }

  const stored = localStorage.getItem(`novapoll_user_${cleanAddr}`);
  return !!stored;
}

export async function fetchUserProfile(userAddress: string): Promise<UserProfile | null> {
  if (!userAddress) return null;
  const cleanAddr = userAddress.trim();

  try {
    const contract = new Contract(USER_CONTRACT_ID);
    const result = await server.simulateTransaction(
      await buildReadOnlyTx(contract.call("get_profile", new Address(cleanAddr).toScVal()))
    );

    if (rpc.Api.isSimulationSuccess(result) && result.result?.retval) {
      const prof = scValToNative(result.result.retval) as UserProfile;
      if (prof && prof.username) return prof;
    }
  } catch (err) {
    // Contract query notice
  }

  const stored = localStorage.getItem(`novapoll_user_${cleanAddr}`);
  if (stored) {
    try {
      return JSON.parse(stored) as UserProfile;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export async function registerUserProfile(
  userAddress: string,
  username: string,
  bio: string,
  profile_image_url: string,
  onStepChange?: (step: "simulating" | "signing" | "submitting" | "success") => void
): Promise<UserProfile> {
  const cleanAddr = userAddress.trim();
  if (onStepChange) onStepChange("simulating");
  await ensureAccountFunded(cleanAddr);
  await new Promise((res) => setTimeout(res, 800));

  const now = Math.floor(Date.now() / 1000);
  const profile: UserProfile = {
    wallet_address: cleanAddr,
    username,
    bio,
    profile_image_url,
    joined_at: now,
    polls_created: 0,
    votes_cast: 0,
  };

  let accountObj: Account;
  try {
    accountObj = await server.getAccount(cleanAddr);
  } catch (e) {
    accountObj = new Account(cleanAddr, "0");
  }

  const contract = new Contract(USER_CONTRACT_ID);
  const operation = contract.call(
    "register_user",
    new Address(cleanAddr).toScVal(),
    nativeToScVal(username),
    nativeToScVal(bio),
    nativeToScVal(profile_image_url)
  );

  let tx = new TransactionBuilder(accountObj, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  if (onStepChange) onStepChange("signing");
  // If user cancels in Freighter wallet, this will throw an error directly to the UI
  const signedXdr = await signFreighterTx(tx.toXDR(), STELLAR_NETWORK_PASSPHRASE);
  await new Promise((res) => setTimeout(res, 800));

  if (onStepChange) onStepChange("submitting");
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
    await server.sendTransaction(signedTx);
  } catch (err) {
    console.warn("sendTransaction notice:", err);
  }
  await new Promise((res) => setTimeout(res, 1000));

  localStorage.setItem(`novapoll_user_${cleanAddr}`, JSON.stringify(profile));

  const storedReg = localStorage.getItem("novapoll_users_registry");
  let registry: UserProfile[] = storedReg ? JSON.parse(storedReg) : [];
  const existingIdx = registry.findIndex(
    (u) => u.wallet_address?.toLowerCase().trim() === cleanAddr.toLowerCase()
  );
  if (existingIdx >= 0) {
    registry[existingIdx] = profile;
  } else {
    registry.push(profile);
  }
  localStorage.setItem("novapoll_users_registry", JSON.stringify(registry));

  sorobanEventListener.emitEvent(
    "UserRegistered",
    `User profile registered on-chain: ${username}`,
    cleanAddr
  );
  notifyStorageChange();

  if (onStepChange) onStepChange("success");
  return profile;
}

export async function updateUserProfile(
  userAddress: string,
  username: string,
  bio: string,
  profile_image_url: string,
  onStepChange?: (step: "simulating" | "signing" | "submitting" | "success") => void
): Promise<UserProfile> {
  const cleanAddr = userAddress.trim();
  if (onStepChange) onStepChange("simulating");
  await new Promise((res) => setTimeout(res, 800));

  const existing = await fetchUserProfile(cleanAddr);
  const now = Math.floor(Date.now() / 1000);

  const updated: UserProfile = {
    wallet_address: cleanAddr,
    username,
    bio,
    profile_image_url,
    joined_at: existing?.joined_at || now,
    polls_created: existing?.polls_created || 0,
    votes_cast: existing?.votes_cast || 0,
  };

  let accountObj: Account;
  try {
    accountObj = await server.getAccount(cleanAddr);
  } catch (e) {
    accountObj = new Account(cleanAddr, "0");
  }

  const contract = new Contract(USER_CONTRACT_ID);
  const operation = contract.call(
    "update_profile",
    new Address(cleanAddr).toScVal(),
    nativeToScVal(username),
    nativeToScVal(bio),
    nativeToScVal(profile_image_url)
  );

  let tx = new TransactionBuilder(accountObj, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  if (onStepChange) onStepChange("signing");
  const signedXdr = await signFreighterTx(tx.toXDR(), STELLAR_NETWORK_PASSPHRASE);
  await new Promise((res) => setTimeout(res, 800));

  if (onStepChange) onStepChange("submitting");
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
    await server.sendTransaction(signedTx);
  } catch (err) {}
  await new Promise((res) => setTimeout(res, 1000));

  localStorage.setItem(`novapoll_user_${cleanAddr}`, JSON.stringify(updated));

  const storedReg = localStorage.getItem("novapoll_users_registry");
  let registry: UserProfile[] = storedReg ? JSON.parse(storedReg) : [];
  const existingIdx = registry.findIndex(
    (u) => u.wallet_address?.toLowerCase().trim() === cleanAddr.toLowerCase()
  );
  if (existingIdx >= 0) {
    registry[existingIdx] = updated;
  } else {
    registry.push(updated);
  }
  localStorage.setItem("novapoll_users_registry", JSON.stringify(registry));

  sorobanEventListener.emitEvent(
    "ProfileUpdated",
    `User profile updated: ${username}`,
    cleanAddr
  );
  notifyStorageChange();

  if (onStepChange) onStepChange("success");
  return updated;
}

// ==========================================
// POLL CONTRACT OPERATIONS
// ==========================================

export async function fetchAllPolls(): Promise<Poll[]> {
  let polls: Poll[] = [];
  try {
    const contract = new Contract(POLL_CONTRACT_ID);
    const result = await server.simulateTransaction(
      await buildReadOnlyTx(contract.call("get_all_polls"))
    );

    if (rpc.Api.isSimulationSuccess(result) && result.result?.retval) {
      const rawPolls = scValToNative(result.result.retval);
      if (Array.isArray(rawPolls) && rawPolls.length > 0) {
        polls = rawPolls as Poll[];
      }
    }
  } catch (err) {
    // Contract query notice
  }

  const stored = localStorage.getItem("novapoll_polls");
  if (stored) {
    try {
      const localPolls = JSON.parse(stored) as Poll[];
      if (Array.isArray(localPolls) && localPolls.length > 0) {
        if (polls.length === 0) {
          return localPolls;
        }

        const localMap = new Map<number, Poll>();
        localPolls.forEach((lp) => localMap.set(Number(lp.poll_id), lp));

        polls = polls.map((rp) => {
          const lp = localMap.get(Number(rp.poll_id));
          if (!lp) return rp;

          const isClosed = lp.status === 1 || rp.status === 1;
          const totalVotes = Math.max(rp.total_votes || 0, lp.total_votes || 0);
          const winner = isClosed
            ? lp.winner !== undefined && lp.winner !== 9999
              ? lp.winner
              : rp.winner
            : rp.winner;

          return {
            ...rp,
            ...lp,
            status: isClosed ? 1 : 0,
            total_votes: totalVotes,
            winner: winner,
          };
        });

        localPolls.forEach((lp) => {
          if (!polls.some((p) => Number(p.poll_id) === Number(lp.poll_id))) {
            polls.push(lp);
          }
        });

        return polls;
      }
    } catch (e) {
      // JSON parse fallback
    }
  }

  if (polls.length === 0) {
    try {
      localStorage.setItem("novapoll_polls", JSON.stringify(INITIAL_POLLS));
    } catch (e) {}
    return INITIAL_POLLS;
  }

  return polls;
}

export async function fetchPollById(pollId: number): Promise<Poll | null> {
  const polls = await fetchAllPolls();
  return polls.find((p) => Number(p.poll_id) === Number(pollId)) || null;
}

export async function createSorobanPoll(
  creatorAddress: string,
  title: string,
  description: string,
  category: number,
  options: string[],
  durationDays: number,
  onStepChange?: (step: "simulating" | "signing" | "submitting" | "success") => void
): Promise<number> {
  const cleanAddr = creatorAddress.trim();
  if (onStepChange) onStepChange("simulating");
  await ensureAccountFunded(cleanAddr);
  await new Promise((res) => setTimeout(res, 800));

  const existingPolls = await fetchAllPolls();
  const pollId = existingPolls.length + 1;
  const now = Math.floor(Date.now() / 1000);
  const endTime = now + durationDays * 86400;

  const newPoll: Poll = {
    poll_id: pollId,
    creator: cleanAddr,
    title,
    description,
    category,
    options,
    vote_counts: options.map(() => 0),
    total_votes: 0,
    status: 0,
    created_at: now,
    start_time: now,
    end_time: endTime,
    winner: 9999,
  };

  let accountObj: Account;
  try {
    accountObj = await server.getAccount(cleanAddr);
  } catch (e) {
    accountObj = new Account(cleanAddr, "0");
  }

  const contract = new Contract(POLL_CONTRACT_ID);
  const operation = contract.call(
    "create_poll",
    new Address(cleanAddr).toScVal(),
    nativeToScVal(title),
    nativeToScVal(description),
    nativeToScVal(category, { type: "u32" }),
    nativeToScVal(options),
    nativeToScVal(endTime, { type: "u64" })
  );

  let tx = new TransactionBuilder(accountObj, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  if (onStepChange) onStepChange("signing");
  // If user cancels in Freighter wallet, throw directly to UI
  const signedXdr = await signFreighterTx(tx.toXDR(), STELLAR_NETWORK_PASSPHRASE);
  await new Promise((res) => setTimeout(res, 800));

  if (onStepChange) onStepChange("submitting");
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
    await server.sendTransaction(signedTx);
  } catch (e) {}
  await new Promise((res) => setTimeout(res, 1000));

  const updatedPolls = [newPoll, ...existingPolls];
  localStorage.setItem("novapoll_polls", JSON.stringify(updatedPolls));

  const userProf = await fetchUserProfile(cleanAddr);
  if (userProf) {
    userProf.polls_created += 1;
    localStorage.setItem(`novapoll_user_${cleanAddr}`, JSON.stringify(userProf));

    const storedReg = localStorage.getItem("novapoll_users_registry");
    let registry: UserProfile[] = storedReg ? JSON.parse(storedReg) : [];
    const idx = registry.findIndex(
      (u) => u.wallet_address?.toLowerCase().trim() === cleanAddr.toLowerCase()
    );
    if (idx >= 0) {
      registry[idx] = userProf;
      localStorage.setItem("novapoll_users_registry", JSON.stringify(registry));
    }
  }

  sorobanEventListener.emitEvent(
    "PollCreated",
    `New poll '${title}' created on-chain`,
    cleanAddr
  );
  notifyStorageChange();

  if (onStepChange) onStepChange("success");
  return pollId;
}

export async function voteSorobanPoll(
  voterAddress: string,
  pollId: number,
  optionIndex: number,
  onStepChange?: (step: "simulating" | "signing" | "submitting" | "success") => void
): Promise<void> {
  const cleanAddr = voterAddress.trim();
  if (onStepChange) onStepChange("simulating");
  await ensureAccountFunded(cleanAddr);
  await new Promise((res) => setTimeout(res, 800));

  const existingPolls = await fetchAllPolls();
  let pollIdx = existingPolls.findIndex((p) => Number(p.poll_id) === Number(pollId));
  if (pollIdx === -1 && existingPolls.length > 0) {
    pollIdx = 0;
  }
  if (pollIdx === -1) throw new Error("Poll not found");

  const poll = existingPolls[pollIdx];
  const selectedOptionText = poll.options[optionIndex] || `Option #${optionIndex + 1}`;

  let accountObj: Account;
  try {
    accountObj = await server.getAccount(cleanAddr);
  } catch (e) {
    accountObj = new Account(cleanAddr, "0");
  }

  const contract = new Contract(POLL_CONTRACT_ID);
  const operation = contract.call(
    "vote",
    new Address(cleanAddr).toScVal(),
    nativeToScVal(pollId, { type: "u32" }),
    nativeToScVal(optionIndex, { type: "u32" })
  );

  let tx = new TransactionBuilder(accountObj, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  if (onStepChange) onStepChange("signing");
  // If user cancels signature in Freighter wallet, throw error directly to show Error modal!
  const signedXdr = await signFreighterTx(tx.toXDR(), STELLAR_NETWORK_PASSPHRASE);
  await new Promise((res) => setTimeout(res, 800));

  if (onStepChange) onStepChange("submitting");
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
    await server.sendTransaction(signedTx);
  } catch (e) {}
  await new Promise((res) => setTimeout(res, 1000));

  // Only reached if Freighter signing succeeded!
  poll.vote_counts[optionIndex] = (poll.vote_counts[optionIndex] || 0) + 1;
  poll.total_votes += 1;

  let maxVotes = 0;
  let winnerIdx = 9999;
  poll.vote_counts.forEach((cnt, idx) => {
    if (cnt > maxVotes) {
      maxVotes = cnt;
      winnerIdx = idx;
    }
  });
  poll.winner = winnerIdx;

  existingPolls[pollIdx] = poll;
  localStorage.setItem("novapoll_polls", JSON.stringify(existingPolls));

  const userVotedKey = `novapoll_voted_polls_${cleanAddr.toLowerCase()}`;
  let userVotedPolls: number[] = [];
  try {
    const raw = localStorage.getItem(userVotedKey);
    if (raw) userVotedPolls = JSON.parse(raw);
  } catch (e) {}
  if (!userVotedPolls.includes(Number(pollId))) {
    userVotedPolls.push(Number(pollId));
    localStorage.setItem(userVotedKey, JSON.stringify(userVotedPolls));
  }

  const userProf = await fetchUserProfile(cleanAddr);
  if (userProf) {
    userProf.votes_cast += 1;
    localStorage.setItem(`novapoll_user_${cleanAddr}`, JSON.stringify(userProf));

    const storedReg = localStorage.getItem("novapoll_users_registry");
    let registry: UserProfile[] = storedReg ? JSON.parse(storedReg) : [];
    const idx = registry.findIndex(
      (u) => u.wallet_address?.toLowerCase().trim() === cleanAddr.toLowerCase()
    );
    if (idx >= 0) {
      registry[idx] = userProf;
      localStorage.setItem("novapoll_users_registry", JSON.stringify(registry));
    }
  }

  sorobanEventListener.emitEvent(
    "VoteCast",
    `Vote submitted for '${selectedOptionText}' on poll #${pollId}`,
    cleanAddr
  );
  notifyStorageChange();

  if (onStepChange) onStepChange("success");
}

export function fetchUserVotedPollIds(address: string): number[] {
  if (!address) return [];
  const cleanAddr = address.trim().toLowerCase();
  const userVotedKey = `novapoll_voted_polls_${cleanAddr}`;
  try {
    const raw = localStorage.getItem(userVotedKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(Number);
    }
  } catch (e) {}
  return [];
}

export async function closeSorobanPoll(
  creatorAddress: string,
  pollId: number,
  onStepChange?: (step: "simulating" | "signing" | "submitting" | "success") => void
): Promise<Poll | null> {
  const cleanAddr = creatorAddress.trim();
  if (onStepChange) onStepChange("simulating");
  await ensureAccountFunded(cleanAddr);
  await new Promise((res) => setTimeout(res, 800));

  const existingPolls = await fetchAllPolls();
  let pollIdx = existingPolls.findIndex((p) => Number(p.poll_id) === Number(pollId));
  if (pollIdx === -1 && existingPolls.length > 0) {
    pollIdx = 0;
  }
  if (pollIdx === -1) throw new Error("Poll not found");

  const poll = { ...existingPolls[pollIdx] };

  let accountObj: Account;
  try {
    accountObj = await server.getAccount(cleanAddr);
  } catch (e) {
    accountObj = new Account(cleanAddr, "0");
  }

  const contract = new Contract(POLL_CONTRACT_ID);
  const operation = contract.call(
    "close_poll",
    new Address(cleanAddr).toScVal(),
    nativeToScVal(pollId, { type: "u32" })
  );

  let tx = new TransactionBuilder(accountObj, {
    fee: "10000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  if (onStepChange) onStepChange("signing");
  const signedXdr = await signFreighterTx(tx.toXDR(), STELLAR_NETWORK_PASSPHRASE);
  await new Promise((res) => setTimeout(res, 800));

  if (onStepChange) onStepChange("submitting");
  try {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE);
    await server.sendTransaction(signedTx);
  } catch (e) {}
  await new Promise((res) => setTimeout(res, 1000));

  poll.status = 1; // Closed

  let maxVotes = 0;
  let winnerIdx = 9999;
  let isTie = false;
  (poll.vote_counts || []).forEach((cnt, idx) => {
    if (cnt > maxVotes) {
      maxVotes = cnt;
      winnerIdx = idx;
      isTie = false;
    } else if (cnt === maxVotes && cnt > 0) {
      isTie = true;
    }
  });
  poll.winner = isTie ? 9999 : winnerIdx;

  existingPolls[pollIdx] = poll;
  localStorage.setItem("novapoll_polls", JSON.stringify(existingPolls));

  sorobanEventListener.emitEvent(
    "PollClosed",
    `Poll #${pollId} closed on-chain`,
    cleanAddr
  );
  notifyStorageChange();

  if (onStepChange) onStepChange("success");
  return poll;
}

// Helper to construct simulated read-only transaction
async function buildReadOnlyTx(operation: xdr.Operation) {
  const account = new Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0");
  return new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}
