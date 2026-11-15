import fs from "node:fs";
import path from "node:path";
import { routePages, templatedPages } from "./pages";
import type { PageMeta } from "./page";
import type { SchemaData } from "./schema";
import { SITE } from "./site";
import authorsJson from "@/content/blog-authors.json";
import projectsGrid from "@/content/projects-grid.json";

/**
 * The blog: posts (content/blog/blog-<slug>.json + <slug>.mdx), topic and audience hubs
 * (content/pages/blog-category-<id>.json) and the products and projects posts link to.
 * Everything here is read at build time.
 */

export type FaqItem = { q: string; a: string };
export type PostProps = {
  article: { slug: string };
  title: string;
  summaryText: string;
  topic: string;
  audiences: string[];
  author: string;
  date: string;
  updated?: string;
  image: string;
  imageAlt: string;
  takeaways: { text: string }[];
  products: string[];
  projects: string[];
  faq: FaqItem[];
};
export type Post = PostProps & { path: string; slug: string; minutes: number; headings: { id: string; text: string }[] };

export type HubProps = { hub: string; kind: "audience" | "topic"; title: string; introText: string; shortText: string; image: string; links?: { label: string; href: string }[] };
export type Hub = HubProps & { path: string };
export type Author = { id: string; name: string; role: string; bio: string };

export const PER_PAGE = 12;
export const BLOG_PATH = "/blog.html";
export const pagePath = (n: number) => (n <= 1 ? BLOG_PATH : `/blog/page/${n}.html`);

/** Heading ids: lower-case words joined by hyphens (same rule as the MDX h2 component). */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Plain text of a markdown heading line (links, emphasis and code removed). */
export const plainMd = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();

