// Trip-planning inquiry endpoint. POST from the "Get a custom trip plan"
// form on each trail detail page.
//
// Design intent: during the manual-concierge MVP phase, every submission
// becomes an email to Yibo. He hand-plans the trip and replies directly.
// No database, no queueing — keep the validation loop as short as possible.
//
// Env vars:
//   RESEND_API_KEY    — Resend API key (set in Vercel for production)
//   INQUIRY_TO        — destination email (default: gongyibob@gmail.com)
//   INQUIRY_FROM      — sender (default: onboarding@resend.dev — Resend's
//                       sandbox sender; replace with your verified domain)
//
// Without RESEND_API_KEY the endpoint still returns success and logs the
// submission to the server console — useful for local dev before signup.

import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO   = process.env.INQUIRY_TO   ?? "gongyibob@gmail.com";
const FROM = process.env.INQUIRY_FROM ?? "Trailspark Inquiries <onboarding@resend.dev>";

interface InquiryBody {
  /** Specific trail (from a /trails/[id] page) or "general-inquiry" (from the landing-page form). */
  trailId?: string;
  trailName?: string;
  email: string;
  dates?: string;
  groupSize?: string;
  notes?: string;
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  let body: InquiryBody;
  try {
    body = (await request.json()) as InquiryBody;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  if (!body.email || !isEmail(body.email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 400 });
  }

  // Trail context is optional — landing-page inquiries arrive without one.
  const trailLabel = body.trailName ?? "General trip inquiry";
  const trailIdLabel = body.trailId ?? "general-inquiry";

  const subject  = `New trip inquiry: ${trailLabel}`;
  const text = [
    `Trail:      ${trailLabel} (${trailIdLabel})`,
    `User email: ${body.email}`,
    body.dates     ? `Dates:      ${body.dates}`     : null,
    body.groupSize ? `Group:      ${body.groupSize}` : null,
    body.notes     ? `Notes:\n${body.notes}`         : null,
    "",
    `Reply directly to the user at ${body.email}.`,
  ].filter(Boolean).join("\n");

  const html = `
    <h2>New trip inquiry</h2>
    <p><strong>Trail:</strong> ${escapeHtml(trailLabel)}
       <span style="color:#888">(${escapeHtml(trailIdLabel)})</span></p>
    <p><strong>From:</strong> <a href="mailto:${escapeHtml(body.email)}">${escapeHtml(body.email)}</a></p>
    ${body.dates     ? `<p><strong>Dates:</strong> ${escapeHtml(body.dates)}</p>`         : ""}
    ${body.groupSize ? `<p><strong>Group size:</strong> ${escapeHtml(body.groupSize)}</p>`: ""}
    ${body.notes     ? `<p><strong>Notes:</strong></p><blockquote style="border-left:3px solid #ddd;padding-left:10px;color:#444;">${escapeHtml(body.notes).replaceAll("\n","<br>")}</blockquote>` : ""}
    <hr>
    <p style="color:#666;font-size:12px">Reply directly to the user at ${escapeHtml(body.email)}.</p>
  `;

  // Always log — useful in dev and provides a paper trail in Vercel logs.
  console.log(`[inquiry] ${body.email} → ${trailLabel} (${trailIdLabel})`);
  if (body.dates)     console.log(`  dates: ${body.dates}`);
  if (body.groupSize) console.log(`  group: ${body.groupSize}`);
  if (body.notes)     console.log(`  notes: ${body.notes}`);

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: FROM,
        to: TO,
        replyTo: body.email,
        subject,
        text,
        html,
      });
      if (result.error) {
        console.error("[inquiry] resend error:", result.error);
        // Don't fail the user-facing request — we've logged the submission.
      }
    } catch (e) {
      console.error("[inquiry] resend exception:", e);
    }
  } else {
    console.log("[inquiry] RESEND_API_KEY not set — email skipped, submission logged only.");
  }

  return NextResponse.json({ ok: true });
}
