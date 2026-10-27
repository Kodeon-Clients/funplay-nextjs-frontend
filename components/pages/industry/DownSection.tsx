import type React from "react";
import Icon from "@/components/ui/Icon";
import Img from "@/components/ui/Img";

export type DownSectionProps = { items: { divClass: React.ComponentProps<"div">["className"]; imgAlt: React.ComponentProps<typeof Img>["alt"]; imgSrc: React.ComponentProps<typeof Img>["src"]; aAriaLabel: React.ComponentProps<"a">["aria-label"]; aText: string }[] };

export default function DownSection(p: DownSectionProps) {
  return (
    <section className="pt-50 pb-50" id="down-section"><div className="container"><div className="row row-cols-1 row-cols-xl-4 row-cols-lg-3 row-cols-sm-2 justify-content-start" data-anime={"{ \"el\": \"childs\", \"scale\":[0.9,1], \"opacity\": [0,1], \"duration\": 500, \"delay\": 0, \"staggervalue\": 200, \"easing\": \"easeOutQuad\" }"}>{p.items.map((px, i) => (<div key={i} className={px.divClass}><figure className="m-0 position-relative hover-box border-radius-6px overflow-hidden"><Img alt={px.imgAlt} decoding="async" height="600" loading="lazy" src={px.imgSrc} width="600" />{" "}<div className="position-absolute top-0px left-0px w-100 h-100 bg-gradient-dark-transparent opacity-5"></div><figcaption className="w-100 h-100 d-flex flex-column justify-content-end align-items-center p-30px"><div className="position-relative z-index-1"><a className="d-flex justify-content-center align-items-center mx-auto icon-box w-70px h-70px rounded-circle bg-white mb-50px box-shadow-quadruple-large" href="#" aria-label={px.aAriaLabel}><Icon className="bi bi-arrow-right-short text-dark-gray icon-medium lh-0px" /></a>{" "}<a className="alt-font fs-18 fw-500 lette text-white d-block text-uppercase" href="#">{px.aText}</a></div><div className="box-overlay bg-dark-gray"></div></figcaption></figure></div>))}</div></div></section>
  );
}
