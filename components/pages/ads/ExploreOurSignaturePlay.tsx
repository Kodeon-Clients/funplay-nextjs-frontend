import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type ExploreOurSignaturePlayProps = { h2Text: string; items: { divStyle: React.ComponentProps<"div">["style"]; h3Text: string; pText: string; divText: Rich }[] };

export default function ExploreOurSignaturePlay(p: ExploreOurSignaturePlayProps) {
  return (
    <section className="section-products"><div className="container text-center"><h2 className="section-title">{p.h2Text}</h2><div className="product-grid">{p.items.map((px, i) => (<div key={i} className="product-card"><div className="product-image" style={px.divStyle}></div><h3 className="product-name">{px.h3Text}</h3><p className="product-desc">{px.pText}</p><div className="product-link"><R v={px.divText} /></div></div>))}</div></div></section>
  );
}
