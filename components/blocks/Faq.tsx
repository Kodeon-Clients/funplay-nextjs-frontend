import parse from "html-react-parser";

type Item = { q: string; a: string };

/** FAQ list with matching FAQPage structured data. Answers are short plain-HTML strings. */
export default function Faq({ items, heading = "Frequently asked questions", schema = true, id = "faq" }: { items: Item[]; heading?: string; schema?: boolean; id?: string }) {
  if (!items?.length) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a.replace(/<[^>]+>/g, "") } })),
  };
  return (
    <section className="fp-faq pt-0">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <h2 className="alt-font fw-600 text-dark-gray fs-32 mb-20px">{heading}</h2>
            <div className="accordion accordion-style-02" id={`${id}-accordion`} data-active-icon="icon-feather-chevron-up" data-inactive-icon="icon-feather-chevron-down">
              {items.map((it, n) => (
                <div className={`accordion-item${n === 0 ? " active-accordion" : ""}`} key={n}>
                  <div className="accordion-header border-bottom border-color-extra-medium-gray">
                    <a href="#" data-bs-toggle="collapse" data-bs-target={`#${id}-${n}`} aria-expanded={n === 0} aria-controls={`${id}-${n}`} data-bs-parent={`#${id}-accordion`}>
                      <div className="accordion-title mb-0 position-relative text-dark-gray pe-30px">
                        <i className={`feather ${n === 0 ? "icon-feather-chevron-up" : "icon-feather-chevron-down"} icon-extra-medium`}></i>
                        <h3 className="fw-600 fs-18 d-inline mb-0" style={{ fontSize: 18, lineHeight: "28px" }}>{it.q}</h3>
                      </div>
                    </a>
                  </div>
                  <div id={`${id}-${n}`} className={`accordion-collapse collapse${n === 0 ? " show" : ""}`} data-bs-parent={`#${id}-accordion`}>
                    <div className="accordion-body last-paragraph-no-margin pt-15px pb-15px">{parse(it.a.startsWith("<") ? it.a : `<p>${it.a}</p>`)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null}
    </section>
  );
}
