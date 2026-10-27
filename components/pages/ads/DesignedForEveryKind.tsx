import type React from "react";
import Img from "@/components/ui/Img";

export type DesignedForEveryKindProps = { h2Text: string; pText: string; items: { imgAlt: React.ComponentProps<typeof Img>["alt"]; imgHeight?: React.ComponentProps<typeof Img>["height"]; imgSrc: React.ComponentProps<typeof Img>["src"]; imgWidth?: React.ComponentProps<typeof Img>["width"]; h3Text: string; pText: string; aText: string }[] };

export default function DesignedForEveryKind(p: DesignedForEveryKindProps) {
  return (
    <section className="section-who-we-serve"><div className="container text-center"><h2 className="section-title">{p.h2Text}</h2><p className="section-subtitle">{p.pText}</p><div className="cards-grid">{p.items.map((px, i) => (<div key={i} className="service-card"><Img alt={px.imgAlt} className="card-image" decoding="async" height={px.imgHeight} loading="lazy" src={px.imgSrc} width={px.imgWidth} />{" "}<h3 className="card-title">{px.h3Text}</h3><p className="card-description">{px.pText}</p>{" "}<a className="card-link" href="#quote-form">{px.aText}</a></div>))}</div></div></section>
  );
}
