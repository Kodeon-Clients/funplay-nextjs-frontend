import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-spring-rider.json";
import PlaygroundSpringRiders, { type PlaygroundSpringRidersProps } from "@/components/pages/corecraft-individual-equipment-spring-rider/PlaygroundSpringRiders";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-spring-rider/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundSpringRiders {...section<PlaygroundSpringRidersProps>(page, "PlaygroundSpringRiders")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
