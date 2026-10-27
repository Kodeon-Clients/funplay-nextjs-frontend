export type CityCitiesWeSupplyIn2Props = { aText: string; text: string; aText2: string; text2: string; spanText: string; h2Text: string };

/** 1 city page, e.g. /outdoor-playground-equipment-manufacturer-in-chandigarh.html */
export default function CityCitiesWeSupplyIn2(p: CityCitiesWeSupplyIn2Props) {
  return (
    <section className="fp-local-links pt-40px pb-40px"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">{p.aText}</a>{p.text}<a href="/our-network.html">{p.aText2}</a>{p.text2}<span>{p.spanText}</span></nav><h2 className="h3">{p.h2Text}</h2><ul className="row list-unstyled"></ul></div></section>
  );
}
