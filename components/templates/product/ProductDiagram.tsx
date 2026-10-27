import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type ProductDiagramProps = { imgAlt: React.ComponentProps<typeof Img>["alt"]; imgSrc: React.ComponentProps<typeof Img>["src"]; items: { divText: Rich }[] };

/** 71 product pages, e.g. /corecraft/castle-crest/crown-court-3.html */
export default function ProductDiagram(p: ProductDiagramProps) {
  return (
    <div className="container-fluid diagram" style={{"backgroundColor": "#e2e1df", "borderRadius": "20px"}}><div className="row"><div className="col-12 image-container"><Img alt={p.imgAlt} className="img-fluid" decoding="async" height="600" loading="lazy" src={p.imgSrc} width="900" /></div><div className="col-12 col-md-5"><div className="dimension-container">{p.items.map((px, i) => (<div key={i} className="dimension-item"><R v={px.divText} /></div>))}</div></div></div></div>
  );
}
