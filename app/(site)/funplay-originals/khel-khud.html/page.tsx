import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-khel-khud.json";
import KhelKhudIndianGamesInspired, { type KhelKhudIndianGamesInspiredProps } from "@/components/pages/funplay-originals-khel-khud/KhelKhudIndianGamesInspired";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-khel-khud/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <KhelKhudIndianGamesInspired {...section<KhelKhudIndianGamesInspiredProps>(page, "KhelKhudIndianGamesInspired")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
