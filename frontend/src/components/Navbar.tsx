import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { useSoroban } from "../contexts/SorobanContext";
import { truncateAddress } from "../utils/formatters";
import {
  Vote,
  LayoutDashboard,
  PlusCircle,
  Compass,
  Trophy,
  User,
  Settings,
  Wallet,
  LogOut,
  ChevronDown,
  Activity,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { address, isConnected, isConnecting, userProfile, connectWallet, disconnectWallet } = useWallet();
  const { ledgerSequence } = useSoroban();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/browse", label: "Browse Polls", icon: Compass },
    { path: "/create", label: "Create Poll", icon: PlusCircle },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan p-0.5 shadow-lg shadow-brand-purple/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                <Vote className="w-5 h-5 text-brand-cyan group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight gradient-text">
                NovaPoll
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Testnet #{ledgerSequence}</span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface/50 p-1.5 rounded-2xl border border-surface-border">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-md shadow-brand-purple/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-surface-light/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Wallet Action */}
          <div className="hidden md:flex items-center gap-4">
            {isConnected && address ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-3.5 py-2 rounded-xl glass-card glass-card-hover text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {userProfile?.profile_image_url ? (
                      <img src={userProfile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.username?.substring(0, 2).toUpperCase() || address.substring(2, 4)
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">
                      {userProfile?.username || truncateAddress(address)}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono">Freighter Connected</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl py-2 shadow-2xl border border-surface-border z-50">
                    <div className="px-4 py-2 border-b border-surface-border">
                      <p className="text-xs text-slate-400">Connected Wallet</p>
                      <p className="text-xs font-mono font-medium text-slate-200 truncate">{address}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-surface-light/50 transition-colors"
                    >
                      <User className="w-4 h-4 text-brand-purple" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/my-polls"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-surface-light/50 transition-colors"
                    >
                      <Vote className="w-4 h-4 text-brand-pink" />
                      <span>My Polls & Votes</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-surface-light/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-brand-cyan" />
                      <span>Settings & RPC</span>
                    </Link>

                    <div className="my-1 border-t border-surface-border" />

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        disconnectWallet();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white text-sm font-semibold shadow-lg shadow-brand-purple/25 hover:shadow-brand-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? "Connecting..." : "Connect Freighter"}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-light/50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-surface-border px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive(link.path)
                      ? "bg-brand-purple/20 text-brand-purple"
                      : "text-slate-300 hover:bg-surface-light/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-surface-border space-y-2">
            {isConnected && address ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2 bg-surface-light/30 rounded-xl mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-purple to-brand-pink flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                    {userProfile?.profile_image_url ? (
                      <img src={userProfile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.username?.substring(0, 2).toUpperCase() || address.substring(2, 4)
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {userProfile?.username || truncateAddress(address)}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono">Freighter Connected</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-surface-light/50"
                >
                  <User className="w-4 h-4 text-brand-purple" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/my-polls"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-surface-light/50"
                >
                  <Vote className="w-4 h-4 text-brand-pink" />
                  <span>My Polls & Votes</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-surface-light/50 text-slate-300"
                >
                  <Settings className="w-4 h-4 text-brand-cyan" />
                  <span>Settings & RPC</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    disconnectWallet();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 font-medium text-sm mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  connectWallet();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-white font-semibold text-sm shadow-lg"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Freighter Wallet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
