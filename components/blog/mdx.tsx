import { Children, isValidElement, type ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import Img from "@/components/ui/Img";
import { slugify } from "@/lib/blog";

/**
 * Components available inside blog posts (content/blog/<slug>.mdx), besides plain markdown.
 * Each one is written on a single line in the MDX file, e.g.
 *   <Figure src="/images/g1.jpg" alt="..." caption="..." />
 *   <Tip title="Site tip" text="..." />
 *   <Checklist title="..." items={["...", "..."]} />
 *   <Table caption="..." head={["", "A", "B"]} rows={[["Cost", "Low", "High"]]} />
 *   <Products /> and <Projects />  (the post's own product and project cards, placed in the text)
 */

const textOf = (n: ReactNode): string =>
  Children.toArray(n)
    .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : isValidElement<{ children?: ReactNode }>(c) ? textOf(c.props.children) : ""))
    .join("");

export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="fpb-figure">
      <Img src={src} alt={alt} loading="lazy" sizes="(max-width: 991px) 100vw, 760px" />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function Tip({ title = "Tip", text }: { title?: string; text: string }) {
  return (
    <aside className="fpb-tip">
      <p className="fpb-tip-title">{title}</p>
      <p>{text}</p>
    </aside>
  );
}

export function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="fpb-checklist">
      <p className="fpb-checklist-title">{title}</p>
      <ul>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </section>
  );
}

export function Table({ caption, head, rows }: { caption?: string; head: string[]; rows: string[][] }) {
  return (
    <div className="fpb-table" role="region" aria-label={caption || "Comparison table"} tabIndex={0}>
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const blogMdx: MDXComponents = {
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  a: ({ href = "", children }) => (/^https?:\/\//.test(href) && !href.includes("funplaysystems.com") ? <a href={href} target="_blank" rel="noopener">{children}</a> : <a href={href}>{children}</a>),
  table: ({ children }) => (
    <div className="fpb-table">
      <table>{children}</table>
    </div>
  ),
  Img,
  Figure,
  Tip,
  Checklist,
  Table,
};
