import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types";
import { normalizeCategoryName, normalizeCategorySlug } from "@/lib/utils";
import { emitContentUpdated } from "@/lib/clientRefreshBus";

type ProductRow = Record<string, any>;

function mapProduct(row: ProductRow): Product {
  const normalizedCategorySlug = normalizeCategorySlug(row.category_slug || "");
  return {
    id: String(row.id),
    name: row.name || "",
    slug: row.slug || "",
    description: row.description || "",
    price: Number(row.price || 0),
    comparePrice: row.compare_price !== null && row.compare_price !== undefined ? Number(row.compare_price) : undefined,
    images: Array.isArray(row.images) ? row.images : [],
    category: normalizeCategoryName(row.category || "", normalizedCategorySlug),
    categorySlug: normalizedCategorySlug,
    isFeature: Boolean(row.is_feature ?? row.is_featured),
    isActive: Boolean(row.is_active),
    stock: Number(row.stock || 0),
    variants: Array.isArray(row.variants) ? row.variants : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 0,
    reviewCount: Number(row.review_count || 0),
  };
}

async function enrichProductsWithRatings(products: Product[]): Promise<Product[]> {
  const supabase = createClient();
  if (!supabase || products.length === 0) return products;

  const productIds = products.map((p) => p.id);
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", productIds)
    .eq("is_approved", true);

  if (error || !data) return products;

  const grouped = new Map<string, { total: number; count: number }>();
  for (const row of data as Array<{ product_id: string; rating: number }>) {
    const key = String(row.product_id);
    const prev = grouped.get(key) || { total: 0, count: 0 };
    prev.total += Number(row.rating || 0);
    prev.count += 1;
    grouped.set(key, prev);
  }

  return products.map((p) => {
    const stats = grouped.get(p.id);
    if (!stats || stats.count === 0) {
      return { ...p, rating: 0, reviewCount: 0 };
    }
    return {
      ...p,
      rating: Number((stats.total / stats.count).toFixed(1)),
      reviewCount: stats.count,
    };
  });
}

export interface ProductPayload {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  categorySlug: string;
  isFeature?: boolean;
  isActive?: boolean;
  stock: number;
  variants?: unknown[];
  tags?: string[];
}

export const productService = {
  async getProducts(filters?: {
    categorySlug?: string;
    isFeatured?: boolean;
    search?: string;
    sortBy?: "newest" | "price-asc" | "price-desc";
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (filters?.categorySlug) {
      const normalizedSlug = normalizeCategorySlug(filters.categorySlug);
      const categorySlugs = normalizedSlug === "flowers" ? ["flowers", "folowers"] : [normalizedSlug];
      query = query.in("category_slug", categorySlugs);
    }

    if (filters?.isFeatured) {
      query = query.eq("is_featured", true);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.sortBy === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (filters?.sortBy === "price-desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let result = data.map(mapProduct);

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    return enrichProductsWithRatings(result);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) return null;
    const mapped = mapProduct(data);
    const [enriched] = await enrichProductsWithRatings([mapped]);
    return enriched || mapped;
  },

  async getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const normalizedCategorySlug = normalizeCategorySlug(product.categorySlug);
    const categorySlugs = normalizedCategorySlug === "flowers" ? ["flowers", "folowers"] : [normalizedCategorySlug];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("category_slug", categorySlugs)
      .eq("is_active", true)
      .neq("id", product.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return enrichProductsWithRatings(data.map(mapProduct));
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return enrichProductsWithRatings(data.map(mapProduct));
  },

  async getAdminProducts(): Promise<Product[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapProduct);
  },

  async getAdminProductById(id: string): Promise<Product | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    emitContentUpdated("products");
    return mapProduct(data);
  },

  async createProduct(payload: ProductPayload): Promise<Product | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: payload.price,
        compare_price: payload.comparePrice ?? null,
        images: payload.images,
        category: payload.category,
        category_slug: payload.categorySlug,
        is_featured: payload.isFeature ?? false,
        is_active: payload.isActive ?? true,
        stock: payload.stock,
        variants: payload.variants ?? [],
        tags: payload.tags ?? [],
      })
      .select("*")
      .single();

    if (error || !data) return null;
    emitContentUpdated("products");
    return mapProduct(data);
  },

  async updateProduct(id: string, payload: Partial<ProductPayload>): Promise<Product | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updateData: Record<string, any> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.comparePrice !== undefined) updateData.compare_price = payload.comparePrice;
    if (payload.images !== undefined) updateData.images = payload.images;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.categorySlug !== undefined) updateData.category_slug = payload.categorySlug;
    if (payload.isFeature !== undefined) updateData.is_featured = payload.isFeature;
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive;
    if (payload.stock !== undefined) updateData.stock = payload.stock;
    if (payload.variants !== undefined) updateData.variants = payload.variants;
    if (payload.tags !== undefined) updateData.tags = payload.tags;

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) return null;
    return mapProduct(data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      emitContentUpdated("products");
    }
    return !error;
  },
};
