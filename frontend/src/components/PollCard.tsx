import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Poll, CATEGORIES } from "../utils/constants";
import { truncateAddress, formatTimeRemaining, calculatePercentage } from "../utils/formatters";
import { Vote, Clock, CheckCircle2, Share2, Award, User, Sparkles } from "lucide-react";

interface PollCardProps {
  poll: Poll;
  onVoteClick?: (poll: Poll) => void;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, onVoteClick }) => {
  const [copied, setCopied] = useState(false);
  const categoryInfo = CATEGORIES.find((c) => c.id === poll.category) || CATEGORIES[7];
  const timeRemaining = formatTimeRemaining(poll.end_time);
  const isClosed = poll.status === 1 || timeRemaining.isExpired;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.poll_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between space-y-5 border border-surface-border relative overflow-hidden group">
      {/* Category & Status Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-surface-light border border-surface-border text-slate-300 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${categoryInfo.color}`} />
            {categoryInfo.name}
          </span>

          <div className="flex items-center gap-2">
            {isClosed ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Closed
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Active
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <Link to={`/poll/${poll.poll_id}`}>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-purple transition-colors line-clamp-2 mb-1.5">
            {poll.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {poll.description}
        </p>

        {/* Options Progress Bar Previews */}
        <div className="space-y-2.5 my-4">
          {poll.options.slice(0, 3).map((opt, idx) => {
            const count = poll.vote_counts[idx] || 0;
            const pct = calculatePercentage(count, poll.total_votes);
            const isWinner = isClosed && poll.winner === idx;

            return (
              <div key={idx} className="relative rounded-xl bg-surface-light/40 border border-surface-border p-2.5 text-xs overflow-hidden">
                {/* Animated Progress Fill */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                    isWinner
                      ? "bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-r border-amber-500/50"
                      : "bg-brand-purple/20 border-r border-brand-purple/40"
                  }`}
                  style={{ width: `${pct}%` }}
                />

                <div className="relative z-10 flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5 text-slate-200 truncate max-w-[70%]">
                    {isWinner && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span>{opt}</span>
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    {pct}% <span className="text-slate-500 font-normal">({count})</span>
                  </span>
                </div>
              </div>
            );
          })}

          {poll.options.length > 3 && (
            <p className="text-[11px] text-slate-500 text-center italic">
              +{poll.options.length - 3} more options
            </p>
          )}
        </div>
      </div>

      {/* Card Footer Info & Actions */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <User className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{truncateAddress(poll.creator)}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeRemaining.text}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-light transition-colors"
            title="Share Poll Link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {!isClosed && onVoteClick && (
            <button
              onClick={() => onVoteClick(poll)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo text-white font-semibold text-xs shadow-md shadow-brand-purple/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Vote</span>
            </button>
          )}
        </div>
      </div>

      {copied && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg animate-bounce">
          Link Copied!
        </div>
      )}
    </div>
  );
};
