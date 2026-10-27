import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-conceptual.json";
import ConceptualPlayStructures, { type ConceptualPlayStructuresProps } from "@/components/pages/funplay-originals-conceptual/ConceptualPlayStructures";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-conceptual/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ConceptualPlayStructures {...section<ConceptualPlayStructuresProps>(page, "ConceptualPlayStructures")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
