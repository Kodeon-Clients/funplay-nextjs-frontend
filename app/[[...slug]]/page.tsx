import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPopup from "@/components/ContactPopup";
import DownloadPopup from "@/components/DownloadPopup";
import { getPage, pageStyle, pathToSlug, routedPages, slugToPath } from "@/lib/content";
import { renderBody } from "@/lib/render";
import { buildMetadata, pageJsonLd } from "@/lib/seo";

export const dynamicParams = false;

/** Theme pages that also used the Tailwind CDN; see scripts/build-landing-css.mjs. */
const LANDING = new Set(["/thankyou.html"]);

export function generateStaticParams() {
  // ONLY_PATHS lets a developer build a handful of pages quickly, e.g. ONLY_PATHS="/,/about-us.html"
  const only = process.env.ONLY_PATHS?.split(",").filter(Boolean);
  const pages = routedPages().filter((r) => !only || only.includes(r.path));
  return pages.map((r) => ({ slug: pathToSlug(r.path) }));
}

type Params = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const rec = getPage(slugToPath((await params).slug));
  if (!rec) return {};
  return buildMetadata(rec);
}

export default async function Page({ params }: Params) {
  const rec = getPage(slugToPath((await params).slug));
  if (!rec || !rec.body) notFound();
  const styles = (rec.styles ?? []).map((h) => pageStyle(h)).filter(Boolean);
  return (
    <>
      {(rec.css ?? []).filter((c) => c.startsWith("/css/projects.css") || c.startsWith("/css/campaign.css")).map((href) => (
        <link rel="stylesheet" href={href} precedence="page" key={href} />
      ))}
      {LANDING.has(rec.path) ? <link rel="stylesheet" href="/css/landing-tw.css" precedence="page" /> : null}
      {styles.map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <Header variant={rec.header} />
      <main id="main">{renderBody(rec.body, rec)}</main>
      <Footer />
      <ContactPopup title={rec.data?.popupTitle} />
      {rec.path === "/" ? <DownloadPopup /> : null}
      {pageJsonLd(rec).map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}
