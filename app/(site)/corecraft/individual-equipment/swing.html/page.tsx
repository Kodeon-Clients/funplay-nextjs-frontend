import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-swing.json";
import PlaygroundSwingsAndSwing, { type PlaygroundSwingsAndSwingProps } from "@/components/pages/corecraft-individual-equipment-swing/PlaygroundSwingsAndSwing";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-swing/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundSwingsAndSwing {...section<PlaygroundSwingsAndSwingProps>(page, "PlaygroundSwingsAndSwing")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
