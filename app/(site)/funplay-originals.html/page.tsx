import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals.json";
import FunplayOriginalsDesignerPlay, { type FunplayOriginalsDesignerPlayProps } from "@/components/pages/funplay-originals/FunplayOriginalsDesignerPlay";
import DownSection, { type DownSectionProps } from "@/components/pages/funplay-originals/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <FunplayOriginalsDesignerPlay {...section<FunplayOriginalsDesignerPlayProps>(page, "FunplayOriginalsDesignerPlay")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
