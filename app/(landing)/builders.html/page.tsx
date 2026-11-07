import type { Metadata } from "next";
import Script from "next/script";
import PageSchema from "@/components/PageSchema";
import HeroPreload from "@/components/HeroPreload";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/builders.json";
import Header from "@/components/landing/builders/Header";
import CreateIconicCommunitiesWith, { type CreateIconicCommunitiesWithProps } from "@/components/landing/builders/CreateIconicCommunitiesWith";
import Footer, { type FooterProps } from "@/components/landing/builders/Footer";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

/** Paid-ads landing page with its own header, footer and styles. */
export default function Page() {
  return (
    <>
      {/* banner: the .box background in /css/campaign.css */}
      <HeroPreload src="/images/campaign/banners/funplay-banner.webp" selector=".box" />
      <link rel="stylesheet" href="/css/campaign.css" precedence="landing" />
      <link rel="stylesheet" href="/css/standalone-tw.css" precedence="landing" />
      <link rel="stylesheet" href="/css/pages/builders-1.css" precedence="landing" />
      <Header />
      <CreateIconicCommunitiesWith {...section<CreateIconicCommunitiesWithProps>(page, "CreateIconicCommunitiesWith")} />
      <Footer {...section<FooterProps>(page, "Footer")} />
      <Script src="/js/campaign-lp.js" strategy="afterInteractive" />
      <PageSchema page={page} />
    </>
  );
}
