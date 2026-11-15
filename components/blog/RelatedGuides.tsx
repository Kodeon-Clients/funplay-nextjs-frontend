import { PostGrid } from "@/components/blog/parts";
import { postsLinkingTo } from "@/lib/blog";

/** "Guides for this product" on product, range and project pages: the blog posts that link to the page. */
export default function RelatedGuides({ path, type }: { path: string; type: string }) {
  if (!["product", "series", "project"].includes(type)) return null;
  const posts = postsLinkingTo(path).slice(0, 3);
  if (!posts.length) return null;
  const title = type === "project" ? "Guides related to this project" : type === "series" ? "Guides for this range" : "Guides for this product";
  return (
    <section className="fpb fpb-related fpb-related-page" aria-labelledby="related-guides">
      <div className="fpb-wrap">
        <div className="fpb-section-head">
          <h2 id="related-guides">{title}</h2>
          <a href="/blog.html">All guides →</a>
        </div>
        <PostGrid posts={posts} />
      </div>
    </section>
  );
}
