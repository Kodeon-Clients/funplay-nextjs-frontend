import parse from "html-react-parser";

/** A section of new copy written in plain HTML, styled with the theme's own classes. */
export default function RichText({ html, heading, className = "pt-0" }: { html: string; heading?: string; className?: string }) {
  return (
    <section className={`fp-rich-text ${className}`}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10 last-paragraph-no-margin">
            {heading ? <h2 className="alt-font fw-600 text-dark-gray fs-32 mb-20px">{heading}</h2> : null}
            {parse(html)}
          </div>
        </div>
      </div>
    </section>
  );
}
