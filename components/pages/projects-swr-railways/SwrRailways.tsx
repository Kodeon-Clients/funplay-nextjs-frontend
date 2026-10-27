import type React from "react";
import Icon from "@/components/ui/Icon";

export type SwrRailwaysProps = { h1Text: string; items: { divClass: React.ComponentProps<"div">["className"]; divId: React.ComponentProps<"div">["id"]; divText: string }[] };

export default function SwrRailways(p: SwrRailwaysProps) {
  return (
    <section className="page-title-big-typography bg-dark-gray ipad-top-space-margin xs-py-0" data-parallax-background-ratio="0.5" style={{"backgroundImage": "url('/images/projects/swr-railways-bangalore/feature-image.jpg')", "backgroundRepeat": "no-repeat", "minHeight": "50vh", "backgroundPosition": "bottom !important"}}><div className="opacity-medium bg-dark-gray"></div><div className="container"><div className="row align-items-center justify-content-center small-screen"><div className="col-lg-6 col-md-8 position-relative text-center" data-anime={"{ \"el\": \"childs\", \"translateY\": [30, 1], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\":200, \"easing\": \"easeOutQuad\" }"}><h1 className="hero-title alt-font text-white fw-400" id="hero-title">{p.h1Text}</h1>{p.items.map((px, i) => (<div key={i} className={px.divClass} id={px.divId}>{px.divText}</div>))}</div><div className="down-section text-center" data-anime={"{ \"translateY\": [100, 0], \"opacity\": [0,1], \"easing\": \"easeOutQuad\" }"}><a aria-label="down" className="section-link" href="#down-section"><div className="fs-30 sm-fs-32 text-white"><Icon className="bi bi-mouse" /></div></a></div></div></div></section>
  );
}
