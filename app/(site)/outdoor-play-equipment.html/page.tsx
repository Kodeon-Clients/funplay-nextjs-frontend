import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/outdoor-play-equipment.json";
import HeroSection, { type HeroSectionProps } from "@/components/pages/outdoor-play-equipment/HeroSection";
import Section5, { type Section5Props } from "@/components/pages/outdoor-play-equipment/Section5";
import AboutUs, { type AboutUsProps } from "@/components/pages/outdoor-play-equipment/AboutUs";
import DownSection, { type DownSectionProps } from "@/components/pages/outdoor-play-equipment/DownSection";
import Products, { type ProductsProps } from "@/components/pages/outdoor-play-equipment/Products";
import WhatTheySayAbout, { type WhatTheySayAboutProps } from "@/components/pages/outdoor-play-equipment/WhatTheySayAbout";
import WhyChooseUs, { type WhyChooseUsProps } from "@/components/pages/outdoor-play-equipment/WhyChooseUs";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <HeroSection {...section<HeroSectionProps>(page, "HeroSection")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <AboutUs {...section<AboutUsProps>(page, "AboutUs")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
      <Products {...section<ProductsProps>(page, "Products")} />
      <WhatTheySayAbout {...section<WhatTheySayAboutProps>(page, "WhatTheySayAbout")} />
      <WhyChooseUs {...section<WhyChooseUsProps>(page, "WhyChooseUs")} />
    </PageShell>
  );
}
