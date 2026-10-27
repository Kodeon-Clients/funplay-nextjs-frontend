import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-merry-go-round.json";
import PlaygroundMerryGoRounds, { type PlaygroundMerryGoRoundsProps } from "@/components/pages/corecraft-individual-equipment-merry-go-round/PlaygroundMerryGoRounds";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-merry-go-round/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundMerryGoRounds {...section<PlaygroundMerryGoRoundsProps>(page, "PlaygroundMerryGoRounds")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
