import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, sharedSection, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/thank-you-lp.json";
import ThankYouContainer, { type ThankYouContainerProps } from "@/components/shared/ThankYouContainer";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ThankYouContainer {...sharedSection<ThankYouContainerProps>("ThankYouContainer")} />
    </PageShell>
  );
}
