import React from "react";
import { useSoroban } from "../contexts/SorobanContext";
import { truncateAddress } from "../utils/formatters";
import { STELLAR_EXPLORER_URL } from "../utils/constants";
import { Activity, Vote, PlusCircle, CheckCircle2, UserCheck, Layers, Award, ExternalLink, Hash, User } from "lucide-react";

export const ActivityFeed: React.FC = () => {
  const { activityFeed } = useSoroban();

  const getEventIcon = (type: string) => {
    switch (type) {
      case "PollCreated":
        return <PlusCircle className="w-4 h-4 text-brand-purple" />;
      case "VoteCast":
        return <Vote className="w-4 h-4 text-brand-cyan" />;
      case "WinnerCalculated":
        return <Award className="w-4 h-4 text-amber-400" />;
      case "PollClosed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "UserRegistered":
      case "ProfileUpdated":
        return <UserCheck className="w-4 h-4 text-brand-pink" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-surface-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-cyan animate-pulse" />
          <span>Live Blockchain Event Stream</span>
        </h3>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          RPC Stream Active
        </span>
      </div>

      {activityFeed.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
          <p>Listening to Soroban event topics on Stellar Testnet...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {activityFeed.map((evt) => {
            const shortHash = evt.txHash
              ? `${evt.txHash.substring(0, 6)}...${evt.txHash.substring(evt.txHash.length - 4)}`
              : `Ledger #${evt.ledger}`;
            const explorerUrl = evt.txHash
              ? `${STELLAR_EXPLORER_URL}/tx/${evt.txHash}`
              : `${STELLAR_EXPLORER_URL}/ledger/${evt.ledger}`;

            return (
              <div
                key={evt.id}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-light/30 border border-surface-border/60 hover:bg-surface-light/60 transition-all text-xs group"
              >
                <div className="p-2.5 rounded-xl bg-surface border border-surface-border shrink-0 mt-0.5 shadow-sm">
                  {getEventIcon(evt.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-200 truncate">{evt.type}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {getTimeAgo(evt.timestamp)}
                    </span>
                  </div>

                  <p className="text-slate-300 font-medium truncate">{evt.details}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {/* Actor Wallet Badge */}
                    {evt.actor && (
                      <span className="flex items-center gap-1 font-mono text-slate-400 bg-surface-light/80 px-2 py-0.5 rounded-md border border-surface-border">
                        <User className="w-3 h-3 text-brand-purple" />
                        {truncateAddress(evt.actor)}
                      </span>
                    )}

                    {/* Stellar Testnet Explorer Tx Link */}
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-brand-cyan hover:underline bg-brand-cyan/10 px-2 py-0.5 rounded-md border border-brand-cyan/20 transition-all"
                    >
                      <Hash className="w-3 h-3" />
                      <span>{shortHash}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-70 group-hover:opacity-100" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
