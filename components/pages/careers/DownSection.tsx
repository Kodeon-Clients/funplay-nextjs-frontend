import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type DownSectionProps = { h3Text: string; items: { aHref: React.ComponentProps<"a">["href"]; spanText: Rich; pText: string; divText: string }[] };

export default function DownSection(p: DownSectionProps) {
  return (
    <section className="ps-7 pe-7 xxl-ps-3 xxl-pe-3 xs-px-0" id="down-section" style={{"backgroundColor": "#e6f5fc"}}><div className="container-fluid"><div className="row justify-content-center mb-5"><div className="col-lg-8 text-center"><h3 className="alt-font text-dark-gray fw-600 mb-20px">{p.h3Text}</h3></div></div><div className="row row-cols-1 row-cols-lg-3 row-cols-md-2 transition-inner-all justify-content-center gap-5 gap-md-0" data-anime={"{ \"el\": \"childs\", \"translateY\": [20, 0], \"opacity\": [0,1], \"duration\": 600, \"delay\": 300, \"staggervalue\": 300, \"easing\": \"easeOutQuad\" }"}>{p.items.map((px, i) => (<div key={i} className="col-12 col-lg-5"><div className="mb-20px border-radius-6px services-box-style-01 hover-box bg-white h-100"><div className="position-relative box-image border-radius-6px overflow-hidden h-100"><a href={px.aHref}><div className="box-overlay bg-black-transparent-medium"></div><div className="p-25px last-paragraph-no-margin"><span className="d-inline-block alt-font text-dark-gray fw-700 mb-10px fs-26"><R v={px.spanText} /></span>{" "}<div><p className="fs-18 text-dark-gray mb-30px">{px.pText}</p></div></div><div className="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 border-radius-4px bg-white box-shadow-extra-large text-uppercase fs-16 lh-24 fw-700 text-red p-15px text-center">{px.divText}</div></a></div></div></div>))}</div></div></section>
  );
}
