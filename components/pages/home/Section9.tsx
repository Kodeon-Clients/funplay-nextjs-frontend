import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type Section9Props = { items: { liClass: React.ComponentProps<"li">["className"]; figcaptionClass: React.ComponentProps<"figcaption">["className"]; divText: Rich; aText: string; aClass: React.ComponentProps<"a">["className"]; aText2: string }[] };

export default function Section9(p: Section9Props) {
  return (
    <section className="pt-0 ps-2 pe-2 xs-px-0" data-anime={"{ \"el\": \"childs\", \"translateY\": [30, 1], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\":200, \"easing\": \"easeOutQuad\" }"} style={{"backgroundColor": "#e6f5fc", "display": "none"}}><div className="container-fluid"><div className="row blog-metro"><div className="col-12"><ul className="blog-metro blog-wrapper grid-loading grid grid-4col xl-grid-4col lg-grid-3col md-grid-2col sm-grid-2col xs-grid-1col gutter-large"><li className="grid-sizer"></li>{p.items.map((px, i) => (<li key={i} className={px.liClass}><figure className="position-relative mb-0 overflow-hidden"><div className="blog-image bg-dark-slate-blue"><Img alt="funplay" decoding="async" loading="lazy" src="https://via.placeholder.com/1000x1000" />{" "}<div className="blog-overlay"></div></div><figcaption className={px.figcaptionClass}><div className="blog-categories mb-auto"><R v={px.divText} /></div>{" "}<a className="fs-13 alt-font mb-5px text-white opacity-6 text-uppercase" href="#">{px.aText}</a>{" "}<a className={px.aClass} href="#">{px.aText2}</a>{" "}</figcaption></figure></li>))}</ul></div></div></div></section>
  );
}
