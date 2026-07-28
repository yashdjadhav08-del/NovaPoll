export const STELLAR_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const STELLAR_RPC_URL = "https://soroban-testnet.stellar.org";
export const STELLAR_EXPLORER_URL = "https://stellar.expert/explorer/testnet";

// Contract Addresses (100% valid Soroban StrKey C-Addresses)
export const USER_CONTRACT_ID =
  (import.meta as any).env?.VITE_USER_CONTRACT_ID ||
  "CADQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQOBYHA4DQP5KR";

export const POLL_CONTRACT_ID =
  (import.meta as any).env?.VITE_POLL_CONTRACT_ID ||
  "CAEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQSCIJBEEQTD2L";

export const CATEGORIES = [
  { id: 0, name: "Blockchain", icon: "Boxes", color: "from-purple-500 to-indigo-500" },
  { id: 1, name: "Technology", icon: "Cpu", color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Artificial Intelligence", icon: "Bot", color: "from-pink-500 to-rose-500" },
  { id: 3, name: "Gaming", icon: "Gamepad2", color: "from-emerald-500 to-teal-500" },
  { id: 4, name: "Sports", icon: "Trophy", color: "from-amber-500 to-orange-500" },
  { id: 5, name: "Education", icon: "GraduationCap", color: "from-violet-500 to-purple-500" },
  { id: 6, name: "Business", icon: "Briefcase", color: "from-sky-500 to-blue-500" },
  { id: 7, name: "General", icon: "Globe", color: "from-slate-500 to-zinc-500" },
] as const;

export const POLL_STATUS = {
  ACTIVE: 0,
  CLOSED: 1,
} as const;

export interface UserProfile {
  wallet_address: string;
  username: string;
  bio: string;
  profile_image_url: string;
  joined_at: number;
  polls_created: number;
  votes_cast: number;
}

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

export interface PollResults {
  poll_id: number;
  options: string[];
  vote_counts: number[];
  total_votes: number;
  winner: number;
}

export interface SorobanEventData {
  id: string;
  type: 'UserRegistered' | 'ProfileUpdated' | 'PollCreated' | 'VoteCast' | 'PollClosed' | 'WinnerCalculated' | 'PollDeleted';
  timestamp: number;
  details: string;
  actor: string;
  ledger: number;
  txHash?: string;
}
