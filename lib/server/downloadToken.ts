import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Stateless verification state for the catalogue download, kept in an httpOnly cookie as
 * base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)). The code itself is never in
 * the cookie, only a keyed hash of it, so it cannot be brute-forced offline without
 * VERIFY_SECRET. The lead's form fields ride along so they can be emailed after verification.
 *
 * Limitation: because the state is client-held, an old cookie can be replayed to reset the
 * attempt counter. The 10-minute expiry and the per-IP rate limit on the verify step keep the
 * practical number of guesses far below the 1,000,000 possible codes.
 */

export const COOKIE_NAME = "fp_dl";
export const COOKIE_PATH = "/api/download";
export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;

export type Lead = {
  name: string;
  email: string;
  phone: string;
  location: string;
  state: string;
  customerType: string;
  comment: string;
  pageUrl: string;
};

export type DownloadPayload = {
  v: 1;
  email: string;
  /** keyed hash of the code */
  h: string;
  /** random nonce mixed into the hash */
  n: string;
  /** expiry, ms since epoch */
  exp: number;
  /** failed attempts so far */
  a: number;
  lead: Lead;
};

const b64u = (b: Buffer | string) => Buffer.from(b).toString("base64url");

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(`fp-dl-cookie:${data}`).digest("base64url");
}

export function hashCode(code: string, email: string, nonce: string, secret: string) {
  return createHmac("sha256", secret).update(`fp-dl-code:${nonce}:${email}:${code}`).digest("base64url");
}

export function newCode(): { code: string; nonce: string } {
  return { code: String(randomInt(0, 1_000_000)).padStart(6, "0"), nonce: randomBytes(12).toString("base64url") };
}

export function encode(p: DownloadPayload, secret: string): string {
  const data = b64u(JSON.stringify(p));
  return `${data}.${sign(data, secret)}`;
}

/** Returns the payload when the signature is valid (expiry is checked by the caller). */
export function decode(token: string | undefined, secret: string): DownloadPayload | null {
  if (!token || token.length > 4096) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  if (!safeEqual(sig, sign(data, secret))) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as DownloadPayload;
    return p && p.v === 1 && typeof p.h === "string" && typeof p.exp === "number" ? p : null;
  } catch {
    return null;
  }
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
