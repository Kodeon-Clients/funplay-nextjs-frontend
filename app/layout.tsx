import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Behaviors from "@/components/Behaviors";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  icons: {
    icon: "/images/favicon.png",
    apple: [
      { url: "/images/apple-touch-icon-57x57.png" },
      { url: "/images/apple-touch-icon-72x72.png", sizes: "72x72" },
      { url: "/images/apple-touch-icon-114x114.png", sizes: "114x114" },
    ],
  },
  other: { "geo.region": "IN-MH", "geo.placename": "Vasai, Palghar", ICBM: `${SITE.geo.lat}, ${SITE.geo.lng}` },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-recaptcha={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || undefined}>
      <head>
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE.gtmId}');`}</Script>
      </head>
      <body data-mobile-nav-style="classic">
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${SITE.gtmId}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="Google Tag Manager"></iframe>
        </noscript>
        {children}
        <Behaviors />
      </body>
    </html>
  );
}
