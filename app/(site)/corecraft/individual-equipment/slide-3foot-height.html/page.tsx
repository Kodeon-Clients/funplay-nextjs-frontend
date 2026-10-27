import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-slide-3foot-height.json";
import FtPlaygroundSlides, { type FtPlaygroundSlidesProps } from "@/components/pages/corecraft-individual-equipment-slide-3foot-height/FtPlaygroundSlides";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-slide-3foot-height/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <FtPlaygroundSlides {...section<FtPlaygroundSlidesProps>(page, "FtPlaygroundSlides")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
