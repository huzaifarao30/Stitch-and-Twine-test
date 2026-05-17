import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrder: string;
  joinedAt: string;
}

export async function GET() {
  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ customers: [] }, { status: 500 });
  }

  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("id, full_name, phone, city, created_at, role")
    .neq("role", "admin")
    .order("created_at", { ascending: false });

  if (profilesError || !profiles) {
    return NextResponse.json({ customers: [] }, { status: 500 });
  }

  const { data: orders } = await adminClient
    .from("orders")
    .select("user_id, total, created_at, customer_email, city, status");

  const byUser = new Map<string, { ordersCount: number; totalSpent: number; lastOrder: string; email: string; city: string }>();
  (orders || []).forEach((order: any) => {
    const userId = order.user_id as string | null;
    if (!userId) return;

    const current = byUser.get(userId) || {
      ordersCount: 0,
      totalSpent: 0,
      lastOrder: "",
      email: "",
      city: "",
    };

    current.ordersCount += 1;
    if (order.status === "delivered") {
      current.totalSpent += Number(order.total || 0);
    }
    if (!current.lastOrder || String(order.created_at) > current.lastOrder) {
      current.lastOrder = String(order.created_at || "");
      current.city = typeof order.city === "string" ? order.city : current.city;
    }
    if (!current.email && typeof order.customer_email === "string") {
      current.email = order.customer_email;
    }

    byUser.set(userId, current);
  });

  const customers: CustomerRow[] = profiles.map((p: any) => {
    const agg = byUser.get(String(p.id));

    return {
      id: String(p.id),
      name: (p.full_name as string) || "Customer",
      phone: (p.phone as string) || "",
      email: agg?.email || "",
      city: agg?.city || (p.city as string) || "",
      ordersCount: agg?.ordersCount || 0,
      totalSpent: agg?.totalSpent || 0,
      lastOrder: agg?.lastOrder || "",
      joinedAt: String(p.created_at || ""),
    };
  });

  customers.sort((a, b) => {
    if (b.totalSpent !== a.totalSpent) return b.totalSpent - a.totalSpent;
    return (b.joinedAt || "").localeCompare(a.joinedAt || "");
  });

  return NextResponse.json({ customers });
}
