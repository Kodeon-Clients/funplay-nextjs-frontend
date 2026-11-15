import Img from "@/components/ui/Img";
import { Crumbs, EnquiryBand, Pager, PostGrid, TopicPill } from "@/components/blog/parts";
import { allHubs, allPosts, fmtDate, pagePath, postsInHub, PER_PAGE } from "@/lib/blog";

export type BlogIndexProps = { h1Text: string; introText: string };

/** Blog home (page 1) and its numbered older pages: hub tiles, featured post, latest posts. */
export default function BlogIndex({ h1Text, introText, page = 1 }: BlogIndexProps & { page?: number }) {
  const posts = allPosts();
  const pages = Math.max(1, Math.ceil((posts.length - 1) / PER_PAGE));
  const featured = posts[0];
  const list = posts.slice(1 + (page - 1) * PER_PAGE, 1 + page * PER_PAGE);
  const hubs = allHubs();
  const audience = hubs.filter((h) => h.kind === "audience");
  const topics = hubs.filter((h) => h.kind === "topic");

  return (
    <div className="fpb fpb-index">
      <header className="fpb-head-band">
        <div className="fpb-wrap">
          <Crumbs items={page === 1 ? [["Home", "/"], ["Blog", null]] : [["Home", "/"], ["Blog", "/blog.html"], [`Page ${page}`, null]]} />
          <p className="fpb-eyebrow">FunPlay blog</p>
          <h1 className="fpb-title">{page === 1 ? h1Text : `${h1Text}: page ${page}`}</h1>
          <p className="fpb-standfirst">{introText}</p>
          <nav className="fpb-chips" aria-label="Blog topics">
            {topics.map((t) => (
              <a key={t.hub} href={t.path}>
                {t.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="fpb-wrap fpb-audiences" aria-labelledby="by-audience">
        <h2 id="by-audience" className="fpb-h2">
          Guides for your project
        </h2>
        <div className="fpb-tiles">
          {audience.map((h) => (
            <a className="fpb-tile" href={h.path} key={h.hub}>
              <Img src={h.image} alt="" loading={page === 1 ? "eager" : "lazy"} sizes="(max-width: 767px) 50vw, 280px" />
              <span className="fpb-tile-body">
                <span className="fpb-tile-name">{h.title}</span>
                <span className="fpb-tile-count">{postsInHub(h.hub).length} guides</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      {page === 1 && featured ? (
        <section className="fpb-wrap" aria-labelledby="featured">
          <h2 id="featured" className="fpb-h2">
            Latest guide
          </h2>
          <article className="fpb-featured">
            <a className="fpb-featured-img" href={featured.path} tabIndex={-1} aria-hidden="true">
              <Img src={featured.image} alt="" loading="eager" fetchPriority="high" sizes="(max-width: 991px) 100vw, 640px" />
            </a>
            <div className="fpb-featured-body">
              <TopicPill topic={featured.topic} link={false} />
              <h3 className="fpb-featured-title">
                <a href={featured.path}>{featured.title}</a>
              </h3>
              <p className="fpb-card-text">{featured.summaryText}</p>
              <p className="fpb-card-meta">
                <time dateTime={featured.date}>{fmtDate(featured.date)}</time> · {featured.minutes} min read
              </p>
              <a className="fpb-btn fpb-btn-dark" href={featured.path}>
                Read the guide
              </a>
            </div>
          </article>
        </section>
      ) : null}

      <section className="fpb-wrap fpb-latest" aria-labelledby="latest">
        <h2 id="latest" className="fpb-h2">
          {page === 1 ? "More guides" : `Guides, page ${page} of ${pages}`}
        </h2>
        <PostGrid posts={list} eager={page === 1 ? 0 : 3} />
        <Pager page={page} pages={pages} href={pagePath} />
      </section>

      <EnquiryBand />
    </div>
  );
}
