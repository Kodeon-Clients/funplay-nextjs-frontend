import type { NextRequest } from "next/server";
import { guard, handleError, json, methodNotAllowed } from "@/lib/server/http";
import { CV_MAX_BYTES, readCv } from "@/lib/server/files";
import { leadEmail, replyTo } from "@/lib/server/leadEmail";
import { sendLead } from "@/lib/server/mailgun";
import { email, pageUrl, phone, safeRedirect, text } from "@/lib/server/validate";
import { insertCareerForm, uploadToWixMedia } from "@/lib/server/wix";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const g = await guard(req, { kind: "career", maxBytes: CV_MAX_BYTES + 64 * 1024, limit: 3, windowMs: 10 * 60 * 1000 });
  if (!("fd" in g)) return g;
  const { fd } = g;
  try {
    const name = text(fd, "name", { label: "Name", required: true, min: 2, max: 80 });
    const mail = email(fd);
    const tel = phone(fd);
    const title = text(fd, "title", { label: "Position", max: 120 }) || "Not specified";
    const cv = await readCv(fd.get("career-cv-resume-file"));
    const url = pageUrl(fd);

    // 1) CV -> Wix Media (API key)
    const media = await uploadToWixMedia(cv);

    // 2) Application -> Wix CMS "CareerForm" (client ID)
    await insertCareerForm({
      name,
      email: mail,
      phone: tel,
      position: title,
      resume: media.url,          // URL field / text field
      resumeFileId: media.id,
      pageUrl: url,
      submittedAt: new Date(),
    });

    // 3) Notification email (keep or remove)
    const { html, text: plain } = leadEmail(
      `New job application: ${title}`,
      [
        ["Position", title],
        ["Name", name],
        ["Email", mail],
        ["Phone", tel],
        ["Resume", `${cv.filename} (${Math.max(1, Math.round(cv.data.byteLength / 1024))} KB) – ${media.url}`],
      ],
      url,
    );
    await sendLead({ subject: `Job application: ${title} - ${name}`, html, text: plain, replyTo: replyTo(name, mail), attachments: [cv] });

    return json({ ok: true, message: "Thank you. Your application has been sent.", redirect: safeRedirect(fd) });
  } catch (e) {
    return handleError(e, "career");
  }
}

export { methodNotAllowed as GET, methodNotAllowed as PUT, methodNotAllowed as PATCH, methodNotAllowed as DELETE };