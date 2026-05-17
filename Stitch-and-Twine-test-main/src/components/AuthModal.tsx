"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { AuthError } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpStep, setOtpStep] = useState<null | "signup" | "forgot">(null);
  const [otpCode, setOtpCode] = useState("");
  const [newResetPassword, setNewResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const { user } = useAuth();

  const formatAuthError = (err: unknown, fallback: string) => {
    const authErr = err as AuthError;
    const rawMessage = authErr?.message || fallback;
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return "Incorrect email or password.";
    }
    if (normalized.includes("email not confirmed")) {
      return "Please verify your email address before logging in.";
    }
    if (normalized.includes("user already registered")) {
      return "An account with this email already exists. Please log in instead.";
    }
    if (normalized.includes("password should be at least")) {
      return "Password is too short. Please use at least 6 characters.";
    }
    if (normalized.includes("network")) {
      return "Network issue detected. Please check your connection and try again.";
    }

    return rawMessage;
  };

  useEffect(() => {
    if (!open) return;

    setIsLogin(true);
    setIsForgotPassword(false);
    setError("");
    setMessage("");
    setShowPass(false);
  }, [open]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const sendOtp = async (email: string, purpose: "signup" | "reset_password") => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose }),
    });

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(json.error || "Unable to send OTP.");
    }
  };

  const verifyOtp = async (email: string, purpose: "signup" | "reset_password", otp: string) => {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, purpose, otp }),
    });

    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      throw new Error(json.error || "Invalid OTP.");
    }
  };

  const checkIsAdmin = async () => {
    try {
      const res = await fetch("/api/admin/role", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return false;
      const json = (await res.json()) as { isAdmin?: boolean };
      return json.isAdmin === true;
    } catch {
      return false;
    }
  };

  const completeSignUp = async (supabase: NonNullable<ReturnType<typeof createClient>>) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          city: form.city.trim() || null,
        },
      },
    });

    if (signUpError) throw signUpError;

    const profileUserId = data.user?.id ?? data.session?.user?.id;
    if (profileUserId) {
      // The handle_new_user() trigger creates the profile server-side.
      // We do a delayed update to add any extra fields the trigger may not set.
      // This avoids the RLS "insert violation" since the row already exists.
      setTimeout(async () => {
        try {
          await supabase
            .from("profiles")
            .update({
              full_name: form.name.trim(),
              city: form.city.trim() || null,
            })
            .eq("id", profileUserId);
        } catch {
          // Silently ignore — trigger already saved the profile
        }
      }, 1500);
    }

    if (data.session) {
      onOpenChange(false);
      return;
    }

    setMessage("Account created. Please check your email to verify your account before logging in.");
    setIsLogin(true);
    setOtpStep(null);
    setOtpCode("");
    setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      return;
    }
    
    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!isLogin && !form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (loginError) throw loginError;

        onOpenChange(false);
        const isAdmin = await checkIsAdmin();
        if (isAdmin) {
          router.push("/admin");
        }
        return;
      }

      if (otpStep !== "signup") {
        await sendOtp(form.email, "signup");
        setOtpStep("signup");
        setMessage("OTP sent to your email. Enter the 6-digit code to continue.");
        return;
      }

      if (!otpCode.trim()) {
        setError("Please enter the OTP code.");
        return;
      }

      await verifyOtp(form.email, "signup", otpCode.trim());
      await completeSignUp(supabase);
    } catch (err) {
      setError(formatAuthError(err, isLogin ? "Unable to sign in." : "Unable to create account."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      onOpenChange(false);
    } catch (err) {
      setError(formatAuthError(err, "Unable to log out right now."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      if (otpStep !== "forgot") {
        await sendOtp(form.email, "reset_password");
        setOtpStep("forgot");
        setMessage("OTP sent to your email. Enter OTP and new password.");
        return;
      }

      if (!otpCode.trim()) {
        setError("Please enter OTP.");
        return;
      }

      if (newResetPassword.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }

      if (newResetPassword !== confirmResetPassword) {
        setError("Passwords do not match.");
        return;
      }

      const res = await fetch("/api/auth/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpCode.trim(), newPassword: newResetPassword }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error || "Unable to reset password.");
      }

      setMessage("Password updated successfully. Please login with new password.");
      setIsForgotPassword(false);
      setOtpStep(null);
      setOtpCode("");
      setNewResetPassword("");
      setConfirmResetPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to send reset email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      city: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setMessage("");
    setShowPass(false);
    setOtpStep(null);
    setOtpCode("");
    setNewResetPassword("");
    setConfirmResetPassword("");
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setIsForgotPassword(false);
    setError("");
    resetForm();
  };

  const fields = isLogin
    ? [
        { key: "email", type: "email", label: "Email", placeholder: "Enter your email@gmail.com", icon: Mail },
        { key: "password", type: showPass ? "text" : "password", label: "Password", placeholder: "Enter your password", icon: Lock },
      ]
    : [
        { key: "name", type: "text", label: "Full Name", placeholder: "Your name", icon: User },
      { key: "city", type: "text", label: "City", placeholder: "Rawalpindi", icon: User },
        { key: "email", type: "email", label: "Email", placeholder: "Enter your email@gmail.com", icon: Mail },
        { key: "password", type: showPass ? "text" : "password", label: "Password", placeholder: "Enter your password", icon: Lock },
        { key: "confirmPassword", type: showPass ? "text" : "password", label: "Confirm Password", placeholder: "Confirm your password", icon: Lock },
      ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[calc(100vw-2rem)] max-w-sm max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <Dialog.Title className="sr-only">
            {isLogin ? "Welcome back" : "Join us"}
          </Dialog.Title>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[var(--surface)] rounded-3xl shadow-boutique-lg p-4 sm:p-6 w-full overflow-y-auto max-h-[90vh]"
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
              >
                <Scissors size={20} className="text-white" />
              </div>
              <h1 className="font-playfair italic text-xl sm:text-2xl text-[var(--text-primary)] mb-1">
                {isForgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Join us"}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {isForgotPassword
                  ? "Enter your email to receive a reset link"
                  : isLogin
                  ? "Sign in to your account"
                  : "Create your Stitch & Twine account"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 text-center">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 text-center">
                {message}
              </div>
            )}

            <AnimatePresence mode="wait">
              {isForgotPassword ? (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={set("email")}
                        placeholder="Enter your email@gmail.com"
                        className="input-boutique pl-9 pr-9"
                      />
                    </div>
                  </div>

                  {otpStep === "forgot" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">OTP Code</label>
                        <input
                          type="text"
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6-digit code"
                          className="input-boutique"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">New Password</label>
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          value={newResetPassword}
                          onChange={(e) => setNewResetPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="input-boutique"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">Confirm New Password</label>
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="input-boutique"
                        />
                      </div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full justify-center py-3 disabled:opacity-60 mt-4 text-white rounded-2xl font-medium text-sm transition-all duration-200 flex items-center"
                    style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? "Please wait..." : otpStep === "forgot" ? "Verify OTP & Reset Password" : "Send OTP"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError("");
                      setMessage("");
                    }}
                    className="w-full text-center text-[12px] text-[var(--accent-gold)] font-semibold hover:underline"
                  >
                    Back to login
                  </button>
                </motion.form>
              ) : (
              user?.email ? (
                <motion.div
                  key="logged-in"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="bg-[#F9F6F1] border border-[var(--border-color)] rounded-2xl p-4 text-sm text-[#5F5145] text-center">
                    Logged in as <span className="font-semibold">{user.email}</span>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full justify-center py-4 disabled:opacity-60 mt-6 text-white rounded-2xl font-medium text-sm transition-all duration-200 flex items-center"
                    style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? "Logging out..." : "Log Out"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="w-full text-center text-[12px] text-[var(--accent-gold)] font-semibold hover:underline"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
              <motion.form
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <field.icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-gold)]" />
                      <input
                        type={field.type}
                        required
                        value={form[field.key as keyof typeof form]}
                        onChange={set(field.key)}
                        placeholder={field.placeholder}
                        className="input-boutique pl-9 pr-9"
                      />
                      {field.key === "password" && (
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--accent-gold)]"
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!isLogin && otpStep === "signup" && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--accent-gold)] mb-1.5">OTP Code</label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6-digit code"
                      className="input-boutique"
                    />
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">Enter the OTP sent to your email to complete sign-up.</p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full justify-center py-3 disabled:opacity-60 mt-4 text-white rounded-2xl font-medium text-sm transition-all duration-200 flex items-center"
                  style={{ background: "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? "Please wait…" : isLogin ? "Sign In" : otpStep === "signup" ? "Verify OTP & Create Account" : "Send OTP"}
                </motion.button>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setMessage("");
                    }}
                    className="w-full text-center text-[12px] text-[var(--accent-gold)] font-semibold hover:underline mt-2"
                  >
                    Forgot password?
                  </button>
                )}
              </motion.form>
              )
              )}
            </AnimatePresence>

            {!isForgotPassword && !user?.email && (
              <p className="text-center text-[12px] text-[var(--text-secondary)] mt-5">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={switchMode}
                  className="text-[var(--accent-gold)] font-semibold hover:underline"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            )}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}