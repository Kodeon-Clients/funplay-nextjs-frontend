import { isDev, mailConfig } from "./env";

export type Attachment = { filename: string; contentType: string; data: Uint8Array };

export type Mail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string[];
  attachments?: Attachment[];
};

export class MailNotConfiguredError extends Error {}

/**
 * Sends an email through the Mailgun HTTP API (multipart/form-data, attachments as files).
 * Throws on failure. Logs only the status code, never the API key or message content.
 * In `next dev` without Mailgun settings the message is printed to the terminal instead,
 * so the forms (including the download verification code) can be tested locally.
 */
export async function sendMail(m: Mail): Promise<void> {
  const cfg = mailConfig();
  const to = Array.isArray(m.to) ? m.to : [m.to];
  if (!cfg) {
    if (isDev) {
      console.info(`[forms][dev] Mailgun not configured. Would send "${m.subject}" to ${to.join(", ")}\n${m.text}`);
      return;
    }
    throw new MailNotConfiguredError("Mailgun is not configured");
  }
  const body = new FormData();
  body.append("from", cfg.from);
  for (const t of to) body.append("to", t);
  for (const b of m.bcc ?? []) body.append("bcc", b);
  body.append("subject", m.subject.replace(/[\r\n]+/g, " ").slice(0, 200));
  body.append("html", m.html);
  body.append("text", m.text);
  if (m.replyTo) body.append("h:Reply-To", m.replyTo);
  for (const a of m.attachments ?? []) {
    // copy into a fresh ArrayBuffer so the Blob owns its bytes
    const bytes = new Uint8Array(a.data.byteLength);
    bytes.set(a.data);
    body.append("attachment", new Blob([bytes.buffer], { type: a.contentType }), a.filename);
  }
  const auth = Buffer.from(`api:${cfg.apiKey}`).toString("base64");
  const res = await fetch(`${cfg.baseUrl}/v3/${encodeURIComponent(cfg.domain)}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error(`[forms] Mailgun send failed: HTTP ${res.status}`);
    throw new Error(`Mailgun HTTP ${res.status}`);
  }
}

/** Sends a lead notification to LEAD_RECIPIENT (+ LEAD_BCC). */
export async function sendLead(m: Omit<Mail, "to" | "bcc">): Promise<void> {
  const cfg = mailConfig();
  const to = cfg?.leadRecipient || "marketing@funplaysystems.com";
  await sendMail({ ...m, to, bcc: cfg?.leadBcc });
}
