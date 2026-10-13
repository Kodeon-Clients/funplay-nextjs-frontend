/**
 * Input validation and sanitising for the form handlers. Values are normalised (Unicode
 * NFC, control characters removed, whitespace trimmed) and length-capped. Nothing here
 * produces HTML; use escapeHtml() when a value is placed into an email body.
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

// Unicode letters, marks and digits, spaces, and normal punctuation people use in names,
// addresses and messages (the old PHP only allowed [a-zA-Z0-9,'". ]).
const TEXT_RE = /^[\p{L}\p{M}\p{N}\s.,'"’‘“”&()\-–—/:;!?@#+%*_₹$=\[\]]+$/u;
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

/** Normalises a raw FormData value: string only, NFC, no control chars (newlines kept if allowed). */
export function clean(v: FormDataEntryValue | null | undefined, max: number, multiline = false): string {
  if (typeof v !== "string") return "";
  let s = v.normalize("NFC");
  s = multiline
    ? s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, "")
    : s.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, " ");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : s.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) : s;
}

type TextOpts = { label: string; required?: boolean; min?: number; max: number; multiline?: boolean };

/** Reads a free-text field and checks it against the allowed character set. */
export function text(fd: FormData, name: string, o: TextOpts): string {
  const raw = fd.get(name);
  const rawLen = typeof raw === "string" ? raw.trim().length : 0;
  if (rawLen > o.max * 1.1 + 10) throw new ValidationError(`${o.label} is too long (maximum ${o.max} characters).`, name);
  const v = clean(raw, o.max, o.multiline);
  if (!v) {
    if (o.required) throw new ValidationError(`Please enter your ${o.label.toLowerCase()}.`, name);
    return "";
  }
  if (o.min && v.length < o.min) throw new ValidationError(`Please enter a little more detail in ${o.label.toLowerCase()}.`, name);
  if (!TEXT_RE.test(v)) throw new ValidationError(`${o.label} contains characters we cannot accept. Please use letters, numbers and normal punctuation.`, name);
  return v;
}

export function email(fd: FormData, name = "email"): string {
  const v = clean(fd.get(name), 160).toLowerCase();
  if (!v) throw new ValidationError("Please enter your email address.", name);
  if (v.length > 120 || !EMAIL_RE.test(v)) throw new ValidationError("Please enter a valid email address.", name);
  return v;
}

/** Indian 10-digit phone number; spaces and dashes are ignored, as on the client. */
export function phone(fd: FormData, name = "phone", required = true): string {
  const v = clean(fd.get(name), 30).replace(/[\s-]/g, "");
  if (!v) {
    if (required) throw new ValidationError("Please enter your phone number.", name);
    return "";
  }
  if (!/^\d{10}$/.test(v)) throw new ValidationError("Phone number must be exactly 10 digits.", name);
  return v;
}

/** A value that must be one of `allowed` when present. */
export function choice(fd: FormData, name: string, allowed: readonly string[], label: string, required = false): string {
  const v = clean(fd.get(name), 80);
  if (!v) {
    if (required) throw new ValidationError(`Please select your ${label.toLowerCase()}.`, name);
    return "";
  }
  if (!allowed.includes(v)) throw new ValidationError(`Please select a valid ${label.toLowerCase()}.`, name);
  return v;
}

/** The page the form was submitted from: http(s) URLs only, otherwise dropped. */
export function pageUrl(fd: FormData): string {
  const v = clean(fd.get("page_url"), 500);
  if (!v) return "";
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString().slice(0, 500) : "";
  } catch {
    return "";
  }
}

/** True when the hidden honeypot input ("website") is present and filled in. */
export function honeypotTripped(fd: FormData): boolean {
  const v = fd.get("website");
  return typeof v === "string" && v.trim() !== "";
}

const THANK_YOU = ["/thank-you.html", "/thankyou.html", "/thank-you-lp.html", "/thank-you-campaign.html"];

/**
 * Some landing pages carry a hidden `redirect` input. Only the site's own thank-you pages are
 * honoured (no open redirects); anything else falls back to /thank-you.html.
 */
export function safeRedirect(fd: FormData, fallback = "/thank-you.html"): string {
  const v = clean(fd.get("redirect"), 300);
  if (!v) return fallback;
  try {
    const u = new URL(v, "https://funplaysystems.com");
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "funplaysystems.com") return fallback;
    return THANK_YOU.includes(u.pathname) ? u.pathname : fallback;
  } catch {
    return fallback;
  }
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"'`=]/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Display name safe to use inside an email header (no quotes, angle brackets or line breaks). */
export function headerSafe(s: string, max = 70): string {
  return s.replace(/[\r\n"<>\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}
