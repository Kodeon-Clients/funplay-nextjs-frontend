import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-forestia.json";
import ForestiaJungleThemedPlaygroundEquipment, { type ForestiaJungleThemedPlaygroundEquipmentProps } from "@/components/pages/corecraft-forestia/ForestiaJungleThemedPlaygroundEquipment";
import Section5, { type Section5Props } from "@/components/pages/corecraft-forestia/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ForestiaJungleThemedPlaygroundEquipment {...section<ForestiaJungleThemedPlaygroundEquipmentProps>(page, "ForestiaJungleThemedPlaygroundEquipment")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
