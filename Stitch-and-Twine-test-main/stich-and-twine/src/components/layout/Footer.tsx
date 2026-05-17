"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Send, Clock } from "lucide-react";
import { useState } from "react";
import { CONFIG } from "@/lib/config";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const catLinks = [
    { label: "Flowers", href: "/category/flowers" },
    { label: "Bouquets", href: "/category/bouquets" },
    { label: "Keycharms", href: "/category/keycharms" },
    { label: "Bags", href: "/category/bags" },
    { label: "Gajry", href: "/category/gajry" },
    { label: "Accessories", href: "/category/accessories" },
  ];

  const quickLinks = [
    { label: "Shop All", href: "/shop" },
    { label: "Custom Order", href: "/custom-order" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ background: "#2E2E2E" }}>
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C4A484, #F2C4CE, #C4A484, transparent)" }} />

      {/* Decorative blobs */}
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #C4A484, transparent)" }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #F2C4CE, transparent)" }} />

      {/* WhatsApp floating button */}
      <a
        href={CONFIG.social.whatsapp.orderLink("Hi! I'd like to inquire about Stitch and Twine products.")}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={24} className="text-white" />
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <div className="text-[9px] tracking-[0.3em] uppercase text-[#C4A484] font-inter font-medium mb-1">
                Est. 2024
              </div>
              <h3 className="font-playfair italic text-2xl text-white tracking-[0.15em]">
                Stitch &amp; Twine
              </h3>
            </div>
            <p className="text-sm text-[#9B8B7A] leading-relaxed mb-6">
              Handcrafted crochet pieces made with premium yarn and boundless love. Each item is a tiny work of art, made by hand, one stitch at a time.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "https://www.instagram.com/stitchandtwine.pk?igsh=MXZkbWh1bDY0OHoyMA==", label: "Instagram" },
                { icon: Facebook, href: "https://www.facebook.com/share/18EKcDD9Ev/", label: "Facebook" },
                { icon: MessageCircle, href: "https://wa.me/923190691621", label: "WhatsApp" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[#3E3E3E] flex items-center justify-center text-[#9B8B7A] hover:border-[#C4A484] hover:text-[#C4A484] transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wider uppercase mb-5">
              Categories
            </h4>
            <ul className="space-y-2.5">
              {catLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9B8B7A] hover:text-[#C4A484] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#C4A484] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wider uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#9B8B7A] hover:text-[#C4A484] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#C4A484] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-[#9B8B7A]">
                <Mail size={13} className="text-[#C4A484]" />
                <span>hello@stitchandtwine.com</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#9B8B7A]">
                <MapPin size={13} className="text-[#C4A484] flex-shrink-0 mt-0.5" />
                <span>Rawalpindi, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wider uppercase mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-[#9B8B7A] mb-4">
              Get early access to new collections and exclusive offers.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#3E3E3E] text-sm text-[#C4A484]">
                🎀 Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm bg-[#3E3E3E] border border-[#4E4E4E] text-white placeholder:text-[#7B7B7B] focus:outline-none focus:border-[#C4A484] transition-colors"
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: "linear-gradient(135deg, #C4A484, #E8C99E)" }}
                  aria-label="Subscribe"
                >
                  <Send size={15} className="text-white" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#3E3E3E] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9B8B7A]">
            © 2026 Stitch and Twine. All rights reserved. Made with 🧶 in Pakistan.
          </p>
          <p className="text-xs text-[#9B8B7A]">
            Handcrafted Quality · Premium Yarn · Shipped with Love
          </p>
        </div>
      </div>
    </footer>
  );
}
