import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type CityDownSectionProps = { h1Text: Rich; items: { pClass?: React.ComponentProps<"p">["className"]; pText: string }[] };

/** 341 city pages, e.g. /outdoor-playground-equipment-manufacturer-in-adoni.html */
export default function CityDownSection(p: CityDownSectionProps) {
  return (
    <section className="pb-75px" id="down-section" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h1 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px"><R v={p.h1Text} /></h1>{p.items.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></div></section>
  );
}
