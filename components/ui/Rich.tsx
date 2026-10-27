import { createElement, Fragment } from "react";

/** Inline formatted text stored as data: plain strings plus a few inline tags (links, bold, line breaks). */
export type Inline = string | { tag: string; attrs?: Record<string, unknown>; c?: Inline[] };
export type Rich = string | Inline[];

const ALLOWED = new Set(["a", "strong", "b", "em", "i", "span", "br", "sup", "sub", "small", "u", "mark", "abbr", "code", "s", "q", "cite", "time"]);

function node(n: Inline, key: number): React.ReactNode {
  if (typeof n === "string") return <Fragment key={key}>{n}</Fragment>;
  if (!ALLOWED.has(n.tag)) throw new Error(`Rich: tag <${n.tag}> is not allowed`);
  return createElement(n.tag, { key, ...(n.attrs ?? {}) }, n.c ? n.c.map(node) : undefined);
}

export default function R({ v }: { v: Rich }) {
  if (typeof v === "string") return <>{v}</>;
  return <>{v.map(node)}</>;
}

/** Plain text of rich content (for structured data). */
export function richText(v: Rich | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.map((n) => (typeof n === "string" ? n : n.tag === "br" ? " " : richText(n.c ?? []))).join("");
}
