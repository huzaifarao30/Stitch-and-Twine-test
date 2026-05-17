import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Find pending orders older than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: staleOrders, error: fetchErr } = await admin
      .from("orders")
      .select("id")
      .eq("status", "pending")
      .lt("created_at", cutoff);

    if (fetchErr || !staleOrders || staleOrders.length === 0) {
      return NextResponse.json({ deleted: 0, message: "No stale orders found" });
    }

    const ids = staleOrders.map((o: { id: string }) => o.id);

    // Delete associated order_items first
    await admin.from("order_items").delete().in("order_id", ids);

    // Delete the orders
    const { error: deleteErr } = await admin.from("orders").delete().in("id", ids);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ deleted: ids.length, message: `Deleted ${ids.length} stale pending orders` });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}
