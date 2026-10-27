/**
 * The editable content of the site as sheet rows, and how edits are written back into the repository.
 *
 * Tabs:
 *   Pages    one row per page: title, meta description, H1, index/noindex, canonical, Open Graph
 *   Images   one row per image used on the site: alt text (site-wide) and an optional replacement file
 *   Content  one row per text field: headings, paragraphs, FAQ questions and answers, facts, blog paragraphs
 *
 * Every editable cell is a "field" with a stable id. lib/sheet sync compares the sheet, the repository
 * and the state of the last sync per field (three-way), so edits made on either side are kept.
 */
import fs from "node:fs";
import path from "node:path";
import { kindOf, toCell, fromCell, roundTrips, plainOf, norm } from "./format.mjs";

export const ROOT = process.cwd();
const C = (...p) => path.join(ROOT, "content", ...p);
const FAMILIES = ["city", "product", "blog"];
const HOST = "https://funplaysystems.com";

/* ------------------------------------------------------------------ files */
export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
export function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 1));
}
const ls = (dir, ext) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);

/** All page data files: { file, key, family, meta }. */
export function pageFiles() {
  const out = [];
  for (const f of ls(C("pages"), ".json")) {
    if (f === "404.json") continue;
    out.push({ file: C("pages", f), key: f.slice(0, -5), family: "pages" });
  }
  for (const fam of FAMILIES) for (const f of ls(C(fam), ".json")) out.push({ file: C(fam, f), key: f.slice(0, -5), family: fam });
  for (const p of out) p.meta = readJson(p.file);
  return out.sort((a, b) => order(a.meta) - order(b.meta) || a.meta.path.localeCompare(b.meta.path));
}
const TYPE_ORDER = ["home", "page", "series", "project", "career", "landing", "product", "city-playground", "city-gym", "blog"];
const order = (m) => (TYPE_ORDER.indexOf(m.type) + 1 || 99);

export function componentFile(family, pageKey, name, type) {
  if (type === "landing") return path.join(ROOT, "components", "landing", pageKey, name + ".tsx");
  if (family === "pages") return path.join(ROOT, "components", "pages", pageKey, name + ".tsx");
  return path.join(ROOT, "components", "templates", family, name + ".tsx");
}

/* ------------------------------------------------------------------ H1 of each page */
const h1Cache = new Map();
/** Name of the prop that renders the <h1> of a component, or null. */
export function h1Prop(file) {
  if (!h1Cache.has(file)) {
    let prop = null;
    if (fs.existsSync(file)) {
      const src = fs.readFileSync(file, "utf8");
      const m = /<h1\b[^>]*>([\s\S]*?)<\/h1>/.exec(src);
      const ref = m && /\{p\.(\w+)\}|<R v=\{p\.(\w+)\} \/>/.exec(m[1]);
      if (ref) prop = ref[1] || ref[2];
    }
    h1Cache.set(file, prop);
  }
  return h1Cache.get(file);
}

/** Where the page's H1 text is stored: { section index, prop } or null when it is written in code. */
export function h1Location(p) {
  const secs = p.meta.sections || [];
  for (let i = 0; i < secs.length; i++) {
    const prop = h1Prop(componentFile(p.family, p.key, secs[i].component, p.meta.type));
    if (prop && secs[i].props && prop in secs[i].props) return { i, prop };
  }
  return null;
}

/* ------------------------------------------------------------------ text fields inside section props */
const TEXT_KEY = /^(?:[a-z][a-z0-9]*Text\d*|text\d*)$/;
const BLOCK_KEYS = new Set(["heading", "q", "a", "label", "value", "content", "title"]);
const SKIP_KEY = /(Style|Class|Href|Src|Alt|Id|Imgs|Alts)\d*$|^(attrs|style|colours|productGallery|article|images|alts|slug|swatch|background)$/;

const LABELS = { h1: "Heading (H1)", h2: "Heading (H2)", h3: "Heading (H3)", h4: "Heading (H4)", h5: "Heading (H5)", h6: "Heading (H6)", p: "Paragraph", a: "Link text", li: "List item", button: "Button", label: "Form label", td: "Table cell", th: "Table heading", strong: "Bold text", b: "Bold text", span: "Text", div: "Text", text: "Text", figcaption: "Caption", blockquote: "Quote", dt: "Term", dd: "Definition", small: "Small text", em: "Text", summary: "Heading" };
const BLOCK_LABELS = { heading: "Section heading", q: "FAQ question", a: "FAQ answer", label: "Fact label", value: "Fact value", content: "Section text", title: "Title" };

