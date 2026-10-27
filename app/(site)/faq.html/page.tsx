import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/faq.json";
import PlaygroundEquipmentFaqs, { type PlaygroundEquipmentFaqsProps } from "@/components/pages/faq/PlaygroundEquipmentFaqs";
import Section5, { type Section5Props } from "@/components/pages/faq/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundEquipmentFaqs {...section<PlaygroundEquipmentFaqsProps>(page, "PlaygroundEquipmentFaqs")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
