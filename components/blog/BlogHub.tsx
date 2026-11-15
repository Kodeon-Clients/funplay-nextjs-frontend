import { Crumbs, EnquiryBand, PostGrid } from "@/components/blog/parts";
import { allHubs, BLOG_PATH, postsInHub, type HubProps } from "@/lib/blog";

/** A topic or audience hub: what the topic covers, links to the matching products, and every post in it. */
export default function BlogHub(h: HubProps) {
  const posts = postsInHub(h.hub);
  const others = allHubs().filter((x) => x.hub !== h.hub);
  return (
    <div className="fpb fpb-hub">
      <header className="fpb-head-band">
        <div className="fpb-wrap">
          <Crumbs items={[["Home", "/"], ["Blog", BLOG_PATH], [h.title, null]]} />
          <p className="fpb-eyebrow">{h.kind === "audience" ? "Guides for your project" : "Blog topic"}</p>
          <h1 className="fpb-title">{h.title}</h1>
          <p className="fpb-standfirst">{h.introText}</p>
          {h.links?.length ? (
            <nav className="fpb-chips fpb-chips-solid" aria-label="Related products">
              {h.links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <section className="fpb-wrap fpb-latest" aria-labelledby="hub-posts">
        <h2 id="hub-posts" className="fpb-h2">
          {posts.length} {posts.length === 1 ? "guide" : "guides"}
        </h2>
        <PostGrid posts={posts} eager={3} />
      </section>

      <section className="fpb-wrap fpb-others" aria-labelledby="other-topics">
        <h2 id="other-topics" className="fpb-h2">
          More from the blog
        </h2>
        <nav className="fpb-chips" aria-label="Other blog topics">
          {others.map((o) => (
            <a key={o.hub} href={o.path}>
              {o.title}
            </a>
          ))}
          <a href={BLOG_PATH}>All guides</a>
        </nav>
      </section>

      <EnquiryBand />
    </div>
  );
}
