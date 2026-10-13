import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactPopup from "@/components/ContactPopup";
import { getPage } from "@/lib/content";
import { renderBody } from "@/lib/render";

export const metadata = { title: "Page not found | FunPlay Systems", robots: { index: false, follow: true } };

/** 404 page: reuses the original 404 design from content (404.html). */
export default function NotFound() {
  const rec = getPage("/404.html");
  return (
    <>
      <Header variant={rec?.header} />
      <main id="main">
        {rec?.body ? renderBody(rec.body, rec) : (
          <section className="text-center"><div className="container"><h1>Page not found</h1><p><a href="/">Go to the homepage</a></p></div></section>
        )}
      </main>
      <Footer />
      <ContactPopup />
    </>
  );
}
