import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-play-lands.json";
import PlayLandsLargeMulti, { type PlayLandsLargeMultiProps } from "@/components/pages/corecraft-play-lands/PlayLandsLargeMulti";
import Section5, { type Section5Props } from "@/components/pages/corecraft-play-lands/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlayLandsLargeMulti {...section<PlayLandsLargeMultiProps>(page, "PlayLandsLargeMulti")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
