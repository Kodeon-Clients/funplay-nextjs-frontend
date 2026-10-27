import type React from "react";
import BlogArticle from "@/components/BlogArticle";
import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type BlogBlogInnerContent2Props = { article: React.ComponentProps<typeof BlogArticle>; divText: Rich };

/** 8 blog pages, e.g. /blog/future-of-play-based-learning-in-indias-schools-challenges-and-opportunities.html */
export default function BlogBlogInnerContent2(p: BlogBlogInnerContent2Props) {
  return (
    <section className="blog-inner-content bg-white text-gray-800"><div className="container mx-auto px-4"><div className="max-w-4xl mx-auto space-y-8"><BlogArticle {...p.article} /></div></div><div className="post-container alt-font"><div className="tags-container"><p className="tags-title alt-font">Tags</p><div className="tags-list alt-font"><R v={p.divText} /></div></div><div className="post-content" id="latestPostsContainer"><p className="post-title alt-font">Latest Posts</p>{" "}<a href="/blog/how-to-choose-a-playground-equipment-manufacturer-in-india.html"><div className="post-item"><div className="post-image"><Img src="/images/g2.jpg" alt="How to Choose a Playground Equipment Manufacturer in India" loading="lazy" /></div><div className="post-details alt-font"><p className="post-heading">How to Choose a Playground Equipment Manufacturer in India</p><p className="post-date">11 October 2026</p></div></div></a><div className="separator"></div><a href="/blog/playground-design-ideas-for-small-spaces.html"><div className="post-item"><div className="post-image"><Img src="/images/about_us2.jpg" alt="Playground Design Ideas for Small Spaces" loading="lazy" /></div><div className="post-details alt-font"><p className="post-heading">Playground Design Ideas for Small Spaces</p><p className="post-date">2 October 2025</p></div></div></a><div className="separator"></div><a href="/blog/blending-play-equipment-with-green-spaces.html"><div className="post-item"><div className="post-image"><Img src="/images/funplay-innovative-images.JPG" alt="Blending Play Equipment with Green Spaces" loading="lazy" /></div><div className="post-details alt-font"><p className="post-heading">Blending Play Equipment with Green Spaces</p><p className="post-date">29 September 2025</p></div></div></a></div></div></section>
  );
}
