import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/gallery.json";
import PlaygroundInstallationGallery, { type PlaygroundInstallationGalleryProps } from "@/components/pages/gallery/PlaygroundInstallationGallery";
import DownSection, { type DownSectionProps } from "@/components/pages/gallery/DownSection";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PlaygroundInstallationGallery {...section<PlaygroundInstallationGalleryProps>(page, "PlaygroundInstallationGallery")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
    </PageShell>
  );
}
