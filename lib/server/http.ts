import { NextResponse, type NextRequest } from "next/server";
import { allowedOrigins } from "./env";
import { rateLimit } from "./rateLimit";
import { verifyRecaptcha } from "./recaptcha";
import { clean, honeypotTripped, ValidationError } from "./validate";
import { MailNotConfiguredError } from "./mailgun";

export type ApiBody = { ok: boolean; message?: string; redirect?: string; step?: string; download?: string };

const NO_STORE = { "Cache-Control": "no-store" };

export function json(body: ApiBody, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export function fail(message: string, status = 400, headers: Record<string, string> = {}) {
  return json({ ok: false, message }, status, headers);
}

/** Handler for every method other than POST. */
export function methodNotAllowed() {
  return fail("This address only accepts form submissions.", 405, { Allow: "POST" });
}

/** Client IP for rate limiting only (never stored or emailed). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Rejects cross-site posts: Origin (when sent) must be this host or one of ALLOWED_ORIGINS. */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; the other checks still apply
  try {
    const o = new URL(origin);
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    if (o.host === host) return true;
    return allowedOrigins().includes(o.origin);
  } catch {
    return false;
  }
}

class TooLargeError extends Error {}

/** Reads the request body with a hard byte cap (works with or without Content-Length). */
async function readCapped(req: NextRequest, maxBytes: number): Promise<Uint8Array<ArrayBuffer>> {
  const len = Number(req.headers.get("content-length") || "0");
  if (len > maxBytes) throw new TooLargeError();
  if (!req.body) return new Uint8Array();
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new TooLargeError();
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.byteLength;
  }
  return out;
}

type GuardOpts = {
  /** form kind; used as the rate-limit bucket and the expected reCAPTCHA action */
  kind: string;
  maxBytes: number;
  limit: number;
  windowMs: number;
  /** skip reCAPTCHA (e.g. for the code-entry step of the download flow) */
  captcha?: boolean;
  rateKey?: string;
};

export type Guarded = { fd: FormData; ip: string };

/**
 * Shared front door for every form route: origin check, per-IP rate limit, content type and
 * size cap, FormData parsing, honeypot and optional reCAPTCHA. Returns either the parsed form
 * or a ready-made error response.
 */
export async function guard(req: NextRequest, o: GuardOpts): Promise<Guarded | NextResponse> {
  if (!sameOrigin(req)) return fail("This form can only be submitted from the FunPlay Systems website.", 403);
  const ip = clientIp(req);
  const rl = rateLimit(`${o.rateKey ?? o.kind}:${ip}`, o.limit, o.windowMs);
  if (!rl.ok) return fail("Too many attempts. Please wait a few minutes and try again, or call us.", 429, { "Retry-After": String(rl.retryAfter) });

  // keep the original header for parsing: the multipart boundary is case-sensitive
  const type = req.headers.get("content-type") || "";
  const lower = type.toLowerCase();
  if (!lower.startsWith("multipart/form-data") && !lower.startsWith("application/x-www-form-urlencoded")) {
    return fail("Unsupported form submission.", 415);
  }
  let fd: FormData;
  try {
    const bytes = await readCapped(req, o.maxBytes);
    fd = await new Response(bytes, { headers: { "content-type": type } }).formData();
  } catch (e) {
    if (e instanceof TooLargeError) return fail("Your submission is too large. Please shorten it or attach a smaller file.", 413);
    return fail("We could not read your submission. Please try again.", 400);
  }

  // Honeypot: pretend success so bots learn nothing, but do nothing.
  if (honeypotTripped(fd)) return json({ ok: true, message: "Thank you." });

  if (o.captcha !== false) {
    const cap = await verifyRecaptcha(clean(fd.get("g-recaptcha-response"), 4000), o.kind);
    if (!cap.ok) return fail(cap.message, 400);
  }
  return { fd, ip };
}

/** Maps thrown errors to friendly JSON responses without leaking internals. */
export function handleError(e: unknown, kind: string) {
  if (e instanceof ValidationError) return fail(e.message, 422);
  if (e instanceof MailNotConfiguredError) {
    console.error(`[forms] ${kind}: Mailgun is not configured (set MAILGUN_API_KEY and MAILGUN_DOMAIN)`);
    return fail("Sorry, our form is temporarily unavailable. Please call us or email marketing@funplaysystems.com.", 503);
  }
  console.error(`[forms] ${kind} failed:`, e instanceof Error ? e.message : "unknown error");
  return fail("Sorry, something went wrong sending your message. Please try again or call us.", 502);
}
