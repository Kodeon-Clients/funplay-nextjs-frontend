import R, { type Rich } from "@/components/ui/Rich";

export type PlaygroundEquipmentSuppliersByProps = { h2Text: string; items: { h3Text: Rich; pText: Rich }[]; h2Text2: string; pText: Rich };

export default function PlaygroundEquipmentSuppliersBy(p: PlaygroundEquipmentSuppliersByProps) {
  return (
    <section className="fp-local-links pt-40px pb-40px"><div className="container"><h2 className="h3">{p.h2Text}</h2><div className="row">{p.items.map((px, i) => (<div key={i} className="col-12 col-md-6 col-lg-4 mb-30px"><h3 className="h5"><R v={px.h3Text} /></h3><p className="fs-15"><R v={px.pText} /></p></div>))}</div><h2 className="h3 mt-30px">{p.h2Text2}</h2><p className="fs-15"><R v={p.pText} /></p></div></section>
  );
}