function fieldLabel(propPath) {
  const parts = propPath.split(".");
  const key = parts[parts.length - 1];
  const items = parts.filter((x) => /^\d+$/.test(x)).map((x) => Number(x) + 1);
  let label;
  if (BLOCK_LABELS[key]) label = BLOCK_LABELS[key];
  else {
    const tag = key.replace(/Text\d*$|\d+$/g, "") || "text";
    label = LABELS[tag] || "Text";
  }
  return items.length ? `${label} (item ${items.join(".")})` : label;
}

/** Text fields of a props object: [{ propPath, kind, value }]. */
export function textFields(props, prefix = "") {
  const out = [];
  if (!props || typeof props !== "object") return out;
  for (const [k, v] of Object.entries(props)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(props) ? false : SKIP_KEY.test(k)) continue;
    const kind = kindOf(v);
    const textKey = Array.isArray(props) ? false : TEXT_KEY.test(k) || BLOCK_KEYS.has(k);
    if (textKey && kind) {
      out.push({ propPath: p, kind, value: v });
      continue;
    }
    if (v && typeof v === "object" && !(kind === "rich" || kind === "blocks")) out.push(...textFields(v, p));
  }
  return out;
}

export function getPath(obj, propPath) {
  return propPath.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
export function setPath(obj, propPath, value) {
  const ks = propPath.split(".");
  const last = ks.pop();
  const parent = ks.reduce((o, k) => o[k], obj);
  parent[last] = value;
}

/* ------------------------------------------------------------------ MDX article blocks */
export function mdxBlocks(slug) {
  const file = C("blog", slug + ".mdx");
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, "utf8");
  return { file, blocks: src.replace(/\n$/, "").split("\n\n") };
}
export const mdxEditable = (b) => !/^\s*[<{]/.test(b) && b.trim() !== "";
const mdxLabel = (b) => (/^#{1,6} /.test(b) ? `Heading (H${/^#+/.exec(b)[0].length})` : /^(- |\d+\. )/.test(b) ? "List" : "Paragraph");
const articleSlug = (meta) => {
  for (const s of meta.sections || []) {
    const a = s.props && s.props.article;
    if (a && a.slug) return a.slug;
  }
  return null;
};

/* ------------------------------------------------------------------ rows */
const robotsCell = (r) => (/noindex/i.test(r || "") ? "noindex" : "index");
const ogTitle = (seo) => {
  const v = (seo.og || {})["og:title"];
  return v && v !== seo.title ? v : "";
};
const ogDesc = (seo) => {
  const v = (seo.og || {})["og:description"];
  return v && v !== seo.description ? v : "";
};

export const PAGE_COLUMNS = [
  // id, header, editable
  ["path", "Page", false],
  ["type", "Page type", false],
  ["title", "Title", true],
  ["titleLen", "Title length", false],
  ["description", "Meta description", true],
  ["descLen", "Description length", false],
  ["h1", "H1", true],
  ["robots", "Index", true],
  ["canonical", "Canonical URL", true],
  ["ogTitle", "OG title (blank = title)", true],
  ["ogDescription", "OG description (blank = meta description)", true],
  ["ogImage", "OG image", true],
  ["url", "Open page", false],
  ["status", "Status", false],
];
export const IMAGE_COLUMNS = [
  ["src", "Image", false],
  ["preview", "Preview", false],
  ["alt", "Alt text (blank = keep the alt text on each page)", true],
  ["currentAlt", "Alt text on the pages now", false],
  ["replace", "Replace with (image path)", true],
  ["count", "Used on (pages)", false],
  ["example", "Example page", false],
  ["status", "Status", false],
];
export const CONTENT_COLUMNS = [
  ["page", "Page", false],
  ["type", "Page type", false],
  ["section", "Section", false],
  ["field", "Field", false],
  ["format", "Format", false],
  ["text", "Text", true],
  ["chars", "Characters", false],
  ["key", "Key (do not change)", false],
  ["status", "Status", false],
];
export const FORMAT_NAMES = { plain: "plain text", rich: "text with links/bold", blocks: "paragraphs and lists", markdown: "markdown", locked: "read-only" };

/**
 * Everything editable, read from the repository.
 * Returns { fields: Map<id, Field>, rows: { Pages: Row[], Images: Row[], Content: Row[] } }
 * Field = { id, tab, rowKey, column, kind, cell, locked, apply(cell, ctx) }
 */
export function extract() {
  const fields = new Map();
  const rows = { Pages: [], Images: [], Content: [] };
  const pages = pageFiles();
  const add = (f) => fields.set(f.id, f);
  const usage = sharedUsage();
  const sharedH1 = new Set(Object.keys(usage).filter((n) => h1Prop(path.join(ROOT, "components", "shared", n + ".tsx"))));
  const sharedOf = {};
  for (const [n, pgs] of Object.entries(usage)) for (const pg of pgs) (sharedOf[pg] ||= []).push(n);

  for (const p of pages) {
    const m = p.meta;
    const seo = m.seo || {};
    const h1 = h1Location(p);
    const h1Value = h1 ? m.sections[h1.i].props[h1.prop] : null;
    const h1Kind = h1 ? kindOf(h1Value) : null;
    const h1Ok = h1 && h1Kind && roundTrips(h1Kind, h1Value);
    const row = {
      key: m.path,
      values: {
        path: m.path,
        type: m.type,
        title: seo.title || "",
        description: seo.description || "",
        h1: h1Ok ? toCell(h1Kind, h1Value) : m.h1 || "",
        robots: robotsCell(seo.robots),
        canonical: seo.canonical || "",
        ogTitle: ogTitle(seo),
        ogDescription: ogDesc(seo),
        ogImage: (seo.og || {})["og:image"] || "",
      },
      readOnly: h1Ok ? [] : ["h1"],
      notes: h1Ok
        ? {}
        : {
            h1: (sharedOf[m.path] || []).some((n) => sharedH1.has(n))
              ? "This H1 is in a section shared with other pages: edit it on the Content tab (Page: All pages with this section)."
              : "This page's H1 is written in the page code (ask the developer to change it).",
          },
    };
    rows.Pages.push(row);
    for (const col of ["title", "description", "h1", "robots", "canonical", "ogTitle", "ogDescription", "ogImage"]) {
      const locked = row.readOnly.includes(col);
      add({ id: `P|${m.path}|${col}`, tab: "Pages", rowKey: m.path, column: col, kind: col === "h1" && h1Ok ? h1Kind : "plain", cell: row.values[col], locked, page: p, h1 });
    }
    // content fields
    const secs = m.sections || [];
    secs.forEach((s, i) => {
      for (const tf of textFields(s.props)) {
        if (h1 && i === h1.i && tf.propPath === h1.prop) continue; // edited on the Pages tab
        const ok = roundTrips(tf.kind, tf.value);
        const key = `${m.path}#${s.component}:${tf.propPath}`;
        const cell = ok ? toCell(tf.kind, tf.value) : plainOf(tf.value);
        rows.Content.push({ key, values: { page: m.path, type: m.type, section: s.component, field: fieldLabel(tf.propPath), format: FORMAT_NAMES[ok ? tf.kind : "locked"], text: cell, key }, readOnly: ok ? [] : ["text"] });
        add({ id: `C|${key}`, tab: "Content", rowKey: key, column: "text", kind: tf.kind, cell, locked: !ok, page: p, section: i, propPath: tf.propPath });
      }
    });
    // blog article body
    const slug = articleSlug(m);
    const mdx = slug && mdxBlocks(slug);
    if (mdx) {
      mdx.blocks.forEach((b, n) => {
        if (!mdxEditable(b)) return;
        const key = `${m.path}#article:${n}`;
        rows.Content.push({ key, values: { page: m.path, type: m.type, section: "Article", field: `${mdxLabel(b)} (block ${n + 1})`, format: FORMAT_NAMES.markdown, text: b, key }, readOnly: [] });
        add({ id: `C|${key}`, tab: "Content", rowKey: key, column: "text", kind: "markdown", cell: b, locked: false, page: p, mdx: { slug, n } });
      });
    }
  }

  // shared sections (one row edits every page that uses the section)
  const sharedFile = C("shared-sections.json");
  const shared = fs.existsSync(sharedFile) ? readJson(sharedFile) : {};
  for (const [name, props] of Object.entries(shared)) {
    for (const tf of textFields(props)) {
      const ok = roundTrips(tf.kind, tf.value);
      const key = `shared#${name}:${tf.propPath}`;
      const cell = ok ? toCell(tf.kind, tf.value) : plainOf(tf.value);
      const label = `All pages with this section (${(usage[name] || []).length})`;
      rows.Content.push({ key, values: { page: label, type: "shared", section: name, field: fieldLabel(tf.propPath), format: FORMAT_NAMES[ok ? tf.kind : "locked"], text: cell, key }, readOnly: ok ? [] : ["text"] });
      add({ id: `C|${key}`, tab: "Content", rowKey: key, column: "text", kind: tf.kind, cell, locked: !ok, shared: name, propPath: tf.propPath });
    }
  }

  // images
  const seoMap = readImageSeo();
  for (const img of imageInventory(pages)) {
    const set = seoMap[img.src] || {};
    const alts = [...img.alts.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => (a === "" ? "(empty: decorative)" : a));
    rows.Images.push({
      key: img.src,
      values: { src: img.src, alt: set.alt || "", currentAlt: alts.slice(0, 5).join(" | ") + (alts.length > 5 ? ` | …${alts.length - 5} more` : ""), replace: set.replace || "", count: img.pages.size, example: [...img.pages][0] || "" },
      readOnly: [],
    });
    add({ id: `I|${img.src}|alt`, tab: "Images", rowKey: img.src, column: "alt", kind: "plain", cell: set.alt || "", locked: false, image: img.src });
    add({ id: `I|${img.src}|replace`, tab: "Images", rowKey: img.src, column: "replace", kind: "plain", cell: set.replace || "", locked: false, image: img.src });
  }
  return { fields, rows, pages };
}

/* ------------------------------------------------------------------ images */
export function readImageSeo() {
  const f = C("image-seo.json");
  return fs.existsSync(f) ? readJson(f) : {};
}

const IMG_EXT = /\.(jpe?g|png|webp|gif|svg|avif)$/i;
const JSON_STR = String.raw`"(?:[^"\\]|\\.)*"`;

/** Images used on the site with the alt texts they have on each page, from the page data and components. */
export function imageInventory(pages) {
  const map = new Map();
  const note = (src, alt, page) => {
    if (typeof src !== "string" || !src.startsWith("/") || !IMG_EXT.test(src)) return;
    if (!map.has(src)) map.set(src, { src, alts: new Map(), pages: new Set() });
    const e = map.get(src);
    if (alt !== undefined && alt !== null) e.alts.set(String(alt), (e.alts.get(String(alt)) || 0) + 1);
    if (page) e.pages.add(page);
  };
  const walk = (o, page) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach((x) => walk(x, page));
    for (const [k, v] of Object.entries(o)) {
      const m = /^(.*)Src(\d*)$/.exec(k);
      if (m && typeof v === "string") note(v, o[`${m[1]}Alt${m[2]}`], page);
      const d = /^(.*)DataImgs(\d*)$/.exec(k);
      if (d && typeof v === "string") {
        const srcs = safeJson(v);
        const alts = safeJson(o[`${d[1]}DataAlts${d[2]}`]);
        srcs.forEach((s, i) => note(s, alts[i], page));
      }
    }
    if (Array.isArray(o.images)) o.images.forEach((s, i) => note(s, (o.alts || [])[i], page));
    for (const v of Object.values(o)) walk(v, page);
  };
  // component files -> pages that render them
  const compPages = componentPages(pages);
  for (const p of pages) walk(p.meta.sections, p.meta.path);
  const shared = fs.existsSync(C("shared-sections.json")) ? readJson(C("shared-sections.json")) : {};
  const usage = sharedUsage();
  for (const [name, props] of Object.entries(shared)) for (const pg of usage[name] || ["(shared)"]) walk(props, pg);
  for (const [file, pgs] of compPages) {
    const src = fs.readFileSync(file, "utf8");
    for (const pg of pgs.size ? pgs : new Set(["(all pages)"])) scanSource(src, pg, note);
  }
  for (const p of pages) {
    const slug = articleSlug(p.meta);
    const mdx = slug && mdxBlocks(slug);
    if (mdx) scanSource(mdx.blocks.join("\n\n"), p.meta.path, note);
  }
  return [...map.values()].sort((a, b) => b.pages.size - a.pages.size || a.src.localeCompare(b.src));
}

function safeJson(s) {
  try {
    const v = JSON.parse(s || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function attrValue(attrs, name) {
  const m = new RegExp(String.raw`\b${name}=(?:"([^"]*)"|\{(${JSON_STR})\})`).exec(attrs);
  if (!m) return undefined;
  return m[1] !== undefined ? m[1] : JSON.parse(m[2]);
}

function scanSource(src, page, note) {
  for (const m of src.matchAll(/<(?:Img|PlainImg|img)\b([^>]*?)\/?>/g)) {
    const s = attrValue(m[1], "src");
    if (s !== undefined) note(s, attrValue(m[1], "alt"), page);
  }
  for (const m of src.matchAll(new RegExp(String.raw`"images": (\[[^\]]*\]), "alts": (\[[^\]]*\])`, "g"))) {
    const s = safeJson(m[1]);
    const a = safeJson(m[2]);
    s.forEach((x, i) => note(x, a[i], page));
  }
  for (const m of src.matchAll(new RegExp(String.raw`galleryAlts\((${JSON_STR}), (${JSON_STR})\)`, "g"))) {
    const s = safeJson(JSON.parse(m[1]));
    const a = safeJson(JSON.parse(m[2]));
    s.forEach((x, i) => note(x, a[i], page));
  }
}

/** Component source files -> set of page paths that use them. */
function componentPages(pages) {
  const out = new Map();
  const add = (file, pg) => {
    if (!fs.existsSync(file)) return;
    if (!out.has(file)) out.set(file, new Set());
    if (pg) out.get(file).add(pg);
  };
  for (const p of pages) for (const s of p.meta.sections || []) add(componentFile(p.family, p.key, s.component, p.meta.type), p.meta.path);
  // route files: every component they import
  for (const route of routeFiles()) {
    const src = fs.readFileSync(route, "utf8");
    const meta = /from "@\/content\/pages\/([^"]+)\.json"/.exec(src);
    const pg = meta && fs.existsSync(C("pages", meta[1] + ".json")) ? readJson(C("pages", meta[1] + ".json")).path : null;
    for (const m of src.matchAll(/from "@\/(components\/[^"]+)"/g)) add(path.join(ROOT, m[1] + ".tsx"), pg);
  }
  // site-wide components
  for (const f of ["Header", "Footer", "ContactPopup", "DownloadPopup", "EnquiryForm"]) add(path.join(ROOT, "components", f + ".tsx"), null);
  return out;
}

function routeFiles() {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name === "page.tsx" || e.name === "not-found.tsx") out.push(p);
    }
  };
  walk(path.join(ROOT, "app"));
  return out;
}

