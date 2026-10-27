import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type SectionProps = { items: { pClass?: React.ComponentProps<"p">["className"]; pId: React.ComponentProps<"p">["id"]; pStyle?: React.ComponentProps<"p">["style"]; pText: Rich }[]; pText: string; items2: { divClass: React.ComponentProps<"div">["className"]; imgSrc: React.ComponentProps<typeof Img>["src"]; spanText: string }[]; pText2: string };

/** Section shared by 12 pages; its text is in content/shared-sections.json. */
export default function Section(p: SectionProps) {
  return (
    <section><div className="at-funplay-section" id="atFunplay-section"><div className="at-funplay-content">{p.items.map((px, i) => (<p key={i} className={px.pClass} id={px.pId} style={px.pStyle}><R v={px.pText} /></p>))}<div className="at-funplay-details"><p className="heading-text-para text-dark-gray fw-700" style={{"fontSize": "1.7rem", "lineHeight": "2.7rem"}}>{p.pText}</p><div className="why-choose-us-list" id="whyChooseUs-list">{p.items2.map((px, i) => (<div key={i} className={px.divClass}><Img alt="" height="32" src={px.imgSrc} width="32" /><span className="why-choose-us-title">{px.spanText}</span></div>))}</div><p className="at-funplay-footer-text" style={{"marginBottom": "0%"}}>{p.pText2}</p></div></div><div className="at-funplay-image-wrapper at-funplay"><Img alt="FunPlay multi play station on a housing project" className="at-funplay-image" id="atFunplay-image" src="/images/campaign/section/img1.webp" /></div></div></section>
  );
}
