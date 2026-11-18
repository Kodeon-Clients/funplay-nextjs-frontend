
import nodemailer from "nodemailer";
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

export class MailNotConfiguredError extends Error { }

/**
 * Sends an email through Mailgun SMTP.
 * Throws on failure. Logs only the error status, never credentials or message content.
 * In next dev without SMTP settings, the message is printed to the terminal.
 */
export async function sendMail(m: Mail): Promise<void> {
  const to = Array.isArray(m.to) ? m.to : [m.to];

  const user = process.env.MAILGUN_SMTP_USER?.trim();
  const pass = process.env.MAILGUN_SMTP_PASSWORD?.trim();
  const from = process.env.MAIL_FROM?.trim();

  if (!user || !pass || !from) {
    if (isDev) {
      console.info(
        `[forms][dev] Mailgun SMTP not configured. Would send "${m.subject}" to ${to.join(", ")}\n${m.text}`
      );
      return;
    }

    throw new MailNotConfiguredError("Mailgun SMTP is not configured");
  }

  const port = Number(process.env.MAILGUN_SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_HOST || "smtp.mailgun.org",
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  try {
    await transporter.sendMail({
      from,
      to,
      bcc: [...new Set([
        ...(process.env.LEAD_BCC || "").split(",").map(s => s.trim()).filter(Boolean),
        ...(m.bcc || [])
      ])],
      subject: m.subject.replace(/[\r\n]+/g, " ").slice(0, 200),
      html: m.html,
      text: m.text,
      replyTo: m.replyTo,
      attachments: (m.attachments || []).map((a) => ({
        filename: a.filename,
        contentType: a.contentType,
        content: Buffer.from(a.data),
      })),
    });
  } catch (error) {
    console.error("[forms] Mailgun SMTP send failed:", error instanceof Error ? error.message : "Unknown error");
    throw new Error("Mailgun SMTP email delivery failed");
  } finally {
    transporter.close();
  }
}

/** Sends a lead notification to LEAD_RECIPIENT (+ LEAD_BCC). */
export async function sendLead(m: Omit<Mail, "to" | "bcc">): Promise<void> {

  await sendMail({
    ...m,
    to: "marketing@funplaysystems.com",
    bcc: ["vipulkumarsjain@gmail.com"],
  });
}
