"use client";
import Link from "next/link";
import { Instagram, Facebook, MessageCircle, Mail, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { settingsService } from "@/services/settingsService";
import { Settings } from "@/types";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
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

  useEffect(() => {
    void settingsService.getSettings().then(setSettings);
  }, []);

  const whatsappDigits = settings.whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${whatsappDigits}`;
  const whatsappInquiry = `${whatsappLink}?text=${encodeURIComponent(`Hi! I'd like to inquire about ${settings.siteName} products.`)}`;

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
    { label: "Track Order", href: "/track-order" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Cart", href: "/cart" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#2E2E2E] dark:bg-[var(--background)]">
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C4A484, #E8C99E, #C4A484, transparent)" }} />

      {/* Decorative blobs */}
      <div className="absolute top-10 right-20 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #C4A484, transparent)" }} />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #F2C4CE, transparent)" }} />

      {/* WhatsApp floating button */}
      <a
        href={whatsappInquiry}
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
              <div className="text-[9px] tracking-[0.3em] uppercase text-[var(--accent-gold)] font-inter font-medium mb-1">
                Est. 2024
              </div>
              <h3 className="font-playfair italic text-2xl text-white tracking-[0.15em]">
                {settings.siteName}
              </h3>
            </div>
            <p className="text-sm text-[#B8AC9C] leading-relaxed mb-6">
              Handcrafted crochet pieces made with premium yarn and boundless love. Each item is a tiny work of art, made by hand, one stitch at a time.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: settings.instagram || "#", label: "Instagram" },
                { icon: Facebook, href: settings.facebook || "#", label: "Facebook" },
                { icon: MessageCircle, href: whatsappLink, label: "WhatsApp" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[#3E3E3E] flex items-center justify-center text-[#B8AC9C] hover:border-[#E8C99E] hover:text-[#E8C99E] transition-all duration-300"
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
                    className="text-sm text-[#B8AC9C] hover:text-[#E8C99E] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#E8C99E] transition-all duration-300 group-hover:w-3" />
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
                    className="text-sm text-[#B8AC9C] hover:text-[#E8C99E] transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-[#E8C99E] transition-all duration-300 group-hover:w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-[#B8AC9C]">
                <Mail size={13} className="text-[#E8C99E]" />
                <span>{settings.email}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-[#B8AC9C]">
                <MapPin size={13} className="text-[#E8C99E] flex-shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-medium text-sm tracking-wider uppercase mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-[#B8AC9C] mb-4">
              Get early access to new collections and exclusive offers.
            </p>
            {subscribed ? (
              <div className="p-3 rounded-xl bg-[#3E3E3E] text-sm text-[var(--accent-gold)]">
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
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-xl text-sm bg-[#3E3E3E] border border-[#4E4E4E] text-white placeholder:text-[#8B8074] focus:outline-none focus:border-[#E8C99E] transition-colors"
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
          <p className="text-xs text-[#9F9282]">
            © 2026 {settings.siteName}. All rights reserved. Made with 🧶 in Pakistan.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-[#9F9282]">
              Handcrafted Quality · Premium Yarn · Shipped with Love
            </p>
            <Link
              href="/admin"
              className="text-[10px] text-[#3E3E3E] opacity-0 hover:opacity-60 transition-opacity duration-300 select-none"
              aria-label="Admin"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
