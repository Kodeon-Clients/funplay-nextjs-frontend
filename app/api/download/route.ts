import type { NextRequest } from "next/server";
import { STATES, CUSTOMER_TYPES } from "@/lib/site";
import { catalogueUrl } from "@/lib/server/env";
import { fail, guard, handleError, json, methodNotAllowed } from "@/lib/server/http";
import { leadEmail, replyTo } from "@/lib/server/leadEmail";
import { sendLead } from "@/lib/server/mailgun";
import { verifyRecaptcha } from "@/lib/server/recaptcha";
import { choice, clean, email, pageUrl, phone, text } from "@/lib/server/validate";
import { insertContactForm, wixSafe } from "@/lib/server/wix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Homepage catalogue download. One step: validate, email the lead, save to CMS, return the download URL. */
export async function POST(req: NextRequest) {
  const g = await guard(req, { kind: "download", maxBytes: 32 * 1024, limit: 5, windowMs: 10 * 60 * 1000, captcha: false });
  if (!("fd" in g)) return g;
  const { fd } = g;
  try {
    const name = text(fd, "name", { label: "Name", required: true, min: 2, max: 80 });
    const mail = email(fd);
    const tel = phone(fd);
    const location = text(fd, "location", { label: "Location", required: true, min: 2, max: 80 });
    const state = choice(fd, "state", STATES, "State", true);
    const customerType = choice(fd, "customerType", CUSTOMER_TYPES, "Category", true);
    const comment = text(fd, "comment", { label: "Message", required: true, min: 2, max: 300, multiline: true });
    const url = pageUrl(fd);

    const cap = await verifyRecaptcha(clean(fd.get("g-recaptcha-response"), 4000), "download");
    if (!cap.ok) return fail(cap.message, 400);

    const { html, text: plain } = leadEmail(
      "New catalogue download",
      [
        ["Name", name],
        ["Email", mail],
        ["Phone", tel],
        ["Location", location],
        ["State", state],
        ["Category", customerType],
        ["Message", comment],
        ["Catalogue", catalogueUrl()],
      ],
      url,
    );
    await sendLead({ subject: `Catalogue download: ${name}${location ? ` (${location})` : ""}`, html, text: plain, replyTo: replyTo(name, mail) });

    await wixSafe("download insert", () =>
      insertContactForm({
        name,
        email: mail,
        phone: tel,
        location,
        state,
        category: customerType,
        message: comment,
        source: "catalogue-download",
        pageUrl: url,
        submittedAt: new Date().toISOString(),
      }),
    );

    return json({ ok: true, message: "Thank you. Your catalogue is ready.", download: catalogueUrl() });
  } catch (e) {
    return handleError(e, "download");
  }
}

export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE };