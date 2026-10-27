import type React from "react";

export type ProductSection2Props = { sectionStyle: React.ComponentProps<"section">["style"]; items: { divClass: React.ComponentProps<"div">["className"]; divText: string }[] };

/** 111 product pages, e.g. /corecraft/castle-crest/crown-court-3.html */
export default function ProductSection2(p: ProductSection2Props) {
  return (
    <section className="background-position-center-top pt-0" style={p.sectionStyle}><div className="container-fluid"><div className="row position-relative"><div className="col swiper swiper-width-auto text-center pb-20px md-pb-20px feather-shadow" data-slider-options={"{ \"slidesPerView\": \"auto\", \"spaceBetween\":70, \"speed\": 14000, \"loop\": true, \"allowTouchMove\": false, \"autoplay\": { \"delay\":0, \"disableOnInteraction\": false }, \"keyboard\": { \"enabled\": true, \"onlyInViewport\": true }, \"effect\": \"slide\" }"}><div className="swiper-wrapper marquee-slide">{p.items.map((px, i) => (<div key={i} className="swiper-slide"><div className={px.divClass}>{px.divText}</div></div>))}</div></div></div></div></section>
  );
}
