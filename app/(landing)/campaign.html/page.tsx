import type { Metadata } from "next";
import Script from "next/script";
import PageSchema from "@/components/PageSchema";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/campaign.json";
import ItemsCenter, { type ItemsCenterProps } from "@/components/landing/campaign/ItemsCenter";
import Relative, { type RelativeProps } from "@/components/landing/campaign/Relative";
import ClienteleSwiper, { type ClienteleSwiperProps } from "@/components/landing/campaign/ClienteleSwiper";
import Relative2, { type Relative2Props } from "@/components/landing/campaign/Relative2";
import WhyUs, { type WhyUsProps } from "@/components/landing/campaign/WhyUs";
import Products, { type ProductsProps } from "@/components/landing/campaign/Products";
import DesignedForEveryKind, { type DesignedForEveryKindProps } from "@/components/landing/campaign/DesignedForEveryKind";
import QuoteForm, { type QuoteFormProps } from "@/components/landing/campaign/QuoteForm";
import QuickLinks, { type QuickLinksProps } from "@/components/landing/campaign/QuickLinks";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

/** Paid-ads landing page with its own header, footer and styles. */
export default function Page() {
  return (
    <div className="tracking-wide antialiased">
      <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" precedence="landing" />
      <link rel="stylesheet" href="/css/swiper-bundle.min.css" precedence="landing" />
      <link rel="stylesheet" href="/css/standalone-tw.css" precedence="landing" />
      <link rel="stylesheet" href="/css/vendors.min.css" precedence="landing" />
      <link rel="stylesheet" href="/css/pages/campaign-1.css" precedence="landing" />
      <link rel="stylesheet" href="/css/pages/campaign-2.css" precedence="landing" />
      <link rel="stylesheet" href="/css/pages/campaign-3.css" precedence="landing" />
      <main>
      <ItemsCenter {...section<ItemsCenterProps>(page, "ItemsCenter")} />
      <Relative {...section<RelativeProps>(page, "Relative")} />
      <ClienteleSwiper {...section<ClienteleSwiperProps>(page, "ClienteleSwiper")} />
      <Relative2 {...section<Relative2Props>(page, "Relative2")} />
      <WhyUs {...section<WhyUsProps>(page, "WhyUs")} />
      <Products {...section<ProductsProps>(page, "Products")} />
      <DesignedForEveryKind {...section<DesignedForEveryKindProps>(page, "DesignedForEveryKind")} />
      <QuoteForm {...section<QuoteFormProps>(page, "QuoteForm")} />
      <QuickLinks {...section<QuickLinksProps>(page, "QuickLinks")} />
      </main>
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="/js/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script src="/js/standalone-forms.js" strategy="afterInteractive" />
      <Script src="/js/campaign-page.js" strategy="afterInteractive" />
      <PageSchema page={page} />
    </div>
  );
}
