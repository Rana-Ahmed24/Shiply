import "server-only";

import { getSiteUrl } from "@/lib/supabase/env";
import { SITE } from "@/lib/constants";
import type { NotificationEvent } from "@/types/notification";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function fromAddress(): string {
  return (
    process.env.NOTIFICATIONS_EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    `${SITE.name} <onboarding@resend.dev>`
  );
}

async function sendViaResend(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("[notifications] Resend error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[notifications] Resend failed:", err);
    return false;
  }
}

export async function sendNotificationEmail(params: {
  to: string;
  event: NotificationEvent;
  title: string;
  body: string;
  linkUrl: string;
}): Promise<void> {
  if (!hasResend()) return;

  const site = getSiteUrl().replace(/\/$/, "");
  const href = params.linkUrl.startsWith("http")
    ? params.linkUrl
    : `${site}${params.linkUrl.startsWith("/") ? "" : "/"}${params.linkUrl}`;

  const subject = `${SITE.fullName}: ${params.title}`;
  const text = `${params.body}\n\nOpen: ${href}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
      <p style="font-size:18px;font-weight:600">${params.title}</p>
      <p>${params.body}</p>
      <p><a href="${href}" style="color:#0d9488">View in ${SITE.fullName}</a></p>
    </div>
  `;

  await sendViaResend({ to: params.to, subject, html, text });
}
