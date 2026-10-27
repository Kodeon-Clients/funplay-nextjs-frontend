import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-garden-decor.json";
import GardenDecorBenchesGazebos, { type GardenDecorBenchesGazebosProps } from "@/components/pages/corecraft-garden-decor/GardenDecorBenchesGazebos";
import Section5, { type Section5Props } from "@/components/pages/corecraft-garden-decor/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <GardenDecorBenchesGazebos {...section<GardenDecorBenchesGazebosProps>(page, "GardenDecorBenchesGazebos")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
