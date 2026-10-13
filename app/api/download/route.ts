import type { NextRequest, NextResponse } from "next/server";
import { STATES, CUSTOMER_TYPES } from "@/lib/site";
import { catalogueUrl, isDev, verifySecret } from "@/lib/server/env";
import { fail, guard, handleError, json, methodNotAllowed } from "@/lib/server/http";
import { leadEmail, replyTo } from "@/lib/server/leadEmail";
import { sendLead, sendMail } from "@/lib/server/mailgun";
import { rateLimit } from "@/lib/server/rateLimit";
import { verifyRecaptcha } from "@/lib/server/recaptcha";
import { choice, clean, email, escapeHtml, pageUrl, phone, text } from "@/lib/server/validate";
import {
  CODE_TTL_MS,
  COOKIE_NAME,
  COOKIE_PATH,
  MAX_ATTEMPTS,
  decode,
  encode,
  hashCode,
  newCode,
  safeEqual,
  type DownloadPayload,
} from "@/lib/server/downloadToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
  Homepage catalogue download with email verification. Replaces download-form.php,
  email-verification.php and verify-code.php.

    step=request  name, email, phone, location, state, customerType, comment
                  -> emails a 6-digit code to the visitor, sets a signed httpOnly cookie,
                     responds { ok: true, step: "verify" }
    step=verify   code
                  -> checks the cookie (10 min expiry, max 5 attempts), emails the lead to
                     LEAD_RECIPIENT, clears the cookie, responds { ok: true, download: url }
*/

const WINDOW = 10 * 60 * 1000;

function setCookie(res: NextResponse, value: string, maxAgeSec: number) {
  res.cookies.set(COOKIE_NAME, value, { httpOnly: true, secure: !isDev, sameSite: "lax", path: COOKIE_PATH, maxAge: maxAgeSec });
  return res;
}
const clearCookie = (res: NextResponse) => setCookie(res, "", 0);

export async function POST(req: NextRequest) {
  // Generous outer limit covering both steps; each step adds its own tighter limit below.
  const g = await guard(req, { kind: "download", maxBytes: 32 * 1024, limit: 30, windowMs: WINDOW, captcha: false });
  if (!("fd" in g)) return g;
  const { fd, ip } = g;

  const secret = verifySecret();
  if (!secret) {
    console.error("[forms] download: VERIFY_SECRET is missing or shorter than 32 characters");
    return fail("Sorry, catalogue downloads are temporarily unavailable. Please call us or email marketing@funplaysystems.com.", 503);
  }

  const step = clean(fd.get("step"), 10) || "request";
  try {
    if (step === "request") return await requestCode(req, fd, ip, secret);
    if (step === "verify") return await verifyCode(req, fd, ip, secret);
    return fail("Unknown step.", 400);
  } catch (e) {
    return handleError(e, `download/${step}`);
  }
}

