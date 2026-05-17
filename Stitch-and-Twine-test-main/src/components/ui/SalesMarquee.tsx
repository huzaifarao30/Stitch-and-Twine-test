// --- SALES MODULE ---
"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSales } from "@/context/SalesContext";

const DISMISS_KEY = "st_marquee_dismissed";

export default function SalesMarquee() {
  const { activeSales, loading } = useSales();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
    }
  }, []);

  if (!mounted || loading || activeSales.length === 0 || dismissed) return null;

  const saleTexts = activeSales.map(
    (s) => `🔥 ${s.categoryName || "Sale"} — ${s.discountPercent}% OFF!`
  );
  saleTexts.push("🧵 Handcrafted with Love");
  saleTexts.push("🌹 Free Delivery on Selected Items");

  const text = saleTexts.join("     ·     ");

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  return (
    <div
      className="sales-storefront-marquee w-full overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
    >
      <div className="sales-marquee-wrapper py-2 px-4">
        <div className="sales-marquee-track animate-marquee whitespace-nowrap text-white font-semibold text-xs sm:text-sm">
          <span>{text}</span>
          <span className="ml-16">{text}</span>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors z-10"
        aria-label="Dismiss announcement"
      >
        <X size={12} className="text-white" />
      </button>
    </div>
  );
}
