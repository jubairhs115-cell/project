"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Message({ type = "info", message, onClose }) {
  if (!message) return null;

  const styles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-indigo-50 text-indigo-800 border-indigo-200",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${styles[type] || styles.info} animate-fadeIn`}>
      <div className="flex items-start gap-3">
        {icons[type] || icons.info}
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition -mr-1 -mt-1 p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

