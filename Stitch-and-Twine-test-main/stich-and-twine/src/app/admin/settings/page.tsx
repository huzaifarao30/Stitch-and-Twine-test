"use client";
import { useState } from "react";
import { Save, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";
import { settingsService } from "@/services/settingsService";
import { Settings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(settingsService.getSettings());
  const [saved, setSaved] = useState(false);

  // Password change state
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const handleSave = () => {
    settingsService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (pw.current !== "stitch2024") { setPwError("Current password is incorrect."); return; }
    if (pw.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pw.newPw !== pw.confirm) { setPwError("New passwords don't match."); return; }
    setPwSaved(true);
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
    { key: "freeDeliveryThreshold", label: "Free Delivery From (PKR)", hint: "Set to 0 to disable free delivery" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-[#2E2E2E]">Settings</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Configure your store &amp; account</p>
      </div>

      <div className="space-y-5">
        {/* General */}
        <div className="bg-white rounded-2xl shadow-boutique p-6">
          <h2 className="font-medium text-[#2E2E2E] mb-5">General Information</h2>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[#2E2E2E] mb-1.5 block">{field.label}</label>
                <input
                  type={field.type || "text"}
                  value={String(settings[field.key] || "")}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-boutique"
                />
                {field.hint && <p className="text-xs text-[#9B8B7A] mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl shadow-boutique p-6">
          <h2 className="font-medium text-[#2E2E2E] mb-5">Delivery Settings</h2>
          <div className="space-y-4">
            {numFields.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[#2E2E2E] mb-1.5 block">{field.label}</label>
                <input
                  type="number"
                  value={Number(settings[field.key])}
                  onChange={(e) => setSettings((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="input-boutique"
                />
                {field.hint && <p className="text-xs text-[#9B8B7A] mt-1">{field.hint}</p>}
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
        <div className="bg-white rounded-2xl shadow-boutique p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-[#C4A484]" />
            <h2 className="font-medium text-[#2E2E2E]">Change Password</h2>
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
            {[
              { key: "current", label: "Current Password", placeholder: "Your current password" },
              { key: "newPw", label: "New Password", placeholder: "At least 6 characters" },
              { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-[#2E2E2E] mb-1.5 block">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={pw[field.key as keyof typeof pw]}
                    onChange={(e) => setPw((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input-boutique pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8B7A] hover:text-[#C4A484]"
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn-primary py-3 px-6 text-sm">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
