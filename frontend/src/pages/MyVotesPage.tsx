import React from "react";
import { useWallet } from "../contexts/WalletContext";
import { usePolls } from "../hooks/usePolls";
import { PollCard } from "../components/PollCard";
import { Vote, Wallet, Compass } from "lucide-react";
import { Link } from "react-router-dom";

export const MyVotesPage: React.FC = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { allPolls } = usePolls();

  if (!isConnected || !address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center glass-card rounded-3xl border border-surface-border space-y-6 my-10">
        <div className="w-16 h-16 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple mx-auto flex items-center justify-center">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Connect Wallet to View History</h2>
        <p className="text-xs text-slate-400">Please connect your Freighter wallet to check your voting history.</p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold"
        >
          Connect Freighter
        </button>
      </div>
    );
  }

  // Filter polls with votes cast
  const votedPolls = allPolls.filter((p) => p.total_votes > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="glass-card p-8 rounded-3xl border border-surface-border">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Vote className="w-6 h-6 text-brand-pink" />
          <span>My Voting History</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Cryptographically verified vote receipts for wallet {address}</p>
      </div>

      {votedPolls.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-4">
          <Vote className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Votes Cast Yet</h3>
          <p className="text-xs text-slate-400">You haven't submitted any votes on active community polls.</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-semibold"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Active Polls</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {votedPolls.map((poll) => (
            <PollCard key={poll.poll_id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};
