import type React from "react";
import Img from "@/components/ui/Img";
import ProductGallery from "@/components/ui/ProductGallery";
import R, { type Rich } from "@/components/ui/Rich";
import { galleryAlts, galleryImgs } from "@/lib/image-seo";

export type ProductCrownCourt3CastleProps = { divStyle?: React.ComponentProps<"div">["style"]; h1Class: React.ComponentProps<"h1">["className"]; h1Text: Rich; pText: string; productGallery: React.ComponentProps<typeof ProductGallery>; items: { divDataAlts: string; divDataImgs: string; divStyle: React.ComponentProps<"div">["style"]; divText: string; spanText: string }[] };

/** 247 product pages, e.g. /corecraft/castle-crest/crown-court-3.html */
export default function ProductCrownCourt3Castle(p: ProductCrownCourt3CastleProps) {
  return (
    <div className="container" style={p.divStyle}><div className="row my-4"><div className="col-12"><div className="last-paragraph-no-margin productimage z-index-3 mt-70px"><h1 className={p.h1Class}><R v={p.h1Text} /></h1><p className="sku">{p.pText}</p></div><div className="carousel slide mb-3" data-bs-ride="carousel" id="imageCarousel"><ProductGallery className="carousel-inner" id="carouselImages" role="listbox" {...p.productGallery} />{" "}<button className="carousel-control-prev" data-bs-slide="prev" data-bs-target="#imageCarousel" type="button"><Img alt="" aria-hidden="true" decoding="async" loading="lazy" src="/images/left-arrow.svg" style={{"width": "22px", "height": "22px"}} />{" "}<span className="visually-hidden">Previous</span>{" "}</button>{" "}<button className="carousel-control-next" data-bs-slide="next" data-bs-target="#imageCarousel" type="button"><Img alt="" aria-hidden="true" decoding="async" loading="lazy" src="/images/arrow-right.svg" style={{"width": "22px", "height": "22px"}} />{" "}<span className="visually-hidden">Next</span>{" "}</button></div></div><div className="col-md-8 color-column"><div className="color-selector">{p.items.map((px, i) => (<div key={i} className="color-option" data-alts={galleryAlts(px.divDataImgs, px.divDataAlts)} data-imgs={galleryImgs(px.divDataImgs)}><div className="color-circle" style={px.divStyle}>{px.divText}</div>{" "}<span>{px.spanText}</span></div>))}</div></div><div className="col-md-4 quote-column" style={{"marginTop": "-10px"}}><a className="btn btn-base-color fw-600 btn-medium btn-rounded d-table d-lg-inline-block lg-mb-15px md-mx-auto popup-with-form" href="#contact-form">Get a Quote</a></div></div></div>
  );
}
