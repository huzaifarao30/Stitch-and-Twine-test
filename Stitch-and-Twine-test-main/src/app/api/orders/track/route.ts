import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Look up by order_number (e.g. ST-123456)
    const { data, error } = await admin
      .from("orders")
      .select("id, order_number, items, subtotal, delivery_fee, discount, total, status, created_at, updated_at, shipped_at, delivered_at, confirmed_at, coupon_code, notes")
      .eq("order_number", id)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const notesText = typeof data.notes === "string" ? data.notes : "";
    const isCustom = notesText.includes('"custom_order"') || notesText.includes("CUSTOM_ORDER");

    // Return only safe public data — no customer phone/email/address
    return NextResponse.json({
      orderNumber: data.order_number,
      items: Array.isArray(data.items) ? data.items.map((item: any) => ({
        name: item.name || item.product_name || "",
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 0),
        image: item.image || item.product_image || "",
      })) : [],
      subtotal: Number(data.subtotal || 0),
      deliveryFee: Number(data.delivery_fee || 0),
      discount: Number(data.discount || 0),
      total: Number(data.total || 0),
      status: data.status || "pending",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      shippedAt: data.shipped_at || null,
      deliveredAt: data.delivered_at || null,
      confirmedAt: data.confirmed_at || null,
      isCustom,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
