#!/usr/bin/env node
/**
 * optimize-images.mjs
 *
 * Builds site/public/{images,videos,files,audio,...} from the original static site
 * (/home/claude/funplay/source) containing ONLY the assets the new site references,
 * re-encoding raster images and writing responsive WebP variants to public/_img/<w>/.
 * Also writes content/images.json ({ "<src>": { w, h, variants: [[w, url], ...] } })
 * which lib/render.tsx uses for width/height and srcset.
 *
 * Variant naming rule: /_img/<w>/<path without leading "/images/"><original name incl. ext>.webp
 *   /images/foo/bar.jpg -> /_img/960/foo/bar.jpg.webp
 *   (paths outside /images/ keep their full path: /corecraft/x/images/a.png -> /_img/960/corecraft/x/images/a.png.webp)
 * Variant URLs in images.json are percent-encoded per segment so they are safe inside srcset.
 *
 * Usage: node scripts/optimize-images.mjs
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.resolve(SITE, "..", "source");
const ASSET_LIST = path.resolve(SITE, "..", "tools", "assets-used.txt");
const PUBLIC = path.join(SITE, "public");
const OUT_JSON = path.join(SITE, "content", "images.json");

const MAX_SIDE = 2400;
const VARIANT_MIN_WIDTH = 800; // only images wider than this get variants
const VARIANT_WIDTHS = [480, 960, 1600];
const RASTER = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CONCURRENCY = Math.max(2, Math.min(8, os.cpus().length));

const EXTRA = [
  "/images/favicon.png",
  "/images/apple-touch-icon-57x57.png",
  "/images/apple-touch-icon-72x72.png",
  "/images/apple-touch-icon-114x114.png",
  "/images/logo-white.png",
  "/images/logo-black.png",
  "/images/popup-image.jpg",
  "/images/Download-Form-Banner.png",
];

sharp.cache(false);
sharp.concurrency(1); // parallelism comes from the task pool below

// ---------------------------------------------------------------- helpers
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === "vendor" || e.name.startsWith(".")) continue;
      walk(p, out);
    } else if (e.isFile()) out.push(p);
  }
  return out;
}

function listFiles(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return walk(dir).filter((f) => exts.some((x) => f.endsWith(x)));
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s.replace(/%20/g, " ");
  }
}

function decodeEntities(s) {
  return s.replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"');
}

const encodeUrlPath = (p) => p.split("/").map((seg) => encodeURIComponent(seg)).join("/");

// Case-insensitive index of every file in the source tree: "/images/a.jpg" (lowercase) -> real "/images/A.jpg"
const sourceIndex = new Map();
for (const f of walk(SOURCE)) {
  const rel = "/" + path.relative(SOURCE, f).split(path.sep).join("/");
  const k = rel.toLowerCase();
  if (!sourceIndex.has(k)) sourceIndex.set(k, rel);
}

/** Normalise a candidate reference into a decoded URL path, or null. */
function normalise(ref) {
  let p = decodeEntities(ref).trim();
  p = p.replace(/^https?:\/\/(www\.)?funplaysystems\.com/i, "");
  p = p.split(/[?#]/)[0];
  p = safeDecode(p);
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/\/{2,}/g, "/");
  return p;
}

const resolve = (decoded) => sourceIndex.get(decoded.toLowerCase()) || null;

// ---------------------------------------------------------------- 1. collect references
/** referenced string (as written in content) -> { decoded, real } */
const refs = new Map();
const missing = new Set();
const dirIncludes = new Set();

function addRef(raw) {
  // A reference may be followed by srcset descriptors, ")" from url(), commas, etc.
  // Try the longest candidate first and shrink at each delimiter until one resolves.
  raw = raw.replace(/\\+$/, "");
  if (raw.includes("${")) {
    // Template literal in an inline script, e.g. "images/catalog/${img}": include the whole directory.
    const dir = normalise(raw.slice(0, raw.indexOf("${")));
    dirIncludes.add(dir.endsWith("/") ? dir : dir.slice(0, dir.lastIndexOf("/") + 1));
    return;
  }
  const cuts = [raw.length];
  for (let i = raw.length - 1; i > 0; i--) if (/[\s),;]/.test(raw[i])) cuts.push(i);
  for (const c of cuts) {
    const cand = raw.slice(0, c).replace(/[\s.,;:]+$/, "");
    if (!cand || cand.endsWith("/")) continue;
    const decoded = normalise(cand);
    const real = resolve(decoded);
    if (real) {
      // Key by the spelling used in content (as an HTML parser would hand it over) and by the decoded path.
      const asWritten = decodeEntities(cand).replace(/^https?:\/\/(www\.)?funplaysystems\.com/i, "").split(/[?#]/)[0];
      for (const k of new Set([asWritten, decoded])) {
        if (!refs.has(k)) refs.set(k, { decoded, real });
      }
      return;
    }
  }
  // Not found: record the shortest sensible spelling.
  const short = raw.split(/[\s),;]/)[0].replace(/[.,;:]+$/, "");
  if (/\.[a-z0-9]{2,5}$/i.test(short)) missing.add(short);
}

// Absolute-path refs (/images/.., /corecraft/x/images/.., /videos/.., /files/.., /audio/..), live-site absolute URLs,
// and bare relative refs ("images/x.jpg", 'images/x.svg', url(images/x)).
const RE_ABS = /(?<![\w.\-/])(?:https?:\/\/(?:www\.)?funplaysystems\.com)?((?:\/[\w\-]+)*\/(?:images|videos|files|audio)\/[^"'`<>\\\n\r]+)/g;
const RE_URL = /https?:\/\/(?:www\.)?funplaysystems\.com(\/(?:[\w\-]+\/)*(?:images|videos|files|audio)\/[^"'`<>\\\n\r]+)/gi;
const RE_REL = /(?<=["'(=\s])((?:images|videos|files|audio)\/[^"'`<>\\\n\r]+)/g;

function scanText(text) {
  for (const m of text.matchAll(RE_ABS)) addRef(m[1]);
  for (const m of text.matchAll(RE_URL)) addRef(m[1]);
  for (const m of text.matchAll(RE_REL)) addRef("/" + m[1]);
}

function scanJsonValue(v) {
  if (typeof v === "string") scanText(v);
  else if (Array.isArray(v)) v.forEach(scanJsonValue);
  else if (v && typeof v === "object") Object.values(v).forEach(scanJsonValue);
}

const scanned = [
  ...listFiles(path.join(SITE, "content", "pages"), [".json"]),
  ...listFiles(path.join(SITE, "content", "overrides"), [".json"]),
  ...listFiles(path.join(SITE, "content", "styles"), [".json"]),
];
for (const f of scanned) {
  // Parse so that escaped strings (data-imgs JSON arrays, \" quotes) are seen in their real form.
  try {
    scanJsonValue(JSON.parse(fs.readFileSync(f, "utf8")));
  } catch {
    scanText(fs.readFileSync(f, "utf8"));
  }
}
const codeFiles = [
  ...listFiles(path.join(SITE, "styles"), [".css"]),
  ...listFiles(path.join(SITE, "components"), [".tsx"]),
  ...listFiles(path.join(SITE, "lib"), [".ts", ".tsx"]),
  ...listFiles(path.join(SITE, "app"), [".ts", ".tsx"]),
];
for (const f of codeFiles) scanText(fs.readFileSync(f, "utf8"));
scanned.push(...codeFiles);

if (fs.existsSync(ASSET_LIST)) {
  for (const line of fs.readFileSync(ASSET_LIST, "utf8").split(/\r?\n/)) {
    const l = line.trim();
    if (l && !l.startsWith("#")) addRef(l);
  }
}
EXTRA.forEach(addRef);

for (const dir of dirIncludes) {
  const lower = dir.toLowerCase();
  let n = 0;
  for (const [k, real] of sourceIndex) {
    if (k.startsWith(lower) && !k.slice(lower.length).includes("/")) {
      if (!refs.has(real)) refs.set(real, { decoded: real, real });
      n++;
    }
  }
  if (!n) missing.add(dir + "*");
}

// Group: one job per real source file, with every output spelling it must be written under.
const jobs = new Map(); // real -> { real, outPaths:Set<decoded>, keys:Set<string> }
for (const [key, { decoded, real }] of refs) {
  if (!jobs.has(real)) jobs.set(real, { real, outPaths: new Set([real]), keys: new Set() });
  const j = jobs.get(real);
  j.outPaths.add(decoded);
  j.keys.add(key);
}

// ---------------------------------------------------------------- 2. prepare public/
async function removeRealDir(p) {
  let st;
  try {
    st = await fsp.lstat(p);
  } catch {
    return;
  }
  if (st.isSymbolicLink()) await fsp.unlink(p); // remove only the link, never its target
  else if (st.isDirectory()) await fsp.rm(p, { recursive: true, force: true });
  else await fsp.unlink(p);
}

await removeRealDir(path.join(PUBLIC, "images"));
await removeRealDir(path.join(PUBLIC, "_img"));
// Other top-level asset dirs we own (never fonts): clear stale output from earlier runs.
const ownedTop = new Set([...jobs.values()].flatMap((j) => [...j.outPaths].map((p) => p.split("/")[1])));
for (const top of ownedTop) if (top && top !== "fonts" && top !== "images") await removeRealDir(path.join(PUBLIC, top));
await fsp.mkdir(path.join(PUBLIC, "images"), { recursive: true });

const outFile = (urlPath) => path.join(PUBLIC, ...urlPath.split("/").filter(Boolean));
async function writeOut(urlPath, buf) {
  const f = outFile(urlPath);
  await fsp.mkdir(path.dirname(f), { recursive: true });
  await fsp.writeFile(f, buf);
}

// ---------------------------------------------------------------- 3. process
const images = {};
const stats = { processed: 0, raster: 0, copied: 0, keptOriginal: 0, variants: 0, before: 0, after: 0, variantBytes: 0, errors: [] };

function variantPath(real, w) {
  const rest = real.startsWith("/images/") ? real.slice("/images/".length) : real.slice(1);
  return `/_img/${w}/${rest}.webp`;
}

async function encodeSame(input, ext, meta) {
  const base = () => {
    let s = sharp(input, { failOn: "none" }).rotate();
    const ow = meta.autoOrient?.width ?? meta.width;
    const oh = meta.autoOrient?.height ?? meta.height;
    if (Math.max(ow, oh) > MAX_SIDE) s = s.resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
    return s; // metadata is stripped by default (no withMetadata())
  };
  if (ext === ".jpg" || ext === ".jpeg") {
    return base().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toBuffer({ resolveWithObject: true });
  }
  if (ext === ".webp") {
    return base().webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
  }
  // PNG: lossless level 9 vs palette level 9, pick the smaller (alpha kept in both).
  const a = await base().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer({ resolveWithObject: true });
  const b = await base().png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toBuffer({ resolveWithObject: true });
  return a.data.length <= b.data.length ? a : b;
}

async function processJob(job) {
  const src = path.join(SOURCE, ...job.real.split("/").filter(Boolean));
  const orig = await fsp.readFile(src);
  const ext = path.extname(job.real).toLowerCase();
  stats.before += orig.length;
  let outBuf = orig;
  let info = null;

  if (RASTER.has(ext)) {
    try {
      const meta = await sharp(orig, { failOn: "none" }).metadata();
      const animated = (meta.pages || 1) > 1;
      const ow = meta.autoOrient?.width ?? meta.width;
      const oh = meta.autoOrient?.height ?? meta.height;
      if (animated) {
        info = { w: ow, h: oh, variants: [] }; // keep animated WebP untouched
      } else {
        const enc = await encodeSame(orig, ext, meta);
        if (enc.data.length < orig.length) {
          outBuf = enc.data;
          info = { w: enc.info.width, h: enc.info.height, variants: [] };
        } else {
          stats.keptOriginal++;
          info = { w: ow, h: oh, variants: [] };
        }
        if (info.w > VARIANT_MIN_WIDTH) {
          for (const w of VARIANT_WIDTHS) {
            if (w > info.w) continue;
            const vbuf = await sharp(orig, { failOn: "none" }).rotate().resize({ width: w }).webp({ quality: 80 }).toBuffer();
            const vp = variantPath(job.real, w);
            await writeOut(vp, vbuf);
            info.variants.push([w, encodeUrlPath(vp)]);
            stats.variants++;
            stats.variantBytes += vbuf.length;
          }
        }
      }
      stats.raster++;
    } catch (e) {
      stats.errors.push(`${job.real}: ${e.message}`);
      outBuf = orig;
      info = null;
    }
  } else {
    stats.copied++;
  }

  for (const p of job.outPaths) {
    await writeOut(p, outBuf);
    stats.after += outBuf.length;
  }
  if (info) for (const k of job.keys) images[k] = info;
  stats.processed++;
}

const queue = [...jobs.values()];
const t0 = Date.now();
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const j = queue.shift();
      await processJob(j);
      if (stats.processed % 100 === 0) process.stdout.write(`  ${stats.processed}/${jobs.size}\n`);
    }
  }),
);

const sorted = Object.fromEntries(Object.keys(images).sort().map((k) => [k, images[k]]));
await fsp.writeFile(OUT_JSON, JSON.stringify(sorted, null, 1) + "\n");

// ---------------------------------------------------------------- 4. summary
function dirSize(p) {
  let n = 0;
  for (const f of walk(p)) n += fs.statSync(f).size;
  return n;
}
const mb = (n) => (n / 1048576).toFixed(1) + " MB";
console.log("\n=== optimize-images summary ===");
console.log(`Scanned files:             ${scanned.length} (+ tools/assets-used.txt)`);
console.log(`Referenced spellings:      ${refs.size}`);
console.log(`Source files processed:    ${stats.processed} (raster ${stats.raster}, copied as-is ${stats.copied})`);
console.log(`Raster kept original bytes:${stats.keptOriginal}`);
console.log(`Bytes before (sources):    ${mb(stats.before)}`);
console.log(`Bytes after (main files):  ${mb(stats.after)}`);
console.log(`WebP variants:             ${stats.variants} (${mb(stats.variantBytes)})`);
console.log(`images.json entries:       ${Object.keys(sorted).length}`);
console.log(`public/ total size:        ${mb(dirSize(PUBLIC))}`);
console.log(`Time:                      ${((Date.now() - t0) / 1000).toFixed(1)} s`);
if (stats.errors.length) {
  console.log(`\nErrors (${stats.errors.length}):`);
  stats.errors.forEach((e) => console.log("  " + e));
}
console.log(`\nMissing referenced paths (${missing.size}):`);
[...missing].sort().forEach((m) => console.log("  " + m));
