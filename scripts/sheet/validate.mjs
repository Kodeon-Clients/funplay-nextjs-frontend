/**
 * Checks on edited cells before anything is written. Errors stop the publish (nothing changes on the
 * site); warnings are listed in the publish log and the change goes ahead.
 */
import fs from "node:fs";
import path from "node:path";
import { fromCell, plainOf, norm, FormatError } from "./format.mjs";
import { ROOT, readJson } from "./model.mjs";

const HOST = "https://funplaysystems.com";
const IMAGES = () => readJson(path.join(ROOT, "content", "images.json"));

/**
 * edits: [{ field, cell }]; all: Map<id, cell> of every field after the edits (for duplicate checks).
 * Returns { errors: [{id, where, msg}], warnings: [...] }
 */
export function validate(edits, all) {
  const errors = [];
  const warnings = [];
  let images;
  const where = (f) => `${f.tab} · ${f.rowKey}${f.tab === "Content" ? "" : " · " + f.column}`;
  const err = (f, msg) => errors.push({ id: f.id, where: where(f), msg });
  const warn = (f, msg) => warnings.push({ id: f.id, where: where(f), msg });

  for (const { field: f, cell } of edits) {
    const v = String(cell ?? "");
    const t = v.trim();
    if (f.locked) {
      err(f, "this cell is read-only (it cannot be changed from the sheet)");
      continue;
    }
    // format
    if (f.kind === "rich" || f.kind === "blocks") {
      try {
        fromCell(f.kind, v, undefined);
      } catch (e) {
        if (e instanceof FormatError) err(f, "formatting: " + e.message);
        else throw e;
        continue;
      }
    }
    if (f.kind === "plain" && f.tab === "Content" && /\*\*|\]\(|<\/?[a-z]+[ >]/.test(v)) warn(f, "this field is plain text: ** [links](...) and <tags> are shown exactly as typed");
    if (/—/.test(v)) warn(f, "contains an em dash (—); the house style avoids them");
    const plain = norm(f.kind === "plain" || f.kind === "markdown" ? v : safePlain(f.kind, v));

    if (f.tab === "Pages") {
      const indexable = (all.get(`P|${f.rowKey}|robots`) || "index") !== "noindex";
      switch (f.column) {
        case "title":
          if (!t) err(f, "title is empty");
          else if (t.length > 65) warn(f, `title is ${t.length} characters; Google shows about 60`);
          else if (t.length < 20) warn(f, `title is only ${t.length} characters`);
          break;
        case "description":
          if (!t && indexable) err(f, "meta description is empty");
          else if (t.length > 160) warn(f, `meta description is ${t.length} characters; Google shows about 155`);
          else if (t && t.length < 70) warn(f, `meta description is only ${t.length} characters`);
          break;
        case "h1":
          if (!plain) err(f, "H1 is empty");
          else if (plain.length > 90) warn(f, `H1 is ${plain.length} characters`);
          break;
        case "robots":
          if (!["index", "noindex"].includes(t)) err(f, 'Index must be "index" or "noindex"');
          break;
        case "canonical":
          if (t && !t.startsWith(HOST + "/")) err(f, `canonical must start with ${HOST}/`);
          if (t && /\s/.test(t)) err(f, "canonical contains a space");
          if (t && t !== HOST + encodeURI(f.rowKey) && t !== HOST + f.rowKey) warn(f, "canonical points to another page: this page will drop out of Google in favour of that one");
          break;
        case "ogImage":
          if (t && !/^(https:\/\/|\/)[^\s]+\.(jpe?g|png|webp)$/i.test(t)) err(f, "OG image must be a .jpg, .png or .webp path (/images/…) or https:// address");
          if (t.startsWith("/") && !fs.existsSync(path.join(ROOT, "public", t))) err(f, `file ${t} does not exist on the site`);
          break;
        case "ogTitle":
          if (t.length > 95) warn(f, `OG title is ${t.length} characters`);
          break;
      }
    } else if (f.tab === "Content") {
      if (!t) err(f, "text is empty (to remove text from a page, ask the developer)");
      if (f.kind === "markdown") {
        if (/\n\s*\n/.test(v.trim())) err(f, "one cell holds one paragraph: an empty line would split it (ask the developer to add paragraphs)");
        if (/^\s*[<{]/.test(v)) err(f, "an article paragraph cannot start with < or {");
      }
      if (f.shared) warn(f, "shared section: this change shows on every page that uses it");
    } else if (f.tab === "Images") {
      if (f.column === "alt" && t.length > 150) warn(f, `alt text is ${t.length} characters; keep it under about 125`);
      if (f.column === "alt" && /^(image|picture|photo) of /i.test(t)) warn(f, 'alt text does not need "image of"');
      if (f.column === "replace" && t) {
        images ||= IMAGES();
        if (!t.startsWith("/")) err(f, "replacement must be a site path like /images/new-name.jpg");
        else if (!fs.existsSync(path.join(ROOT, "public", t))) err(f, `file ${t} is not on the site yet (ask the developer to upload it)`);
        else if (!images[t] && /\.(jpe?g|png)$/i.test(t)) warn(f, `${t} has no optimised sizes yet (the developer runs npm run optimize-images)`);
      }
    }
  }

  // duplicates across indexable pages (only reported for the pages that were edited)
  const edited = new Set(edits.filter((e) => e.field.tab === "Pages").map((e) => e.field.rowKey + "|" + e.field.column));
  for (const col of ["title", "description"]) {
    const seen = new Map();
    for (const [id, cell] of all) {
      const m = /^P\|(.*)\|(\w+)$/.exec(id);
      if (!m || m[2] !== col || !norm(cell)) continue;
      if ((all.get(`P|${m[1]}|robots`) || "index") === "noindex") continue;
      const k = norm(cell).toLowerCase();
      (seen.get(k) || seen.set(k, []).get(k)).push(m[1]);
    }
    for (const pages of seen.values()) {
      if (pages.length < 2) continue;
      for (const p of pages)
        if (edited.has(p + "|" + col)) warnings.push({ id: `P|${p}|${col}`, where: `Pages · ${p} · ${col}`, msg: `same ${col} as ${pages.filter((x) => x !== p).slice(0, 3).join(", ")}` });
    }
  }
  return { errors, warnings };
}

function safePlain(kind, v) {
  try {
    return plainOf(fromCell(kind, v, undefined));
  } catch {
    return v;
  }
}

/** Compile changed MDX files, so a broken article never reaches the build. */
export async function checkMdx(files) {
  const problems = [];
  if (!files.length) return problems;
  const { compile } = await import("@mdx-js/mdx");
  for (const f of files) {
    try {
      await compile(fs.readFileSync(f, "utf8"));
    } catch (e) {
      problems.push({ file: path.relative(ROOT, f), msg: String(e.message || e).split("\n")[0] });
    }
  }
  return problems;
}
