import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment-climber.json";
import PlaygroundClimbersAndClimbing, { type PlaygroundClimbersAndClimbingProps } from "@/components/pages/corecraft-individual-equipment-climber/PlaygroundClimbersAndClimbing";
import Section5, { type Section5Props } from "@/components/pages/corecraft-individual-equipment-climber/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundClimbersAndClimbing {...section<PlaygroundClimbersAndClimbingProps>(page, "PlaygroundClimbersAndClimbing")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
