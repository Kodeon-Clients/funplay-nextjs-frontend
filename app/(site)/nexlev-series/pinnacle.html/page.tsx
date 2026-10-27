import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-pinnacle.json";
import NexlevPinnacleTepeePlay, { type NexlevPinnacleTepeePlayProps } from "@/components/pages/nexlev-series-pinnacle/NexlevPinnacleTepeePlay";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-pinnacle/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevPinnacleTepeePlay {...section<NexlevPinnacleTepeePlayProps>(page, "NexlevPinnacleTepeePlay")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
