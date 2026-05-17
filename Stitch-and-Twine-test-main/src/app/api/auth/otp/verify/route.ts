import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

type Purpose = "signup" | "reset_password";

function isPurpose(value: string): value is Purpose {
  return value === "signup" || value === "reset_password";
}

function hashOtp(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const purposeRaw = String(body?.purpose || "").trim();
    const otp = String(body?.otp || "").trim();

    if (!email || !otp || !isPurpose(purposeRaw)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const otpHash = hashOtp(otp);

    const { data: row, error } = await admin
      .from("email_otps")
      .select("id, expires_at, consumed_at")
      .eq("email", email)
      .eq("purpose", purposeRaw)
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

    const { error: consumeError } = await admin
      .from("email_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    if (consumeError) {
      return NextResponse.json({ error: consumeError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}
