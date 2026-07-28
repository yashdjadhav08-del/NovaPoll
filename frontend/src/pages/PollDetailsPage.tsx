import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSoroban } from "../contexts/SorobanContext";
import { useWallet } from "../contexts/WalletContext";
import { fetchPollById } from "../services/soroban";
import { Poll, CATEGORIES, STELLAR_EXPLORER_URL } from "../utils/constants";
import { truncateAddress, formatDateTime, formatTimeRemaining, calculatePercentage } from "../utils/formatters";
import { VoteModal } from "../components/VoteModal";
import { PendingTxModal } from "../components/PendingTxModal";
import { PollCardSkeleton } from "../components/Skeleton";
import { Vote, Clock, CheckCircle2, Award, Share2, ArrowLeft, ExternalLink, ShieldCheck, Lock, Trash2 } from "lucide-react";

export const PollDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { refreshPolls } = useSoroban();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [txStep, setTxStep] = useState<"idle" | "simulating" | "signing" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    async function loadPoll() {
      if (!id) return;
      setIsLoading(true);
      const data = await fetchPollById(Number(id));
      setPoll(data);
      setIsLoading(false);
    }
    loadPoll();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PollCardSkeleton />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Poll Not Found</h2>
        <p className="text-xs text-slate-400">The poll ID #{id} does not exist on Stellar Testnet storage.</p>
        <Link to="/browse" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </Link>
      </div>
    );
  }

  const categoryInfo = CATEGORIES.find((c) => c.id === poll.category) || CATEGORIES[7];
  const timeRemaining = formatTimeRemaining(poll.end_time);
  const isClosed = poll.status === 1 || timeRemaining.isExpired;
  const isCreator = address && address.toLowerCase() === poll.creator.toLowerCase();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClosePoll = async () => {
    setTxStep("simulating");
    try {
      await new Promise((res) => setTimeout(res, 800));
      setTxStep("signing");
      await new Promise((res) => setTimeout(res, 1200));
      setTxStep("submitting");
      await new Promise((res) => setTimeout(res, 1500));
      setTxStep("success");
      setPoll({ ...poll, status: 1 });
      await refreshPolls();
    } catch (err) {
      setTxStep("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Back */}
      <Link to="/browse" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse Polls</span>
      </Link>

      {/* Main Poll Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-surface-border space-y-8 relative">
        {/* Top Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-light border border-surface-border text-slate-300 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${categoryInfo.color}`} />
              {categoryInfo.name}
            </span>

            {isClosed ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Closed & Finalized
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Poll
              </span>
            )}
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? "Link Copied!" : "Share Poll"}</span>
          </button>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
            {poll.title}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {poll.description}
          </p>
        </div>

        {/* Creator & Blockchain Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-light/30 border border-surface-border text-xs">
          <div>
            <p className="text-slate-400">Created By</p>
            <a
              href={`${STELLAR_EXPLORER_URL}/account/${poll.creator}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-bold text-brand-cyan hover:underline inline-flex items-center gap-1 mt-0.5"
            >
              <span>{truncateAddress(poll.creator, 6)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <p className="text-slate-400">Created At</p>
            <p className="font-mono text-slate-200 mt-0.5">{formatDateTime(poll.created_at)}</p>
          </div>

          <div>
            <p className="text-slate-400">Poll Deadline</p>
            <p className="font-mono text-slate-200 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-purple" />
              <span>{timeRemaining.text}</span>
            </p>
          </div>
        </div>

        {/* Voting Options Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Live Vote Results</h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {poll.total_votes} Total Votes
            </span>
          </div>

          <div className="space-y-3">
            {poll.options.map((option, idx) => {
              const votes = poll.vote_counts[idx] || 0;
              const pct = calculatePercentage(votes, poll.total_votes);
              const isWinner = isClosed && poll.winner === idx;

              return (
                <div
                  key={idx}
                  className={`relative p-5 rounded-2xl border transition-all overflow-hidden ${
                    isWinner
                      ? "bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10"
                      : "bg-surface-light/40 border-surface-border"
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-1000 ${
                      isWinner
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-600/30 border-r-2 border-amber-500"
                        : "bg-brand-purple/20 border-r-2 border-brand-purple/50"
                    }`}
                    style={{ width: `${pct}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between text-sm font-semibold">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-surface border border-surface-border text-xs flex items-center justify-center text-slate-300 font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-slate-100 flex items-center gap-2">
                        {option}
                        {isWinner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            WINNER
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-base text-slate-100 font-bold">{pct}%</span>
                      <span className="text-xs text-slate-400 font-normal ml-2">({votes} votes)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="pt-6 border-t border-surface-border flex flex-wrap items-center justify-between gap-4">
          <div>
            {!isClosed && (
              <button
                onClick={() => setShowVoteModal(true)}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-bold text-sm shadow-xl shadow-brand-purple/25 hover:scale-105 active:scale-95 transition-all"
              >
                <Vote className="w-5 h-5" />
                <span>Cast Your Vote</span>
              </button>
            )}
          </div>

          {/* Creator Management Actions */}
          {isCreator && !isClosed && (
            <button
              onClick={handleClosePoll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Manually Close Poll</span>
            </button>
          )}
        </div>
      </div>

      {/* Vote Modal */}
      {showVoteModal && (
        <VoteModal poll={poll} onClose={() => setShowVoteModal(false)} />
      )}

      {/* Pending Tx Modal */}
      {txStep !== "idle" && (
        <PendingTxModal
          step={txStep}
          title="Closing Poll On-Chain"
          onClose={() => setTxStep("idle")}
        />
      )}
    </div>
  );
};
