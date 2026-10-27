import type React from "react";

export type ProductDescriptionProps = { h2Class: React.ComponentProps<"h2">["className"]; items: { pClass?: React.ComponentProps<"p">["className"]; pText: string }[] };

/** 247 product pages, e.g. /corecraft/castle-crest/crown-court-3.html */
export default function ProductDescription(p: ProductDescriptionProps) {
  return (
    <section className="pb-50"><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h2 className={p.h2Class}>Description<span className="text-light-gray"></span></h2>{p.items.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></div></section>
  );
}
