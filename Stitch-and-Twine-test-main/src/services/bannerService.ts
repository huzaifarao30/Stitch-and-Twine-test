import { Banner } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { emitContentUpdated } from "@/lib/clientRefreshBus";

function mapBanner(row: any): Banner {
  return {
    id: String(row.id),
    title: row.title || "",
    subtitle: row.subtitle || "",
    description: row.description || "",
    image: row.image || "",
    ctaText: row.cta_text || "Shop Now",
    ctaLink: row.cta_link || "/shop",
    isActive: Boolean(row.is_active),
  };
}

export const bannerService = {
  async getBanners(): Promise<Banner[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapBanner);
  },

  async getAdminBanners(): Promise<Banner[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapBanner);
  },

  async getAdminBannerById(id: string): Promise<Banner | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    emitContentUpdated("banners");
    return mapBanner(data);
  },

  async createBanner(payload: Omit<Banner, "id">): Promise<Banner | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("banners")
      .insert({
        title: payload.title,
        subtitle: payload.subtitle,
        description: payload.description,
        image: payload.image,
        cta_text: payload.ctaText,
        cta_link: payload.ctaLink,
        is_active: payload.isActive,
      })
      .select("*")
      .single();

    if (error || !data) return null;
    emitContentUpdated("banners");
    return mapBanner(data);
  },

  async updateBanner(id: string, payload: Partial<Omit<Banner, "id">>): Promise<Banner | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updateData: Record<string, any> = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.subtitle !== undefined) updateData.subtitle = payload.subtitle;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;
    if (payload.ctaText !== undefined) updateData.cta_text = payload.ctaText;
    if (payload.ctaLink !== undefined) updateData.cta_link = payload.ctaLink;
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive;

    const { data, error } = await supabase
      .from("banners")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) return null;
    return mapBanner(data);
  },

  async deleteBanner(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (!error) {
      emitContentUpdated("banners");
    }
    return !error;
  },
};
