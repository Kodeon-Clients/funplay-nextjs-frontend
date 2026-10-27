import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series-woody.json";
import NexlevWoodyWoodenPlayground, { type NexlevWoodyWoodenPlaygroundProps } from "@/components/pages/nexlev-series-woody/NexlevWoodyWoodenPlayground";
import Section5, { type Section5Props } from "@/components/pages/nexlev-series-woody/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevWoodyWoodenPlayground {...section<NexlevWoodyWoodenPlaygroundProps>(page, "NexlevWoodyWoodenPlayground")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
