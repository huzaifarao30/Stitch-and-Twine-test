import { Settings } from "@/types";

const defaultSettings: Settings = {
  siteName: "Stitch and Twine",
  whatsappNumber: "923190691621",
  deliveryFee: 250,
  freeDeliveryThreshold: 0,  // 0 = no free delivery
  email: "hello@stitchandtwine.com",
  address: "Rawalpindi, Pakistan",
  instagram: "https://www.instagram.com/stitchandtwine.pk?igsh=MXZkbWh1bDY0OHoyMA==",
  facebook: "https://www.facebook.com/share/18EKcDD9Ev/",
};

export const settingsService = {
  getSettings(): Settings {
    if (typeof window === "undefined") return defaultSettings;
    const stored = localStorage.getItem("sat_settings");
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  },

  saveSettings(settings: Partial<Settings>): void {
    if (typeof window === "undefined") return;
    const current = this.getSettings();
    localStorage.setItem("sat_settings", JSON.stringify({ ...current, ...settings }));
  },
};
