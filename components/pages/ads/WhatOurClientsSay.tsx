import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type WhatOurClientsSayProps = { h2Text: string; h3Text: Rich; h3Text2: string; pText: string; h3Text3: string; spanText: string; pText2: string; items: { pText: string; imgSrc: React.ComponentProps<typeof Img>["src"]; pText2: string; smallText: string }[] };

export default function WhatOurClientsSay(p: WhatOurClientsSayProps) {
  return (
    <section className="section-testimonials"><div className="container"><h2 className="section-title">{p.h2Text}</h2><div className="divider"></div><div className="stats-row"><div className="stat-box"><Img alt="Client" className="client-img" decoding="async" id="client-image" loading="lazy" src="/images/c1.png" />{" "}<h3 className="stat-text"><R v={p.h3Text} /></h3></div><div className="stat-box"><h3 className="stat-number">{p.h3Text2}</h3><p className="stat-desc">{p.pText}</p></div><div className="stat-box"><div className="rating"><h3 className="stat-number">{p.h3Text3}</h3>{" "}<span className="stars">{p.spanText}</span></div><p className="stat-desc">{p.pText2}</p></div></div><div className="testimonial-grid">{p.items.map((px, i) => (<div key={i} className="testimonial-card"><div className="testimonial-content"><p className="testimonial-text">{px.pText}</p></div><div className="testimonial-author"><div className="testimonial-image"><Img alt="Client" decoding="async" loading="lazy" src={px.imgSrc} /></div><div className="testimonial-name"><p>{px.pText2}</p>{" "}<small>{px.smallText}</small></div></div></div>))}</div></div></section>
  );
}
