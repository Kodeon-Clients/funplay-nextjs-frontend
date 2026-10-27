import R, { type Rich } from "@/components/ui/Rich";

export type ProductSectionProps = { items: { liText: Rich }[] };

/** 248 product pages, e.g. /corecraft/castle-crest/crown-court-3.html */
export default function ProductSection(p: ProductSectionProps) {
  return (
    <section className="top-space-margin bg-gradient-very-light-gray pt-20px pb-20px ps-45px pe-45px sm-ps-15px sm-pe-15px"><div className="container-fluid"><div className="row align-items-center"><div className="col-12 breadcrumb breadcrumb-style-01 fs-14"><ul>{p.items.map((px, i) => (<li key={i}><R v={px.liText} /></li>))}</ul></div></div></div></section>
  );
}
