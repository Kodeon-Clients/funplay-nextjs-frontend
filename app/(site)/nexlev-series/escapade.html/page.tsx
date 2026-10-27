import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-escapade.json";
import NexlevEscapadeAdventurePlay, { type NexlevEscapadeAdventurePlayProps } from "@/components/pages/nexlev-series-escapade/NexlevEscapadeAdventurePlay";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-escapade/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevEscapadeAdventurePlay {...section<NexlevEscapadeAdventurePlayProps>(page, "NexlevEscapadeAdventurePlay")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
