import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/blog.json";
import PlaygroundDesignAndBuying, { type PlaygroundDesignAndBuyingProps } from "@/components/pages/blog/PlaygroundDesignAndBuying";
import DownSection, { type DownSectionProps } from "@/components/pages/blog/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundDesignAndBuying {...section<PlaygroundDesignAndBuyingProps>(page, "PlaygroundDesignAndBuying")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
