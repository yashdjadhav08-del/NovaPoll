import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastProps {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300 max-w-sm text-xs ${
        type === "success"
          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
          : type === "error"
          ? "bg-rose-950/80 border-rose-500/40 text-rose-200"
          : "bg-blue-950/80 border-blue-500/40 text-blue-200"
      }`}
    >
      {type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
      {type === "error" && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
      {type === "info" && <Info className="w-5 h-5 text-blue-400 shrink-0" />}

      <span className="flex-1 font-medium leading-relaxed">{message}</span>

      <button onClick={onClose} className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
