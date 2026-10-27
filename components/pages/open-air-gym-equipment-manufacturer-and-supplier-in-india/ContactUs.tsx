import type React from "react";
import Icon from "@/components/ui/Icon";

export type ContactUsProps = { items: { divClass: React.ComponentProps<"div">["className"]; iClass: React.ComponentProps<typeof Icon>["className"]; spanText: string; pText: string }[]; h2Text: string; pText: string };

export default function ContactUs(p: ContactUsProps) {
  return (
    <section className="cover-background" style={{"backgroundColor": "#E6F5FC", "padding": "0px", "marginTop": "0px"}}><div className="container"><div className="row row-cols-1 row-cols-lg-3 row-cols-sm-2 justify-content-center" data-anime={"{ \"el\": \"childs\", \"rotateZ\": [5, 0], \"translateY\": [50, 0], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\": 300, \"easing\": \"easeOutQuad\" }"}>{p.items.map((px, i) => (<div key={i} className={px.divClass}><div className="feature-box bg-white box-shadow-quadruple-large box-shadow-quadruple-large-hover justify-content-start border-radius-5px overflow-hidden pt-18 pb-18 ps-10 pe-10 lg-p-12 h-100 last-paragraph-no-margin"><div className="feature-box-icon"><Icon className={px.iClass} /></div><div className="feature-box-content"><span className="d-inline-block alt-font text-dark-gray fw-700 mb-5px fs-18">{px.spanText}</span>{" "}<p>{px.pText}</p></div><div className="feature-box-overlay bg-white"></div></div></div>))}</div><section className="pt-0px pt-35px" style={{"textAlign": "center", "backgroundColor": "#E6F5FC"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h2 className="h4 descriptionheading text-dark-gray alt-font fw-600" style={{"paddingTop": "30px"}}>{p.h2Text}</h2><p>{p.pText}</p></div></div></div></section></div></section>
  );
}
