import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type BlogImportedVsIndianEquipmentProps = { items: { divClass: React.ComponentProps<"div">["className"]; divStyle?: React.ComponentProps<"div">["style"]; divDataParticle?: string; divDataParticleOptions?: string; divId?: React.ComponentProps<"div">["id"] }[]; divText: Rich; text: string; h1Text: string; aText: string };

/** 1 blog page, e.g. /blog/imported-vs-indian-playground-equipment.html */
export default function BlogImportedVsIndianEquipment(p: BlogImportedVsIndianEquipmentProps) {
  return (
    <section className="ipad-top-space-margin bg-dark-gray cover-background d-flex align-items-center top-60px md-top-0px sm-top-0px" style={{"backgroundImage": "url('/images/blog2.jpg')"}}>{p.items.map((it, i) => (<div key={i} className={it.divClass} style={it.divStyle} data-particle={it.divDataParticle} data-particle-options={it.divDataParticleOptions} id={it.divId}></div>))}<div className="container"><div className="row justify-content-center"><div className="col-lg-12 position-relative" data-anime={"{ \"el\": \"childs\", \"opacity\": [0, 1], \"translateX\": [50, 0], \"staggervalue\": 100, \"easing\": \"easeOutQuad\" }"}><div className="d-inline-block mb-20px"><R v={p.divText} /></div>{p.text}</div><h1 className="text-white fw-500 text-white alt-font mb-30px mb-0">{p.h1Text}</h1><div className="text-white fs-18 mt-40px"><Img alt="Author icon illustration" className="w-80px h-80px rounded-circle me-15px" decoding="async" height="148" loading="lazy" src="/images/author-icon.jpg" width="148" />{" "}<a className="text-white" href="#">{p.aText}</a></div></div></div></section>
  );
}
