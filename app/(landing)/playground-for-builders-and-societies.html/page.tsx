import type { Metadata } from "next";
import Script from "next/script";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/playground-for-builders-and-societies.json";
import PlayLanding, { type PlayLandingProps } from "@/components/landing/play/PlayLanding";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

/** Paid-ads landing page (builders & housing societies). Not indexed; its own header, footer, styles and script. */
export default function Page() {
  return (
    <>
      <link rel="preload" as="image" href={section<PlayLandingProps>(page, "PlayLanding").hero.image}/>
      <link rel="stylesheet" href="/css/pages/play-lp.css" precedence="landing" />
      <PlayLanding {...section<PlayLandingProps>(page, "PlayLanding")} />
      <Script src="/js/play-lp.js" strategy="afterInteractive" />
    </>
  );
}
