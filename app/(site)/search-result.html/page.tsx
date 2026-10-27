import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/search-result.json";
import NoProductFound, { type NoProductFoundProps } from "@/components/pages/search-result/NoProductFound";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NoProductFound {...section<NoProductFoundProps>(page, "NoProductFound")} />
    </PageShell>
  );
}
