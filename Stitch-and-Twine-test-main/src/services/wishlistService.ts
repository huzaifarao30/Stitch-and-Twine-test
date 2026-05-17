import { createClient } from "@/utils/supabase/client";
import { WishlistItem } from "@/types";

function mapWishlistItem(row: any): WishlistItem | null {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  if (!product) return null;

  return {
    id: String(row.id),
    productId: String(row.product_id),
    name: product.name || "",
    price: Number(product.price || 0),
    image: Array.isArray(product.images) ? (product.images[0] || "") : "",
    slug: product.slug || "",
  };
}

export const wishlistService = {
  async getWishlistItems(userId: string): Promise<WishlistItem[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("wishlists")
      .select("id, product_id, products(name,price,images,slug,is_active)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data
      .map(mapWishlistItem)
      .filter((item): item is WishlistItem => !!item)
      .filter((item) => Boolean(item.slug));
  },

  async addWishlistItem(userId: string, productId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: userId, product_id: productId });

    return !error;
  },

  async removeWishlistItem(userId: string, productId: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    return !error;
  },
};
