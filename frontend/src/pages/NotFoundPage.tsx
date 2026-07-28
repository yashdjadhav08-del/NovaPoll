import React from "react";
import { Link } from "react-router-dom";
import { Vote, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple mx-auto flex items-center justify-center animate-bounce">
        <Vote className="w-10 h-10" />
      </div>
      <h1 className="text-5xl font-extrabold gradient-text">404</h1>
      <h2 className="text-xl font-bold text-slate-100">Page Not Found</h2>
      <p className="text-xs text-slate-400">
        The requested page does not exist or has been moved to another location.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold shadow-lg shadow-brand-purple/20"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
