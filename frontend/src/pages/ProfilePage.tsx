import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, ProfileFormData } from "../utils/validators";
import { useWallet } from "../contexts/WalletContext";
import { registerUserProfile, updateUserProfile } from "../services/soroban";
import { PendingTxModal } from "../components/PendingTxModal";
import { truncateAddress, formatDate } from "../utils/formatters";
import { User, ShieldCheck, Edit3, Vote, Flame, Wallet, CheckCircle2 } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const {
    address,
    isConnected,
    isRegistered,
    userProfile,
    connectWallet,
    refreshProfile,
  } = useWallet();

  const [txStep, setTxStep] = useState<"idle" | "simulating" | "signing" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      profile_image_url: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      setValue("username", userProfile.username);
      setValue("bio", userProfile.bio);
      setValue("profile_image_url", userProfile.profile_image_url);
    }
  }, [userProfile, setValue]);

  if (!isConnected || !address) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center glass-card rounded-3xl border border-surface-border space-y-6 my-10">
        <div className="w-16 h-16 rounded-full bg-brand-purple/20 border border-brand-purple/40 text-brand-purple mx-auto flex items-center justify-center">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">Connect Wallet</h2>
        <p className="text-xs text-slate-400">Please connect your Freighter wallet to view or update your profile.</p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-semibold"
        >
          Connect Freighter Wallet
        </button>
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    if (!address) return;
    setErrorMessage(null);

    try {
      if (isRegistered) {
        await updateUserProfile(address, data.username, data.bio, data.profile_image_url, (step) => setTxStep(step));
      } else {
        await registerUserProfile(address, data.username, data.bio, data.profile_image_url, (step) => setTxStep(step));
      }
      await refreshProfile();
    } catch (err: any) {
      setTxStep("error");
      setErrorMessage(err.message || "Failed to register user profile on-chain.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Banner */}
      <div className="glass-card rounded-3xl p-8 border border-surface-border flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-purple via-brand-pink to-brand-cyan p-1 shadow-xl shadow-brand-purple/20">
          <div className="w-full h-full bg-surface rounded-xl overflow-hidden flex items-center justify-center">
            {userProfile?.profile_image_url ? (
              <img src={userProfile.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-brand-cyan" />
            )}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100">
              {userProfile?.username || "Unregistered Profile"}
            </h1>

            {isRegistered ? (
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified On-Chain
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Action Required: Register Profile
              </span>
            )}
          </div>

          <p className="text-xs font-mono text-slate-400">{address}</p>
          <p className="text-xs text-slate-300 max-w-xl">
            {userProfile?.bio || "No bio added yet. Register or update your profile below."}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-2">
          <p className="text-xs text-slate-400">Polls Authored</p>
          <p className="text-2xl font-extrabold font-mono text-brand-purple">
            {userProfile?.polls_created || 0}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-2">
          <p className="text-xs text-slate-400">Votes Cast</p>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">
            {userProfile?.votes_cast || 0}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-2">
          <p className="text-xs text-slate-400">Joined Date</p>
          <p className="text-2xl font-extrabold font-mono text-brand-cyan">
            {userProfile?.joined_at ? formatDate(userProfile.joined_at) : "Today"}
          </p>
        </div>
      </div>

      {/* Profile Setup / Edit Form */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-surface-border space-y-6">
        <div className="flex items-center gap-3 border-b border-surface-border pb-4">
          <Edit3 className="w-5 h-5 text-brand-purple" />
          <h2 className="text-lg font-bold text-slate-100">
            {isRegistered ? "Edit Profile Settings" : "Register On-Chain Profile"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">
              Username <span className="text-brand-pink">*</span>
            </label>
            <input
              {...register("username")}
              placeholder="e.g. Satoshi_Stellar"
              className="w-full glass-input"
            />
            {errors.username && <p className="text-[11px] text-rose-400">{errors.username.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              placeholder="Tell the community about yourself..."
              className="w-full glass-input resize-none"
            />
            {errors.bio && <p className="text-[11px] text-rose-400">{errors.bio.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-200">Profile Image URL</label>
            <input
              {...register("profile_image_url")}
              placeholder="https://images.unsplash.com/your-avatar.jpg"
              className="w-full glass-input"
            />
            {errors.profile_image_url && <p className="text-[11px] text-rose-400">{errors.profile_image_url.message}</p>}
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-xs font-bold shadow-lg shadow-brand-purple/25 hover:scale-105 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isRegistered ? "Save Profile Changes" : "Register On-Chain Profile"}</span>
            </button>
          </div>
        </form>
      </div>

      {txStep !== "idle" && (
        <PendingTxModal
          step={txStep}
          title={isRegistered ? "Updating Profile" : "Registering Profile"}
          onClose={() => setTxStep("idle")}
        />
      )}
    </div>
  );
};
