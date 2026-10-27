import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-robo-romp.json";
import RoboRompRobotThemedPlayground, { type RoboRompRobotThemedPlaygroundProps } from "@/components/pages/corecraft-robo-romp/RoboRompRobotThemedPlayground";
import Section5, { type Section5Props } from "@/components/pages/corecraft-robo-romp/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <RoboRompRobotThemedPlayground {...section<RoboRompRobotThemedPlaygroundProps>(page, "RoboRompRobotThemedPlayground")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
