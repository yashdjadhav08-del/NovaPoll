import React, { useState } from "react";
import { Poll } from "../utils/constants";
import { useWallet } from "../contexts/WalletContext";
import { useSoroban } from "../contexts/SorobanContext";
import { voteSorobanPoll } from "../services/soroban";
import { PendingTxModal } from "./PendingTxModal";
import { X, Vote, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

interface VoteModalProps {
  poll: Poll;
  onClose: () => void;
}

export const VoteModal: React.FC<VoteModalProps> = ({ poll, onClose }) => {
  const { address, isConnected, isRegistered, connectWallet } = useWallet();
  const { refreshPolls } = useSoroban();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [txStep, setTxStep] = useState<"idle" | "simulating" | "signing" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVoteSubmit = async () => {
    if (selectedOption === null) return;
    if (!isConnected || !address) {
      connectWallet();
      return;
    }

    if (!isRegistered) {
      setErrorMessage("You must register an on-chain User profile before creating polls or voting!");
      return;
    }

    setErrorMessage(null);

    try {
      await voteSorobanPoll(address, poll.poll_id, selectedOption, (step) => setTxStep(step));
      await refreshPolls();
    } catch (err: any) {
      setTxStep("error");
      setErrorMessage(err.message || "Transaction signature was cancelled in Freighter wallet.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-surface-border shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Cast On-Chain Vote</h3>
              <p className="text-xs text-slate-400">Poll #{poll.poll_id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-slate-200 mb-4">{poll.title}</h4>

        {/* Not registered warning */}
        {isConnected && !isRegistered && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-semibold">User Registration Required</p>
              <p className="text-[11px] text-amber-200/80">
                Soroban inter-contract validation requires a registered profile before voting. Visit your Profile page to register.
              </p>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="space-y-3 mb-6">
          {poll.options.map((option, index) => {
            const isSelected = selectedOption === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-brand-purple/20 to-brand-indigo/20 border-brand-purple text-white shadow-lg shadow-brand-purple/10"
                    : "bg-surface-light/40 border-surface-border text-slate-300 hover:border-slate-600 hover:bg-surface-light/70"
                }`}
              >
                <span>{option}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? "border-brand-purple bg-brand-purple text-white" : "border-slate-500"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {errorMessage && txStep === "idle" && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-light text-sm font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleVoteSubmit}
            disabled={selectedOption === null}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-sm font-semibold shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm Vote</span>
          </button>
        </div>

        {/* Transaction Modal Overlay */}
        {txStep !== "idle" && (
          <PendingTxModal
            step={txStep}
            title="Submitting Soroban Vote"
            errorMessage={errorMessage}
            onClose={() => {
              setTxStep("idle");
              if (txStep === "success") onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};
