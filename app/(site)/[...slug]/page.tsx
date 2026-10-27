import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { sections as citySections } from "@/components/templates/city";
import { sections as productSections } from "@/components/templates/product";
import { sections as blogSections } from "@/components/templates/blog";
import { buildMetadata } from "@/lib/page";
import { getTemplatedPage, templatedPages, type Family } from "@/lib/pages";

export const dynamicParams = false;

const REGISTRY: Record<Family, Record<string, ComponentType<any>>> = { city: citySections, product: productSections, blog: blogSections }; // eslint-disable-line @typescript-eslint/no-explicit-any

type Params = { params: Promise<{ slug: string[] }> };

const toPath = (slug: string[]) => "/" + slug.map(decodeURIComponent).join("/");

export function generateStaticParams() {
  // ONLY_PATHS builds a handful of pages quickly, e.g. ONLY_PATHS="/corecraft/castle-crest/crown-court-3.html"
  const only = process.env.ONLY_PATHS?.split(",").filter(Boolean);
  return templatedPages()
    .filter((p) => !only || only.includes(p.path))
    .map((p) => ({ slug: p.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = getTemplatedPage(toPath((await params).slug));
  return page ? buildMetadata(page) : {};
}

/** City, product and blog pages: the page's JSON lists its sections; each is a component fed plain data. */
export default async function Page({ params }: Params) {
  const page = getTemplatedPage(toPath((await params).slug));
  if (!page) notFound();
  const registry = REGISTRY[page.family];
  return (
    <PageShell page={page}>
      {page.sections.map((s, i) => {
        const C = registry[s.component];
        if (!C) throw new Error(`Unknown section ${s.component} on ${page.path}`);
        return <C key={i} {...s.props} />;
      })}
    </PageShell>
  );
}
