import fs from "node:fs";
import path from "node:path";
import type { PageMeta } from "./page";

/** A page built from section components: which component, with which plain-data props. */
export type Section = { component: string; props: Record<string, unknown> };
export type TemplatedPage = PageMeta & { sections: Section[] };

/** Families of pages rendered from templates; their data lives in content/<family>/*.json (blog bodies in .mdx). */
export const FAMILIES = ["city", "product", "blog"] as const;
export type Family = (typeof FAMILIES)[number];

let cache: Map<string, TemplatedPage & { family: Family }> | null = null;

function load() {
  if (cache) return cache;
  cache = new Map();
  for (const family of FAMILIES) {
    const dir = path.join(process.cwd(), "content", family);
    for (const f of fs.readdirSync(dir).sort()) {
      if (!f.endsWith(".json")) continue;
      const page = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as TemplatedPage;
      cache.set(page.path, { ...page, family });
    }
  }
  return cache;
}

let metas: PageMeta[] | null = null;

/** Pages with their own route file: their metadata lives in content/pages/<page>.json. */
export function routePages(): PageMeta[] {
  if (metas) return metas;
  const dir = path.join(process.cwd(), "content", "pages");
  metas = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as PageMeta);
  return metas;
}

/** Every page of the site (for the sitemaps, the search index and structured data). */
export function allPages(): PageMeta[] {
  return [...routePages(), ...templatedPages()];
}

export function templatedPages() {
  return [...load().values()];
}

export function getTemplatedPage(p: string) {
  return load().get(p);
}
