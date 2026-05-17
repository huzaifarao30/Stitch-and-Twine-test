"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  Users, Settings, ChevronRight, ChevronLeft, ExternalLink, BarChart2, SlidersHorizontal,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Sliders", href: "/admin/sliders", icon: SlidersHorizontal },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const SIDEBAR_FULL = 260;
const SIDEBAR_MINI = 64;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;

  return (
    <div className="flex h-screen overflow-hidden font-inter" style={{ background: "#F6F2EA" }}>
      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarW }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="admin-sidebar flex-shrink-0 overflow-hidden"
        style={{ width: sidebarW }}
      >
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
                <div className="text-[9px] tracking-[0.3em] uppercase text-[#C4A484] font-medium mb-0.5 whitespace-nowrap">
                  Admin Panel
                </div>
                <h2 className="font-playfair italic text-base text-white tracking-wide whitespace-nowrap">
                  Stitch &amp; Twine
                </h2>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9B8B7A] hover:text-white hover:bg-[#3E3E3E] transition-all flex-shrink-0 ml-auto"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
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
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  active
                    ? "bg-[#3E3E3E] text-white"
                    : "text-[#9B8B7A] hover:text-white hover:bg-[#3E3E3E]"
                }`}
              >
                <item.icon
                  size={18}
                  className={`flex-shrink-0 ${active ? "text-[#C4A484]" : "text-[#6B6B6B] group-hover:text-[#C4A484]"}`}
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
                {!collapsed && active && <ChevronRight size={14} className="text-[#C4A484] flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-4 border-t border-[#3E3E3E]">
          <Link
            href="/"
            target="_blank"
            title={collapsed ? "View Site" : undefined}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-xs text-[#9B8B7A] hover:text-white hover:bg-[#3E3E3E] transition-all"
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
        </div>
      </motion.aside>

      {/* ── Main Content — takes remaining width, never hides ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
