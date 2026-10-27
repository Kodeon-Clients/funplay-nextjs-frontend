import type React from "react";

export type Section8Props = { items: { pClass?: React.ComponentProps<"p">["className"]; pStyle?: React.ComponentProps<"p">["style"]; pText: string }[] };

export default function Section8(p: Section8Props) {
  return (
    <section className="pb-0 ipad-top-space-margin md-pt-0" data-anime={"{ \"el\": \"childs\", \"translateY\": [30, 1], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\":200, \"easing\": \"easeOutQuad\" }"} style={{"paddingTop": "0px", "paddingBottom": "0px", "backgroundColor": "#e6f5fc", "display": "none"}}><div className="container"><div className="row align-items-center justify-content-center"><div className="col-12 col-xl-6 col-lg-8 text-center position-relative page-title-double-large"><div className="d-flex flex-column justify-content-center extra-very-small-screen">{p.items.map((px, i) => (<p key={i} className={px.pClass} style={px.pStyle}>{px.pText}</p>))}</div></div></div></div></section>
  );
}
