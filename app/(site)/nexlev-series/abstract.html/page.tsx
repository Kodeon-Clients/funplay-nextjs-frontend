import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-abstract.json";
import NexlevAbstractPlayStructures, { type NexlevAbstractPlayStructuresProps } from "@/components/pages/nexlev-series-abstract/NexlevAbstractPlayStructures";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-abstract/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevAbstractPlayStructures {...section<NexlevAbstractPlayStructuresProps>(page, "NexlevAbstractPlayStructures")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
