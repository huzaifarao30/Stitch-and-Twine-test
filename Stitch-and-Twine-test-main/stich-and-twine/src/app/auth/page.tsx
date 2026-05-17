"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Scissors, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    localStorage.setItem("stUser", JSON.stringify({ name: form.name || form.email.split("@")[0], email: form.email }));
    router.push("/");
  };

  const fields = isLogin
    ? [
        { key: "email", type: "email", label: "Email", placeholder: "you@example.com", icon: Mail },
        { key: "password", type: showPass ? "text" : "password", label: "Password", placeholder: "••••••••", icon: Lock },
      ]
    : [
        { key: "name", type: "text", label: "Full Name", placeholder: "Your name", icon: User },
        { key: "phone", type: "tel", label: "Phone (WhatsApp)", placeholder: "+92 319 0691621", icon: Phone },
        { key: "email", type: "email", label: "Email", placeholder: "you@example.com", icon: Mail },
        { key: "password", type: showPass ? "text" : "password", label: "Password", placeholder: "••••••••", icon: Lock },
        { key: "confirmPassword", type: showPass ? "text" : "password", label: "Confirm Password", placeholder: "••••••••", icon: Lock },
      ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 pt-24"
      style={{ background: "linear-gradient(135deg, #F5E6EA 0%, #F6F2EA 50%, #EDE6DA 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-boutique-lg p-8 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}>
            <Scissors size={20} className="text-white" />
          </div>
          <h1 className="font-playfair italic text-2xl text-[#2E2E2E] mb-1">
            {isLogin ? "Welcome back" : "Join us"}
          </h1>
          <p className="text-xs text-[#9B8B7A]">
            {isLogin ? "Sign in to your account" : "Create your Stitch & Twine account"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                  {field.label}
                </label>
                <div className="relative">
                  <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                  <input
                    type={field.type}
                    required
                    value={form[field.key as keyof typeof form]}
                    onChange={set(field.key)}
                    placeholder={field.placeholder}
                    className="input-boutique pl-9 pr-9"
                  />
                  {(field.key === "password" || field.key === "confirmPassword") && (
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7A] hover:text-[#C4A484]"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60 mt-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        <p className="text-center text-[12px] text-[#9B8B7A] mt-5">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-[#C4A484] font-semibold hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
