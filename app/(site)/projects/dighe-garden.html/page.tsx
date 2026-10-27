import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/projects-dighe-garden.json";
import DigheGarden, { type DigheGardenProps } from "@/components/pages/projects-dighe-garden/DigheGarden";
import Section5, { type Section5Props } from "@/components/pages/projects-dighe-garden/Section5";
import Section6, { type Section6Props } from "@/components/pages/projects-dighe-garden/Section6";
import Section, { type SectionProps } from "@/components/shared/Section";
import Section2, { type Section2Props } from "@/components/shared/Section2";
import Section3, { type Section3Props } from "@/components/shared/Section3";
import QuoteFormWrapperMobile, { type QuoteFormWrapperMobileProps } from "@/components/shared/QuoteFormWrapperMobile";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <DigheGarden {...section<DigheGardenProps>(page, "DigheGarden")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <Section6 {...section<Section6Props>(page, "Section6")} />
      <Section {...sharedSection<SectionProps>("Section")} />
      <Section2 {...sharedSection<Section2Props>("Section2")} />
      <Section3 {...sharedSection<Section3Props>("Section3")} />
      <QuoteFormWrapperMobile {...sharedSection<QuoteFormWrapperMobileProps>("QuoteFormWrapperMobile")} />
    </PageShell>
  );
}
