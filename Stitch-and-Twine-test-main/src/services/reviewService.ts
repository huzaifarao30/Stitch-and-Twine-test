import { createClient } from "@/utils/supabase/client";
import { Review } from "@/types";

export interface ProductReview {
  id: string;
  productId: string;
  productName?: string;
  userId: string;
  customerName: string;
  rating: number;
  reviewText: string;
  isApproved: boolean;
  createdAt: string;
}

function mapReview(row: any): ProductReview {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;

  return {
    id: String(row.id),
    productId: String(row.product_id),
    productName: product?.name || undefined,
    userId: String(row.user_id),
    customerName: row.customer_name || "Customer",
    rating: Number(row.rating || 0),
    reviewText: row.review_text || "",
    isApproved: Boolean(row.is_approved),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export const reviewService = {
  async getHomepageReviews(displayLimit = 6, fiveStarPool = 24): Promise<Review[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data: fiveStarRows, error: fiveStarError } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("is_approved", true)
      .eq("rating", 5)
      .order("created_at", { ascending: false })
      .limit(fiveStarPool);

    const mapRow = (row: any): Review => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      return {
        id: String(row.id),
        customerName: row.customer_name || "Customer",
        customerAvatar: row.customer_avatar || undefined,
        rating: Number(row.rating || 0),
        reviewText: row.review_text || "",
        productReference: product?.name || undefined,
        isFeatured: Boolean(row.is_featured),
        createdAt: row.created_at || new Date().toISOString(),
      };
    };

    const fiveStarReviews = !fiveStarError && Array.isArray(fiveStarRows)
      ? fiveStarRows.map(mapRow)
      : [];

    if (fiveStarReviews.length >= displayLimit) {
      return fiveStarReviews;
    }

    const { data: latestRows, error: latestError } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(displayLimit);

    if (latestError || !latestRows) {
      return fiveStarReviews;
    }

    return latestRows.map(mapRow);
  },

  async getApprovedReviewStats(): Promise<{ average: number; count: number }> {
    const supabase = createClient();
    if (!supabase) return { average: 0, count: 0 };

    const { data, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("is_approved", true);

    if (error || !data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const count = data.length;
    const total = data.reduce((sum, row: any) => sum + Number(row.rating || 0), 0);
    const average = total / count;

    return { average, count };
  },

  async getTopFiveStarReviews(limit = 6): Promise<Review[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("is_approved", true)
      .eq("rating", 5)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row: any) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      return {
        id: String(row.id),
        customerName: row.customer_name || "Customer",
        customerAvatar: row.customer_avatar || undefined,
        rating: Number(row.rating || 5),
        reviewText: row.review_text || "",
        productReference: product?.name || undefined,
        isFeatured: Boolean(row.is_featured),
        createdAt: row.created_at || new Date().toISOString(),
      } satisfies Review;
    });
  },

  async getProductReviews(productId: string, userId?: string): Promise<ProductReview[]> {
    const supabase = createClient();
    if (!supabase) return [];

    let query = supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.or(`is_approved.eq.true,user_id.eq.${userId}`);
    } else {
      query = query.eq("is_approved", true);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapReview);
  },

  async createReview(payload: {
    productId: string;
    userId: string;
    customerName: string;
    rating: number;
    reviewText: string;
  }): Promise<ProductReview> {
    const supabase = createClient();
    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const tryInsert = async () =>
      supabase
      .from("reviews")
      .insert({
        product_id: payload.productId,
        user_id: payload.userId,
        customer_name: payload.customerName,
        rating: payload.rating,
        review_text: payload.reviewText,
        is_approved: true,
      })
      .select("*")
      .single();

    let { data, error } = await tryInsert();

    if (error && /foreign key|violates foreign key constraint/i.test(error.message)) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            full_name:
              typeof user.user_metadata?.full_name === "string"
                ? user.user_metadata.full_name
                : user.email?.split("@")[0] || "Customer",
            phone: typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null,
            city: typeof user.user_metadata?.city === "string" ? user.user_metadata.city : null,
            address: typeof user.user_metadata?.address === "string" ? user.user_metadata.address : null,
          },
          { onConflict: "id" }
        );

        const retry = await tryInsert();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error || !data) {
      throw new Error(error?.message || "Unable to create review.");
    }
    return mapReview(data);
  },

  async getAdminReviews(limit = 10): Promise<ProductReview[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapReview);
  },

  async deleteReview(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    return !error;
  },
};
