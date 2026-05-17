import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerEmail, orderNumber } = body as {
      orderId?: string;
      customerEmail?: string;
      orderNumber?: string;
    };

    if (!customerEmail || !orderNumber) {
      return NextResponse.json({ error: "Missing customerEmail or orderNumber" }, { status: 400 });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error("[confirm-email] BREVO_API_KEY is missing from env");
      return NextResponse.json({ error: "BREVO_API_KEY is missing" }, { status: 500 });
    }

    // Step 1: Fetch verified senders from Brevo to use a valid sender
    let senderEmail = process.env.SMTP_FROM_EMAIL || "";
    let senderName = "Stitch & Twine";

    if (!senderEmail) {
      try {
        const sendersRes = await fetch("https://api.brevo.com/v3/senders", {
          headers: {
            accept: "application/json",
            "api-key": brevoApiKey,
          },
        });

        if (sendersRes.ok) {
          const sendersData = await sendersRes.json();
          const senders = sendersData?.senders;
          if (Array.isArray(senders) && senders.length > 0) {
            // Use the first active sender
            const activeSender = senders.find((s: any) => s.active) || senders[0];
            senderEmail = activeSender.email;
            senderName = activeSender.name || senderName;
            console.log(`[confirm-email] Using Brevo sender: ${senderName} <${senderEmail}>`);
          }
        }
      } catch (senderErr) {
        console.error("[confirm-email] Failed to fetch senders from Brevo:", senderErr);
      }
    }

    if (!senderEmail) {
      console.error("[confirm-email] No verified sender found. Set SMTP_FROM_EMAIL env var or add a sender in Brevo.");
      return NextResponse.json({ error: "No verified sender configured in Brevo" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://stitchandtwine.com";
    const trackingLink = `${siteUrl}/track-order?id=${encodeURIComponent(orderNumber)}`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #EDE6DA;">
        <div style="background: linear-gradient(135deg, #E8A0B0, #C4A484); padding: 32px 24px; text-align: center;">
          <h1 style="color: #FFFFFF; font-size: 24px; margin: 0 0 8px 0; font-weight: 600;">Order Confirmed! ✨</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Your order has been confirmed and is being prepared</p>
        </div>
        <div style="padding: 32px 24px;">
          <div style="background: #F6F2EA; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #6B6B6B; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Order Number</p>
            <p style="color: #2E2E2E; font-size: 20px; font-weight: 700; margin: 0;">${orderNumber}</p>
          </div>
          <p style="color: #2E2E2E; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for your purchase! We've received your payment and your order is now being prepared with love. 🌸
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${trackingLink}" style="display: inline-block; background: linear-gradient(135deg, #B8935F, #C4A484); color: #FFFFFF; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Track Your Order →
            </a>
          </div>
          <p style="color: #6B6B6B; font-size: 12px; text-align: center; margin: 0;">
            If you have any questions, reply to this email or WhatsApp us.
          </p>
        </div>
        <div style="background: #F6F2EA; padding: 16px 24px; text-align: center;">
          <p style="color: #C4A484; font-size: 12px; margin: 0;">Stitch & Twine — Handcrafted with Love 🧵</p>
        </div>
      </div>
    `;

    console.log(`[confirm-email] Sending email to ${customerEmail} for order ${orderNumber} from ${senderEmail}`);

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: customerEmail }],
        subject: `Order Confirmed — ${orderNumber} ✨`,
        htmlContent,
      }),
    });

    if (!brevoRes.ok) {
      const text = await brevoRes.text();
      console.error(`[confirm-email] Brevo API error (${brevoRes.status}): ${text}`);
      return NextResponse.json({ error: `Brevo error: ${text}` }, { status: 502 });
    }

    console.log(`[confirm-email] Email sent successfully to ${customerEmail}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[confirm-email] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

