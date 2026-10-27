import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-castle.json";
import NexlevWoodenCastlePlaygrounds, { type NexlevWoodenCastlePlaygroundsProps } from "@/components/pages/nexlev-series-castle/NexlevWoodenCastlePlaygrounds";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-castle/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevWoodenCastlePlaygrounds {...section<NexlevWoodenCastlePlaygroundsProps>(page, "NexlevWoodenCastlePlaygrounds")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
