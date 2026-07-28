import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isAllowed, getUserInfo } from "@stellar/freighter-api";
import { connectFreighterWallet, FreighterWalletState } from "../services/freighter";
import { fetchUserProfile, checkUserRegistered } from "../services/soroban";
import { UserProfile } from "../utils/constants";

interface WalletContextType {
  address: string | null;
  network: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  isRegistered: boolean;
  isProfileLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshProfile: () => Promise<void>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setIsRegistered: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>("TESTNET");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);
  const [manuallyDisconnected, setManuallyDisconnected] = useState<boolean>(false);

  const refreshProfile = useCallback(async () => {
    if (!address) {
      setUserProfile(null);
      setIsRegistered(false);
      return;
    }

    setIsProfileLoading(true);
    try {
      const reg = await checkUserRegistered(address);
      setIsRegistered(reg);

      if (reg) {
        const prof = await fetchUserProfile(address);
        setUserProfile(prof);
      } else {
        setUserProfile(null);
      }
    } catch (err) {
      console.error("Error refreshing profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  }, [address]);

  // Poll Freighter wallet to detect active account switching (respects manual disconnect)
  useEffect(() => {
    async function checkActiveAccount() {
      if (manuallyDisconnected) return;
      try {
        const allowedRes = await isAllowed().catch(() => false);
        const isAllow = typeof allowedRes === "boolean" ? allowedRes : !!(allowedRes as any)?.isAllowed;
        if (isAllow) {
          const userInfo: any = await getUserInfo().catch(() => null);
          const pubKey = typeof userInfo === "string" ? userInfo : userInfo?.publicKey || null;
          if (pubKey && pubKey !== address) {
            setAddress(pubKey);
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Silent ignore
      }
    }

    checkActiveAccount();
    const interval = setInterval(checkActiveAccount, 2000);
    return () => clearInterval(interval);
  }, [address, manuallyDisconnected]);

  useEffect(() => {
    if (address) {
      refreshProfile();
    }
  }, [address, refreshProfile]);

  const connectWallet = async () => {
    setManuallyDisconnected(false);
    setIsConnecting(true);
    setError(null);
    try {
      const walletState: FreighterWalletState = await connectFreighterWallet();
      if (walletState.isConnected && walletState.address) {
        setAddress(walletState.address);
        setNetwork(walletState.network || "TESTNET");
        setIsConnected(true);
      } else {
        setError(walletState.error || "Failed to connect wallet.");
        setIsConnected(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setManuallyDisconnected(true);
    setAddress(null);
    setIsConnected(false);
    setUserProfile(null);
    setIsRegistered(false);
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        network,
        isConnected,
        isConnecting,
        error,
        userProfile,
        isRegistered,
        isProfileLoading,
        connectWallet,
        disconnectWallet,
        refreshProfile,
        setUserProfile,
        setIsRegistered,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
