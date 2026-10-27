import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/funplay-originals-timeless-play.json";
import TimelessPlayStructures, { type TimelessPlayStructuresProps } from "@/components/pages/funplay-originals-timeless-play/TimelessPlayStructures";
import Section5, { type Section5Props } from "@/components/pages/funplay-originals-timeless-play/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <TimelessPlayStructures {...section<TimelessPlayStructuresProps>(page, "TimelessPlayStructures")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
