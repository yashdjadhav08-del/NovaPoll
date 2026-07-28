import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchAllPolls, getLatestLedgerSequence } from "../services/soroban";
import { sorobanEventListener } from "../services/events";
import { useWallet } from "./WalletContext";
import { Poll, SorobanEventData } from "../utils/constants";

interface SorobanContextType {
  polls: Poll[];
  isLoadingPolls: boolean;
  ledgerSequence: number;
  activityFeed: SorobanEventData[];
  refreshPolls: () => Promise<void>;
  totalVotesCount: number;
  activePollsCount: number;
  closedPollsCount: number;
}

const SorobanContext = createContext<SorobanContextType | undefined>(undefined);

export const SorobanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoadingPolls, setIsLoadingPolls] = useState<boolean>(true);
  const [ledgerSequence, setLedgerSequence] = useState<number>(0);
  const [activityFeed, setActivityFeed] = useState<SorobanEventData[]>([]);

  const { address } = useWallet();

  const refreshPolls = useCallback(async () => {
    setIsLoadingPolls(true);
    try {
      const fetched = await fetchAllPolls();
      setPolls(fetched);
    } catch (err) {
      console.error("Error refreshing polls:", err);
    } finally {
      setIsLoadingPolls(false);
    }
  }, []);

  const refreshLedger = useCallback(async () => {
    try {
      const seq = await getLatestLedgerSequence();
      setLedgerSequence(seq);
    } catch (err) {
      console.warn("Error fetching ledger:", err);
    }
  }, []);

  // Re-fetch polls whenever connected wallet address changes
  useEffect(() => {
    refreshPolls();
  }, [address, refreshPolls]);

  // Listen to window storage events for real-time side-by-side browser sync
  useEffect(() => {
    const handleStorageChange = () => {
      refreshPolls();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshPolls]);

  useEffect(() => {
    refreshPolls();
    refreshLedger();

    const ledgerInterval = setInterval(refreshLedger, 5000);

    // Subscribe to Soroban event streaming
    sorobanEventListener.startListening(4000);
    const unsubscribe = sorobanEventListener.subscribe((eventData) => {
      setActivityFeed((prev) => [eventData, ...prev.slice(0, 19)]);
      // Instantly refresh poll data on blockchain events!
      refreshPolls();
    });

    return () => {
      clearInterval(ledgerInterval);
      unsubscribe();
      sorobanEventListener.stopListening();
    };
  }, [refreshPolls, refreshLedger]);

  const totalVotesCount = polls.reduce((sum, p) => sum + (p.total_votes || 0), 0);
  const activePollsCount = polls.filter((p) => p.status === 0).length;
  const closedPollsCount = polls.filter((p) => p.status === 1).length;

  return (
    <SorobanContext.Provider
      value={{
        polls,
        isLoadingPolls,
        ledgerSequence,
        activityFeed,
        refreshPolls,
        totalVotesCount,
        activePollsCount,
        closedPollsCount,
      }}
    >
      {children}
    </SorobanContext.Provider>
  );
};

export const useSoroban = () => {
  const context = useContext(SorobanContext);
  if (!context) {
    throw new Error("useSoroban must be used within a SorobanProvider");
  }
  return context;
};
