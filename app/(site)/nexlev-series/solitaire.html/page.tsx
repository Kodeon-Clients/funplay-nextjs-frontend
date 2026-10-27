import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-solitaire.json";
import NexlevSolitairePlayTowers, { type NexlevSolitairePlayTowersProps } from "@/components/pages/nexlev-series-solitaire/NexlevSolitairePlayTowers";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-solitaire/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevSolitairePlayTowers {...section<NexlevSolitairePlayTowersProps>(page, "NexlevSolitairePlayTowers")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
