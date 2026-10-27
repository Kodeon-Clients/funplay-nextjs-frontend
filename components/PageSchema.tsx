import { pageJsonLd, type SchemaData } from "@/lib/schema";
import type { PageMeta } from "@/lib/page";

/**
 * JSON-LD for the page. The JSON is serialised with <, > and & escaped as unicode escapes, so the
 * text React writes into the script element is exactly the JSON (no HTML parsing involved).
 */
export default function PageSchema({ page }: { page: PageMeta & { schema?: SchemaData } }) {
  const json = JSON.stringify(pageJsonLd(page)).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  return <script type="application/ld+json">{json}</script>;
}
