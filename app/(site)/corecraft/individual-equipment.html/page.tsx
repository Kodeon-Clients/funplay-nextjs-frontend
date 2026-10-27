import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-individual-equipment.json";
import IndividualPlaygroundEquipment, { type IndividualPlaygroundEquipmentProps } from "@/components/pages/corecraft-individual-equipment/IndividualPlaygroundEquipment";
import DownSection, { type DownSectionProps } from "@/components/pages/corecraft-individual-equipment/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <IndividualPlaygroundEquipment {...section<IndividualPlaygroundEquipmentProps>(page, "IndividualPlaygroundEquipment")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
