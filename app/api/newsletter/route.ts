import type { NextRequest } from "next/server";
import { guard, handleError, json, methodNotAllowed } from "@/lib/server/http";
import { leadEmail } from "@/lib/server/leadEmail";
import { subscribe } from "@/lib/server/mailchimp";
import { sendLead } from "@/lib/server/mailgun";
import { email, pageUrl } from "@/lib/server/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Footer newsletter sign-up (replaces email-templates/subscribe-newsletter.php). */
export async function POST(req: NextRequest) {
  const g = await guard(req, { kind: "newsletter", maxBytes: 16 * 1024, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!("fd" in g)) return g;
  const { fd } = g;
  try {
    const mail = email(fd);
    const url = pageUrl(fd);

    const mc = await subscribe(mail);
    try {
      const { html, text } = leadEmail(
        "New newsletter subscriber",
        [
          ["Email", mail],
          ["Mailchimp", mc === "subscribed" ? "Added to list" : mc === "failed" ? "Could not add to list, please add manually" : "Not configured"],
        ],
        url,
      );
      await sendLead({ subject: `Newsletter sign-up: ${mail}`, html, text, replyTo: mail });
    } catch (e) {
      // If Mailchimp took the address the visitor is subscribed; only fail when both paths failed.
      if (mc !== "subscribed") throw e;
      console.error("[forms] newsletter notification failed:", (e as Error).message);
    }
    return json({ ok: true, message: "Thank you for subscribing to our newsletter." });
  } catch (e) {
    return handleError(e, "newsletter");
  }
}

export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE };
