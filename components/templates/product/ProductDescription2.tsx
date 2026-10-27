import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type ProductDescription2Props = { h2Text: Rich; items: { pClass?: React.ComponentProps<"p">["className"]; pText: string }[]; text: string };

/** 1 product page, e.g. /funplay-originals/conceptual/city-strange.html */
export default function ProductDescription2(p: ProductDescription2Props) {
  return (
    <section className="pb-50"><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h2 className="h4 descriptionheading text-dark-gray alt-font fw-600"><R v={p.h2Text} /></h2>{p.items.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}{p.text}</div></div></div></section>
  );
}
