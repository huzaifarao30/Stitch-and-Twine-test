"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, MessageCircle, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-boutique min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="section-eyebrow mb-3">Get in Touch</p>
          <h1 className="section-title mb-4">We'd Love to Hear from You</h1>
          <p className="text-[#6B6B6B] max-w-md mx-auto text-sm leading-relaxed">
            Have a question about a custom order, delivery, or our products? We're just a message away.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: MessageCircle, title: "WhatsApp", value: "+92 319 0691621", sub: "Open 24/7 — we reply fast!", link: "https://wa.me/923190691621", color: "#25D366" },
              { icon: Mail, title: "Email", value: "hello@stitchandtwine.com", sub: "We reply within 24 hours", link: "mailto:hello@stitchandtwine.com", color: "#C4A484" },
              { icon: MapPin, title: "Location", value: "Rawalpindi, Pakistan", sub: "Nationwide delivery available", color: "#F2C4CE" },
              { icon: Clock, title: "Business Hours", value: "Open 24/7", sub: "Always here for you!", color: "#D4B896" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-5 bg-white rounded-2xl shadow-boutique"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#9B8B7A] mb-1">{item.title}</p>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="font-medium text-[#2E2E2E] hover:text-[#C4A484] transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium text-[#2E2E2E]">{item.value}</p>
                  )}
                  <p className="text-xs text-[#9B8B7A] mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}

            {/* Quick WhatsApp */}
            <a
              href="https://wa.me/923190691621?text=Hi! I'd like to inquire about a crochet order."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-medium transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #25D366, #1ebe5d)" }}
            >
              <MessageCircle size={20} />
              Chat on WhatsApp Now
            </a>
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {submitted ? (
              <div className="bg-white rounded-3xl shadow-boutique p-10 flex flex-col items-center justify-center text-center gap-5 h-full">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-playfair text-2xl text-[#2E2E2E] mb-2">Message Sent!</h3>
                  <p className="text-[#6B6B6B] text-sm">Thank you for reaching out. We'll get back to you within 24 hours. 🎀</p>
                </div>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", message: "" }); }}
                  className="btn-secondary text-sm">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-boutique p-8 space-y-5">
                <h3 className="font-playfair text-2xl text-[#2E2E2E] mb-6">Send a Message</h3>
                {[
                  { key: "name", label: "Your Name", placeholder: "Enter your name", type: "text" },
                  { key: "email", label: "Email Address", placeholder: "you@example.com", type: "email" },
                  { key: "phone", label: "Phone (optional)", placeholder: "+92 300 1234567", type: "tel" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-[#2E2E2E] mb-1.5 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.key !== "phone"}
                      className="input-boutique text-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-[#2E2E2E] mb-1.5 block">Message</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Tell us about your custom order request, inquiry, or feedback..."
                    rows={4}
                    required
                    className="input-boutique text-sm resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
