import React from "react";
import { LeaderboardTable } from "../components/LeaderboardTable";

export const LeaderboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <LeaderboardTable />
    </div>
  );
};
