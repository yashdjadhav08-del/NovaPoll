import React from "react";

export const PollCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-surface-border space-y-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-24 h-5 bg-surface-light rounded-full" />
        <div className="w-16 h-5 bg-surface-light rounded-full" />
      </div>

      <div className="w-3/4 h-6 bg-surface-light rounded-lg" />
      <div className="w-full h-4 bg-surface-light rounded-lg" />
      <div className="w-2/3 h-4 bg-surface-light rounded-lg" />

      <div className="space-y-2 py-2">
        <div className="w-full h-9 bg-surface-light rounded-xl" />
        <div className="w-full h-9 bg-surface-light rounded-xl" />
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-surface-border">
        <div className="w-20 h-4 bg-surface-light rounded-lg" />
        <div className="w-16 h-8 bg-surface-light rounded-xl" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-surface-light/40 rounded-2xl border border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-light" />
            <div className="w-32 h-4 bg-surface-light rounded-lg" />
          </div>
          <div className="w-16 h-4 bg-surface-light rounded-lg" />
        </div>
      ))}
    </div>
  );
};
