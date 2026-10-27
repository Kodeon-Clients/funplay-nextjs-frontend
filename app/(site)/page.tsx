import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/home.json";
import OutdoorPlaygroundEquipmentManufacturer, { type OutdoorPlaygroundEquipmentManufacturerProps } from "@/components/pages/home/OutdoorPlaygroundEquipmentManufacturer";
import Section5, { type Section5Props } from "@/components/pages/home/Section5";
import Section6, { type Section6Props } from "@/components/pages/home/Section6";
import Section7, { type Section7Props } from "@/components/pages/home/Section7";
import Section8, { type Section8Props } from "@/components/pages/home/Section8";
import Section9, { type Section9Props } from "@/components/pages/home/Section9";
import Section10, { type Section10Props } from "@/components/pages/home/Section10";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <OutdoorPlaygroundEquipmentManufacturer {...section<OutdoorPlaygroundEquipmentManufacturerProps>(page, "OutdoorPlaygroundEquipmentManufacturer")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <Section6 {...section<Section6Props>(page, "Section6")} />
      <Section7 {...section<Section7Props>(page, "Section7")} />
      <Section8 {...section<Section8Props>(page, "Section8")} />
      <Section9 {...section<Section9Props>(page, "Section9")} />
      <Section10 {...section<Section10Props>(page, "Section10")} />
    </PageShell>
  );
}
