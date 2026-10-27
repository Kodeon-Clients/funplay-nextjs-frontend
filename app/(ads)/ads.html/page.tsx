import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/ads.json";
import HeroSection, { type HeroSectionProps } from "@/components/pages/ads/HeroSection";
import ClienteleSwiper, { type ClienteleSwiperProps } from "@/components/pages/ads/ClienteleSwiper";
import WhatOurClientsSay, { type WhatOurClientsSayProps } from "@/components/pages/ads/WhatOurClientsSay";
import WhyTrustFunplay, { type WhyTrustFunplayProps } from "@/components/pages/ads/WhyTrustFunplay";
import ExploreOurSignaturePlay, { type ExploreOurSignaturePlayProps } from "@/components/pages/ads/ExploreOurSignaturePlay";
import DesignedForEveryKind, { type DesignedForEveryKindProps } from "@/components/pages/ads/DesignedForEveryKind";
import HowWeCanHelp, { type HowWeCanHelpProps } from "@/components/pages/ads/HowWeCanHelp";
import PageHeader from "@/components/pages/ads/PageHeader";
import PageFooter from "@/components/pages/ads/PageFooter";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page} header={<PageHeader />} footer={<PageFooter />}>
      <HeroSection {...section<HeroSectionProps>(page, "HeroSection")} />
      <ClienteleSwiper {...section<ClienteleSwiperProps>(page, "ClienteleSwiper")} />
      <WhatOurClientsSay {...section<WhatOurClientsSayProps>(page, "WhatOurClientsSay")} />
      <WhyTrustFunplay {...section<WhyTrustFunplayProps>(page, "WhyTrustFunplay")} />
      <ExploreOurSignaturePlay {...section<ExploreOurSignaturePlayProps>(page, "ExploreOurSignaturePlay")} />
      <DesignedForEveryKind {...section<DesignedForEveryKindProps>(page, "DesignedForEveryKind")} />
      <HowWeCanHelp {...section<HowWeCanHelpProps>(page, "HowWeCanHelp")} />
    </PageShell>
  );
}
