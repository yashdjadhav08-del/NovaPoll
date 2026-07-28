import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { usePolls } from "../hooks/usePolls";
import { PollCard } from "../components/PollCard";
import { VoteModal } from "../components/VoteModal";
import { Poll } from "../utils/constants";
import { Vote, PlusCircle, Wallet, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export const MyPollsPage: React.FC = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { allPolls } = usePolls();
  const [selectedVotePoll, setSelectedVotePoll] = useState<Poll | null>(null);

  if (!isConnected || !address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center glass-card rounded-3xl border border-surface-border space-y-6 my-10">
        <div className="w-16 h-16 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple mx-auto flex items-center justify-center">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Connect Freighter Wallet</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please connect your Freighter wallet extension to manage your created polls and view your vote history.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg shadow-brand-purple/25"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  const myCreatedPolls = allPolls.filter(
    (p) => p.creator.toLowerCase() === address.toLowerCase()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-surface-border">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Vote className="w-6 h-6 text-brand-purple" />
            <span>My Created Polls</span>
          </h1>
          <p className="text-xs text-slate-400">Manage community polls authored by {address}</p>
        </div>

        <Link
          to="/create"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold text-xs shadow-md shadow-brand-purple/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Poll</span>
        </Link>
      </div>

      {myCreatedPolls.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <Vote className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Polls Created Yet</h3>
          <p className="text-xs text-slate-400">You haven't authored any Soroban polls on Stellar Testnet.</p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Poll</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCreatedPolls.map((poll) => (
            <PollCard key={poll.poll_id} poll={poll} onVoteClick={(p) => setSelectedVotePoll(p)} />
          ))}
        </div>
      )}

      {selectedVotePoll && (
        <VoteModal poll={selectedVotePoll} onClose={() => setSelectedVotePoll(null)} />
      )}
    </div>
  );
};