/** Shared section name -> page paths whose route file renders it. */
export function sharedUsage() {
  const out = {};
  for (const route of routeFiles()) {
    const src = fs.readFileSync(route, "utf8");
    const meta = /from "@\/content\/pages\/([^"]+)\.json"/.exec(src);
    const pg = meta && fs.existsSync(C("pages", meta[1] + ".json")) ? readJson(C("pages", meta[1] + ".json")).path : route;
    for (const m of src.matchAll(/sharedSection<\w+>\("(\w+)"\)/g)) (out[m[1]] ||= []).push(pg);
  }
  return out;
}

/* ------------------------------------------------------------------ applying edits */
/**
 * Write edited cells into the repository. edits: [{ field, cell }] (already validated).
 * Returns a list of { id, file } changed.
 */
export function apply(edits) {
  const files = new Map(); // file -> parsed json
  const load = (file) => {
    if (!files.has(file)) files.set(file, readJson(file));
    return files.get(file);
  };
  const mdxFiles = new Map();
  const images = readImageSeo();
  let imagesChanged = false;
  const changed = [];
  const schemaSwaps = new Map(); // page file -> [[old, new]]
  const swap = (file, oldV, newV) => {
    const o = norm(oldV);
    const n = norm(newV);
    if (o && o !== n) (schemaSwaps.get(file) || schemaSwaps.set(file, []).get(file)).push([o, n]);
  };

  for (const { field: f, cell } of edits) {
    if (f.tab === "Pages") {
      const m = load(f.page.file);
      const seo = (m.seo ||= {});
      const og = (seo.og ||= {});
      const tw = (seo.twitter ||= {});
      const v = String(cell ?? "").trim();
      switch (f.column) {
        case "title":
          for (const k of ["og:title"]) if (og[k] === seo.title) delete og[k];
          if (tw["twitter:title"] === seo.title) delete tw["twitter:title"];
          swap(f.page.file, seo.title, v);
          seo.title = v;
          break;
        case "description":
          if (og["og:description"] === seo.description) delete og["og:description"];
          if (tw["twitter:description"] === seo.description) delete tw["twitter:description"];
          swap(f.page.file, seo.description, v);
          seo.description = v;
          break;
        case "h1": {
          const s = m.sections[f.h1.i].props;
          const old = s[f.h1.prop];
          s[f.h1.prop] = fromCell(f.kind, cell, old);
          swap(f.page.file, plainOf(old), plainOf(s[f.h1.prop]));
          swap(f.page.file, m.h1, plainOf(s[f.h1.prop]));
          m.h1 = norm(plainOf(s[f.h1.prop]));
          break;
        }
        case "robots":
          seo.robots = v === "noindex" ? "noindex, follow" : null;
          break;
        case "canonical":
          seo.canonical = v || null;
          break;
        case "ogTitle":
          if (v) og["og:title"] = v;
          else delete og["og:title"];
          break;
        case "ogDescription":
          if (v) og["og:description"] = v;
          else delete og["og:description"];
          break;
        case "ogImage":
          if (v) og["og:image"] = v.startsWith("/") ? HOST + v : v;
          else delete og["og:image"];
          break;
      }
      changed.push({ id: f.id, file: f.page.file });
    } else if (f.tab === "Content" && f.mdx) {
      const file = C("blog", f.mdx.slug + ".mdx");
      if (!mdxFiles.has(file)) mdxFiles.set(file, mdxBlocks(f.mdx.slug).blocks);
      mdxFiles.get(file)[f.mdx.n] = String(cell).replace(/\r\n?/g, "\n").trim();
      changed.push({ id: f.id, file });
    } else if (f.tab === "Content") {
      const file = f.shared ? C("shared-sections.json") : f.page.file;
      const data = load(file);
      const props = f.shared ? data[f.shared] : data.sections[f.section].props;
      const old = getPath(props, f.propPath);
      const nv = fromCell(f.kind, cell, old);
      setPath(props, f.propPath, nv);
      if (!f.shared) swap(file, plainOf(old), plainOf(nv));
      changed.push({ id: f.id, file });
    } else if (f.tab === "Images") {
      const e = { ...(images[f.image] || {}) };
      const v = String(cell ?? "").trim();
      if (v) e[f.column] = v;
      else delete e[f.column];
      if (Object.keys(e).length) images[f.image] = e;
      else delete images[f.image];
      imagesChanged = true;
      changed.push({ id: f.id, file: C("image-seo.json") });
    }
  }
  // structured data that repeats visible text (FAQ answers, breadcrumb names, descriptions) follows the edit
  for (const [file, pairs] of schemaSwaps) {
    const m = load(file);
    if (m.schema) m.schema = swapStrings(m.schema, pairs);
  }
  for (const [file, data] of files) writeJson(file, data);
  for (const [file, blocks] of mdxFiles) fs.writeFileSync(file, blocks.join("\n\n") + "\n");
  if (imagesChanged) writeJson(C("image-seo.json"), Object.fromEntries(Object.entries(images).sort(([a], [b]) => a.localeCompare(b))));
  return changed;
}

function swapStrings(v, pairs) {
  if (typeof v === "string") {
    const n = norm(v);
    for (const [o, nv] of pairs) if (n === o) return nv;
    return v;
  }
  if (Array.isArray(v)) return v.map((x) => swapStrings(x, pairs));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swapStrings(x, pairs)]));
  return v;
}
