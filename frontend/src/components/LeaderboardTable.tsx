import React, { useState } from "react";
import { useSoroban } from "../contexts/SorobanContext";
import { useWallet } from "../contexts/WalletContext";
import { truncateAddress } from "../utils/formatters";
import { Trophy, Medal, Award, Flame, Vote, UserX } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  address: string;
  username: string;
  avatar: string;
  pollsCreated: number;
  votesCast: number;
  reputationScore: number;
}

export const LeaderboardTable: React.FC = () => {
  const [tab, setTab] = useState<"creators" | "voters">("creators");
  const { polls } = useSoroban();
  const { address: currentAddress, userProfile } = useWallet();

  const userMap = new Map<
    string,
    { address: string; username: string; avatar: string; pollsCreated: number; votesCast: number; totalVotesReceived: number }
  >();

  const getOrInitUser = (rawAddr: string) => {
    if (!rawAddr || typeof rawAddr !== "string") return null;
    const cleanAddr = rawAddr.trim();
    if (!cleanAddr.startsWith("G") || cleanAddr.length < 50) return null;

    const norm = cleanAddr.toLowerCase();
    if (!userMap.has(norm)) {
      const isCurrent = currentAddress?.toLowerCase().trim() === norm;
      userMap.set(norm, {
        address: cleanAddr,
        username: isCurrent && userProfile?.username ? userProfile.username : truncateAddress(cleanAddr),
        avatar: isCurrent && userProfile?.profile_image_url ? userProfile.profile_image_url : `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanAddr}`,
        pollsCreated: 0,
        votesCast: 0,
        totalVotesReceived: 0,
      });
    }
    return userMap.get(norm)!;
  };

  // 1. Scan registered profiles from localStorage (excluding registry key)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("novapoll_user_") && key !== "novapoll_users_registry") {
      try {
        const u = JSON.parse(localStorage.getItem(key) || "");
        if (u && u.wallet_address) {
          const userObj = getOrInitUser(u.wallet_address);
          if (userObj) {
            if (u.username) userObj.username = u.username;
            if (u.profile_image_url) userObj.avatar = u.profile_image_url;
            if (typeof u.votes_cast === "number") userObj.votesCast = Math.max(userObj.votesCast, u.votes_cast);
            if (typeof u.polls_created === "number") userObj.pollsCreated = Math.max(userObj.pollsCreated, u.polls_created);
          }
        }
      } catch (e) {}
    }
  }

  // 2. Count actual polls created by each user from active polls list
  polls.forEach((poll) => {
    if (poll.creator) {
      const creatorObj = getOrInitUser(poll.creator);
      if (creatorObj) {
        creatorObj.pollsCreated += 1;
        creatorObj.totalVotesReceived += poll.total_votes || 0;
      }
    }
  });

  // 3. Ensure current connected wallet user is present with accurate profile data
  if (currentAddress) {
    const currentObj = getOrInitUser(currentAddress);
    if (currentObj && userProfile) {
      if (userProfile.username) currentObj.username = userProfile.username;
      if (userProfile.profile_image_url) currentObj.avatar = userProfile.profile_image_url;
      if (typeof userProfile.votes_cast === "number") {
        currentObj.votesCast = Math.max(currentObj.votesCast, userProfile.votes_cast);
      }
      if (typeof userProfile.polls_created === "number") {
        currentObj.pollsCreated = Math.max(currentObj.pollsCreated, userProfile.polls_created);
      }
    }
  }

  const leaderboardList: LeaderboardUser[] = Array.from(userMap.values()).map((data) => {
    // Real governance points formula: 10 PTS per Poll Authored + 5 PTS per Vote Cast
    const reputationScore = data.pollsCreated * 10 + data.votesCast * 5;
    return {
      rank: 0,
      address: data.address,
      username: data.username,
      avatar: data.avatar,
      pollsCreated: data.pollsCreated,
      votesCast: data.votesCast,
      reputationScore,
    };
  });

  // Primary sort by Reputation Score (PTS) so higher points ALWAYS rank higher!
  const sortedUsers = [...leaderboardList].sort((a, b) => {
    if (b.reputationScore !== a.reputationScore) {
      return b.reputationScore - a.reputationScore;
    }
    return tab === "creators"
      ? b.pollsCreated - a.pollsCreated
      : b.votesCast - a.votesCast;
  });

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Community Leaderboard</span>
          </h3>
          <p className="text-xs text-slate-400">Live rankings derived from on-chain Stellar Testnet activity</p>
        </div>

        <div className="flex bg-surface-light p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setTab("creators")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "creators"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Top Creators</span>
          </button>

          <button
            onClick={() => setTab("voters")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === "voters"
                ? "bg-brand-purple text-white shadow-md shadow-brand-purple/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Active Voters</span>
          </button>
        </div>
      </div>

      {/* Table / Empty State */}
      {sortedUsers.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <UserX className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">No On-Chain Rankings Yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Connect your Freighter wallet, register your profile, and create polls to earn the #1 rank on the leaderboard!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-border text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-4 pl-2">Rank</th>
                <th className="pb-4">User</th>
                <th className="pb-4 text-center">Polls Created</th>
                <th className="pb-4 text-center">Votes Cast</th>
                <th className="pb-4 text-right pr-2">Reputation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-sm">
              {sortedUsers.map((user, idx) => {
                const rank = idx + 1;
                return (
                  <tr key={user.address.toLowerCase()} className="hover:bg-surface-light/40 transition-colors group">
                    <td className="py-4 pl-2 font-bold font-mono">
                      {rank === 1 ? (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40 shadow-sm shadow-amber-400/20">
                          <Trophy className="w-4 h-4" />
                        </span>
                      ) : rank === 2 ? (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 border border-slate-300/40">
                          <Medal className="w-4 h-4" />
                        </span>
                      ) : rank === 3 ? (
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-600/40">
                          <Award className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="text-slate-500 pl-2">#{rank}</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-9 h-9 rounded-xl object-cover border border-surface-border bg-surface-light"
                        />
                        <div>
                          <p className="font-bold text-slate-100 group-hover:text-brand-purple transition-colors">
                            {user.username}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            {truncateAddress(user.address)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center font-mono font-semibold text-slate-200">
                      {user.pollsCreated}
                    </td>
                    <td className="py-4 text-center font-mono font-semibold text-slate-200">
                      {user.votesCast}
                    </td>
                    <td className="py-4 text-right pr-2 font-mono font-bold text-brand-cyan">
                      {user.reputationScore.toLocaleString()} PTS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
