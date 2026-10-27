import R, { type Rich } from "@/components/ui/Rich";

export type CityCitiesWeSupplyInProps = { spanText: string; h2Text: string; items: { liText: Rich }[] };

/** 26 city pages, e.g. /outdoor-playground-equipment-manufacturer-in-arunachal-pradesh.html */
export default function CityCitiesWeSupplyIn(p: CityCitiesWeSupplyInProps) {
  return (
    <section className="fp-local-links pt-40px pb-40px"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">Home</a>{" › "}<a href="/our-network.html">Our Network</a>{" › "}<span>{p.spanText}</span></nav><h2 className="h3">{p.h2Text}</h2><ul className="row list-unstyled">{p.items.map((px, i) => (<li key={i} className="col-6 col-md-4 col-lg-3 mb-5px"><R v={px.liText} /></li>))}</ul></div></section>
  );
}
