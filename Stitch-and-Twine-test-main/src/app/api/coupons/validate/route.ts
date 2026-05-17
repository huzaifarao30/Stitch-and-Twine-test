import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body?.code || "").trim().toUpperCase();
    const subtotal = Number(body?.subtotal || 0);

    if (!code) {
      return NextResponse.json({ valid: false, message: "Please enter a coupon code" });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ valid: false, message: "Server not configured" }, { status: 500 });
    }

    const { data, error } = await admin
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" });
    }

    // Check minimum order
    const minOrderAmount = data.min_order_amount ? Number(data.min_order_amount) : 0;
    if (minOrderAmount > 0 && subtotal < minOrderAmount) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of PKR ${minOrderAmount} required`,
      });
    }

    const discountValue = Number(data.discount_value || 0);
    const discount =
      data.discount_type === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue;

    const finalDiscount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      coupon: {
        id: String(data.id),
        code: data.code,
        discountType: data.discount_type,
        discountValue,
        minOrderAmount: data.min_order_amount ? Number(data.min_order_amount) : undefined,
        isActive: true,
        expiresAt: data.expires_at || undefined,
      },
      discount: finalDiscount,
      message: `Coupon applied! You saved PKR ${finalDiscount.toFixed(0)}`,
    });
  } catch (err) {
    return NextResponse.json(
      { valid: false, message: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
