import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/thankyou.json";
import ThankYouContainer2, { type ThankYouContainer2Props } from "@/components/pages/thankyou/ThankYouContainer2";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ThankYouContainer2 {...section<ThankYouContainer2Props>(page, "ThankYouContainer2")} />
    </PageShell>
  );
}
