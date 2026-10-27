import type React from "react";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type BlogHowFunplayManufacturesPlaygroundProps = { sectionStyle: React.ComponentProps<"section">["style"]; items: { divClass: React.ComponentProps<"div">["className"]; divStyle?: React.ComponentProps<"div">["style"]; divDataParticle?: string; divDataParticleOptions?: string; divId?: React.ComponentProps<"div">["id"] }[]; divDataAnime?: string; divText: Rich; h1Class: React.ComponentProps<"h1">["className"]; h1Text: string; imgDecoding?: React.ComponentProps<typeof Img>["decoding"] };

/** 50 blog pages, e.g. /blog/behind-the-scenes-funplays-manufacturing-marvel.html */
export default function BlogHowFunplayManufacturesPlayground(p: BlogHowFunplayManufacturesPlaygroundProps) {
  return (
    <section className="ipad-top-space-margin bg-dark-gray cover-background d-flex align-items-center top-60px md-top-0px sm-top-0px" style={p.sectionStyle}>{p.items.map((it, i) => (<div key={i} className={it.divClass} style={it.divStyle} data-particle={it.divDataParticle} data-particle-options={it.divDataParticleOptions} id={it.divId}></div>))}<div className="container"><div className="row justify-content-center"><div className="col-lg-12 position-relative" data-anime={p.divDataAnime}><div className="d-inline-block mb-20px"><R v={p.divText} /></div><h1 className={p.h1Class}>{p.h1Text}</h1><div className="text-white fs-18 mt-40px"><Img alt="Author icon illustration" className="w-80px h-80px rounded-circle me-15px" decoding={p.imgDecoding} height="148" loading="lazy" src="/images/author-icon.jpg" width="148" />{" "}<a className="text-white" href="#">By FunPlay</a></div></div></div></div></section>
  );
}
