import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import BlogHub from "@/components/blog/BlogHub";
import { allHubs, hubPage, type HubProps } from "@/lib/blog";

export const dynamicParams = false;

type Params = { params: Promise<{ hub: string }> };

/** Topic and audience hubs: /blog/category/<id>.html, data in content/pages/blog-category-<id>.json. */
export function generateStaticParams() {
  return allHubs().map((h) => ({ hub: `${h.hub}.html` }));
}

const find = async (params: Params["params"]) => hubPage((await params).hub.replace(/\.html$/, "")) as PageMeta | undefined;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = await find(params);
  return page ? buildMetadata(page) : {};
}

export default async function Page({ params }: Params) {
  const page = await find(params);
  if (!page) notFound();
  return (
    <PageShell page={page}>
      <BlogHub {...section<HubProps>(page, "BlogHub")} />
    </PageShell>
  );
}
