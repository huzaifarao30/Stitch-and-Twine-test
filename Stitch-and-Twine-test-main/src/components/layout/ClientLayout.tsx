"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ToastViewport from "@/components/ui/ToastViewport";
import SalesMarquee from "@/components/ui/SalesMarquee"; // --- SALES MODULE ---
import RealtimeContentBridge from "@/components/RealtimeContentBridge";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useIdleSessionTimeout } from "@/hooks/useIdleSessionTimeout";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  USER_IDLE_TIMEOUT_MS,
  USER_IDLE_WARNING_MS,
} from "@/lib/sessionPolicy";

// Pages that don't show the public Navbar/Footer
const adminPages = ["/admin"];
const isAdminRoute = (pathname: string) =>
  adminPages.some((p) => pathname.startsWith(p));

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = isAdminRoute(pathname);
  const { user, loading } = useAuth();
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [routeLoadingVisible, setRouteLoadingVisible] = useState(false);
  const [routeLoadingDone, setRouteLoadingDone] = useState(false);
  const firstPathRenderRef = useRef(true);

  const handleUserTimeout = useCallback(async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setShowIdleWarning(false);
    router.replace("/");
  }, [router]);

  const { resetIdleTimer } = useIdleSessionTimeout({
    enabled: !isAdmin && !loading && Boolean(user),
    idleTimeoutMs: USER_IDLE_TIMEOUT_MS,
    warningTimeoutMs: USER_IDLE_WARNING_MS,
    onWarning: () => setShowIdleWarning(true),
    onTimeout: handleUserTimeout,
  });

  const keepSessionAlive = () => {
    setShowIdleWarning(false);
    resetIdleTimer();
  };

  useEffect(() => {
    if (firstPathRenderRef.current) {
      firstPathRenderRef.current = false;
      return;
    }

    setRouteLoadingVisible(true);
    setRouteLoadingDone(false);

    // Keep a minimum visible phase so transitions feel intentional, then complete/fade.
    const finishTimer = window.setTimeout(() => setRouteLoadingDone(true), 420);
    const hideTimer = window.setTimeout(() => setRouteLoadingVisible(false), 700);

    return () => {
      window.clearTimeout(finishTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <RealtimeContentBridge />
      <SalesMarquee /> {/* --- SALES MODULE --- */}
      <Navbar />
      <ToastViewport />
      {routeLoadingVisible && (
        <>
          <div className={`route-progress-bar ${routeLoadingDone ? "is-complete" : ""}`} />
          <div className={`route-fade-overlay ${routeLoadingDone ? "is-complete" : ""}`} />
        </>
      )}
      {showIdleWarning && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(92vw,560px)] rounded-2xl border border-[var(--dropdown-border)] bg-[var(--surface)] shadow-boutique p-3 sm:p-4">
          <p className="text-sm text-[var(--text-primary)]">
            You will be logged out soon due to inactivity.
          </p>
          <div className="mt-3 flex items-center gap-2 justify-end">
            <button
              onClick={handleUserTimeout}
              className="px-3 py-2 text-sm rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout now
            </button>
            <button
              onClick={keepSessionAlive}
              className="px-3 py-2 text-sm rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
            >
              Stay logged in
            </button>
          </div>
        </div>
      )}
      <main className="min-h-screen">{children}</main>
      <Footer />
      <SpeedInsights />
    </>
  );
}
