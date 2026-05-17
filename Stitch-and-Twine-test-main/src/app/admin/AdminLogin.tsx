"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";

const normalizeRole = (role: string | null | undefined) => role?.trim().toLowerCase() || null;

async function fetchAdminRole() {
  const res = await fetch("/api/admin/role", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    return false;
  }

  const json = (await res.json()) as { isAdmin?: boolean };
  return json.isAdmin === true;
}

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { user, adminUser, loading: authLoading } = useAuth();
  const activeUser = adminUser ?? user;
  const [form, setForm] = useState({
    email: "",
    password: "",
    resetEmail: "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  const formatAuthError = (raw: string) => {
    const normalized = raw.toLowerCase();
    if (normalized.includes("invalid login credentials")) {
      return "Invalid email or password.";
    }
    if (normalized.includes("email not confirmed")) {
      return "Please verify your email before signing in.";
    }
    return raw;
  };

  const resolveIsAdmin = async (metadataRole?: string | null) => {
    if (normalizeRole(metadataRole) === "admin") {
      return true;
    }

    const isAdminFromServer = await fetchAdminRole();
    return isAdminFromServer;
  };

  useEffect(() => {
    if (authLoading || !activeUser) {
      return;
    }

    const checkRole = async () => {
      const isAdmin = await resolveIsAdmin(activeUser.role);
      if (isAdmin) {
        router.replace("/admin");
        return;
      }

      setMessage("");
      setError("Please sign in with an admin account.");
    };

    void checkRole();
  }, [activeUser, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      setLoading(false);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(formatAuthError(signInError.message));
      setLoading(false);
      return;
    }

    const loggedInUser = data.user;
    if (!loggedInUser) {
      setError("Unable to verify account after sign-in. Please try again.");
      setLoading(false);
      return;
    }

    const metadataRole =
      typeof loggedInUser.app_metadata?.role === "string"
        ? loggedInUser.app_metadata.role
        : typeof loggedInUser.user_metadata?.role === "string"
          ? loggedInUser.user_metadata.role
          : null;

    const isAdmin = await resolveIsAdmin(metadataRole);
    if (isAdmin) {
      router.replace("/admin");
    } else {
      setError("Please sign in with an admin account.");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!forgotOtpSent) {
        const res = await fetch("/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.resetEmail, purpose: "reset_password" }),
        });

        const json = (await res.json()) as { error?: string };
        if (!res.ok) {
          throw new Error(json.error || "Unable to send OTP.");
        }

        setForgotOtpSent(true);
        setMessage("OTP sent to your email. Enter OTP and new password.");
        return;
      }

      if (!form.otp.trim()) {
        throw new Error("Please enter OTP.");
      }
      if (form.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }
      if (form.newPassword !== form.confirmNewPassword) {
        throw new Error("Passwords do not match.");
      }

      const res = await fetch("/api/auth/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.resetEmail,
          otp: form.otp.trim(),
          newPassword: form.newPassword,
        }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Unable to reset password.");
      }

      setMessage("Password updated. Please login with your new password.");
      setMode("login");
      setForgotOtpSent(false);
      setForm((prev) => ({
        ...prev,
        resetEmail: "",
        otp: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4 pb-8 overflow-y-auto bg-[var(--background)]"
      style={{
        backgroundImage: "radial-gradient(circle at center, var(--soft-beige) 0%, var(--background) 100%)"
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-playfair italic text-3xl text-[var(--text-primary)] tracking-[0.15em]">
            Stitch &amp; Twine
          </h1>
          <p className="text-[var(--text-secondary)] text-xs tracking-[0.2em] uppercase mt-2">
            Admin Panel
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 bg-[var(--surface)] shadow-boutique-lg border border-[var(--border-color)]"
        >
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-4 text-sm text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
              {error}
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Login
              </h2>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                    size={16}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="input-boutique pl-10"
                    placeholder="Enter your email@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                    size={16}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="input-boutique pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="w-full text-[var(--accent-gold)] hover:text-[var(--text-secondary)] text-sm mt-1 transition-colors"
              >
                Forgot Password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Reset Password
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">
                {forgotOtpSent
                  ? "Enter OTP and set your new password."
                  : "Enter your email and we&apos;ll send you an OTP."}
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]"
                    size={16}
                  />
                  <input
                    type="email"
                    value={form.resetEmail}
                    onChange={(e) =>
                      setForm({ ...form, resetEmail: e.target.value })
                    }
                    className="input-boutique pl-10"
                    placeholder="Enter your email@gmail.com"
                    required
                  />
                </div>
              </div>

              {forgotOtpSent && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      value={form.otp}
                      onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      className="input-boutique"
                      placeholder="6-digit code"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                      New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="input-boutique"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.confirmNewPassword}
                      onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
                      className="input-boutique"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
              >
                {loading ? "Please wait..." : forgotOtpSent ? "Verify OTP & Reset Password" : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setForgotOtpSent(false);
                  setError("");
                  setMessage("");
                  setForm((prev) => ({
                    ...prev,
                    otp: "",
                    newPassword: "",
                    confirmNewPassword: "",
                  }));
                }}
                className="w-full text-[var(--accent-gold)] hover:text-[var(--text-secondary)] text-sm mt-1 transition-colors"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
