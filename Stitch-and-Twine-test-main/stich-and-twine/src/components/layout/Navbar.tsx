"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, ChevronDown, Search, Scissors, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import CartDrawer from "@/components/ui/CartDrawer";
import { categories } from "@/data/categories";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishTotal } = useWishlist();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-30 glassmorphism transition-all duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
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
            <div className="flex flex-col leading-none">
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#C4A484] font-inter font-medium">
                Est. 2024
              </span>
              <span className="font-playfair italic text-lg text-[#2E2E2E] tracking-[0.15em] transition-all duration-300 group-hover:tracking-[0.2em]">
                Stitch &amp; Twine
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-[#C4A484] bg-[#F6F2EA]"
                    : "text-[#2E2E2E] hover:text-[#C4A484] hover:bg-[#F6F2EA]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                catOpen ? "text-[#C4A484] bg-[#F6F2EA]" : "text-[#2E2E2E] hover:text-[#C4A484] hover:bg-[#F6F2EA]"
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
                    className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-boutique-lg border border-[#EDE6DA] overflow-hidden py-2 min-w-[200px]"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2E2E2E] hover:bg-[#F6F2EA] hover:text-[#C4A484] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F2C4CE]" />
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#2E2E2E] hover:text-[#C4A484] hover:bg-[#F6F2EA] transition-all"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/wishlist"
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#2E2E2E] hover:text-[#E8A0B0] hover:bg-[#FAE8ED] transition-all"
            >
              <Heart size={18} />
              {wishTotal > 0 && <span className="badge-count">{wishTotal}</span>}
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#2E2E2E] hover:text-[#C4A484] hover:bg-[#F6F2EA] transition-all"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && <span className="badge-count">{totalItems}</span>}
            </button>

            {/* Login / Account */}
            <Link
              href="/auth"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#C4A484] text-[#C4A484] hover:bg-[#F6F2EA] transition-all"
            >
              <User size={13} />
              Login
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#2E2E2E] hover:bg-[#F6F2EA] transition-all ml-1"
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
              className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-[#EDE6DA]"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-xl text-sm font-medium text-[#2E2E2E] hover:bg-[#F6F2EA] hover:text-[#C4A484] transition-colors"
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
                <div>
                  <p className="px-4 py-2 text-xs uppercase tracking-widest text-[#C4A484] font-medium">Categories</p>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        className="px-4 py-2.5 rounded-xl text-sm text-[#6B6B6B] hover:bg-[#F6F2EA] hover:text-[#C4A484] transition-colors"
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
    </>
  );
}
