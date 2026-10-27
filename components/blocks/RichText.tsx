import Blocks, { type Block } from "@/components/ui/Blocks";

/** A section of new copy (paragraphs, lists, links), styled with the theme's own classes. */
export default function RichText({ content, heading, className = "pt-0" }: { content: Block[]; heading?: string; className?: string }) {
  return (
    <section className={`fp-rich-text ${className}`}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10 last-paragraph-no-margin">
            {heading ? <h2 className="alt-font fw-600 text-dark-gray fs-32 mb-20px">{heading}</h2> : null}
            <Blocks content={content} />
          </div>
        </div>
      </div>
    </section>
  );
}
