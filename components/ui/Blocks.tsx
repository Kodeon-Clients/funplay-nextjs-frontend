import R, { richText, type Inline } from "./Rich";

type Attrs = Record<string, unknown>;
export type TextBlock = { tag: "p" | "h2" | "h3" | "h4" | "h5" | "blockquote"; attrs?: Attrs; c: Inline[] };
export type ListBlock = { tag: "ul" | "ol"; attrs?: Attrs; items: Inline[][] };
/** Paragraphs, headings and lists of new copy, stored as data (see content-src). */
export type Block = TextBlock | ListBlock;

const isList = (b: Block): b is ListBlock => b.tag === "ul" || b.tag === "ol";

export default function Blocks({ content }: { content: Block[] }) {
  return (
    <>
      {content.map((b, i) => {
        if (isList(b)) {
          const List = b.tag;
          return (
            <List key={i} {...(b.attrs ?? {})}>
              {b.items.map((it, j) => (
                <li key={j}>
                  <R v={it} />
                </li>
              ))}
            </List>
          );
        }
        const T = b.tag;
        return (
          <T key={i} {...(b.attrs ?? {})}>
            <R v={b.c} />
          </T>
        );
      })}
    </>
  );
}

export function blocksText(content: Block[] | string): string {
  if (typeof content === "string") return content;
  return content.map((b) => (isList(b) ? b.items.map((it) => richText(it)).join(" ") : richText(b.c))).join(" ");
}
