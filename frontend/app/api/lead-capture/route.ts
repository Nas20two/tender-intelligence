import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEADS_EMAIL = "nasir418ece@gmail.com";
const FROM_EMAIL = "leads@nasyhub.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const payload = {
      email: email.trim(),
      source: "tender-intelligence",
      timestamp: new Date().toISOString(),
    };

    console.log(`[TI Lead] New: ${payload.email}`);

    // Send notification via Resend
    if (RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Tender Intelligence <${FROM_EMAIL}>`,
            to: LEADS_EMAIL,
            subject: `🔔 New TI Lead: ${payload.email}`,
            html: `
              <h2>New Tender Intelligence Lead</h2>
              <table style="border-collapse:collapse;width:100%;max-width:500px;">
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${payload.email}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Source</td><td style="padding:8px;border:1px solid #ddd;">${payload.source}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Time</td><td style="padding:8px;border:1px solid #ddd;">${payload.timestamp}</td></tr>
              </table>
              <p style="margin-top:16px;color:#666;font-size:13px;">
                Follow up: <a href="mailto:${payload.email}">${payload.email}</a>
              </p>
            `,
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (res.ok) {
          console.log(`[TI Lead] Email sent: ${payload.email}`);
        } else {
          const err = await res.text();
          console.error(`[TI Lead] Resend failed:`, err);
        }
      } catch (e) {
        console.error(`[TI Lead] Resend error:`, e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[TI Lead] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
