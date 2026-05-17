"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, ChevronDown, Search, Scissors, User, LogOut, Package } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/ui/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { categoryService } from "@/services/categoryService";
import { settingsService } from "@/services/settingsService";
import { Category, Settings } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { subscribeContentUpdated } from "@/lib/clientRefreshBus";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteName: "Stitch and Twine",
    whatsappNumber: "923190691621",
    deliveryFee: 250,
    freeDeliveryThreshold: 0,
    email: "hello@stitchandtwine.com",
    address: "Rawalpindi, Pakistan",
    instagram: "",
    facebook: "",
  });
  const { totalItems } = useCart();
  const { totalItems: wishTotal } = useWishlist();
  const { user, adminUser } = useAuth();
  const activeUser = adminUser ?? user;
  const isAdmin = Boolean(adminUser);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const loadCategories = useCallback(async () => {
    const data = await categoryService.getCategories();
    setCategories(data);
  }, []);

  const loadSettings = useCallback(async () => {
    const data = await settingsService.getSettings();
    setSettings(data);
  }, []);

  useEffect(() => {
    // Settings are not critical for first paint; fetch during idle.
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const hasRequestIdleCallback =
      typeof window !== "undefined" && typeof (window as Window & typeof globalThis & { requestIdleCallback?: unknown }).requestIdleCallback === "function";

    if (hasRequestIdleCallback) {
      idleId = window.requestIdleCallback(() => {
        void loadSettings();
      }, { timeout: 1200 });
    } else {
      timeoutId = setTimeout(() => {
        void loadSettings();
      }, 200);
    }

    const unsubscribe = subscribeContentUpdated((kind) => {
      if (kind === "all" || kind === "categories") {
        if (categories.length > 0) {
          void loadCategories();
        }
      }
      if (kind === "all" || kind === "settings") {
        void loadSettings();
      }
    });

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      unsubscribe();
    };
  }, [categories.length, loadCategories, loadSettings]);

  useEffect(() => {
    // Category data is only needed when menus open.
    if (!catOpen && !mobileOpen) return;
    if (categories.length > 0) return;
    void loadCategories();
  }, [catOpen, mobileOpen, categories.length, loadCategories]);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUserMenuOpen(false);
  };

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-30 glassmorphism transition-all duration-300 ${scrolled ? "shadow-md" : "shadow-sm"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Stitch & Twine"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <div className="flex flex-col leading-none items-center" style={{ paddingTop: '4px', position: 'relative', zIndex: 10 }}>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--accent-gold)] font-inter font-medium sm:text-[10px] md:text-[12px]">
                Est. 2024
              </span>
              <span className="font-playfair italic text-lg text-[var(--logo-text)] tracking-[0.15em] transition-all duration-300 group-hover:tracking-[0.2em]">
                {settings.siteName}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${pathname === link.href
                    ? "text-[var(--accent-gold)] bg-[var(--nav-hover-bg)]"
                    : "text-[var(--nav-text)] hover:text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)]"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${catOpen ? "text-[var(--accent-gold)] bg-[var(--nav-hover-bg)]" : "text-[var(--nav-text)] hover:text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)]"
                }`}>
                Categories
                <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 bg-[var(--dropdown-bg)] rounded-2xl shadow-boutique-lg border border-[var(--dropdown-border)] overflow-hidden py-2 min-w-[200px]"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--pink-soft)]" />
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Order CTA */}
            <Link
              href="/custom-order"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-all duration-200 hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
            >
              <Scissors size={13} />
              Custom Order
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/shop"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--nav-text)] hover:text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)] transition-all"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/wishlist"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--nav-text)] hover:text-[var(--pink-medium)] hover:bg-[var(--pink-light)] transition-all"
            >
              <Heart size={18} />
              {wishTotal > 0 && <span className="badge-count">{wishTotal}</span>}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[var(--nav-text)] hover:text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)] transition-all"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Login / Account */}
            {activeUser ? (
              // User Menu (when logged in)
              <div className="relative hidden sm:block" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${userMenuOpen ? "border-[var(--accent-gold)] bg-[var(--nav-hover-bg)] text-[var(--accent-gold)]" : "border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)]"}`}>
                  <User size={13} />
                  {activeUser.name}
                  <ChevronDown size={12} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 bg-[var(--dropdown-bg)] rounded-2xl shadow-boutique-lg border border-[var(--dropdown-border)] overflow-hidden py-2 min-w-[160px]"
                    >
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                          >
                            <Package size={14} />
                            Admin Panel
                          </Link>
                        )}
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Package size={14} />
                        My Orders
                      </Link>
                      <Link
                        href="/track-order"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Search size={14} />
                        Track Order
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Heart size={14} />
                        Wishlist
                      </Link>
                      <hr className="my-1 border-[var(--dropdown-border)]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Login Button (when not logged in)
              <button
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--nav-hover-bg)] transition-all"
              >
                <User size={13} />
                Login
              </button>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] transition-all ml-1"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-[var(--mobile-bg)] backdrop-blur-xl border-t border-[var(--dropdown-border)]"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/custom-order"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
                >
                  <Scissors size={14} />
                  Custom Order
                </Link>
                <div className="py-2 mb-2 border-b border-[var(--dropdown-border)]">
                  {activeUser ? (
                    <>
                      <div className="px-4 py-2 text-xs text-[var(--text-secondary)]">
                        Welcome back, <span className="font-semibold">{activeUser.name}</span>
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                        >
                          <Package size={14} />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Package size={14} />
                        My Orders
                      </Link>
                      <Link
                        href="/track-order"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Search size={14} />
                        Track Order
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Heart size={14} />
                        Wishlist
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/track-order"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--nav-text)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Search size={14} />
                        Track Order
                      </Link>
                      <button
                        onClick={() => setAuthModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--accent-gold)] bg-[var(--nav-hover-bg)] hover:bg-[var(--soft-beige)] transition-colors w-full"
                      >
                        <User size={14} />
                        Login / Sign Up
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <p className="px-4 py-2 text-xs uppercase tracking-widest text-[var(--accent-gold)] font-medium">Categories</p>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
