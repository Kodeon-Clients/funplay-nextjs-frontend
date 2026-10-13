import { renderedPages } from "@/lib/content";
import { indexable } from "@/lib/sitemap";

export const dynamic = "force-static";

/** Small index used by the header search box and the search results page. */
export function GET() {
  const rank: Record<string, number> = { product: 0, series: 1, page: 2, home: 2, blog: 3, project: 4, career: 5, "city-playground": 6, "city-gym": 7 };
  const items = renderedPages()
    .filter((r) => indexable(r))
    .sort((a, b) => (rank[a.type] ?? 9) - (rank[b.type] ?? 9))
    .map((r) => ({
      t: (r.type === "product" ? r.data?.name : r.h1) || r.seo?.title?.split("|")[0].trim() || r.path,
      u: r.path,
      k: [r.type, r.data?.breadcrumb?.slice(2, -1).join(" "), r.seo?.description?.slice(0, 90)].filter(Boolean).join(" "),
      i: r.type === "product" ? r.data?.image : undefined,
    }));
  return Response.json(items, { headers: { "Cache-Control": "public, max-age=3600" } });
}
