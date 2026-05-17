import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const normalizeRole = (role: unknown) =>
  typeof role === "string" ? role.trim().toLowerCase() : null;

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ isAdmin: false, reason: "supabase_not_configured" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isAdmin: false, reason: "not_authenticated" }, { status: 401 });
  }

  const metadataRole = normalizeRole(user.app_metadata?.role ?? user.user_metadata?.role);
  if (metadataRole === "admin") {
    return NextResponse.json({ isAdmin: true, source: "metadata" });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ isAdmin: false, reason: "admin_client_not_configured" }, { status: 500 });
  }

  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ isAdmin: false, reason: error.message }, { status: 500 });
  }

  const profileRole = normalizeRole(profile?.role);
  return NextResponse.json({ isAdmin: profileRole === "admin", source: "profile" });
}
