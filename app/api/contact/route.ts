import type { NextRequest } from "next/server";
import { guard, handleError, json, methodNotAllowed } from "@/lib/server/http";
import { leadEmail, replyTo } from "@/lib/server/leadEmail";
import { sendLead } from "@/lib/server/mailgun";
import { clean, email, pageUrl, phone, safeRedirect, text } from "@/lib/server/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Enquiry / quote form (replaces email-templates/contact-form.php). Used by the site-wide
 * contact popup, the contact page and the landing-page forms that carry extra fields
 * (typeOfProject, companyname, institutionname).
 */
export async function POST(req: NextRequest) {
  const g = await guard(req, { kind: "contact", maxBytes: 32 * 1024, limit: 5, windowMs: 10 * 60 * 1000 });
  if (!("fd" in g)) return g;
  const { fd } = g;
  try {
    const name = text(fd, "name", { label: "Name", required: true, min: 2, max: 80 });
    const mail = email(fd);
    const tel = phone(fd);
    const location = text(fd, "location", { label: "Location", required: true, min: 2, max: 80 });
    const state = text(fd, "state", { label: "State", max: 60 });
    const customerType = text(fd, "customerType", { label: "Category", max: 60 }) || text(fd, "typeOfProject", { label: "Type of project", max: 80 });
    const company = text(fd, "companyname", { label: "Company name", max: 120 });
    const institution = text(fd, "institutionname", { label: "Institution name", max: 120 });
    const comment = text(fd, "comment", { label: "Message", required: true, min: 2, max: 300, multiline: true });
    const source = clean(fd.get("source"), 40);
    const url = pageUrl(fd);

    const { html, text: plain } = leadEmail(
      "New website enquiry",
      [
        ["Name", name],
        ["Email", mail],
        ["Phone", tel],
        ["Location", location],
        ["State", state],
        ["Category", customerType],
        ["Company", company],
        ["Institution", institution],
        ["Message", comment],
        ["Form", source],
      ],
      url,
    );
    await sendLead({ subject: `Website enquiry: ${name}${location ? ` (${location})` : ""}`, html, text: plain, replyTo: replyTo(name, mail) });
    return json({ ok: true, message: "Thank you. We will get back to you soon.", redirect: safeRedirect(fd) });
  } catch (e) {
    return handleError(e, "contact");
  }
}

export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE };
