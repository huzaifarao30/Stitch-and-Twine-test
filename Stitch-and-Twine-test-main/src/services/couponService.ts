import { Coupon } from "@/types";
import { createClient } from "@/utils/supabase/client";

function mapCoupon(row: any): Coupon {
  return {
    id: String(row.id),
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value || 0),
    minOrderAmount: row.min_order_amount ? Number(row.min_order_amount) : undefined,
    isActive: Boolean(row.is_active),
    expiresAt: row.expires_at || undefined,
  };
}

export const couponService = {
  async getAdminCoupons(): Promise<Coupon[]> {
    const supabase = createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapCoupon);
  },

  async createCoupon(payload: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderAmount?: number;
    expiresAt?: string;
  }): Promise<Coupon | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("coupons")
      .insert({
        code: payload.code.toUpperCase().trim(),
        discount_type: payload.discountType,
        discount_value: payload.discountValue,
        min_order_amount: payload.minOrderAmount ?? null,
        expires_at: payload.expiresAt ?? null,
        is_active: true,
      })
      .select("*")
      .single();

    if (error || !data) return null;
    return mapCoupon(data);
  },

  async updateCoupon(id: string, payload: Partial<{
    isActive: boolean;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    minOrderAmount?: number;
    expiresAt?: string;
  }>): Promise<Coupon | null> {
    const supabase = createClient();
    if (!supabase) return null;

    const updateData: Record<string, any> = {};
    if (payload.isActive !== undefined) updateData.is_active = payload.isActive;
    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.discountType !== undefined) updateData.discount_type = payload.discountType;
    if (payload.discountValue !== undefined) updateData.discount_value = payload.discountValue;
    if (payload.minOrderAmount !== undefined) updateData.min_order_amount = payload.minOrderAmount;
    if (payload.expiresAt !== undefined) updateData.expires_at = payload.expiresAt;

    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) return null;
    return mapCoupon(data);
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const supabase = createClient();
    if (!supabase) return false;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    return !error;
  },

  async applyCoupon(code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon?: Coupon;
    discount?: number;
    message?: string;
  }> {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), subtotal }),
      });

      const data = await res.json();
      return data;
    } catch {
      return { valid: false, message: "Unable to validate coupon. Please try again." };
    }
  },
};
