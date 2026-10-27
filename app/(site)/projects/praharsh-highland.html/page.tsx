import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/projects-praharsh-highland.json";
import PraharshHighland, { type PraharshHighlandProps } from "@/components/pages/projects-praharsh-highland/PraharshHighland";
import Section5, { type Section5Props } from "@/components/pages/projects-praharsh-highland/Section5";
import Section6, { type Section6Props } from "@/components/pages/projects-praharsh-highland/Section6";
import Section, { type SectionProps } from "@/components/shared/Section";
import Section2, { type Section2Props } from "@/components/shared/Section2";
import Section3, { type Section3Props } from "@/components/shared/Section3";
import QuoteFormWrapperMobile, { type QuoteFormWrapperMobileProps } from "@/components/shared/QuoteFormWrapperMobile";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PraharshHighland {...section<PraharshHighlandProps>(page, "PraharshHighland")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <Section6 {...section<Section6Props>(page, "Section6")} />
      <Section {...sharedSection<SectionProps>("Section")} />
      <Section2 {...sharedSection<Section2Props>("Section2")} />
      <Section3 {...sharedSection<Section3Props>("Section3")} />
      <QuoteFormWrapperMobile {...sharedSection<QuoteFormWrapperMobileProps>("QuoteFormWrapperMobile")} />
    </PageShell>
  );
}
