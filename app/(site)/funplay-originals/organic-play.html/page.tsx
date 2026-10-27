import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-organic-play.json";
import OrganicPlayNaturePlay, { type OrganicPlayNaturePlayProps } from "@/components/pages/funplay-originals-organic-play/OrganicPlayNaturePlay";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-organic-play/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <OrganicPlayNaturePlay {...section<OrganicPlayNaturePlayProps>(page, "OrganicPlayNaturePlay")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
