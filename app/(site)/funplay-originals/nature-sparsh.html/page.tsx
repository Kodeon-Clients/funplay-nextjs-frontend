import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-nature-sparsh.json";
import NatureSparshNatureInspiredPlay, { type NatureSparshNatureInspiredPlayProps } from "@/components/pages/funplay-originals-nature-sparsh/NatureSparshNatureInspiredPlay";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-nature-sparsh/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NatureSparshNatureInspiredPlay {...section<NatureSparshNatureInspiredPlayProps>(page, "NatureSparshNatureInspiredPlay")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
