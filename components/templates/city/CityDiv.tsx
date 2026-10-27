import type React from "react";
import CityFacts from "@/components/blocks/CityFacts";
import Faq from "@/components/blocks/Faq";
import RichText from "@/components/blocks/RichText";

export type CityDivProps = { items: { richText: React.ComponentProps<typeof RichText> }[]; cityFacts: React.ComponentProps<typeof CityFacts>; faq: React.ComponentProps<typeof Faq> };

/** 668 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-adoni.html */
export default function CityDiv(p: CityDivProps) {
  return (
    <div className="fp-city-content pt-80px md-pt-50px">{p.items.map((it, i) => (<RichText key={i} {...it.richText} />))}<CityFacts {...p.cityFacts} /><Faq {...p.faq} /></div>
  );
}
