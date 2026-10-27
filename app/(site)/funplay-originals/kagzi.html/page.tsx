import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-kagzi.json";
import KagziOrigamiInspiredPlayStructures, { type KagziOrigamiInspiredPlayStructuresProps } from "@/components/pages/funplay-originals-kagzi/KagziOrigamiInspiredPlayStructures";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-kagzi/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <KagziOrigamiInspiredPlayStructures {...section<KagziOrigamiInspiredPlayStructuresProps>(page, "KagziOrigamiInspiredPlayStructures")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
