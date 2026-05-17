"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  User, Phone, Package, Palette, Ruler, AlignLeft,
  DollarSign, Calendar, Send, CheckCircle, MessageCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";
import { Settings } from "@/types";

const PRODUCT_TYPES = ["Flowers", "Bouquets", "Keycharms", "Bags", "Gajry", "Accessories", "Other"];
const SIZE_OPTIONS = ["Small", "Medium", "Large", "Custom"];
const BUDGET_RANGES = ["Under ₨500", "₨500 – ₨1,000", "₨1,000 – ₨2,500", "₨2,500 – ₨5,000", "₨5,000+", "Let's discuss"];

function buildWhatsAppMessage(data: Record<string, string>) {
  const lines = [
    `🧶 *Custom Crochet Order Request*`,
    ``,
    `👤 *Name:* ${data.name}`,
    `📱 *Phone:* ${data.phone}`,
    data.email ? `📧 *Email:* ${data.email}` : null,
    `🏙️ *City:* ${data.city}`,
    `📍 *Address:* ${data.address}`,
    `🎁 *Product Type:* ${data.productType}`,
    data.colors ? `🎨 *Preferred Colors:* ${data.colors}` : null,
    data.size ? `📐 *Size:* ${data.size}` : null,
    `📝 *Description:*\n${data.description}`,
    data.budget ? `💰 *Budget Range:* ${data.budget}` : null,
    data.deadline ? `📅 *Deadline:* ${data.deadline}` : null,
    ``,
    `_Sent from StitchAndTwine.com_`,
  ]
    .filter(Boolean)
    .join("\n");
  return encodeURIComponent(lines);
}

export default function CustomOrderPage() {
  const { user, adminUser } = useAuth();
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
  const [form, setForm] = useState({
    email: "",
    city: "",
    address: "",
    name: "", phone: "", productType: "", colors: "",
    size: "", description: "", budget: "", deadline: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void settingsService.getSettings().then(setSettings);
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSizeDir = (s: string) => setForm((prev) => ({ ...prev, size: s }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const order = await orderService.createCustomOrder({
        name: form.name,
        phone: form.phone,
        email: form.email || user?.email,
        city: form.city,
        address: form.address,
        productType: form.productType,
        colors: form.colors,
        size: form.size,
        description: form.description,
        budget: form.budget,
        deadline: form.deadline,
      });

      const msg = buildWhatsAppMessage({ ...form, orderNumber: order.orderNumber });
      const whatsappDigits = settings.whatsappNumber.replace(/[^0-9]/g, "");
      const url = `https://wa.me/${whatsappDigits}?text=${msg}`;
      window.open(url, "_blank", "noopener,noreferrer");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit custom order.");
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="section-eyebrow mb-3">Made Just For You</p>
          <h1 className="section-title mb-4">Custom Crochet Order</h1>
          <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
            Fill in your dream piece details and we&apos;ll open WhatsApp with your request pre-filled — 
            our artisan will reply within 24 hours. 🧶
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--surface)] dark:bg-[#2A2A2A] rounded-2xl p-10 text-center shadow-boutique"
          >
            <CheckCircle size={52} className="mx-auto mb-4 text-[#7BC67E]" />
            <h2 className="font-playfair text-2xl text-[var(--text-primary)] dark:text-[#F0EBE3] mb-2">WhatsApp Opened!</h2>
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-6">
              Your request has been pre-filled in WhatsApp. Just tap Send and we&apos;ll get back to you soon.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Place Another Order
            </button>
          </motion.div>
        ) : adminUser ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-[var(--surface)] dark:bg-[#2A2A2A] rounded-2xl p-8 shadow-boutique text-center"
          >
            <h2 className="font-playfair text-2xl text-[var(--text-primary)] dark:text-[#F0EBE3] mb-3">
              Admin accounts cannot place custom orders
            </h2>
            <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
              Please sign in with a customer account to submit a custom request.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-[var(--surface)] dark:bg-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-boutique space-y-5"
          >
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Your Name <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Khan"
                  value={form.name}
                  onChange={set("name")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Phone / WhatsApp <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                <input
                  type="tel"
                  required
                  placeholder="03xx-xxxxxxx"
                  value={form.phone}
                  onChange={set("phone")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                className="input-boutique dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                City <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rawalpindi"
                value={form.city}
                onChange={set("city")}
                className="input-boutique dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Address <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Street, area, house no."
                value={form.address}
                onChange={set("address")}
                className="input-boutique dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Product Type <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <div className="relative">
                <Package size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                <select
                  required
                  value={form.productType}
                  onChange={set("productType")}
                  className="input-boutique pl-9 appearance-none dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3]"
                >
                  <option value="">Select a category…</option>
                  {PRODUCT_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Preferred Colors
              </label>
              <div className="relative">
                <Palette size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                <input
                  type="text"
                  placeholder="e.g. Dusty rose, cream, sage green"
                  value={form.colors}
                  onChange={set("colors")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-2">
                <Ruler size={13} className="inline mr-1.5 text-[var(--accent-gold)]" />
                Size Preference
              </label>
              <div className="flex gap-2 flex-wrap">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizeDir(s)}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                      form.size === s
                        ? "border-[var(--accent-gold)] text-[var(--accent-gold)] bg-[var(--background)] dark:bg-[#3E3E3E]"
                        : "border-[var(--border-color)] dark:border-[#4E4E4E] text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:border-[var(--accent-gold)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                Your Vision <span className="text-[var(--pink-medium)]">*</span>
              </label>
              <div className="relative">
                <AlignLeft size={15} className="absolute left-3 top-3.5 text-[var(--accent-gold)]" />
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your dream piece in detail… style, occasion, any references."
                  value={form.description}
                  onChange={set("description")}
                  className="input-boutique pl-9 resize-none dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[var(--text-secondary)]"
                />
              </div>
            </div>

            {/* Budget + Deadline row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                  <DollarSign size={13} className="inline mr-1" />
                  Budget Range
                </label>
                <select
                  value={form.budget}
                  onChange={set("budget")}
                  className="input-boutique appearance-none dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3]"
                >
                  <option value="">Any budget</option>
                  {BUDGET_RANGES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                  <Calendar size={13} className="inline mr-1" />
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={set("deadline")}
                  min={new Date().toISOString().split("T")[0]}
                  className="input-boutique dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3]"
                />
              </div>
            </div>

            {/* Submit */}
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-white font-semibold text-sm shadow-lg"
              style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(37,211,102,0.4)" }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={18} />
              Send via WhatsApp
              <Send size={14} />
            </motion.button>

            <p className="text-center text-[10px] text-[var(--text-secondary)]">
              Tapping the button will open WhatsApp with your order pre-filled.
            </p>
          </motion.form>
        )}
      </div>
    </main>
  );
}