function readArticle(slug: string) {
  const file = path.join(process.cwd(), "content", "blog", `${slug}.mdx`);
  const src = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const headings = [...src.matchAll(/^## (.+)$/gm)].map((m) => {
    const text = plainMd(m[1]);
    return { id: slugify(text), text };
  });
  const prose = src.replace(/^<[\s\S]*?\/>$/gm, " ").replace(/[#*_>`[\]()-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return { headings, minutes: Math.max(2, Math.round(words / 200)) };
}

let postCache: Post[] | null = null;
/** All posts, newest first. */
export function allPosts(): Post[] {
  if (postCache) return postCache;
  postCache = templatedPages()
    .filter((p) => p.family === "blog" && p.sections[0]?.component === "BlogPost")
    .map((p) => {
      const props = p.sections[0].props as PostProps;
      return { ...props, path: p.path, slug: props.article.slug, ...readArticle(props.article.slug) };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  return postCache;
}

export const getPost = (p: string) => allPosts().find((x) => x.path === p);

let hubCache: Hub[] | null = null;
/** Topic and audience hubs, in the order of their page files. */
export function allHubs(): Hub[] {
  if (hubCache) return hubCache;
  const order = ["schools", "housing-societies", "parks", "resorts-commercial"];
  hubCache = routePages()
    .filter((p) => p.type === "blog-hub")
    .map((p) => ({ ...(p.sections![0].props as HubProps), path: p.path }))
    .sort((a, b) => (a.kind === b.kind ? (order.indexOf(a.hub) + 1 || 99) - (order.indexOf(b.hub) + 1 || 99) : a.kind === "audience" ? -1 : 1));
  return hubCache;
}
export const getHub = (id: string) => allHubs().find((h) => h.hub === id);
export const hubPage = (id: string) => routePages().find((p) => p.type === "blog-hub" && (p.sections?.[0]?.props as HubProps)?.hub === id);

export function postsInHub(id: string) {
  const hub = getHub(id);
  if (!hub) return [];
  if (hub.kind === "topic") return allPosts().filter((p) => p.topic === id);
  // audience hubs: posts written mainly for this audience (listed first) come first
  const list = allPosts().filter((p) => p.audiences.includes(id));
  return [...list.filter((p) => p.audiences[0] === id), ...list.filter((p) => p.audiences[0] !== id)];
}

const AUTHORS = authorsJson as Author[];
export function getAuthor(id: string): Author {
  return AUTHORS.find((a) => a.id === id) ?? { id, name: SITE.name, role: "", bio: "" };
}

/** Posts that share the topic first, then an audience, then the newest. */
export function relatedPosts(post: Post, n = 3) {
  const score = (p: Post) => (p.topic === post.topic ? 2 : 0) + (p.audiences.some((a) => post.audiences.includes(a)) ? 1 : 0);
  return allPosts()
    .filter((p) => p.path !== post.path)
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map((x) => x.p);
}

/* ------------------------------------------------------------------ products, series and projects */
export type Card = { path: string; name: string; image: string; label: string };

let cardCache: Map<string, Card & { series?: string }> | null = null;
function cards() {
  if (cardCache) return cardCache;
  cardCache = new Map();
  for (const p of templatedPages()) {
    if (p.family !== "product") continue;
    const pr = (p as PageMeta).schema?.product;
    if (!pr) continue;
    const category = pr.category && !pr.category.startsWith("/") ? pr.category : "";
    cardCache.set(p.path, { path: p.path, name: pr.name, image: pr.images?.[0] ?? "", label: category, series: pr.series });
  }
  for (const p of routePages()) {
    if (p.type === "series" || p.path === "/open-air-gym-equipment-manufacturer-and-supplier-in-india.html" || p.path === "/funplay-originals.html" || p.path === "/nexlev-series.html" || p.path === "/corecraft.html") {
      cardCache.set(p.path, { path: p.path, name: p.h1 || p.seo.title, image: p.data?.cardImage ?? "", label: "Range" });
    }
  }
  const projectPages = new Map(routePages().filter((p) => p.type === "project").map((p) => [p.path, p]));
  for (const g of projectsGrid as { title: string; location: string; image: string; link: string }[]) {
    const page = projectPages.get(g.link);
    const name = page?.schema?.project?.name || g.title;
    const loc = g.location.charAt(0) + g.location.slice(1).toLowerCase();
    cardCache.set(g.link, { path: g.link, name, image: g.image, label: loc.replace(/\b\w/g, (c) => c.toUpperCase()) });
  }
  return cardCache;
}

/** Card data for a product, range or project page. Unknown paths fail the build, so a typo cannot ship. */
export function card(p: string): Card {
  const c = cards().get(p);
  if (!c) throw new Error(`Blog: no product, range or project page at ${p}`);
  return c;
}

/** Posts that link to a page: a product, its range, or a project. */
export function postsLinkingTo(pagePath: string) {
  const c = cards().get(pagePath);
  if (!c) return [];
  return allPosts().filter((p) => p.products.includes(pagePath) || p.projects.includes(pagePath) || (c.series ? p.products.includes(c.series) : false) || (c.label === "Range" && p.products.some((x) => cards().get(x)?.series === pagePath)));
}

/* ------------------------------------------------------------------ dates, schema */
export function fmtDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Structured data of a post: breadcrumb, BlogPosting and FAQ, taken from the post's own fields. */
export function postSchema(page: PageMeta): SchemaData {
  const post = getPost(page.path)!;
  const hub = getHub(post.topic);
  const author = getAuthor(post.author);
  return {
    breadcrumb: [
      ["Home", `${SITE.url}/`],
      ["Blog", `${SITE.url}${BLOG_PATH}`],
      ...(hub ? [[hub.title, SITE.url + hub.path]] : []),
      [post.title, SITE.url + post.path],
    ],
    article: {
      headline: post.title,
      description: page.seo.description,
      image: post.image,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      author: author.name,
      authorRole: author.role,
    },
    faq: post.faq.map((f) => [f.q, f.a]),
  };
}
