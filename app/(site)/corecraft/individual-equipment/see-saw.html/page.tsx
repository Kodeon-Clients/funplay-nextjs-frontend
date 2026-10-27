import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-see-saw.json";
import PlaygroundSeeSaws, { type PlaygroundSeeSawsProps } from "@/components/pages/corecraft-individual-equipment-see-saw/PlaygroundSeeSaws";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-see-saw/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundSeeSaws {...section<PlaygroundSeeSawsProps>(page, "PlaygroundSeeSaws")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
