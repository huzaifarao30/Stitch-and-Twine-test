import { createClient } from "@/utils/supabase/client";
import { Category } from "@/types";
import { normalizeCategoryName, normalizeCategorySlug } from "@/lib/utils";
import { emitContentUpdated } from "@/lib/clientRefreshBus";

type CategoryRow = Record<string, any>;

function mapCategory(row: CategoryRow): Category {
  const normalizedSlug = normalizeCategorySlug(row.slug || "");
  return {
    id: String(row.id),
    name: normalizeCategoryName(row.name || "", normalizedSlug),
    slug: normalizedSlug,
    description: row.description || "",
    image: row.image || "",
  };
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description: string;
  image: string;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapCategory);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const normalizedSlug = normalizeCategorySlug(slug);
    const categorySlugs = normalizedSlug === "flowers" ? ["flowers", "folowers"] : [normalizedSlug];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .in("slug", categorySlugs)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    return mapCategory(data);
  },

  async getAdminCategories(): Promise<Category[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapCategory);
  },

  async getAdminCategoryById(id: string): Promise<Category | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return mapCategory(data);
  },

  async createCategory(payload: CategoryPayload): Promise<Category | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        image: payload.image,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) return null;
    emitContentUpdated("categories");
    return mapCategory(data);
  },

  async updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<Category | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updateData: Record<string, any> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.image !== undefined) updateData.image = payload.image;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) return null;
    emitContentUpdated("categories");
    return mapCategory(data);
  },

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (!error) {
      emitContentUpdated("categories");
    }
    return !error;
  },
};
