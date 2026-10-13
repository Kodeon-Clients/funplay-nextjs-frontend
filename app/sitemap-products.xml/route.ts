import { urlset, xmlHeaders } from "@/lib/sitemap";

export const dynamic = "force-static";

export function GET() {
  return new Response(urlset("products"), { headers: xmlHeaders });
}
