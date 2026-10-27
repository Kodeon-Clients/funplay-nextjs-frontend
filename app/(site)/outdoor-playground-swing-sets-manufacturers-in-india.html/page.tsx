import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/outdoor-playground-swing-sets-manufacturers-in-india.json";
import Section5, { type Section5Props } from "@/components/pages/outdoor-playground-swing-sets-manufacturers-in-india/Section5";
import OutdoorPlaygroundSwingSets, { type OutdoorPlaygroundSwingSetsProps } from "@/components/pages/outdoor-playground-swing-sets-manufacturers-in-india/OutdoorPlaygroundSwingSets";
import Section6, { type Section6Props } from "@/components/pages/outdoor-playground-swing-sets-manufacturers-in-india/Section6";
import TopFactorsWhichMake, { type TopFactorsWhichMakeProps } from "@/components/pages/outdoor-playground-swing-sets-manufacturers-in-india/TopFactorsWhichMake";
import ContactUs, { type ContactUsProps } from "@/components/pages/outdoor-playground-swing-sets-manufacturers-in-india/ContactUs";
import OurNetwork, { type OurNetworkProps } from "@/components/shared/OurNetwork";
import PlaygroundEquipmentSuppliersNear, { type PlaygroundEquipmentSuppliersNearProps } from "@/components/shared/PlaygroundEquipmentSuppliersNear";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <OutdoorPlaygroundSwingSets {...section<OutdoorPlaygroundSwingSetsProps>(page, "OutdoorPlaygroundSwingSets")} />
      <Section6 {...section<Section6Props>(page, "Section6")} />
      <TopFactorsWhichMake {...section<TopFactorsWhichMakeProps>(page, "TopFactorsWhichMake")} />
      <ContactUs {...section<ContactUsProps>(page, "ContactUs")} />
      <OurNetwork {...sharedSection<OurNetworkProps>("OurNetwork")} />
      <PlaygroundEquipmentSuppliersNear {...sharedSection<PlaygroundEquipmentSuppliersNearProps>("PlaygroundEquipmentSuppliersNear")} />
    </PageShell>
  );
}
