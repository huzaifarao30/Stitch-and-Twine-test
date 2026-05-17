"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { subscribeToast, type ToastEvent } from "@/lib/toastBus";

export default function ToastViewport() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((evt) => {
      setToasts((prev) => [...prev, evt].slice(-4));
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== evt.id));
      }, 2200);
    });

    return unsubscribe;
  }, []);

  const iconByTone = {
    success: <CheckCircle2 size={14} className="text-emerald-600" />,
    info: <Info size={14} className="text-[var(--accent-gold)]" />,
    error: <AlertCircle size={14} className="text-red-500" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[95] flex w-[min(92vw,340px)] flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-card ${toast.tone === "error" ? "toast-card-error" : "toast-card-success"}`}
        >
          {iconByTone[toast.tone]}
          <span className="text-xs sm:text-sm text-[var(--text-primary)] leading-snug">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
