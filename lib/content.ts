import { STANDALONE_PAGES } from "./standalone";
import fs from "node:fs";
import path from "node:path";

/** One page of the site. Collections live in content/pages/<collection>.json. */
export type PageRecord = {
  path: string;
  type: string;
  collection: string;
  seo?: {
    title: string;
    description: string;
    canonical: string | null;
    robots?: string | null;
    og: Record<string, string>;
    twitter: Record<string, string>;
    jsonld: unknown[];
  };
  header?: "transparent" | "light";
  css?: string[];
  styles?: string[];
  body?: string;
  h1?: string;
  raw?: string;
  redirect?: string;
  data?: Record<string, any>;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

let cache: { byPath: Map<string, PageRecord>; all: PageRecord[]; styles: Record<string, string> } | null = null;

function load() {
  if (cache) return cache;
  const dir = path.join(CONTENT_DIR, "pages");
  const all: PageRecord[] = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".json")) continue;
    const recs = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as PageRecord[];
    all.push(...recs);
  }
  // Content overrides (new copy, SEO additions) are merged over the extracted records.
  const ovDir = path.join(CONTENT_DIR, "overrides");
  const overrides: Record<string, Partial<PageRecord>> = {};
  if (fs.existsSync(ovDir)) {
    for (const f of fs.readdirSync(ovDir).sort()) {
      if (!f.endsWith(".json")) continue;
      Object.assign(overrides, JSON.parse(fs.readFileSync(path.join(ovDir, f), "utf8")));
    }
  }
  const byPath = new Map<string, PageRecord>();
  for (const r of all) {
    const ov = overrides[r.path] as (Partial<PageRecord> & { bodyReplace?: [string, string][] }) | undefined;
    const merged = ov ? deepMerge(r, ov) : r;
    // bodyReplace: exact find/replace edits on the stored body HTML (each "find" must occur)
    if (ov?.bodyReplace && merged.body) {
      for (const [find, repl] of ov.bodyReplace) {
        if (!merged.body.includes(find)) throw new Error(`bodyReplace target not found on ${r.path}: ${find.slice(0, 80)}`);
        merged.body = merged.body.replace(find, repl);
      }
      delete (merged as any).bodyReplace;
    }
    byPath.set(r.path, merged);
  }
  // pages that exist only as overrides (new pages)
  for (const [p, ov] of Object.entries(overrides)) {
    const rec = ov as PageRecord;
    if (!byPath.has(p) && rec.type) byPath.set(p, { ...rec, collection: rec.collection || "new", path: p });
  }
  const styles = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "styles", "page-styles.json"), "utf8"));
  cache = { byPath, all: [...byPath.values()], styles };
  return cache;
}

function deepMerge<T>(a: T, b: Partial<T>): T {
  if (Array.isArray(b) || typeof b !== "object" || b === null) return b as T;
  const out: any = { ...(a as any) };
  for (const [k, v] of Object.entries(b)) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object" ? deepMerge(out[k], v as any) : v;
  }
  return out;
}

export const STANDALONE = new Set(STANDALONE_PAGES);

export const RENDERED_TYPES = new Set([
  "home", "page", "blog", "career", "project", "series", "product", "city-gym", "city-playground", "state-hub", "compare",
]);

export function allPages() {
  return load().all;
}

export function renderedPages() {
  return load().all.filter((r) => RENDERED_TYPES.has(r.type));
}

/** Pages rendered by the catch-all route: landing pages are served by app/<page>.html/route.ts
 * as standalone documents (lib/standalone.ts) but still count for the sitemap, search and llms.txt. */
export function routedPages() {
  return renderedPages().filter((r) => !STANDALONE.has(r.path));
}

export function getPage(p: string) {
  return load().byPath.get(p);
}

export function pageStyle(hash: string) {
  return load().styles[hash] ?? "";
}

/** Converts a URL path to catch-all route params and back. */
export function pathToSlug(p: string): string[] {
  return p === "/" ? [] : p.replace(/^\//, "").split("/");
}

export function slugToPath(slug?: string[]): string {
  if (!slug || slug.length === 0) return "/";
  return "/" + slug.map((s) => decodeURIComponent(s)).join("/");
}
