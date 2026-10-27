import type React from "react";

export type WhyTrustFunplayProps = { h2Text: string; items: { pathD: React.ComponentProps<"path">["d"]; pText: string }[] };

export default function WhyTrustFunplay(p: WhyTrustFunplayProps) {
  return (
    <section className="section-why-us"><div className="container text-center"><h2 className="section-title">{p.h2Text}</h2><div className="features-grid">{p.items.map((px, i) => (<div key={i} className="feature-card"><svg fill="#d74951" height="48px" viewBox="0 -960 960 960" width="48px" xmlns="http://www.w3.org/2000/svg"><path d={px.pathD}></path></svg>{" "}<p>{px.pText}</p></div>))}</div></div></section>
  );
}
