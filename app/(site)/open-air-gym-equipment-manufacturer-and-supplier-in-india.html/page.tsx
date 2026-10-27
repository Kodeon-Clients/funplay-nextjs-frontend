import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india.json";
import OpenAirGymEquipment, { type OpenAirGymEquipmentProps } from "@/components/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india/OpenAirGymEquipment";
import OutdoorGymEquipmentManufacturer, { type OutdoorGymEquipmentManufacturerProps } from "@/components/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india/OutdoorGymEquipmentManufacturer";
import HowWouldYouLike, { type HowWouldYouLikeProps } from "@/components/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india/HowWouldYouLike";
import TopFactorsWhichMake, { type TopFactorsWhichMakeProps } from "@/components/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india/TopFactorsWhichMake";
import ContactUs, { type ContactUsProps } from "@/components/pages/open-air-gym-equipment-manufacturer-and-supplier-in-india/ContactUs";
import OurNetwork, { type OurNetworkProps } from "@/components/shared/OurNetwork";
import PlaygroundEquipmentSuppliersNear, { type PlaygroundEquipmentSuppliersNearProps } from "@/components/shared/PlaygroundEquipmentSuppliersNear";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <OpenAirGymEquipment {...section<OpenAirGymEquipmentProps>(page, "OpenAirGymEquipment")} />
      <OutdoorGymEquipmentManufacturer {...section<OutdoorGymEquipmentManufacturerProps>(page, "OutdoorGymEquipmentManufacturer")} />
      <HowWouldYouLike {...section<HowWouldYouLikeProps>(page, "HowWouldYouLike")} />
      <TopFactorsWhichMake {...section<TopFactorsWhichMakeProps>(page, "TopFactorsWhichMake")} />
      <ContactUs {...section<ContactUsProps>(page, "ContactUs")} />
      <OurNetwork {...sharedSection<OurNetworkProps>("OurNetwork")} />
      <PlaygroundEquipmentSuppliersNear {...sharedSection<PlaygroundEquipmentSuppliersNearProps>("PlaygroundEquipmentSuppliersNear")} />
    </PageShell>
  );
}
