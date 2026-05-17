"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Scissors, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { CONFIG } from "@/lib/config";

type Screen = "login" | "forgot";

export default function AdminLogin() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("login");
  const [identifier, setIdentifier] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // on mount, redirect if already logged in
  if (typeof window !== "undefined" && localStorage.getItem("adminAuth") === "true") {
    router.replace("/admin");
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Accept username OR email
    const isAdmin =
      (identifier === CONFIG.admin.username || identifier === "admin@stitchandtwine.com") &&
      password === CONFIG.admin.password;

    if (isAdmin) {
      localStorage.setItem("adminAuth", "true");
      router.push("/admin");
    } else {
      setError("Invalid username/email or password.");
      setLoading(false);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #F5E6EA 0%, #F6F2EA 50%, #EDE6DA 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-boutique p-8 w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
          >
            <Scissors size={24} className="text-white" />
          </div>
          <p className="text-[9px] tracking-[0.3em] uppercase text-[#C4A484] font-medium mb-1">Admin Panel</p>
          <h1 className="font-playfair italic text-2xl text-[#2E2E2E]">Stitch &amp; Twine</h1>
        </div>

        <AnimatePresence mode="wait">
          {/* ── LOGIN SCREEN ── */}
          {screen === "login" && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin or admin@stitchandtwine.com"
                      className="input-boutique pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                    <input
                      type={showPass ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-boutique pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7A] hover:text-[#C4A484]"
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setScreen("forgot"); setError(""); }}
                    className="text-xs text-[#C4A484] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? "Signing in…" : "Sign In"}
                </motion.button>
              </form>

              <p className="text-center text-[11px] text-[#9B8B7A] mt-6">
                Stitch &amp; Twine Admin &middot; Rawalpindi, Pakistan
              </p>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD SCREEN ── */}
          {screen === "forgot" && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <button
                onClick={() => { setScreen("login"); setResetSent(false); }}
                className="flex items-center gap-1.5 text-xs text-[#9B8B7A] hover:text-[#C4A484] mb-5"
              >
                <ArrowLeft size={13} /> Back to login
              </button>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-500 text-xl">✓</span>
                  </div>
                  <p className="font-medium text-[#2E2E2E] mb-1">Request received</p>
                  <p className="text-xs text-[#9B8B7A] leading-relaxed">
                    Contact support or check your registered email for reset instructions.
                  </p>
                  <div className="mt-4 p-3 bg-[#F6F2EA] rounded-xl text-left text-xs text-[#6B6B6B]">
                    <p className="font-medium text-[#2E2E2E] mb-1">Default credentials:</p>
                    <p>Username: <span className="font-mono text-[#C4A484]">admin</span></p>
                    <p>Password: <span className="font-mono text-[#C4A484]">stitch2024</span></p>
                    <p className="text-[10px] text-[#9B8B7A] mt-1">
                      Change these in Admin Settings after logging in.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <p className="text-sm text-[#6B6B6B] mb-4">
                      Enter your admin email and we&apos;ll send reset instructions.
                    </p>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[#C4A484] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A484]" />
                      <input
                        type="email"
                        required
                        placeholder="admin@stitchandtwine.com"
                        className="input-boutique pl-9"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit"
                    className="btn-primary w-full justify-center py-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Send Reset Link
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
