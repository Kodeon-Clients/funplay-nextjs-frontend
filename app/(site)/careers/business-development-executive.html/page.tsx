import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/careers-business-development-executive.json";
import BusinessDevelopmentExecutive, { type BusinessDevelopmentExecutiveProps } from "@/components/pages/careers-business-development-executive/BusinessDevelopmentExecutive";
import Section5, { type Section5Props } from "@/components/pages/careers-business-development-executive/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <BusinessDevelopmentExecutive {...section<BusinessDevelopmentExecutiveProps>(page, "BusinessDevelopmentExecutive")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
