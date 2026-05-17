"use client";
import { useEffect, useState } from "react";
import { Save, CheckCircle, Lock, Eye, EyeOff, Plus, Trash2, CreditCard } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { Settings, PaymentMethod } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toastBus";

export default function AdminSettingsPage() {
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
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { user, adminUser } = useAuth();
  const activeUser = adminUser ?? user;

  useEffect(() => {
    void settingsService.getSettings().then(setSettings);
  }, []);

  // Password change state
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = async () => {
    setSaveError("");
    const ok = await settingsService.saveSettings({ ...settings, freeDeliveryThreshold: 0 });
    if (!ok) {
      setSaveError("Unable to save settings. Please check your permissions.");
      showToast("Could not save settings", "error");
      return;
    }
    setSaved(true);
    showToast("Settings saved", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (!activeUser?.email) { setPwError("You must be logged in to update password."); return; }
    if (pw.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pw.newPw !== pw.confirm) { setPwError("New passwords don't match."); return; }

    const supabase = createClient();
    if (!supabase) { setPwError("Supabase is not configured."); return; }

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: activeUser.email,
      password: pw.current,
    });
    if (verifyErr) {
      setPwError("Current password is incorrect.");
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: pw.newPw });
    if (updateErr) {
      setPwError(updateErr.message || "Unable to update password.");
      showToast("Password update failed", "error");
      return;
    }

    setPwSaved(true);
    showToast("Password updated", "success");
    setPw({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2500);
  };

  const fields: Array<{ key: keyof Settings; label: string; type?: string; hint?: string }> = [
    { key: "siteName", label: "Site Name" },
    { key: "whatsappNumber", label: "WhatsApp Number", hint: "International format without +, e.g. 923190691621" },
    { key: "email", label: "Contact Email", type: "email" },
    { key: "address", label: "Business Address" },
    { key: "instagram", label: "Instagram URL" },
    { key: "facebook", label: "Facebook URL" },
  ];

  const numFields: Array<{ key: keyof Settings; label: string; hint?: string }> = [
    { key: "deliveryFee", label: "Delivery Fee (PKR)", hint: "Flat delivery charge applied to every order" },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Configure your store &amp; account</p>
      </div>

      <div className="space-y-5">
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
            {saveError}
          </div>
        )}

        {/* General */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
          <h2 className="font-medium text-[var(--text-primary)] mb-5">General Information</h2>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">{field.label}</label>
                <input
                  type={field.type || "text"}
                  value={String(settings[field.key] || "")}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-boutique"
                />
                {field.hint && <p className="text-xs text-[var(--text-secondary)] mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
          <h2 className="font-medium text-[var(--text-primary)] mb-5">Delivery Settings</h2>
          <div className="space-y-4">
            {numFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">{field.label}</label>
                <input
                  type="number"
                  value={Number(settings[field.key])}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="input-boutique"
                />
                {field.hint && <p className="text-xs text-[var(--text-secondary)] mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Save general */}
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-medium text-sm transition-all"
          style={{ background: saved ? "#5AB860" : "linear-gradient(135deg, #E8A0B0, #C4A484)" }}
        >
          {saved ? <><CheckCircle size={16} /> Settings Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>

        {/* Change Password */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-[var(--accent-gold)]" />
            <h2 className="font-medium text-[var(--text-primary)]">Change Password</h2>
          </div>

          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4">
              {pwError}
            </div>
          )}
          {pwSaved && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2.5 rounded-xl mb-4 flex items-center gap-2">
              <CheckCircle size={14} /> Password changed successfully!
            </div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-gold)]"
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPw ? "Hide Passwords" : "Show Passwords"}
            </button>

            {[
              { key: "current", label: "Current Password", placeholder: "Your current password" },
              { key: "newPw", label: "New Password", placeholder: "At least 6 characters" },
              { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[var(--text-primary)] mb-1.5 block">{field.label}</label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={pw[field.key as keyof typeof pw]}
                  onChange={(e) => setPw((p) => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="input-boutique"
                />
              </div>
            ))}
            <button type="submit" className="btn-primary py-3 px-6 text-sm">
              Update Password
            </button>
          </form>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-[var(--surface)] rounded-2xl shadow-boutique p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-[var(--accent-gold)]" />
            <h2 className="font-playfair text-lg text-[var(--text-primary)]">Payment Methods</h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Payment methods shown to customers on the checkout terms page.</p>

          <div className="space-y-3 mb-4">
            {(settings.paymentMethods || []).map((method, idx) => (
              <div key={method.id} className="flex gap-3 items-start bg-[var(--background)] rounded-xl p-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={method.bankName}
                    onChange={(e) => {
                      const updated = [...(settings.paymentMethods || [])];
                      updated[idx] = { ...updated[idx], bankName: e.target.value };
                      setSettings({ ...settings, paymentMethods: updated });
                    }}
                    placeholder="Bank Name"
                    className="input-boutique text-xs"
                  />
                  <input
                    type="text"
                    value={method.accountTitle}
                    onChange={(e) => {
                      const updated = [...(settings.paymentMethods || [])];
                      updated[idx] = { ...updated[idx], accountTitle: e.target.value };
                      setSettings({ ...settings, paymentMethods: updated });
                    }}
                    placeholder="Account Title"
                    className="input-boutique text-xs"
                  />
                  <input
                    type="text"
                    value={method.accountNumber}
                    onChange={(e) => {
                      const updated = [...(settings.paymentMethods || [])];
                      updated[idx] = { ...updated[idx], accountNumber: e.target.value };
                      setSettings({ ...settings, paymentMethods: updated });
                    }}
                    placeholder="Account Number"
                    className="input-boutique text-xs"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = (settings.paymentMethods || []).filter((_, i) => i !== idx);
                    setSettings({ ...settings, paymentMethods: updated });
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const newMethod: PaymentMethod = {
                id: `pm_${Date.now()}`,
                bankName: "",
                accountTitle: "",
                accountNumber: "",
              };
              setSettings({ ...settings, paymentMethods: [...(settings.paymentMethods || []), newMethod] });
            }}
            className="flex items-center gap-2 text-xs font-medium text-[var(--accent-gold)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Plus size={14} /> Add Payment Method
          </button>

          <p className="text-[10px] text-[var(--text-secondary)] mt-3">
            Changes are saved when you click "Save Settings" above.
          </p>
        </div>
      </div>
    </div>
  );
}
