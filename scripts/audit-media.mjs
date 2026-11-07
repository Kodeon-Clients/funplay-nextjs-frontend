/**
 * Media audit: which images, videos, audio files and PDFs in public/ are used, which are not, and which
 * references point to files that do not exist.
 *
 * "Used" means referenced by anything the site serves or runs:
 *   - every built page (.next/server/app/**: HTML and RSC payloads: src, srcset, poster, href, inline styles,
 *     data-* attributes, Open Graph / Twitter images, JSON-LD, preload links)
 *   - all built CSS and JavaScript (.next/static/**) and the server bundles (.next/server/**: API routes,
 *     e-mail templates, sitemaps, metadata)
 *   - files served as they are from public/ (static HTML pages, CSS, JS, robots.txt, llms.txt, ...),
 *     with relative paths resolved against the file's own folder
 *   - the page data (content/**), redirects, next.config.ts, proxy.ts, vercel.json
 * Paths are compared exactly (Vercel is case-sensitive); a reference that only matches with different
 * letter case is reported as missing.
 *
 * Run after a build:  npm run build && npm run audit-media
 * Writes .media-audit/media-audit.json and three CSV files (unused, missing, references).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const OUT = path.join(ROOT, ".media-audit");
const HOST = /^https?:\/\/(?:www\.)?funplaysystems\.com/i;
const MEDIA = /\.(jpe?g|png|webp|gif|svg|avif|ico|bmp|tiff?|mp4|webm|mov|m4v|ogv|ogg|mp3|wav|m4a|aac|pdf)$/i;
const KIND = (p) => (/\.(mp4|webm|mov|m4v|ogv)$/i.test(p) ? "video" : /\.(mp3|wav|m4a|aac|ogg)$/i.test(p) ? "audio" : /\.pdf$/i.test(p) ? "document" : /\.gif$/i.test(p) && /videos\//i.test(p) ? "video (GIF)" : "image");

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const decodeEntities = (s) =>
  s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const unescapeJs = (s) => s.replace(/\\u002[fF]/g, "/").replace(/\\u0026/g, "&").replace(/\\\//g, "/").replace(/\\"/g, '"');
const safeDecodeUri = (s) => {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
};

/* ------------------------------------------------------------------ reference extraction */
/** Candidate media paths in a text, each { ref, abs } where abs is the site path ("/images/a.jpg") or null. */
function references(text, baseDir) {
  // the image size index (content/images.json, inlined into a server bundle) lists every image and its
  // optimised copies: it describes files, it does not use them
  text = text.replace(/JSON\.parse\('(?:[^'\\]|\\.)*"variants":(?:[^'\\]|\\.)*'\)/g, "");
  const t = unescapeJs(decodeEntities(text));
  const found = new Set();
  const add = (raw, guess = false) => {
    let r = raw.trim().replace(/^['"]|['"]$/g, "");
    if (!r || r.startsWith("data:") || r.startsWith("blob:") || r.startsWith("#")) return;
    r = r.replace(HOST, "");
    if (/^[a-z]+:\/\//i.test(r) || r.startsWith("//")) return; // other sites
    r = r.split(/[?#]/)[0];
    if (!MEDIA.test(r)) return;
    let abs = r;
    if (!r.startsWith("/")) {
      if (baseDir === null) return;
      abs = path.posix.normalize(path.posix.join(baseDir, r));
    }
    abs = safeDecodeUri(abs);
    if (guess && !exact.has(abs)) return; // folder + name combinations only count when the file exists
    found.add(abs);
  };
  // quoted strings (attributes, JS and JSON strings), CSS url(), srcset lists
  for (const m of t.matchAll(/["'`]([^"'`\n<>]{1,400}?\.(?:jpe?g|png|webp|gif|svg|avif|ico|bmp|tiff?|mp4|webm|mov|m4v|ogv|ogg|mp3|wav|m4a|aac|pdf))(?:[?#][^"'`\s]*)?["'`]/gi)) {
    const v = m[1];
    if (!v.includes("/")) continue; // a bare file name: only meaningful with a folder (below) or in an attribute
    if (v.includes(",") && /\s\d+[wx]\b/.test(v + " 1x")) v.split(/,\s*/).forEach((part) => add(part.split(/\s+/)[0]));
    else add(v);
  }
  for (const m of t.matchAll(/url\(\s*([^)]+?)\s*\)/gi)) add(m[1]);
  // paths built in code: a folder in a template or string join ("images/catalog/${img}", "/images/" + name)
  // combined with the bare file names listed in the same file
  const folders = new Set([...t.matchAll(/["'`]((?:\.{0,2}\/)?(?:[\w.-]+\/)*(?:images|_img|videos|files|audio)(?:\/[\w .-]+)*\/)(?:\$\{|["'`]\s*\+)/g)].map((m) => m[1]));
  if (folders.size) {
    for (const m of t.matchAll(/["'`]([^"'`\/\n<>]{1,200}\.(?:jpe?g|png|webp|gif|svg|avif|mp4|webm|mov|mp3|wav|m4a|pdf))["'`]/gi)) for (const f of folders) add(f + m[1], true);
  }
  for (const m of t.matchAll(/\b(?:src|href|poster|data-src)=["']([^"'\/]+\.(?:jpe?g|png|webp|gif|svg|avif|mp4|webm|mov|mp3|wav|m4a|pdf))["']/gi)) add(m[1]);
  for (const m of t.matchAll(/srcset=["']([^"']+)["']/gi)) m[1].split(/,\s*/).forEach((part) => add(part.trim().split(/\s+/)[0]));
  // bare paths in text (sitemaps, robots, llms.txt, JSON-LD without quotes around single values)
  for (const m of t.matchAll(/(?:https?:\/\/(?:www\.)?funplaysystems\.com)?(\/(?:images|_img|videos|files|audio|fonts)\/[^\s"'`<>()\\]+?\.(?:jpe?g|png|webp|gif|svg|avif|ico|mp4|webm|mov|m4v|mp3|wav|m4a|pdf))(?=[\s"'`<>()\\,;]|$)/gi)) add(m[1]);
  return found;
}

/* ------------------------------------------------------------------ files */
const publicFiles = walk(PUB).map((f) => "/" + path.relative(PUB, f).split(path.sep).join("/"));
const media = publicFiles.filter((p) => MEDIA.test(p));
const exact = new Set(publicFiles);
const lower = new Map(publicFiles.map((p) => [p.toLowerCase(), p]));

const sources = [];
const built = path.join(ROOT, ".next");
if (!fs.existsSync(path.join(built, "server", "app"))) {
  console.error("No build found. Run npm run build first.");
  process.exit(1);
}
const pageOf = (file) => {
  const rel = path.relative(path.join(built, "server", "app"), file).split(path.sep).join("/");
  return "/" + rel.replace(/\.(html|rsc|meta|body)$/, "").replace(/^index$/, "").replace(/\.html\.html$/, ".html").replace(/\(site\)\/|\(landing\)\/|\(ads\)\//g, "");
};
for (const f of walk(path.join(built, "server", "app"))) if (/\.(html|rsc|body)$/.test(f)) sources.push({ file: f, label: pageOf(f), base: path.posix.dirname(pageOf(f)) });
for (const f of walk(path.join(built, "static"))) if (/\.(js|css)$/.test(f)) sources.push({ file: f, label: "site code: " + path.basename(f), base: null });
for (const f of walk(path.join(built, "server"))) if (/\.js$/.test(f) && !f.includes(`${path.sep}app${path.sep}`)) sources.push({ file: f, label: "server code: " + path.relative(built, f), base: null });
for (const f of walk(path.join(built, "server", "app"))) if (/\.js$/.test(f)) sources.push({ file: f, label: "server code: " + path.relative(built, f), base: null });
for (const f of walk(PUB)) if (/\.(html?|css|js|txt|xml|json|webmanifest)$/i.test(f)) {
  const rel = "/" + path.relative(PUB, f).split(path.sep).join("/");
  // relative URLs in CSS resolve against the stylesheet; in HTML and in scripts against the page (site root)
  sources.push({ file: f, label: "public file: " + rel, base: /\.css$/i.test(f) ? path.posix.dirname(rel) : /\.js$/i.test(f) ? "/" : path.posix.dirname(rel) });
}
for (const f of walk(path.join(ROOT, "content"))) if (/\.(json|mdx)$/.test(f) && !/(\.sheet-base|[\\/]images)\.json$/.test(f)) sources.push({ file: f, label: "page data: " + path.relative(ROOT, f), base: null });
for (const f of ["next.config.ts", "proxy.ts", "vercel.json"]) if (fs.existsSync(path.join(ROOT, f))) sources.push({ file: path.join(ROOT, f), label: f, base: null });

const refs = new Map(); // site path -> Set(labels)
for (const s of sources) {
  const text = fs.readFileSync(s.file, "utf8");
  for (const r of references(text, s.base)) {
    if (r.startsWith("/_next/")) continue;
    if (!refs.has(r)) refs.set(r, new Set());
    refs.get(r).add(s.label);
  }
}

/* ------------------------------------------------------------------ results */
const pagesOnly = (set) => [...set].filter((l) => l.startsWith("/"));
const used = new Set();
const missing = [];
for (const [r, from] of refs) {
  if (exact.has(r)) used.add(r);
  else if (lower.has(r.toLowerCase())) {
    used.add(lower.get(r.toLowerCase()));
    missing.push({ ref: r, problem: `wrong letter case: the file is ${lower.get(r.toLowerCase())}`, from: [...from] });
  } else if (/^\/(images|_img|videos|files|audio|fonts|css|js)\//.test(r) || !r.includes("/", 1)) missing.push({ ref: r, problem: "file does not exist", from: [...from] });
}
// an unused original whose optimised copies are used is still used (the copies are made from it)
// /_img/<width>/<path without "/images/">.webp (scripts/optimize-images.mjs naming)
const variantOf = (p) => {
  const rest = /^\/_img\/\d+\/(.+)\.webp$/.exec(p)?.[1];
  if (!rest) return undefined;
  return exact.has("/images/" + rest) ? "images/" + rest : rest;
};
for (const p of [...used]) {
  const o = variantOf(p);
  if (o && exact.has("/" + o)) used.add("/" + o);
}
const unused = media
  .filter((p) => !used.has(p))
  .map((p) => {
    const size = fs.statSync(path.join(PUB, p)).size;
    const orig = variantOf(p);
    return { path: p, kind: KIND(p), bytes: size, generatedCopyOf: orig ? "/" + orig : "" };
  });

fs.mkdirSync(OUT, { recursive: true });
const csv = (rows) => rows.map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(",")).join("\n") + "\n";
fs.writeFileSync(path.join(OUT, "unused.csv"), csv([["path", "kind", "bytes", "generated copy of"], ...unused.map((u) => [u.path, u.kind, u.bytes, u.generatedCopyOf])]));
fs.writeFileSync(path.join(OUT, "missing.csv"), csv([["reference", "problem", "pages", "other places"], ...missing.map((m) => [m.ref, m.problem, pagesOnly(new Set(m.from)).join(" "), m.from.filter((l) => !l.startsWith("/")).join(" | ")])]));
fs.writeFileSync(path.join(OUT, "references.csv"), csv([["file", "used by (pages)", "other places"], ...media.filter((p) => used.has(p)).map((p) => {
  const from = new Set([...(refs.get(p) || []), ...[...refs].filter(([r]) => r.toLowerCase() === p.toLowerCase()).flatMap(([, s]) => [...s])]);
  return [p, pagesOnly(from).length, [...from].filter((l) => !l.startsWith("/")).slice(0, 5).join(" | ")];
})]));
fs.writeFileSync(path.join(OUT, "media-audit.json"), JSON.stringify({ sources: sources.length, mediaFiles: media.length, used: media.filter((p) => used.has(p)).length, unused, missing, refs: Object.fromEntries([...refs].map(([k, v]) => [k, [...v]])) }, null, 1));
const mb = (b) => (b / 1048576).toFixed(1) + " MB";
console.log(`${sources.length} sources scanned; ${media.length} media files: ${media.length - unused.length} used, ${unused.length} unused (${mb(unused.reduce((a, u) => a + u.bytes, 0))}); ${missing.length} broken references`);
console.log("Details in " + path.relative(ROOT, OUT) + "/");
