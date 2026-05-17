import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

async function findUserByEmail(admin: ReturnType<typeof createAdminClient>, email: string) {
  if (!admin) return null;
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return null;
  return data.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const otp = String(body?.otp || "").trim();
    const newPassword = String(body?.newPassword || "");

    if (!email || !otp || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const otpHash = hashOtp(otp);
    const { data: row, error } = await admin
      .from("email_otps")
      .select("id, expires_at")
      .eq("email", email)
      .eq("purpose", "reset_password")
      .eq("otp_hash", otpHash)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !row) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    const user = await findUserByEmail(admin, email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error: updateErr } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await admin
      .from("email_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}
