import React from "react";

export const AuroraBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-purple/20 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-cyan/15 blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] rounded-full bg-brand-pink/10 blur-[130px] pointer-events-none animate-pulse-slow" />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
