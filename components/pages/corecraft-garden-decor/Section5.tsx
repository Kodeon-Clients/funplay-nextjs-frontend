import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type Section5Props = { items: { items: { imgAlt: React.ComponentProps<typeof Img>["alt"]; imgSrc: React.ComponentProps<typeof Img>["src"]; aHref: React.ComponentProps<"a">["href"]; aText: string; divText: Rich }[] }[] };

export default function Section5(p: Section5Props) {
  return (
    <section style={{"paddingTop": "50px"}}><div className="container" id="down-section">{p.items.map((px, i) => (<div key={i} className="row">{px.items.map((pxx, i) => (<div key={i} className="col-12 col-lg-4 md-mb-15px pt-30px"><div className="swiper-slide" style={{"border": "1px solid #e6e6e6", "borderRadius": "6px"}}><div className="services-box-style-01 hover-box last-paragraph-no-margin"><div className="position-relative box-image" style={{"borderRadius": "6px 6px 0 0"}}><Img alt={pxx.imgAlt} className="w-100" decoding="async" height="605" loading="lazy" src={pxx.imgSrc} style={{"borderRadius": "6px 6px 0 0"}} width="800" />{" "}<div className="box-overlay bg-dark-gray"></div>{" "}<a className="d-flex justify-content-center align-items-center mx-auto icon-box absolute-middle-center z-index-1 w-110px h-110px rounded-circle bg-white box-shadow-extra-large text-uppercase fs-16 lh-24 fw-700 text-red ps-15px pe-15px text-center" href={pxx.aHref}>{pxx.aText}</a></div><div className="pt-15px pb-15px text-center border-radius-6px"><R v={pxx.divText} /></div></div></div></div>))}</div>))}</div></section>
  );
}
