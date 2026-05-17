"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  User, Phone, Package, Palette, Ruler, AlignLeft,
  DollarSign, Calendar, Send, CheckCircle, MessageCircle
} from "lucide-react";

const PRODUCT_TYPES = ["Flowers", "Bouquets", "Keycharms", "Bags", "Gajry", "Accessories", "Other"];
const SIZE_OPTIONS = ["Small", "Medium", "Large", "Custom"];
const BUDGET_RANGES = ["Under ₨500", "₨500 – ₨1,000", "₨1,000 – ₨2,500", "₨2,500 – ₨5,000", "₨5,000+", "Let's discuss"];

function buildWhatsAppMessage(data: Record<string, string>) {
  const lines = [
    `🧶 *Custom Crochet Order Request*`,
    ``,
    `👤 *Name:* ${data.name}`,
    `📱 *Phone:* ${data.phone}`,
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
  const [form, setForm] = useState({
    name: "", phone: "", productType: "", colors: "",
    size: "", description: "", budget: "", deadline: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setSizeDir = (s: string) => setForm((prev) => ({ ...prev, size: s }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = buildWhatsAppMessage(form);
    const url = `https://wa.me/923001234567?text=${msg}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
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
          <p className="text-sm text-[#6B6B6B] dark:text-[#9B8B7A] leading-relaxed max-w-md mx-auto">
            Fill in your dream piece details and we&apos;ll open WhatsApp with your request pre-filled — 
            our artisan will reply within 24 hours. 🧶
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-10 text-center shadow-boutique"
          >
            <CheckCircle size={52} className="mx-auto mb-4 text-[#7BC67E]" />
            <h2 className="font-playfair text-2xl text-[#2E2E2E] dark:text-[#F0EBE3] mb-2">WhatsApp Opened!</h2>
            <p className="text-sm text-[#6B6B6B] dark:text-[#9B8B7A] mb-6">
              Your request has been pre-filled in WhatsApp. Just tap Send and we&apos;ll get back to you soon.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Place Another Order
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#2A2A2A] rounded-2xl p-6 sm:p-8 shadow-boutique space-y-5"
          >
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                Your Name <span className="text-[#E8A0B0]">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Fatima Khan"
                  value={form.name}
                  onChange={set("name")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[#6B6B6B]"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                Phone / WhatsApp <span className="text-[#E8A0B0]">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                <input
                  type="tel"
                  required
                  placeholder="03xx-xxxxxxx"
                  value={form.phone}
                  onChange={set("phone")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[#6B6B6B]"
                />
              </div>
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                Product Type <span className="text-[#E8A0B0]">*</span>
              </label>
              <div className="relative">
                <Package size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
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
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                Preferred Colors
              </label>
              <div className="relative">
                <Palette size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                <input
                  type="text"
                  placeholder="e.g. Dusty rose, cream, sage green"
                  value={form.colors}
                  onChange={set("colors")}
                  className="input-boutique pl-9 dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[#6B6B6B]"
                />
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-2">
                <Ruler size={13} className="inline mr-1.5 text-[#C4A484]" />
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
                        ? "border-[#C4A484] text-[#C4A484] bg-[#F6F2EA] dark:bg-[#3E3E3E]"
                        : "border-[#EDE6DA] dark:border-[#4E4E4E] text-[#6B6B6B] dark:text-[#9B8B7A] hover:border-[#C4A484]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                Your Vision <span className="text-[#E8A0B0]">*</span>
              </label>
              <div className="relative">
                <AlignLeft size={15} className="absolute left-3 top-3.5 text-[#C4A484]" />
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your dream piece in detail… style, occasion, any references."
                  value={form.description}
                  onChange={set("description")}
                  className="input-boutique pl-9 resize-none dark:bg-[#3E3E3E] dark:border-[#4E4E4E] dark:text-[#F0EBE3] dark:placeholder:text-[#6B6B6B]"
                />
              </div>
            </div>

            {/* Budget + Deadline row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
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
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
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

            <p className="text-center text-[10px] text-[#9B8B7A]">
              Tapping the button will open WhatsApp with your order pre-filled.
            </p>
          </motion.form>
        )}
      </div>
    </main>
  );
}
