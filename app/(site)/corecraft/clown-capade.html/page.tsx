import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/corecraft-clown-capade.json";
import ClownCapadeCircusThemedPlayground, { type ClownCapadeCircusThemedPlaygroundProps } from "@/components/pages/corecraft-clown-capade/ClownCapadeCircusThemedPlayground";
import Section5, { type Section5Props } from "@/components/pages/corecraft-clown-capade/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ClownCapadeCircusThemedPlayground {...section<ClownCapadeCircusThemedPlaygroundProps>(page, "ClownCapadeCircusThemedPlayground")} />
      <Section5 {...section<Section5Props>(page, "Section5")} />
    </PageShell>
  );
}
