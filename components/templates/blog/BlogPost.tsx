import fs from "node:fs";
import path from "node:path";
import { articles } from "@/content/blog/articles";
import Img from "@/components/ui/Img";
import { blogMdx } from "@/components/blog/mdx";
import { Crumbs, EnquiryBand, LinkCards, PostGrid, TopicPill } from "@/components/blog/parts";
import { BLOG_PATH, fmtDate, getAuthor, getHub, relatedPosts, allPosts, type PostProps } from "@/lib/blog";

/**
 * A blog post. Its JSON (content/blog/blog-<slug>.json) holds these props; the article body is
 * content/blog/<slug>.mdx. Layout: breadcrumb, title block, picture, then the article with key
 * takeaways, products, projects and FAQ beside a sticky contents list and enquiry card, then the
 * enquiry band and related posts.
 */
export default function BlogPost(p: PostProps) {
  const post = allPosts().find((x) => x.slug === p.article.slug)!;
  const Article = articles[p.article.slug as keyof typeof articles];
  if (!Article) throw new Error(`No article content for ${p.article.slug}`);
  const hub = getHub(p.topic);
  const author = getAuthor(p.author);
  const products = p.products.length ? <LinkCards paths={p.products} kind="product" /> : null;
  const projects = p.projects.length ? <LinkCards paths={p.projects} kind="project" /> : null;
  const src = articleSource(p.article.slug);
  const placesProducts = src.includes("<Products />");
  const placesProjects = src.includes("<Projects />");
  const toc = post.headings;
  const related = relatedPosts(post);

  return (
    <>
      <div className="fpb fpb-post">
        <header className="fpb-wrap fpb-post-head">
          <Crumbs items={[["Home", "/"], ["Blog", BLOG_PATH], ...(hub ? ([[hub.title, hub.path]] as [string, string][]) : []), [p.title, null]]} />
          <TopicPill topic={p.topic} />
          <h1 className="fpb-title">{p.title}</h1>
          <p className="fpb-standfirst">{p.summaryText}</p>
          <div className="fpb-meta">
            <span className="fpb-avatar" aria-hidden="true">
              {author.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </span>
            <span>
              <span className="fpb-meta-name">{author.name}</span>
              <span className="fpb-meta-role">{author.role ? `${author.role}, FunPlay Systems` : "FunPlay Systems"}</span>
            </span>
            <span className="fpb-meta-dates">
              <span>
                Published <time dateTime={p.date}>{fmtDate(p.date)}</time>
              </span>
              {p.updated && p.updated !== p.date ? (
                <span>
                  Updated <time dateTime={p.updated}>{fmtDate(p.updated)}</time>
                </span>
              ) : null}
              <span>{post.minutes} min read</span>
            </span>
          </div>
        </header>

        <div className="fpb-wrap">
          <figure className="fpb-hero">
            <Img src={p.image} alt={p.imageAlt} loading="eager" fetchPriority="high" sizes="(max-width: 1199px) 100vw, 1140px" />
          </figure>
        </div>

        <div className="fpb-wrap fpb-layout">
          <article className="fpb-article">
            {toc.length > 2 ? (
              <details className="fpb-toc-mobile">
                <summary>In this guide</summary>
                <ol>
                  {toc.map((h) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}

            {p.takeaways.length ? (
              <section className="fpb-takeaways" aria-labelledby="key-takeaways">
                <h2 id="key-takeaways" className="fpb-takeaways-title">
                  Key takeaways
                </h2>
                <ul>
                  {p.takeaways.map((t, i) => (
                    <li key={i}>{t.text}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="fpb-prose">
              <Article
                components={{
                  ...blogMdx,
                  Products: () => (products ? <InlineBlock title="Equipment mentioned in this guide">{products}</InlineBlock> : null),
                  Projects: () => (projects ? <InlineBlock title="Where we have built this">{projects}</InlineBlock> : null),
                }}
              />
            </div>

            {products && !placesProducts ? <InlineBlock title="Equipment mentioned in this guide">{products}</InlineBlock> : null}
            {projects && !placesProjects ? <InlineBlock title="Where we have built this">{projects}</InlineBlock> : null}

            {p.faq.length ? (
              <section className="fpb-faq" aria-labelledby="faq">
                <h2 id="faq">Frequently asked questions</h2>
                {p.faq.map((f, i) => (
                  <details key={i} open={i === 0}>
                    <summary>
                      <h3>{f.q}</h3>
                    </summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </section>
            ) : null}

            <footer className="fpb-author">
              <span className="fpb-avatar" aria-hidden="true">
                {author.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <p>
                <strong>{author.name}</strong>
                {author.role ? `, ${author.role}` : ""}. {author.bio}
              </p>
            </footer>
          </article>

          <aside className="fpb-side" aria-label="In this guide">
            <div className="fpb-side-sticky">
              {toc.length > 2 ? (
                <nav className="fpb-toc" aria-label="Contents">
                  <p className="fpb-side-title">In this guide</p>
                  <ol>
                    {toc.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
              <div className="fpb-side-cta">
                <p className="fpb-side-cta-title">Planning a play area?</p>
                <p>Get a layout and quote for your site from our planning team.</p>
                <a href="#contact-form" className="fpb-btn fpb-btn-light popup-with-form">
                  Get a layout and quote
                </a>
                <a href="/Products.html" className="fpb-side-link">
                  Browse all equipment →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <EnquiryBand />

      {related.length ? (
        <section className="fpb fpb-related" aria-labelledby="related">
          <div className="fpb-wrap">
            <div className="fpb-section-head">
              <h2 id="related">Keep reading</h2>
              {hub ? <a href={hub.path}>More in {hub.title} →</a> : null}
            </div>
            <PostGrid posts={related} />
          </div>
        </section>
      ) : null}
    </>
  );
}

function InlineBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="fpb-inline">
      <p className="fpb-inline-title">{title}</p>
      {children}
    </section>
  );
}

function articleSource(slug: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", "blog", `${slug}.mdx`), "utf8");
}
