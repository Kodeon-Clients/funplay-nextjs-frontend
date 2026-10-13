import { renderedPages, type PageRecord } from "./content";
import { SITE } from "./site";

export type SitemapGroup = "pages" | "products" | "blog" | "locations";

const EXCLUDE = new Set(["/search-result.html", "/thank-you.html", "/thankyou.html", "/thank-you-lp.html", "/thank-you-campaign.html", "/404.html", "/generic.html", "/ads.html", "/campaign.html"]);

export function indexable(r: PageRecord) {
  if (EXCLUDE.has(r.path)) return false;
  if (/noindex/i.test(r.seo?.robots || "")) return false;
  const canon = r.seo?.canonical;
  if (canon && canon.replace(SITE.url, "") !== r.path && !(r.path === "/" && canon === SITE.url + "/")) return false;
  return true;
}

export function groupOf(r: PageRecord): SitemapGroup {
  if (r.type === "product" || r.type === "series") return "products";
  if (r.type === "blog") return "blog";
  if (r.type === "city-gym" || r.type === "city-playground") return "locations";
  return "pages";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
}

export function urlset(group: SitemapGroup) {
  const today = new Date().toISOString().slice(0, 10);
  const items = renderedPages().filter((r) => indexable(r) && groupOf(r) === group);
  const body = items
    .map((r) => {
      const loc = SITE.url + encodeURI(r.path);
      const img = r.data?.image || r.data?.cardImage;
      const imgXml = img ? `<image:image><image:loc>${esc(SITE.url + encodeURI(img))}</image:loc></image:image>` : "";
      return `<url><loc>${esc(loc)}</loc><lastmod>${today}</lastmod>${imgXml}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;
}

export function sitemapIndex() {
  const today = new Date().toISOString().slice(0, 10);
  const groups: SitemapGroup[] = ["pages", "products", "blog", "locations"];
  const body = groups.map((g) => `<sitemap><loc>${SITE.url}/sitemap-${g}.xml</loc><lastmod>${today}</lastmod></sitemap>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export const xmlHeaders = { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" };
