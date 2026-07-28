import React from "react";
import { Link } from "react-router-dom";
import { Vote } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-surface-border bg-background/90 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-cyan p-0.5 shadow-md shadow-brand-purple/20">
              <div className="w-full h-full bg-background rounded-[6px] flex items-center justify-center">
                <Vote className="w-3.5 h-3.5 text-brand-cyan" />
              </div>
            </div>
            <span className="text-base font-bold gradient-text">NovaPoll</span>
          </Link>

          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/dashboard" className="hover:text-slate-200 transition-colors">
              Dashboard
            </Link>
            <Link to="/browse" className="hover:text-slate-200 transition-colors">
              Browse Polls
            </Link>
            <Link to="/leaderboard" className="hover:text-slate-200 transition-colors">
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
