import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPopup from "@/components/ContactPopup";
import DownloadPopup from "@/components/DownloadPopupLazy";
import PageSchema from "@/components/PageSchema";
import type { PageMeta } from "@/lib/page";

/** Header, main content, footer, enquiry popup and structured data around every site page.
 * A page with its own header or footer (the ads landing page) passes them in. */
export default function PageShell({ page, children, header, footer }: { page: PageMeta; children: React.ReactNode; header?: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <>
      {(page.css ?? []).map((href) => (
        <link rel="stylesheet" href={href} precedence="page" key={href} />
      ))}
      {(page.styles ?? []).map((id) => (
        <link rel="stylesheet" href={`/css/pages/${id}.css`} precedence="page" key={id} />
      ))}
      {header ?? <Header variant={page.header} />}
      <main id="main">{children}</main>
      {footer ?? <Footer />}
      <ContactPopup title={page.popupTitle} />
      {page.path === "/" ? <DownloadPopup /> : null}
      <PageSchema page={page} />
    </>
  );
}
