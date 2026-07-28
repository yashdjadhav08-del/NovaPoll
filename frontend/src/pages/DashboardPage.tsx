import React, { useState } from "react";
import { usePolls } from "../hooks/usePolls";
import { useSoroban } from "../contexts/SorobanContext";
import { useWallet } from "../contexts/WalletContext";
import { PollCard } from "../components/PollCard";
import { VoteModal } from "../components/VoteModal";
import { ActivityFeed } from "../components/ActivityFeed";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { Poll } from "../utils/constants";
import { LayoutDashboard, Flame, Vote, Users, Layers, ShieldCheck, Wallet, Sparkles } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { polls, trendingPoll, stats } = usePolls();
  const { ledgerSequence } = useSoroban();
  const { address, isConnected, isRegistered, connectWallet } = useWallet();
  const [selectedVotePoll, setSelectedVotePoll] = useState<Poll | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-8 rounded-3xl border border-surface-border">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple/20 border border-brand-purple/40 text-brand-purple flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Governance Dashboard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            NovaPoll Analytics & Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time on-chain metrics powered by Stellar Testnet RPC & Soroban Contracts
          </p>
        </div>

        {/* Quick Status Pill */}
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2.5 rounded-2xl border border-surface-border text-xs flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-cyan" />
            <div>
              <p className="text-[10px] text-slate-400">Current Ledger</p>
              <p className="font-mono font-bold text-slate-200">#{ledgerSequence}</p>
            </div>
          </div>

          <div className="glass-card px-4 py-2.5 rounded-2xl border border-surface-border text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400">User Profile</p>
              <p className="font-semibold text-emerald-400">
                {isRegistered ? "Verified On-Chain" : "Guest Mode"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium">Total Polls Created</span>
            <Vote className="w-5 h-5 text-brand-purple" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-100">{stats.totalPolls}</p>
          <p className="text-[11px] text-slate-400">Permanent Soroban ledger records</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium">Total Votes Cast</span>
            <Flame className="w-5 h-5 text-brand-pink" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-emerald-400">{stats.totalVotes}</p>
          <p className="text-[11px] text-slate-400">Cryptographically signed votes</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium">Active Community Polls</span>
            <Sparkles className="w-5 h-5 text-brand-cyan" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-brand-cyan">{stats.activePolls}</p>
          <p className="text-[11px] text-slate-400">Accepting votes currently</p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-3">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-medium">Closed & Archived</span>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold font-mono text-amber-400">{stats.closedPolls}</p>
          <p className="text-[11px] text-slate-400">Winners calculated & locked</p>
        </div>
      </div>

      {/* Main Grid: Trending Poll + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Trending Poll Spotlight */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>Trending Poll Spotlight</span>
            </h2>
          </div>

          {trendingPoll ? (
            <PollCard poll={trendingPoll} onVoteClick={(poll) => setSelectedVotePoll(poll)} />
          ) : (
            <div className="glass-card p-8 rounded-3xl text-center text-slate-400 text-xs">
              No active trending polls available right now.
            </div>
          )}

          {/* Quick Active Polls Grid */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-slate-100">Latest Active Polls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {polls.filter((p) => p.status === 0).slice(0, 4).map((poll) => (
                <PollCard key={poll.poll_id} poll={poll} onVoteClick={(p) => setSelectedVotePoll(p)} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Event Feed */}
        <div className="space-y-6">
          <ActivityFeed />
        </div>
      </div>

      {/* Leaderboard Section */}
      <LeaderboardTable />

      {/* Vote Modal */}
      {selectedVotePoll && (
        <VoteModal poll={selectedVotePoll} onClose={() => setSelectedVotePoll(null)} />
      )}
    </div>
  );
};
