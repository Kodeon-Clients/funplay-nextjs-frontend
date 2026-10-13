import { recaptchaSecret, RECAPTCHA_MIN_SCORE } from "./env";

export type CaptchaResult = { ok: true } | { ok: false; message: string };

/**
 * Verifies a reCAPTCHA v3 token. Does nothing (passes) when RECAPTCHA_SECRET_KEY is not set.
 * When it is set a token is required, the score must be >= 0.5 and, if Google reports an
 * action, it must match the form kind. If Google cannot be reached the check passes (logged)
 * so that a Google outage does not lose genuine leads; the honeypot and rate limit still apply.
 */
export async function verifyRecaptcha(token: string, action: string): Promise<CaptchaResult> {
  const secret = recaptchaSecret();
  if (!secret) return { ok: true };
  const fail = { ok: false as const, message: "We could not confirm you are not a robot. Please reload the page and try again." };
  if (!token || token.length > 4000) return fail;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`siteverify HTTP ${res.status}`);
    const data = (await res.json()) as { success?: boolean; score?: number; action?: string };
    if (!data.success) return fail;
    if (typeof data.score === "number" && data.score < RECAPTCHA_MIN_SCORE) return fail;
    if (data.action && data.action !== action) return fail;
    return { ok: true };
  } catch (e) {
    console.warn("[forms] reCAPTCHA verification unavailable, allowing submission:", (e as Error).message);
    return { ok: true };
  }
}
