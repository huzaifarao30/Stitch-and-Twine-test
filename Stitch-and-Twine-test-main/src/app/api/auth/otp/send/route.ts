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

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const purposeRaw = String(body?.purpose || "").trim();

    if (!email || !isPurpose(purposeRaw)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const templateId = purposeRaw === "signup"
      ? 1 // Hardcoded Sign-Up OTP Template ID
      : 2; // Hardcoded Reset OTP Template ID

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return NextResponse.json({ error: "BREVO_API_KEY is missing" }, { status: 500 });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await admin
      .from("email_otps")
      .delete()
      .eq("email", email)
      .eq("purpose", purposeRaw)
      .is("consumed_at", null);

    const { error: insertError } = await admin
      .from("email_otps")
      .insert({
        email,
        purpose: purposeRaw,
        otp_hash: otpHash,
        expires_at: expiresAt,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: [{ email }],
        templateId,
        params: { otp },
      }),
    });

    if (!brevoRes.ok) {
      const text = await brevoRes.text();
      return NextResponse.json({ error: `Brevo error: ${text}` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 });
  }
}
