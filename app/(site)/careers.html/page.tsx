import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/careers.json";
import CareersAtFunplaySystems, { type CareersAtFunplaySystemsProps } from "@/components/pages/careers/CareersAtFunplaySystems";
import DownSection, { type DownSectionProps } from "@/components/pages/careers/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <CareersAtFunplaySystems {...section<CareersAtFunplaySystemsProps>(page, "CareersAtFunplaySystems")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
