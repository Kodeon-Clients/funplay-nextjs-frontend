import Img from "@/components/ui/Img";
import { card, fmtDate, getHub, type Post } from "@/lib/blog";
import { SITE } from "@/lib/site";

/** Small building blocks shared by the blog home, hub pages, posts and the "related guides" block. */

export function Crumbs({ items }: { items: [string, string | null][] }) {
  return (
    <nav className="fpb-crumbs" aria-label="Breadcrumb">
      <ol>
        {items.map(([name, href], i) => (
          <li key={i}>{href && i < items.length - 1 ? <a href={href}>{name}</a> : <span aria-current={i === items.length - 1 ? "page" : undefined}>{name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function TopicPill({ topic, link = true }: { topic: string; link?: boolean }) {
  const hub = getHub(topic);
  if (!hub) return null;
  return link ? (
    <a className="fpb-pill" href={hub.path}>
      {hub.title}
    </a>
  ) : (
    <span className="fpb-pill">{hub.title}</span>
  );
}

/** A post as a card: picture, topic, title, date and reading time, and the summary. */
export function PostCard({ post, eager = false, heading: H = "h3" }: { post: Post; eager?: boolean; heading?: "h2" | "h3" }) {
  return (
    <article className="fpb-card">
      <a className="fpb-card-img" href={post.path} tabIndex={-1} aria-hidden="true">
        <Img src={post.image} alt="" loading={eager ? "eager" : "lazy"} sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 380px" />
      </a>
      <div className="fpb-card-body">
        <TopicPill topic={post.topic} link={false} />
        <H className="fpb-card-title">
          <a href={post.path}>{post.title}</a>
        </H>
        <p className="fpb-card-text">{post.summaryText}</p>
        <p className="fpb-card-meta">
          <time dateTime={post.date}>{fmtDate(post.date)}</time> · {post.minutes} min read
        </p>
      </div>
    </article>
  );
}

export function PostGrid({ posts, eager = 0 }: { posts: Post[]; eager?: number }) {
  return (
    <div className="fpb-grid">
      {posts.map((p, i) => (
        <PostCard key={p.path} post={p} eager={i < eager} />
      ))}
    </div>
  );
}

/** Product, range or project cards (data comes from the pages themselves). */
export function LinkCards({ paths, kind }: { paths: string[]; kind: "product" | "project" }) {
  if (!paths.length) return null;
  return (
    <div className={`fpb-links fpb-links-${kind}`}>
      {paths.map((p) => {
        const c = card(p);
        return (
          <a className="fpb-link" href={c.path} key={p}>
            <span className="fpb-link-img">
              <Img src={c.image} alt={c.name} loading="lazy" sizes="(max-width: 767px) 50vw, 240px" />
            </span>
            <span className="fpb-link-name">{c.name}</span>
            {c.label ? <span className="fpb-link-label">{c.label}</span> : null}
          </a>
        );
      })}
    </div>
  );
}

/** Enquiry band: opens the site's enquiry popup, with the sales number and the product range. */
export function EnquiryBand({ title = "Planning a play area?", text = "Send us your site size, the age group and a rough budget. Our planning team will suggest a layout and send a quote you can compare line by line." }: { title?: string; text?: string }) {
  return (
    <section className="fpb-band" aria-label="Enquiry">
      <div className="fpb-wrap fpb-band-inner">
        <div>
          <h2 className="fpb-band-title">{title}</h2>
          <p className="fpb-band-text">{text}</p>
        </div>
        <div className="fpb-band-actions">
          <a href="#contact-form" className="fpb-btn fpb-btn-light popup-with-form">
            Get a layout and quote
          </a>
          <a href={`tel:${SITE.phone.sales.tel}`} className="fpb-btn fpb-btn-ghost">
            Call {SITE.phone.sales.display}
          </a>
        </div>
      </div>
    </section>
  );
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  if (pages < 2) return null;
  return (
    <nav className="fpb-pager" aria-label="Blog pages">
      {page > 1 ? (
        <a href={href(page - 1)} rel="prev">
          ← Newer
        </a>
      ) : (
        <span className="is-off">← Newer</span>
      )}
      <ol>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <li key={n}>{n === page ? <span aria-current="page">{n}</span> : <a href={href(n)}>{n}</a>}</li>
        ))}
      </ol>
      {page < pages ? (
        <a href={href(page + 1)} rel="next">
          Older →
        </a>
      ) : (
        <span className="is-off">Older →</span>
      )}
    </nav>
  );
}
