"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { Settings } from "@/types";

export default function ContactPage() {
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

  return (
    <div className="bg-boutique min-h-screen pt-6 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="section-eyebrow mb-3">Get in Touch</p>
          <h1 className="section-title mb-4">We'd Love to Hear from You</h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm leading-relaxed">
            Have a question about a custom order, delivery, or our products? We're just a message away.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">
            {[
              { icon: MessageCircle, title: "WhatsApp", value: settings.whatsappNumber, sub: "Open 24/7 — we reply fast!", link: whatsappLink, color: "#25D366" },
              { icon: Mail, title: "Email", value: settings.email, sub: "We reply within 24 hours", link: `mailto:${settings.email}`, color: "#C4A484" },
              { icon: MapPin, title: "Location", value: settings.address, sub: "Nationwide delivery available", color: "#F2C4CE" },
              { icon: Clock, title: "Business Hours", value: "Open 24/7", sub: "Always here for you!", color: "#D4B896" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 bg-[var(--surface)] rounded-2xl shadow-boutique"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-1">{item.title}</p>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium text-[var(--text-primary)]">{item.value}</p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick WhatsApp */}
            <a
              href={`${whatsappLink}?text=${encodeURIComponent("Hi! I'd like to inquire about a crochet order.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-medium transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
            >
              <MessageCircle size={20} />
              Chat on WhatsApp Now
            </a>
        </div>
      </div>
    </div>
  );
}
