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

export const INITIAL_POLLS: Poll[] = [
  {
    poll_id: 1,
    creator: "GBQN57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3KQ2",
    title: "bgmi vs free fire",
    description: "Lets compare which battle royale mobile game is superior on mobile devices.",
    category: 3,
    options: ["bgmi", "free fire"],
    vote_counts: [18, 6],
    total_votes: 24,
    status: 0,
    created_at: Math.floor(Date.now() / 1000) - 86400,
    start_time: Math.floor(Date.now() / 1000) - 86400,
    end_time: Math.floor(Date.now() / 1000) + 6 * 86400,
    winner: 9999,
  },
  {
    poll_id: 2,
    creator: "GDLZ7XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3YLBQ",
    title: "black vs white",
    description: "Community choice for dark mode UI vs light mode UI.",
    category: 7,
    options: ["Option 1 (Dark Mode)", "Option 2 (Light Mode)"],
    vote_counts: [1, 1],
    total_votes: 2,
    status: 0,
    created_at: Math.floor(Date.now() / 1000) - 43200,
    start_time: Math.floor(Date.now() / 1000) - 43200,
    end_time: Math.floor(Date.now() / 1000) + 6 * 86400,
    winner: 9999,
  },
  {
    poll_id: 3,
    creator: "GAILL57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQXAD2",
    title: "Soroban Smart Contracts vs EVM Compatibility",
    description: "Should Stellar Soroban focus on WASM native execution speed or EVM compatibility layer?",
    category: 0,
    options: ["WASM Native Speed", "EVM Compatibility", "Dual Engine"],
    vote_counts: [45, 12, 8],
    total_votes: 65,
    status: 1,
    created_at: Math.floor(Date.now() / 1000) - 604800,
    start_time: Math.floor(Date.now() / 1000) - 604800,
    end_time: Math.floor(Date.now() / 1000) - 86400,
    winner: 0,
  },
  {
    poll_id: 4,
    creator: "GBQN57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3KQ2",
    title: "AI Governance on Stellar Testnet",
    description: "Decentralized AI model parameter voting powered by Soroban smart contract logic.",
    category: 2,
    options: ["Approve v2.4", "Reject & Audit", "Request Governance Delay"],
    vote_counts: [32, 14, 5],
    total_votes: 51,
    status: 1,
    created_at: Math.floor(Date.now() / 1000) - 432000,
    start_time: Math.floor(Date.now() / 1000) - 432000,
    end_time: Math.floor(Date.now() / 1000) - 172800,
    winner: 0,
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    wallet_address: "GBQN57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3KQ2",
    username: "de_gigal",
    bio: "Soroban Core Contributor & Community Poll Author",
    profile_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    joined_at: Math.floor(Date.now() / 1000) - 2592000,
    polls_created: 5,
    votes_cast: 42,
  },
  {
    wallet_address: "GDLZ7XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQYTG3YLBQ",
    username: "yash_jadhav",
    bio: "Web3 Developer & Stellar Ecosystem Enthusiast",
    profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    joined_at: Math.floor(Date.now() / 1000) - 1814400,
    polls_created: 3,
    votes_cast: 28,
  },
  {
    wallet_address: "GAILL57K3XWV6EAI24INWEGVYAS72IFTG0LXFXTQ3MTJJ2EHQXAD2",
    username: "stellar_master",
    bio: "Decentralized Voting Validator on Soroban",
    profile_image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    joined_at: Math.floor(Date.now() / 1000) - 1209600,
    polls_created: 4,
    votes_cast: 35,
  },
];
