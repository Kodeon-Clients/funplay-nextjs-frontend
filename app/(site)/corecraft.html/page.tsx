import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft.json";
import CorecraftPlaygroundEquipment, { type CorecraftPlaygroundEquipmentProps } from "@/components/pages/corecraft/CorecraftPlaygroundEquipment";
import DownSection, { type DownSectionProps } from "@/components/pages/corecraft/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <CorecraftPlaygroundEquipment {...section<CorecraftPlaygroundEquipmentProps>(page, "CorecraftPlaygroundEquipment")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
