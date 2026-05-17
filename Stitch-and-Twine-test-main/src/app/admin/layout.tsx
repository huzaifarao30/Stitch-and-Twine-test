"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Ticket,
  Users, Settings, ChevronRight, ChevronLeft, ExternalLink, BarChart2,
  SlidersHorizontal, Menu, X, LogOut, Star, Percent,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useIdleSessionTimeout } from "@/hooks/useIdleSessionTimeout";
import {
  ADMIN_IDLE_TIMEOUT_MS,
  ADMIN_IDLE_WARNING_MS,
} from "@/lib/sessionPolicy";
import ToastViewport from "@/components/ui/ToastViewport";
import ThemeToggle from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Sales", href: "/admin/sales", icon: Percent }, // --- SALES MODULE ---
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Sliders", href: "/admin/sliders", icon: SlidersHorizontal },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const SIDEBAR_FULL = 260;
const SIDEBAR_MINI = 64;
const normalizeRole = (role: string | null | undefined) => role?.trim().toLowerCase() || null;

async function fetchAdminRole() {
  const res = await fetch("/api/admin/role", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    return false;
  }

  const json = (await res.json()) as { isAdmin?: boolean };
  return json.isAdmin === true;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "auth" | "unauth" | "forbidden">("loading");
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const { user, adminUser, loading: authLoading } = useAuth();
  const activeUser = adminUser ?? user;
  const sidebarW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  useEffect(() => {
    const isLoginPage = pathname === "/admin/login";

    if (authLoading) {
      setAuthState("loading");
      return;
    }

    // Check if user is actually authenticated
    if (!activeUser) {
      setAuthState("unauth");
      if (!isLoginPage) {
        router.replace("/admin/login");
      }
      return;
    }

    // User is authenticated — check admin role
    const role = activeUser.role?.trim().toLowerCase();
    if (role !== "admin") {
      // Also check via the server endpoint (profile table fallback)
      fetchAdminRole().then((isAdmin) => {
        if (isAdmin) {
          setAuthState("auth");
          if (isLoginPage) router.replace("/admin");
        } else {
          setAuthState("forbidden");
        }
      });
      return;
    }

    // User has admin role from metadata
    setAuthState("auth");
    if (isLoginPage) {
      router.replace("/admin");
    }
  }, [activeUser, authLoading, pathname, router]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async (redirectTo = "/") => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setShowIdleWarning(false);
    setAuthState("unauth");
    router.replace(redirectTo);
  }, [router]);

  const { resetIdleTimer } = useIdleSessionTimeout({
    enabled: authState === "auth",
    idleTimeoutMs: ADMIN_IDLE_TIMEOUT_MS,
    warningTimeoutMs: ADMIN_IDLE_WARNING_MS,
    onWarning: () => setShowIdleWarning(true),
    onTimeout: () => handleLogout("/admin/login"),
  });

  const keepAdminSessionAlive = () => {
    setShowIdleWarning(false);
    resetIdleTimer();
  };

  // Loading spinner
  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="crochet-spinner" />
          <p className="text-sm text-[var(--text-secondary)]">Loading admin panel…</p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    if (authState === "auth") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
          <div className="flex flex-col items-center gap-4">
            <div className="crochet-spinner" />
            <p className="text-sm text-[var(--text-secondary)]">Redirecting to dashboard…</p>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }

  if (authState !== "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <div className="crochet-spinner" />
          <p className="text-sm text-[var(--text-secondary)]">Checking admin access…</p>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#3E3E3E] min-h-[72px]">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="text-[9px] tracking-[0.3em] uppercase text-[var(--accent-gold)] font-medium mb-0.5 whitespace-nowrap">
                Admin Panel
              </div>
              <h2 className="font-playfair italic text-base text-white tracking-wide whitespace-nowrap">
                Stitch &amp; Twine
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#3E3E3E] transition-all flex-shrink-0 ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Close button — mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[#3E3E3E] transition-all flex-shrink-0 ml-auto"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 lg:px-2.5 lg:py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                active
                  ? "bg-[#3E3E3E] text-white"
                  : "text-[var(--text-secondary)] hover:text-white hover:bg-[#3E3E3E]"
              }`}
            >
              <item.icon
                size={18}
                className={`flex-shrink-0 ${active ? "text-[var(--accent-gold)]" : "text-[var(--text-secondary)] group-hover:text-[var(--accent-gold)]"}`}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && active && <ChevronRight size={14} className="text-[var(--accent-gold)] flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-4 border-t border-[#3E3E3E] space-y-1">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "View Site" : undefined}
          className="flex items-center gap-3 px-3 py-3 lg:px-2.5 lg:py-2.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-white hover:bg-[#3E3E3E] transition-all"
        >
          <ExternalLink size={16} className="flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                key="view"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                View Site
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={() => handleLogout()}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-3 lg:px-2.5 lg:py-2.5 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-[#3E3E3E] transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                key="logout"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        {/* Theme Toggle */}
        <div className="flex items-center gap-3 px-3 py-2 lg:px-2.5">
          <ThemeToggle />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                key="theme"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap overflow-hidden text-xs text-[var(--text-secondary)]"
              >
                Theme
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden font-inter bg-[var(--background)]">
      <ToastViewport />
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="admin-sidebar hidden lg:flex flex-col"
        style={{ width: sidebarW }}
      >
        {sidebarContent}
      </motion.aside>

      {/* ── Mobile Sidebar Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="admin-sidebar fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--surface)]/80 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--background)] transition-colors"
          >
            <Menu size={20} className="text-[var(--text-primary)]" />
          </button>
          <div className="text-center">
            <p className="text-[8px] tracking-[0.3em] uppercase text-[var(--accent-gold)] font-medium">Admin</p>
            <h2 className="font-playfair italic text-sm text-[var(--text-primary)] tracking-wide">Stitch &amp; Twine</h2>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {showIdleWarning && (
            <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,420px)] rounded-2xl border border-[#3E3E3E] bg-[#2E2E2E] text-white shadow-2xl p-4">
              <p className="text-sm">Admin session will expire soon due to inactivity.</p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleLogout("/admin/login")}
                  className="px-3 py-2 text-xs rounded-lg border border-red-300 text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  Logout now
                </button>
                <button
                  onClick={keepAdminSessionAlive}
                  className="px-3 py-2 text-xs rounded-lg bg-[#C4A484] text-[var(--text-primary)] hover:opacity-90 transition-opacity"
                >
                  Stay logged in
                </button>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
