import { useState, useMemo } from "react";
import { useSoroban } from "../contexts/SorobanContext";
import { CATEGORIES, Poll } from "../utils/constants";

export function usePolls() {
  const { polls, isLoadingPolls, refreshPolls, activePollsCount, closedPollsCount, totalVotesCount } = useSoroban();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "ALL">("ALL");
  const [selectedFilter, setSelectedFilter] = useState<"NEWEST" | "OLDEST" | "MOST_VOTES" | "TRENDING" | "ACTIVE" | "CLOSED">("NEWEST");

  const filteredPolls = useMemo(() => {
    let result = [...polls];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.creator.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter & Sort
    switch (selectedFilter) {
      case "NEWEST":
        result.sort((a, b) => b.created_at - a.created_at);
        break;
      case "OLDEST":
        result.sort((a, b) => a.created_at - b.created_at);
        break;
      case "MOST_VOTES":
        result.sort((a, b) => b.total_votes - a.total_votes);
        break;
      case "TRENDING":
        result = result.filter((p) => p.status === 0).sort((a, b) => b.total_votes - a.total_votes);
        break;
      case "ACTIVE":
        result = result.filter((p) => p.status === 0);
        break;
      case "CLOSED":
        result = result.filter((p) => p.status === 1);
        break;
    }

    return result;
  }, [polls, searchQuery, selectedCategory, selectedFilter]);

  const trendingPoll = useMemo(() => {
    const active = polls.filter((p) => p.status === 0);
    if (active.length === 0) return null;
    return active.reduce((prev, curr) => (curr.total_votes > prev.total_votes ? curr : prev), active[0]);
  }, [polls]);

  return {
    polls: filteredPolls,
    allPolls: polls,
    isLoadingPolls,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedFilter,
    setSelectedFilter,
    refreshPolls,
    trendingPoll,
    stats: {
      totalPolls: polls.length,
      activePolls: activePollsCount,
      closedPolls: closedPollsCount,
      totalVotes: totalVotesCount,
    },
  };
}
