import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/about-us.json";
import AboutFunplaySystemsPlayground, { type AboutFunplaySystemsPlaygroundProps } from "@/components/pages/about-us/AboutFunplaySystemsPlayground";
import DownSection, { type DownSectionProps } from "@/components/pages/about-us/DownSection";
import Section5, { type Section5Props } from "@/components/pages/about-us/Section5";
import Section6, { type Section6Props } from "@/components/pages/about-us/Section6";
import ObjectFitContain, { type ObjectFitContainProps } from "@/components/pages/about-us/ObjectFitContain";
import Section7, { type Section7Props } from "@/components/pages/about-us/Section7";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <AboutFunplaySystemsPlayground {...section<AboutFunplaySystemsPlaygroundProps>(page, "AboutFunplaySystemsPlayground")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
      <Section6 {...section<Section6Props>(page, "Section6")} />
      <ObjectFitContain {...section<ObjectFitContainProps>(page, "ObjectFitContain")} />
      <Section7 {...section<Section7Props>(page, "Section7")} />
    </PageShell>
  );
}
