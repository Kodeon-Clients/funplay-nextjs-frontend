import { ValidationError } from "./validate";

export const CV_MAX_BYTES = 5 * 1024 * 1024;

type Kind = { ext: "pdf" | "doc" | "docx"; mime: string };

const KINDS: Record<Kind["ext"], Kind> = {
  pdf: { ext: "pdf", mime: "application/pdf" },
  doc: { ext: "doc", mime: "application/msword" },
  docx: { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
};

const startsWith = (b: Uint8Array, sig: number[]) => sig.every((x, i) => b[i] === x);

/** Identifies PDF / DOC / DOCX by their leading bytes (the browser-supplied MIME type is ignored). */
export function sniffDocument(b: Uint8Array): Kind | null {
  if (startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d])) return KINDS.pdf; // "%PDF-"
  if (startsWith(b, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return KINDS.doc; // OLE2 compound file
  if (startsWith(b, [0x50, 0x4b, 0x03, 0x04])) {
    // ZIP: only accept it as DOCX when the archive lists Word document parts (names are stored
    // uncompressed in the local file headers, so a byte search is enough).
    const head = Buffer.from(b.subarray(0, Math.min(b.byteLength, 256 * 1024))).toString("latin1");
    if (head.includes("[Content_Types].xml") && head.includes("word/")) return KINDS.docx;
  }
  return null;
}

/** Reads and checks the uploaded CV. Never touches the disk. */
export async function readCv(entry: FormDataEntryValue | null): Promise<{ filename: string; contentType: string; data: Uint8Array }> {
  if (!entry || typeof entry === "string" || entry.size === 0) throw new ValidationError("Please attach your resume / CV.", "career-cv-resume-file");
  if (entry.size > CV_MAX_BYTES) throw new ValidationError("Your resume must be smaller than 5 MB.", "career-cv-resume-file");
  const data = new Uint8Array(await entry.arrayBuffer());
  const kind = sniffDocument(data);
  if (!kind) throw new ValidationError("Please attach your resume as a PDF, DOC or DOCX file.", "career-cv-resume-file");
  const base =
    (entry.name || "resume")
      .replace(/\.[^.]*$/, "")
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "_")
      .replace(/^[._]+|_+$/g, "")
      .slice(0, 60) || "resume";
  return { filename: `${base}.${kind.ext}`, contentType: kind.mime, data };
}