async function requestCode(req: NextRequest, fd: FormData, ip: string, secret: string) {
  const name = text(fd, "name", { label: "Name", required: true, min: 2, max: 80 });
  const mail = email(fd);
  const lead = {
    name,
    email: mail,
    phone: phone(fd),
    location: text(fd, "location", { label: "Location", required: true, min: 2, max: 80 }),
    state: choice(fd, "state", STATES, "State", true),
    customerType: choice(fd, "customerType", CUSTOMER_TYPES, "Category", true),
    comment: text(fd, "comment", { label: "Message", required: true, min: 2, max: 300, multiline: true }),
    pageUrl: pageUrl(fd),
  };

  // Stop the form being used to flood an inbox: 3 codes per IP and per address per 10 minutes.
  const byIp = rateLimit(`download-request:${ip}`, 3, WINDOW);
  const byEmail = rateLimit(`download-request-email:${mail}`, 3, WINDOW);
  if (!byIp.ok || !byEmail.ok) {
    const retry = Math.max(byIp.retryAfter, byEmail.retryAfter);
    return fail("We have already sent you a few codes. Please check your inbox (and spam folder) or try again in a few minutes.", 429, { "Retry-After": String(retry) });
  }

  const cap = await verifyRecaptcha(clean(fd.get("g-recaptcha-response"), 4000), "download");
  if (!cap.ok) return fail(cap.message, 400);

  const { code, nonce } = newCode();
  const first = escapeHtml(name.split(" ")[0] || name);
  await sendMail({
    to: mail,
    subject: `${code} is your FunPlay catalogue verification code`,
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px;"><p>Hello ${first},</p><p>Your verification code for the FunPlay Systems catalogue is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px;margin:16px 0;">${code}</p><p>Enter it in the download window on our website. The code expires in 10 minutes.</p><p>If you did not request this, you can ignore this email.</p><p>FunPlay Systems</p></body></html>`,
    text: `Hello ${name.split(" ")[0] || name},\n\nYour verification code for the FunPlay Systems catalogue is: ${code}\n\nEnter it in the download window on our website. The code expires in 10 minutes.\nIf you did not request this, you can ignore this email.\n\nFunPlay Systems\n`,
  });

  const payload: DownloadPayload = { v: 1, email: mail, h: hashCode(code, mail, nonce, secret), n: nonce, exp: Date.now() + CODE_TTL_MS, a: 0, lead };
  const res = json({ ok: true, step: "verify", message: `We have emailed a 6-digit code to ${mail}. It expires in 10 minutes.` });
  return setCookie(res, encode(payload, secret), Math.floor(CODE_TTL_MS / 1000));
}

async function verifyCode(req: NextRequest, fd: FormData, ip: string, secret: string) {
  const rl = rateLimit(`download-verify:${ip}`, 10, WINDOW);
  if (!rl.ok) return fail("Too many attempts. Please wait a few minutes and request a new code.", 429, { "Retry-After": String(rl.retryAfter) });

  const code = clean(fd.get("code"), 20).replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) return fail("Please enter the 6-digit code from the email.", 422);

  const p = decode(req.cookies.get(COOKIE_NAME)?.value, secret);
  if (!p) return clearCookie(fail("Your verification has expired. Please request a new code.", 400));
  if (p.exp < Date.now()) return clearCookie(fail("This code has expired. Please request a new code.", 400));
  if (p.a >= MAX_ATTEMPTS) return clearCookie(fail("Too many incorrect codes. Please request a new code.", 429));

  if (!safeEqual(hashCode(code, p.email, p.n, secret), p.h)) {
    const a = p.a + 1;
    if (a >= MAX_ATTEMPTS) return clearCookie(fail("Too many incorrect codes. Please request a new code.", 429));
    const left = MAX_ATTEMPTS - a;
    const res = fail(`That code is not correct. You have ${left} attempt${left === 1 ? "" : "s"} left.`, 400);
    return setCookie(res, encode({ ...p, a }, secret), Math.max(1, Math.floor((p.exp - Date.now()) / 1000)));
  }

  // Verified: send the lead. If this fails the cookie is kept so the visitor can simply retry
  // (the old PHP had every recipient commented out, so these leads were silently lost).
  const l = p.lead;
  const { html, text: plain } = leadEmail(
    "New catalogue download",
    [
      ["Name", l.name],
      ["Email", `${l.email} (verified)`],
      ["Phone", l.phone],
      ["Location", l.location],
      ["State", l.state],
      ["Category", l.customerType],
      ["Message", l.comment],
      ["Catalogue", catalogueUrl()],
    ],
    l.pageUrl,
  );
  await sendLead({ subject: `Catalogue download: ${l.name}${l.location ? ` (${l.location})` : ""}`, html, text: plain, replyTo: replyTo(l.name, l.email) });

  return clearCookie(json({ ok: true, message: "Thank you. Your email is verified and the catalogue is ready.", download: catalogueUrl() }));
}

export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE };
