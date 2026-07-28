import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pollFormSchema, PollFormData } from "../utils/validators";
import { CATEGORIES } from "../utils/constants";
import { useWallet } from "../contexts/WalletContext";
import { useSoroban } from "../contexts/SorobanContext";
import { createSorobanPoll } from "../services/soroban";
import { PendingTxModal } from "../components/PendingTxModal";
import { PlusCircle, Trash2, Plus, Sparkles, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

export const CreatePollPage: React.FC = () => {
  const { address, isConnected, isRegistered, connectWallet } = useWallet();
  const { refreshPolls } = useSoroban();
  const navigate = useNavigate();

  const [options, setOptions] = useState<string[]>(["Option 1", "Option 2"]);
  const [txStep, setTxStep] = useState<"idle" | "simulating" | "signing" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: 0,
      options: ["Option 1", "Option 2"],
      durationDays: 7,
    },
  });

  const watchTitle = watch("title");
  const watchCategory = watch("category");

  const addOption = () => {
    if (options.length < 6) {
      const nextOptions = [...options, `Option ${options.length + 1}`];
      setOptions(nextOptions);
      setValue("options", nextOptions);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const nextOptions = options.filter((_, i) => i !== index);
      setOptions(nextOptions);
      setValue("options", nextOptions);
    }
  };

  const updateOption = (index: number, val: string) => {
    const nextOptions = [...options];
    nextOptions[index] = val;
    setOptions(nextOptions);
    setValue("options", nextOptions);
  };

  const onSubmit = async (data: PollFormData) => {
    if (!isConnected || !address) {
      connectWallet();
      return;
    }

    if (!isRegistered) {
      setErrorMessage("You must register an on-chain User profile before creating polls!");
      return;
    }

    setErrorMessage(null);

    try {
      await createSorobanPoll(
        address,
        data.title,
        data.description,
        data.category,
        options,
        data.durationDays,
        (step) => setTxStep(step)
      );
      await refreshPolls();
    } catch (err: any) {
      setTxStep("error");
      setErrorMessage(err.message || "Failed to create Soroban poll transaction.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="glass-card p-8 rounded-3xl border border-surface-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Create Soroban Community Poll</h1>
            <p className="text-xs text-slate-400">
              Deploy an immutable vote topic directly to Stellar Testnet smart contracts
            </p>
          </div>
        </div>
      </div>

      {/* User Registration Notice */}
      {isConnected && !isRegistered && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <p className="font-bold text-sm">On-Chain User Registration Required</p>
            <p className="mt-1 leading-relaxed text-amber-200/80">
              NovaPoll enforces Level 3 Inter-Contract Verification. The Poll Contract checks your wallet against the User Contract before creating a poll. Please create your user profile first.
            </p>
          </div>
        </div>
      )}

      {/* Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Poll Question / Title <span className="text-brand-pink">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="e.g. Should Stellar Soroban adopt EVM compatibility?"
                className="w-full glass-input"
              />
              {errors.title && <p className="text-[11px] text-rose-400">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Description & Context <span className="text-brand-pink">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Provide detailed context, background rules, or guidelines for voters..."
                className="w-full glass-input resize-none"
              />
              {errors.description && <p className="text-[11px] text-rose-400">{errors.description.message}</p>}
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Category</label>
                <select
                  {...register("category", { valueAsNumber: true })}
                  className="w-full glass-input bg-surface text-slate-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-surface text-slate-200">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Voting Duration</label>
                <select
                  {...register("durationDays", { valueAsNumber: true })}
                  className="w-full glass-input bg-surface text-slate-200"
                >
                  <option value={1}>1 Day (Fast Vote)</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Standard)</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days (Long Term)</option>
                </select>
              </div>
            </div>

            {/* Poll Options (Dynamic Array) */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-200">
                  Poll Options (Min 2, Max 6) <span className="text-brand-pink">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{options.length}/6 options</span>
              </div>

              <div className="space-y-3">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 glass-input"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.options && <p className="text-[11px] text-rose-400">{errors.options.message}</p>}

              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-light border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-colors mt-2"
                >
                  <Plus className="w-4 h-4 text-brand-purple" />
                  <span>Add Option</span>
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                {errorMessage}
              </div>
            )}

            {/* Submit CTA */}
            <div className="pt-4 border-t border-surface-border flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-sm font-bold shadow-xl shadow-brand-purple/30 hover:scale-105 active:scale-95 transition-all"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Publish Poll On-Chain</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Live Card Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span>Live Poll Card Preview</span>
          </h3>

          <div className="glass-card rounded-2xl p-6 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-light border border-surface-border text-slate-300">
                {CATEGORIES[watchCategory]?.name || "Blockchain"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-100">
              {watchTitle || "Your Poll Title Will Appear Here"}
            </h4>

            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-surface-light/40 border border-surface-border text-xs text-slate-300">
                  {opt || `Option ${i + 1}`}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-surface-border flex justify-between text-[11px] text-slate-400">
              <span>Creator: {address ? address.substring(0, 6) + "..." : "0x00...000"}</span>
              <span>0 Votes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Tx Modal */}
      {txStep !== "idle" && (
        <PendingTxModal
          step={txStep}
          title="Creating Soroban Poll"
          onClose={() => {
            setTxStep("idle");
            if (txStep === "success") navigate("/browse");
          }}
        />
      )}
    </div>
  );
};
