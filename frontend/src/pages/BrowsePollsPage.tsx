import React, { useState } from "react";
import { usePolls } from "../hooks/usePolls";
import { PollCard } from "../components/PollCard";
import { VoteModal } from "../components/VoteModal";
import { CATEGORIES, Poll } from "../utils/constants";
import { Search, Filter, SlidersHorizontal, Compass, Sparkles } from "lucide-react";

export const BrowsePollsPage: React.FC = () => {
  const {
    polls,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedFilter,
    setSelectedFilter,
    isLoadingPolls,
  } = usePolls();

  const [selectedVotePoll, setSelectedVotePoll] = useState<Poll | null>(null);

  const filters = [
    { id: "NEWEST", label: "Newest" },
    { id: "TRENDING", label: "Trending" },
    { id: "MOST_VOTES", label: "Most Votes" },
    { id: "ACTIVE", label: "Active" },
    { id: "CLOSED", label: "Closed" },
    { id: "OLDEST", label: "Oldest" },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="glass-card p-8 rounded-3xl border border-surface-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Browse Soroban Polls</h1>
            <p className="text-xs text-slate-400">Discover and participate in Web3 community governance</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, category, or creator address..."
            className="w-full glass-input pl-12 py-3"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200"
            }`}
          >
            All Categories
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                  : "bg-surface-light border border-surface-border text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting & Result Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-400 font-mono">
          Showing <span className="text-slate-100 font-bold">{polls.length}</span> community polls
        </p>

        <div className="flex items-center gap-2 bg-surface-light p-1 rounded-xl border border-surface-border overflow-x-auto max-w-full">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFilter === f.id
                  ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Poll Grid */}
      {polls.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-slate-200">No Polls Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No community polls match your current search query or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.poll_id} poll={poll} onVoteClick={(p) => setSelectedVotePoll(p)} />
          ))}
        </div>
      )}

      {/* Vote Modal */}
      {selectedVotePoll && (
        <VoteModal poll={selectedVotePoll} onClose={() => setSelectedVotePoll(null)} />
      )}
    </div>
  );
};
