import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-wall-play.json";
import WallPlayInteractivePanels, { type WallPlayInteractivePanelsProps } from "@/components/pages/funplay-originals-wall-play/WallPlayInteractivePanels";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-wall-play/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <WallPlayInteractivePanels {...section<WallPlayInteractivePanelsProps>(page, "WallPlayInteractivePanels")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
