import type { Metadata } from "next";
import { SITE } from "./site";
import shared from "@/content/shared-sections.json";

export type Seo = {
  title: string;
  description?: string;
  canonical?: string | null;
  robots?: string | null;
  og?: Record<string, string>;
  twitter?: Record<string, string>;
};

/** Everything a page needs besides its sections: route, SEO fields, header style and page data. */
export type PageMeta = {
  path: string;
  type: string;
  header?: "transparent" | "light";
  popupTitle?: string;
  /** page-specific stylesheets in public/css/pages/<id>.css */
  styles?: string[];
  /** extra stylesheets in public/css */
  css?: string[];
  h1?: string;
  seo: Seo;
  data?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** inputs for structured data (lib/schema.ts) */
  schema?: import("./schema").SchemaData;
  /** text and other data of the page's own sections, by component name */
  sections?: { component: string; props: Record<string, unknown> }[];
};

/** Props of one of the page's own sections (stored in the page's JSON so the content sheet can edit them). */
export function section<T>(page: PageMeta, name: string): T {
  const s = page.sections?.find((x) => x.component === name);
  if (!s) throw new Error(`${page.path}: no data for section ${name}`);
  return s.props as T;
}

/** Props of a section shared by several pages (content/shared-sections.json). */
export function sharedSection<T>(name: string): T {
  const p = (shared as Record<string, unknown>)[name];
  if (!p) throw new Error(`no data for shared section ${name}`);
  return p as T;
}

/** Next.js metadata from a page's SEO fields (title, description, canonical, Open Graph, Twitter, robots). */
export function buildMetadata(page: PageMeta): Metadata {
  const s = page.seo;
  const og = s.og || {};
  const tw = s.twitter || {};
  const canonical = s.canonical || SITE.url + page.path;
  const noindex = /noindex/i.test(s.robots || "");
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
