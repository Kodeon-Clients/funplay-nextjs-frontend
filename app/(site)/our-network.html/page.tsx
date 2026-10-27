import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/our-network.json";
import PlaygroundEquipmentSupplierAcross, { type PlaygroundEquipmentSupplierAcrossProps } from "@/components/pages/our-network/PlaygroundEquipmentSupplierAcross";
import OurLocationsAcrossIndia, { type OurLocationsAcrossIndiaProps } from "@/components/pages/our-network/OurLocationsAcrossIndia";
import PlaygroundEquipmentSuppliersBy, { type PlaygroundEquipmentSuppliersByProps } from "@/components/pages/our-network/PlaygroundEquipmentSuppliersBy";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundEquipmentSupplierAcross {...section<PlaygroundEquipmentSupplierAcrossProps>(page, "PlaygroundEquipmentSupplierAcross")} />
      <OurLocationsAcrossIndia {...section<OurLocationsAcrossIndiaProps>(page, "OurLocationsAcrossIndia")} />
      <PlaygroundEquipmentSuppliersBy {...section<PlaygroundEquipmentSuppliersByProps>(page, "PlaygroundEquipmentSuppliersBy")} />
    </PageShell>
  );
}
