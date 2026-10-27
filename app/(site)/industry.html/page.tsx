import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/industry.json";
import PlaygroundSolutionsByIndustry, { type PlaygroundSolutionsByIndustryProps } from "@/components/pages/industry/PlaygroundSolutionsByIndustry";
import DownSection, { type DownSectionProps } from "@/components/pages/industry/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundSolutionsByIndustry {...section<PlaygroundSolutionsByIndustryProps>(page, "PlaygroundSolutionsByIndustry")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
