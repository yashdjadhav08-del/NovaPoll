import { useWallet } from "../contexts/WalletContext";

export function useUserProfile() {
  const {
    address,
    userProfile,
    isRegistered,
    isProfileLoading,
    refreshProfile,
    setUserProfile,
    setIsRegistered,
  } = useWallet();

  return {
    address,
    userProfile,
    isRegistered,
    isProfileLoading,
    refreshProfile,
    setUserProfile,
    setIsRegistered,
  };
}
