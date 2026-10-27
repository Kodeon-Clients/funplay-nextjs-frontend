import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-castle-crest.json";
import CastleCrestCastleThemedPlayground, { type CastleCrestCastleThemedPlaygroundProps } from "@/components/pages/corecraft-castle-crest/CastleCrestCastleThemedPlayground";
import Section5, { type Section5Props } from "@/components/pages/corecraft-castle-crest/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <CastleCrestCastleThemedPlayground {...section<CastleCrestCastleThemedPlaygroundProps>(page, "CastleCrestCastleThemedPlayground")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
