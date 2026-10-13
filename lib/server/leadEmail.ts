import { escapeHtml, headerSafe } from "./validate";

export type Row = [label: string, value: string];

const cell = "border-top:1px solid #dfdfdf;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;padding:8px 10px;vertical-align:top;";

/**
 * Renders a lead notification as a clean HTML table plus a plain-text version. Empty values
 * are skipped, every value is HTML-escaped, line breaks are kept. No IP address is included.
 */
export function leadEmail(title: string, rows: Row[], pageUrl?: string): { html: string; text: string } {
  const all: Row[] = rows.filter(([, v]) => v && v.trim());
  if (pageUrl) all.push(["Page URL", pageUrl]);
  const trs = all
    .map(
      ([k, v]) =>
        `<tr><td style="${cell}font-weight:bold;white-space:nowrap;width:160px;">${escapeHtml(k)}</td><td style="${cell}">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body style="margin:0;padding:20px;background:#f5f5f5;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-collapse:collapse;"><tr><td colspan="2" style="padding:16px 10px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#111;">${escapeHtml(title)}</td></tr>${trs}<tr><td colspan="2" style="${cell}font-size:12px;color:#666;">Sent from the FunPlay Systems website. Reply to this email to respond to the sender.</td></tr></table></body></html>`;
  const text = `${title}\n\n${all.map(([k, v]) => `${k}: ${v}`).join("\n")}\n`;
  return { html, text };
}

/** `"Name" <email>` for the Reply-To header. */
export function replyTo(name: string, email: string): string {
  const n = headerSafe(name);
  return n ? `"${n}" <${email}>` : email;
}
