import type React from "react";
import BlogArticle from "@/components/BlogArticle";
import Img from "@/components/ui/Img";

export type BlogBlogInnerContent5Props = { article: React.ComponentProps<typeof BlogArticle>; aHref: React.ComponentProps<"a">["href"]; imgSrc: React.ComponentProps<typeof Img>["src"]; imgAlt: React.ComponentProps<typeof Img>["alt"]; items: { pClass: React.ComponentProps<"p">["className"]; pText: string }[]; aHref2: React.ComponentProps<"a">["href"]; imgSrc2: React.ComponentProps<typeof Img>["src"]; imgAlt2: React.ComponentProps<typeof Img>["alt"]; items2: { pClass: React.ComponentProps<"p">["className"]; pText: string }[] };

/** 2 blog pages, e.g. /blog/playground-design-ideas-for-small-spaces.html */
export default function BlogBlogInnerContent5(p: BlogBlogInnerContent5Props) {
  return (
    <section className="blog-inner-content"><div className="container"><div className="row justify-content-center"><div className="col-lg-12"><BlogArticle {...p.article} /></div></div></div><div className="post-container alt-font"><div className="post-content" id="latestPostsContainer"><p className="post-title alt-font">Latest Posts</p>{" "}<a href="/blog/how-to-choose-a-playground-equipment-manufacturer-in-india.html"><div className="post-item"><div className="post-image"><Img src="/images/g2.jpg" alt="How to Choose a Playground Equipment Manufacturer in India" loading="lazy" /></div><div className="post-details alt-font"><p className="post-heading">How to Choose a Playground Equipment Manufacturer in India</p><p className="post-date">11 October 2026</p></div></div></a><div className="separator"></div><a href={p.aHref}><div className="post-item"><div className="post-image"><Img src={p.imgSrc} alt={p.imgAlt} loading="lazy" /></div><div className="post-details alt-font">{p.items.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></a><div className="separator"></div><a href={p.aHref2}><div className="post-item"><div className="post-image"><Img src={p.imgSrc2} alt={p.imgAlt2} loading="lazy" /></div><div className="post-details alt-font">{p.items2.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></a></div></div></section>
  );
}
