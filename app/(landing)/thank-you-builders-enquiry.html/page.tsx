import type { Metadata } from "next";
import Script from "next/script";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/thank-you-builders-enquiry.json";
import PlayThankYou, { type PlayThankYouProps } from "@/components/landing/play/PlayThankYou";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

/** Thank-you page of the builders, after the enquiry form landing page (conversion page for Google Ads and GA4). Not indexed. */
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/css/pages/play-lp.css" precedence="landing" />
      <PlayThankYou {...section<PlayThankYouProps>(page, "PlayThankYou")} />
      <Script src="/js/play-lp.js" strategy="afterInteractive" />
    </>
  );
}
