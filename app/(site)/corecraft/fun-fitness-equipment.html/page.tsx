import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-fun-fitness-equipment.json";
import OutdoorGymEquipmentFun, { type OutdoorGymEquipmentFunProps } from "@/components/pages/corecraft-fun-fitness-equipment/OutdoorGymEquipmentFun";
import Section5, { type Section5Props } from "@/components/pages/corecraft-fun-fitness-equipment/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <OutdoorGymEquipmentFun {...section<OutdoorGymEquipmentFunProps>(page, "OutdoorGymEquipmentFun")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
