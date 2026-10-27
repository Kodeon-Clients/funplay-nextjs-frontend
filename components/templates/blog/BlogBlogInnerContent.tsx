import type React from "react";
import BlogArticle from "@/components/BlogArticle";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type BlogBlogInnerContentProps = { article: React.ComponentProps<typeof BlogArticle>; divText: Rich; aHref: React.ComponentProps<"a">["href"]; imgSrc: React.ComponentProps<typeof Img>["src"]; imgAlt: React.ComponentProps<typeof Img>["alt"]; items: { pClass: React.ComponentProps<"p">["className"]; pText: string }[]; aHref2: React.ComponentProps<"a">["href"]; imgSrc2: React.ComponentProps<typeof Img>["src"]; imgAlt2: React.ComponentProps<typeof Img>["alt"]; items2: { pClass: React.ComponentProps<"p">["className"]; pText: string }[]; aHref3: React.ComponentProps<"a">["href"]; imgSrc3: React.ComponentProps<typeof Img>["src"]; imgAlt3: React.ComponentProps<typeof Img>["alt"]; items3: { pClass: React.ComponentProps<"p">["className"]; pText: string }[] };

/** 36 blog pages, e.g. /blog/best-outdoor-playground-equipment-suppliers-india.html */
export default function BlogBlogInnerContent(p: BlogBlogInnerContentProps) {
  return (
    <section className="blog-inner-content"><div className="container"><div className="row justify-content-center"><div className="col-lg-12"><BlogArticle {...p.article} /></div></div></div><div className="post-container alt-font"><div className="tags-container"><p className="tags-title alt-font">Tags</p><div className="tags-list alt-font"><R v={p.divText} /></div></div><div className="post-content" id="latestPostsContainer"><p className="post-title alt-font">Latest Posts</p>{" "}<a href={p.aHref}><div className="post-item"><div className="post-image"><Img src={p.imgSrc} alt={p.imgAlt} loading="lazy" /></div><div className="post-details alt-font">{p.items.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></a><div className="separator"></div><a href={p.aHref2}><div className="post-item"><div className="post-image"><Img src={p.imgSrc2} alt={p.imgAlt2} loading="lazy" /></div><div className="post-details alt-font">{p.items2.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></a><div className="separator"></div><a href={p.aHref3}><div className="post-item"><div className="post-image"><Img src={p.imgSrc3} alt={p.imgAlt3} loading="lazy" /></div><div className="post-details alt-font">{p.items3.map((px, i) => (<p key={i} className={px.pClass}>{px.pText}</p>))}</div></div></a></div></div></section>
  );
}
