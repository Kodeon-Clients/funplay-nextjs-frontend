import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/nexlev-series.json";
import NexlevSeriesWoodenPlay, { type NexlevSeriesWoodenPlayProps } from "@/components/pages/nexlev-series/NexlevSeriesWoodenPlay";
import DownSection, { type DownSectionProps } from "@/components/pages/nexlev-series/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <NexlevSeriesWoodenPlay {...section<NexlevSeriesWoodenPlayProps>(page, "NexlevSeriesWoodenPlay")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
