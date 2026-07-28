import React, { useState } from "react";
import { STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE, USER_CONTRACT_ID, POLL_CONTRACT_ID } from "../utils/constants";
import { Settings, Cpu, Layers, ShieldCheck, Check } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [userContract, setUserContract] = useState(USER_CONTRACT_ID);
  const [pollContract, setPollContract] = useState(POLL_CONTRACT_ID);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="glass-card p-8 rounded-3xl border border-surface-border">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-cyan" />
          <span>Platform Settings & Soroban RPC Config</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Configure contract addresses and RPC endpoints for NovaPoll</p>
      </div>

      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-purple" />
            <span>Smart Contract Deployment Addresses</span>
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">User Contract ID</label>
            <input
              type="text"
              value={userContract}
              onChange={(e) => setUserContract(e.target.value)}
              className="w-full glass-input font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Poll Contract ID</label>
            <input
              type="text"
              value={pollContract}
              onChange={(e) => setPollContract(e.target.value)}
              className="w-full glass-input font-mono text-xs"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-surface-border space-y-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-cyan" />
            <span>Stellar Testnet RPC Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-surface-light/40 border border-surface-border space-y-1">
              <span className="text-slate-400">RPC Endpoint:</span>
              <p className="text-slate-200 truncate">{STELLAR_RPC_URL}</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-light/40 border border-surface-border space-y-1">
              <span className="text-slate-400">Network Passphrase:</span>
              <p className="text-slate-200 truncate">{STELLAR_NETWORK_PASSPHRASE}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {saved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Config Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto px-6 py-2.5 rounded-xl bg-brand-purple text-white text-xs font-bold shadow-lg"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
