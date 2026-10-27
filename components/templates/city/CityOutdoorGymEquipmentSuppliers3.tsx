import R, { type Rich } from "@/components/ui/Rich";

export type CityOutdoorGymEquipmentSuppliers3Props = { aText: string; text: string; aText2: string; text2: string; spanText: string; h2Text: string; pText: Rich };

/** 1 city page, e.g. /outdoor-gym-equipment-manufacturer-supplier-india.html */
export default function CityOutdoorGymEquipmentSuppliers3(p: CityOutdoorGymEquipmentSuppliers3Props) {
  return (
    <section className="fp-local-links pt-40px pb-40px bg-very-light-gray"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">{p.aText}</a>{p.text}<a href="/our-network.html">{p.aText2}</a>{p.text2}<span>{p.spanText}</span></nav><h2 className="h4">{p.h2Text}</h2><p><R v={p.pText} /></p></div></section>
  );
}
