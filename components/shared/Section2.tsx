import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type Section2Props = { pText: string; items: { imgAlt: React.ComponentProps<typeof Img>["alt"]; imgSrc: React.ComponentProps<typeof Img>["src"]; divText: Rich }[] };

/** Section shared by 12 pages; its text is in content/shared-sections.json. */
export default function Section2(p: Section2Props) {
  return (
    <section><div className="solutions-wrapper"><div className="solutions-header"><p className="heading-text-para text-dark-gray fw-700" id="solutionForEvery-title" style={{"fontSize": "2.375rem", "lineHeight": "2.7rem", "textAlign": "center"}}>{p.pText}</p></div><div className="solutions-grid" id="solutionForEvery-grid">{p.items.map((px, i) => (<div key={i} className="solution-card"><div className="solution-image-wrapper"><Img alt={px.imgAlt} className="grid-image" loading="lazy" src={px.imgSrc} /></div><div className="solution-content"><R v={px.divText} /></div></div>))}</div></div></section>
  );
}
