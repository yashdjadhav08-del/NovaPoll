import React from "react";
import { Link } from "react-router-dom";
import { AuroraBackground } from "../components/AuroraBackground";
import { PollCard } from "../components/PollCard";
import { usePolls } from "../hooks/usePolls";
import { Vote, ShieldCheck, Zap, Layers, ChevronRight, Sparkles, ArrowRight, HelpCircle } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { polls, stats } = usePolls();

  return (
    <AuroraBackground>
      <div className="space-y-20 pb-20">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 text-center space-y-8 max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-brand-purple/40 text-xs font-semibold text-brand-cyan shadow-lg shadow-brand-purple/20 animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>Stellar Soroban Level 3 Certification Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            The Future of <br className="hidden sm:block" />
            <span className="gradient-text">Decentralized Community Voting</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Create unlimited community polls, vote securely on-chain powered by Stellar Soroban smart contracts, and watch real-time results update instantly across the ledger.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan text-white text-base font-bold shadow-xl shadow-brand-purple/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Vote className="w-5 h-5" />
              <span>Create On-Chain Poll</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/browse"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass-card text-slate-200 hover:text-white text-base font-semibold border border-surface-border hover:border-slate-500 transition-all"
            >
              <span>Explore All Polls</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="glass-card p-5 rounded-2xl border border-surface-border text-center">
              <p className="text-3xl font-extrabold font-mono gradient-text">{stats.totalPolls}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Total On-Chain Polls</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-surface-border text-center">
              <p className="text-3xl font-extrabold font-mono text-emerald-400">{stats.totalVotes}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Verifiable Votes Cast</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-surface-border text-center">
              <p className="text-3xl font-extrabold font-mono text-brand-cyan">{stats.activePolls}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Active Community Polls</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-surface-border text-center">
              <p className="text-3xl font-extrabold font-mono text-brand-pink">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Soroban Smart Contract Verified</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-slate-100">Engineered for Web3 Governance</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              NovaPoll leverages Soroban inter-contract validation and RPC event streaming for complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-surface-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Inter-Contract Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Poll Contract cross-calls the User Contract to verify identity registration before enabling poll creation or vote casting.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-surface-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Instant Event Streaming</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Frontend subscribes directly to Soroban RPC topics. Votes, new polls, and winner calculations update live without page refreshing.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl border border-surface-border space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-pink/20 border border-brand-pink/40 flex items-center justify-center text-brand-pink">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Freighter Wallet Native</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless cryptographic signing using the official Freighter extension with full Stellar Testnet integration.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Polls */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Active Community Polls</h2>
              <p className="text-xs text-slate-400">Cast your vote on active Soroban proposals</p>
            </div>
            <Link to="/browse" className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {polls.slice(0, 3).map((poll) => (
              <PollCard key={poll.poll_id} poll={poll} />
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-brand-purple" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-slate-400">Everything you need to know about NovaPoll on Stellar Soroban</p>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">How does NovaPoll ensure 1 vote per wallet?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Soroban Poll smart contract locks a persistent key <code className="text-brand-cyan">DataKey::Voted(poll_id, voter)</code> upon vote invocation. Duplicate attempts return a custom contract error.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">What is Inter-Contract Communication in NovaPoll?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The Poll Contract cross-calls the User Contract's <code className="text-brand-purple">user_exists</code> function to ensure only registered users can create polls or vote.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AuroraBackground>
  );
};
