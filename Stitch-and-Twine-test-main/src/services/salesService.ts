// --- SALES MODULE ---
import { createClient } from "@/utils/supabase/client";
import { Sale } from "@/types";
import { emitContentUpdated } from "@/lib/clientRefreshBus";
import { normalizeCategoryName, normalizeCategorySlug } from "@/lib/utils";

type SaleRow = Record<string, any>;

function mapSale(row: SaleRow): Sale {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    categoryName: row.categories?.name
      ? normalizeCategoryName(row.categories.name, row.categories.slug)
      : row.category_name || "",
    categorySlug: row.categories?.slug
      ? normalizeCategorySlug(row.categories.slug)
      : row.category_slug || "",
    discountPercent: Number(row.discount_percent || 0),
    isActive: Boolean(row.is_active),
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/** Check if a sale is currently within its date range */
function isSaleInDateRange(sale: Sale): boolean {
  const now = new Date();
  if (sale.startDate && new Date(sale.startDate) > now) return false;
  if (sale.endDate && new Date(sale.endDate) < now) return false;
  return true;
}

export interface SalePayload {
  categoryId: string;
  discountPercent: number;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export const salesService = {
  /** Get all currently active sales (used by storefront for price calc + marquee) */
  async getActiveSales(): Promise<Sale[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("sales")
      .select("*, categories(name, slug)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data
      .map(mapSale)
      .filter(isSaleInDateRange);
  },

  /** Get all sales for admin management */
  async getAdminSales(): Promise<Sale[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("sales")
      .select("*, categories(name, slug)")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapSale);
  },

  /** Create a new sale */
  async createSale(payload: SalePayload): Promise<Sale | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("sales")
      .insert({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`,
        category_id: payload.categoryId,
        discount_percent: payload.discountPercent,
        is_active: payload.isActive ?? false,
        start_date: payload.startDate ?? null,
        end_date: payload.endDate ?? null,
      })
      .select("*, categories(name, slug)")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    if (!data) return null;
    emitContentUpdated("sales");
    return mapSale(data);
  },

  /** Update an existing sale */
  async updateSale(id: string, payload: Partial<SalePayload>): Promise<Sale | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updateData: Record<string, any> = {};
    if (payload.categoryId !== undefined) updateData.category_id = payload.categoryId;
    if (payload.discountPercent !== undefined) updateData.discount_percent = payload.discountPercent;
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive;
    if (payload.startDate !== undefined) updateData.start_date = payload.startDate;
    if (payload.endDate !== undefined) updateData.end_date = payload.endDate;

    const { data, error } = await supabase
      .from("sales")
      .update(updateData)
      .eq("id", id)
      .select("*, categories(name, slug)")
      .single();

    if (error || !data) return null;
    emitContentUpdated("sales");
    return mapSale(data);
  },

  /** Delete a sale */
  async deleteSale(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (!error) {
      emitContentUpdated("sales");
    }
    return !error;
  },

  /** Count products in a category */
  async getProductCountForCategory(categoryId: string): Promise<number> {
    const supabase = createClient();
    if (!supabase) return 0;

    // First get the category slug
    const { data: cat } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", categoryId)
      .maybeSingle();

    if (!cat?.slug) return 0;

    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category_slug", cat.slug)
      .eq("is_active", true);

    if (error) return 0;
    return count ?? 0;
  },
};
