/**
 * Server-side configuration for the form handlers. Every value is read from environment
 * variables at call time (so Vercel env changes apply on the next cold start without code
 * changes). Never import this file from a client component.
 */

const read = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
};

export type MailConfig = {
  apiKey: string;
  domain: string;
  baseUrl: string;
  from: string;
  leadRecipient: string;
  leadBcc: string[];
};

/** Mailgun settings, or null when MAILGUN_API_KEY / MAILGUN_DOMAIN are missing. */
export function mailConfig(): MailConfig | null {
  const apiKey = read("MAILGUN_API_KEY");
  const domain = read("MAILGUN_DOMAIN");
  if (!apiKey || !domain) return null;
  const region = (read("MAILGUN_REGION") || "us").toLowerCase();
  return {
    apiKey,
    domain,
    baseUrl: region === "eu" ? "https://api.eu.mailgun.net" : "https://api.mailgun.net",
    from: read("MAIL_FROM") || "FunPlay Website <webmaster@funplaysystems.com>",
    leadRecipient: read("LEAD_RECIPIENT") || "marketing@funplaysystems.com",
    leadBcc: (read("LEAD_BCC") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

/** Lead recipient even when Mailgun is not configured (used in dev logging). */
export function leadRecipient(): string {
  return read("LEAD_RECIPIENT") || "marketing@funplaysystems.com";
}

export function recaptchaSecret(): string | undefined {
  return read("RECAPTCHA_SECRET_KEY");
}

export const RECAPTCHA_MIN_SCORE = 0.5;

export function mailchimpConfig(): { apiKey: string; listId: string; dc: string } | null {
  const apiKey = read("MAILCHIMP_API_KEY");
  const listId = read("MAILCHIMP_LIST_ID");
  if (!apiKey || !listId) return null;
  // Mailchimp keys end in "-<datacenter>", e.g. "...-us21"; the API host uses that prefix.
  const dc = apiKey.split("-").pop() || "";
  if (!/^[a-z]+\d+$/.test(dc)) return null;
  return { apiKey, listId, dc };
}

/** Secret used to sign the catalogue-download verification cookie. */
export function verifySecret(): string | null {
  const s = read("VERIFY_SECRET");
  return s && s.length >= 32 ? s : null;
}

/** Public path (or absolute URL) of the catalogue PDF handed out after verification. */
export function catalogueUrl(): string {
  return read("CATALOGUE_URL") || "/files/Funplay-Originals.pdf";
}

/** Extra origins allowed to post to the API besides the request's own host (comma separated). */
export function allowedOrigins(): string[] {
  return (read("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export const isDev = process.env.NODE_ENV === "development";
