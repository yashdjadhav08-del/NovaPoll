import {
  isConnected,
  isAllowed,
  setAllowed,
  getUserInfo,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";
import { STELLAR_NETWORK_PASSPHRASE } from "../utils/constants";

export interface FreighterWalletState {
  isConnected: boolean;
  address: string | null;
  network: string | null;
  error: string | null;
}

export async function checkFreighterAvailable(): Promise<boolean> {
  try {
    const res = await isConnected();
    return typeof res === "boolean" ? res : !!(res as any)?.isConnected;
  } catch (err) {
    console.error("Freighter detection error:", err);
    return false;
  }
}

export async function connectFreighterWallet(): Promise<FreighterWalletState> {
  try {
    const [userInfo, networkInfo] = await Promise.all([
      getUserInfo().catch(() => null),
      getNetwork().catch(() => "TESTNET"),
    ]);

    let pubKey = typeof userInfo === "string" ? userInfo : (userInfo as any)?.publicKey || null;
    let netStr = typeof networkInfo === "string" ? networkInfo : (networkInfo as any)?.network || "TESTNET";

    if (!pubKey) {
      await setAllowed().catch(() => false);
      const freshUser: any = await getUserInfo().catch(() => null);
      pubKey = typeof freshUser === "string" ? freshUser : freshUser?.publicKey || null;
    }

    if (!pubKey) {
      return {
        isConnected: false,
        address: null,
        network: null,
        error: "Freighter wallet extension is not installed or connection was denied.",
      };
    }

    return {
      isConnected: true,
      address: pubKey.trim(),
      network: netStr,
      error: null,
    };
  } catch (err: any) {
    return {
      isConnected: false,
      address: null,
      network: null,
      error: err.message || "Failed to connect Freighter wallet.",
    };
  }
}

export async function signFreighterTx(
  xdr: string,
  networkPassphrase = STELLAR_NETWORK_PASSPHRASE
): Promise<string> {
  const allowedRes = await isAllowed().catch(() => false);
  const isAllow = typeof allowedRes === "boolean" ? allowedRes : !!(allowedRes as any)?.isAllowed;
  
  if (!isAllow) {
    const setRes = await setAllowed().catch(() => false);
    const isSet = typeof setRes === "boolean" ? setRes : !!(setRes as any)?.isAllowed;
    if (!isSet) {
      throw new Error("Freighter wallet connection permission was rejected by user.");
    }
  }

  // Trigger Freighter extension popup window to request signature
  let signedResult: any;
  try {
    signedResult = await signTransaction(xdr, {
      networkPassphrase,
    });
  } catch (err: any) {
    throw new Error(err.message || "Transaction signature was cancelled in Freighter wallet.");
  }

  const signedXdr =
    typeof signedResult === "string"
      ? signedResult
      : signedResult?.signedTxXdr || signedResult?.xdr || null;

  if (!signedXdr) {
    throw new Error("Transaction signature was rejected or cancelled in Freighter wallet.");
  }

  return signedXdr;
}
