import type { Metadata } from "next";
import Script from "next/script";
import PageSchema from "@/components/PageSchema";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/school.json";
import Header from "@/components/landing/school/Header";
import DesignJoyfulSpacesThat, { type DesignJoyfulSpacesThatProps } from "@/components/landing/school/DesignJoyfulSpacesThat";
import Footer, { type FooterProps } from "@/components/landing/school/Footer";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

/** Paid-ads landing page with its own header, footer and styles. */
export default function Page() {
  return (
    <>
      <link rel="stylesheet" href="/css/campaign.css" precedence="landing" />
      <link rel="stylesheet" href="/css/standalone-tw.css" precedence="landing" />
      <link rel="stylesheet" href="/css/pages/school-1.css" precedence="landing" />
      <Header />
      <DesignJoyfulSpacesThat {...section<DesignJoyfulSpacesThatProps>(page, "DesignJoyfulSpacesThat")} />
      <Footer {...section<FooterProps>(page, "Footer")} />
      <Script src="/js/campaign-lp.js" strategy="afterInteractive" />
      <PageSchema page={page} />
    </>
  );
}
