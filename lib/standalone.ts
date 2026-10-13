import fs from "node:fs";
import path from "node:path";

/**
 * Paid-ads landing pages are served as their own HTML documents (own header, footer and CSS
 * stack), exactly like the original site. Sources: content/standalone/<name>, built by
 * tools/standalone.py. Pages are generated at build time; the reCAPTCHA site key, when set,
 * is injected for the form scripts.
 */
export const STANDALONE_PAGES = ["/campaign.html", "/school.html", "/builders.html", "/generic.html"];

export function standaloneResponse(name: string): Response {
  let html = fs.readFileSync(path.join(process.cwd(), "content", "standalone", name), "utf8");
  const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (key) html = html.replace(/<html([^>]*)>/, `<html$1 data-recaptcha="${key.replace(/[^\w-]/g, "")}">`);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
