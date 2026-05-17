import { Settings } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { emitContentUpdated } from "@/lib/clientRefreshBus";

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
  async getSettings(): Promise<Settings> {
    const supabase = createClient();
    if (!supabase) return defaultSettings;

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return defaultSettings;
    }

    return {
      siteName: data.site_name ?? defaultSettings.siteName,
      whatsappNumber: data.whatsapp_number ?? defaultSettings.whatsappNumber,
      deliveryFee: Number(data.delivery_fee ?? defaultSettings.deliveryFee),
      freeDeliveryThreshold: Number(data.free_delivery_threshold ?? defaultSettings.freeDeliveryThreshold),
      email: data.email ?? defaultSettings.email,
      address: data.address ?? defaultSettings.address,
      instagram: data.instagram ?? defaultSettings.instagram,
      facebook: data.facebook ?? defaultSettings.facebook,
      paymentMethods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
    };
  },

  async saveSettings(settings: Partial<Settings>): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("settings")
      .upsert(
        {
          id: 1,
          site_name: settings.siteName,
          whatsapp_number: settings.whatsappNumber,
          delivery_fee: settings.deliveryFee,
          free_delivery_threshold: settings.freeDeliveryThreshold,
          email: settings.email,
          address: settings.address,
          instagram: settings.instagram,
          facebook: settings.facebook,
          payment_methods: settings.paymentMethods ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (!error) {
      emitContentUpdated("settings");
    }

    return !error;
  },
};
