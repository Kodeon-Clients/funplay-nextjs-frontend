import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/blog.json";
import BlogIndex, { type BlogIndexProps } from "@/components/blog/BlogIndex";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <BlogIndex {...section<BlogIndexProps>(page, "BlogIndex")} />
    </PageShell>
  );
}
