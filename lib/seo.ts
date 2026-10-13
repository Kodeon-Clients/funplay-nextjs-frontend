import type { Metadata } from "next";
import type { PageRecord } from "./content";
import { SITE } from "./site";

/** Builds Next.js metadata from a page record's SEO fields (title, description, canonical, OG, Twitter, robots). */
export function buildMetadata(rec: PageRecord): Metadata {
  const s = rec.seo;
  if (!s) return {};
  const og = s.og || {};
  const tw = s.twitter || {};
  const canonical = s.canonical || SITE.url + rec.path;
  const robots = s.robots || "";
  const noindex = /noindex/i.test(robots);
  return {
    title: { absolute: s.title },
    description: s.description || undefined,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type: og["og:type"] === "article" ? "article" : "website",
      title: og["og:title"] || s.title,
      description: og["og:description"] || s.description,
      url: og["og:url"] || canonical,
      siteName: og["og:site_name"] || SITE.name,
      locale: og["og:locale"] || "en_IN",
      images: og["og:image"] ? [{ url: og["og:image"] }] : undefined,
    },
    twitter: {
      card: (tw["twitter:card"] as "summary_large_image") || "summary_large_image",
      title: tw["twitter:title"] || og["og:title"] || s.title,
      description: tw["twitter:description"] || og["og:description"] || s.description,
      images: tw["twitter:image"] || og["og:image"] ? [tw["twitter:image"] || og["og:image"]] : undefined,
    },
  };
}

/** JSON-LD blocks for the page, de-duplicated by @type + @id. */
export function pageJsonLd(rec: PageRecord): unknown[] {
  const list = (rec.seo?.jsonld ?? []) as any[];
  const seen = new Set<string>();
  const out: unknown[] = [];
  for (const ld of list) {
    const key = JSON.stringify([ld?.["@type"], ld?.["@id"], ld?.["@graph"] ? "graph" : "", ld?.name]);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ld);
  }
  return out;
}
