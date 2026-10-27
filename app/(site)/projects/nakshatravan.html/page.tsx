import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/projects-nakshatravan.json";
import Nakshatravan, { type NakshatravanProps } from "@/components/pages/projects-nakshatravan/Nakshatravan";
import Section5, { type Section5Props } from "@/components/pages/projects-nakshatravan/Section5";
import Section4, { type Section4Props } from "@/components/shared/Section4";
import Section, { type SectionProps } from "@/components/shared/Section";
import Section2, { type Section2Props } from "@/components/shared/Section2";
import Section3, { type Section3Props } from "@/components/shared/Section3";
import QuoteFormWrapperMobile, { type QuoteFormWrapperMobileProps } from "@/components/shared/QuoteFormWrapperMobile";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <Nakshatravan {...section<NakshatravanProps>(page, "Nakshatravan")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <Section4 {...sharedSection<Section4Props>("Section4")} />
      <Section {...sharedSection<SectionProps>("Section")} />
      <Section2 {...sharedSection<Section2Props>("Section2")} />
      <Section3 {...sharedSection<Section3Props>("Section3")} />
      <QuoteFormWrapperMobile {...sharedSection<QuoteFormWrapperMobileProps>("QuoteFormWrapperMobile")} />
    </PageShell>
  );
}
