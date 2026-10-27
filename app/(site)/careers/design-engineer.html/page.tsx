import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/careers-design-engineer.json";
import DesignEngineer, { type DesignEngineerProps } from "@/components/pages/careers-design-engineer/DesignEngineer";
import Section5, { type Section5Props } from "@/components/pages/careers-design-engineer/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <DesignEngineer {...section<DesignEngineerProps>(page, "DesignEngineer")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
