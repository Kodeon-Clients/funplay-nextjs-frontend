import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/products.json";
import PlaygroundAndOutdoorGym, { type PlaygroundAndOutdoorGymProps } from "@/components/pages/products/PlaygroundAndOutdoorGym";
import DownSection, { type DownSectionProps } from "@/components/pages/products/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundAndOutdoorGym {...section<PlaygroundAndOutdoorGymProps>(page, "PlaygroundAndOutdoorGym")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
