import R, { type Rich } from "@/components/ui/Rich";

export type PlaygroundEquipmentSuppliersNearProps = { aText: string; text: string; aText2: string; text2: string; spanText: string; h2Text: string; pText: Rich };

/** Section shared by 2 pages; its text is in content/shared-sections.json. */
export default function PlaygroundEquipmentSuppliersNear(p: PlaygroundEquipmentSuppliersNearProps) {
  return (
    <section className="fp-local-links pt-40px pb-40px bg-very-light-gray"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">{p.aText}</a>{p.text}<a href="/our-network.html">{p.aText2}</a>{p.text2}<span>{p.spanText}</span></nav><h2 className="h4">{p.h2Text}</h2><p><R v={p.pText} /></p></div></section>
  );
}
