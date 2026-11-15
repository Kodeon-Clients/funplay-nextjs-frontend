import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/blog.json";
import BlogIndex, { type BlogIndexProps } from "@/components/blog/BlogIndex";
import { allPosts, pagePath, PER_PAGE } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const dynamicParams = false;

type Params = { params: Promise<{ n: string }> };

const pages = () => Math.max(1, Math.ceil((allPosts().length - 1) / PER_PAGE));

/** Older posts: /blog/page/2.html, /blog/page/3.html, ... (page 1 is /blog.html). */
export function generateStaticParams() {
  return Array.from({ length: pages() - 1 }, (_, i) => ({ n: `${i + 2}.html` }));
}

function pageFor(n: number): PageMeta {
  const base = meta as PageMeta;
  const p = pagePath(n);
  const title = `${base.seo.title.split(" | ")[0]}: Page ${n} | FunPlay Blog`;
  return {
    ...base,
    path: p,
    seo: { ...base.seo, title, canonical: SITE.url + p, og: { ...base.seo.og, "og:url": SITE.url + p, "og:title": title } },
    schema: { pageType: "CollectionPage", breadcrumb: [["Home", `${SITE.url}/`], ["Blog", `${SITE.url}/blog.html`], [`Page ${n}`, SITE.url + p]] },
  };
}

const num = (s: string) => Number(/^(\d+)\.html$/.exec(s)?.[1] ?? NaN);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const n = num((await params).n);
  return n >= 2 ? buildMetadata(pageFor(n)) : {};
}

export default async function Page({ params }: Params) {
  const n = num((await params).n);
  if (!(n >= 2 && n <= pages())) notFound();
  const page = pageFor(n);
  return (
    <PageShell page={page}>
      <BlogIndex {...section<BlogIndexProps>(page, "BlogIndex")} page={n} />
    </PageShell>
  );
}
