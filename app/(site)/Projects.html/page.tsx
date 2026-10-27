import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/projects.json";
import OurPlaygroundInstallationProjects, { type OurPlaygroundInstallationProjectsProps } from "@/components/pages/projects/OurPlaygroundInstallationProjects";
import Section5 from "@/components/pages/projects/Section5";
import DownSection, { type DownSectionProps } from "@/components/pages/projects/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <OurPlaygroundInstallationProjects {...section<OurPlaygroundInstallationProjectsProps>(page, "OurPlaygroundInstallationProjects")} />
      <Section5 />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
