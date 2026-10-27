import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type CityOutdoorGymEquipmentSuppliersProps = { aHref: React.ComponentProps<"a">["href"]; aText: string; spanText: string; h2Text: string; items: { liText: Rich }[]; items2: { pText: Rich }[] };

/** 363 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-agartala.html */
export default function CityOutdoorGymEquipmentSuppliers(p: CityOutdoorGymEquipmentSuppliersProps) {
  return (
    <section className="fp-local-links pt-40px pb-40px bg-very-light-gray"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">Home</a>{" › "}<a href="/our-network.html">Our Network</a>{" › "}<a href={p.aHref}>{p.aText}</a>{" › "}<span>{p.spanText}</span></nav><h2 className="h4">{p.h2Text}</h2><ul className="list-inline">{p.items.map((px, i) => (<li key={i}><R v={px.liText} /></li>))}</ul>{p.items2.map((px, i) => (<p key={i}><R v={px.pText} /></p>))}</div></section>
  );
}
