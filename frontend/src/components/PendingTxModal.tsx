import React from "react";
import { Loader2, CheckCircle2, XCircle, ShieldCheck, Wallet, Cpu, Check } from "lucide-react";

interface PendingTxModalProps {
  step: "idle" | "simulating" | "signing" | "submitting" | "success" | "error";
  title?: string;
  errorMessage?: string | null;
  onClose: () => void;
}

export const PendingTxModal: React.FC<PendingTxModalProps> = ({
  step,
  title = "Processing Blockchain Transaction",
  errorMessage,
  onClose,
}) => {
  const steps = [
    { id: "simulating", label: "Simulating Soroban Transaction", icon: Cpu },
    { id: "signing", label: "Awaiting Freighter Wallet Signature", icon: Wallet },
    { id: "submitting", label: "Submitting to Stellar Testnet Ledger", icon: ShieldCheck },
  ];

  const getStepIndex = (currentStep: string) => {
    if (currentStep === "simulating") return 0;
    if (currentStep === "signing") return 1;
    if (currentStep === "submitting") return 2;
    if (currentStep === "success") return 3;
    return -1;
  };

  const currentIndex = getStepIndex(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-lg">
      <div className="glass-card w-full max-w-md rounded-3xl p-6 sm:p-8 border border-surface-border shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
        {step === "success" ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Transaction Confirmed!</h3>
            <p className="text-xs text-slate-400">
              Your action has been verified and permanently written to Stellar Testnet storage.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        ) : step === "error" ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/20">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Transaction Cancelled / Failed</h3>
            <p className="text-xs text-slate-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 leading-relaxed font-mono">
              {errorMessage || "The transaction signature was cancelled in Freighter wallet or could not be completed."}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-surface-light text-slate-200 font-semibold text-sm hover:bg-surface-light/80 transition-all border border-surface-border"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-brand-purple/20 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-purple to-brand-cyan p-0.5 flex items-center justify-center shadow-xl shadow-brand-purple/30">
                <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-brand-cyan animate-spin" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">{title}</h3>
              <p className="text-xs text-slate-400 mt-1">Please confirm the prompt in Freighter wallet</p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-3 text-left">
              {steps.map((st, idx) => {
                const isDone = currentIndex > idx;
                const isCurrent = currentIndex === idx;

                return (
                  <div
                    key={st.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium transition-all ${
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : isCurrent
                        ? "bg-brand-purple/20 border-brand-purple/50 text-white shadow-md shadow-brand-purple/10"
                        : "bg-surface-light/30 border-surface-border text-slate-500"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-brand-purple text-white animate-pulse"
                          : "bg-surface-light text-slate-500"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className="flex-1">{st.label}</span>
                    {isCurrent && <Loader2 className="w-4 h-4 text-brand-cyan animate-spin" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
