import { sitemapIndex, xmlHeaders } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return new Response(sitemapIndex(), { headers: xmlHeaders });
}
