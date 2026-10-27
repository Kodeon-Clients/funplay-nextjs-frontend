/**
 * Cell format of the content sheet: how stored text (plain strings, rich text, content blocks)
 * is shown in a cell and read back.
 *
 * Rich text (string or list of inline segments {tag, attrs, c}):
 *   **bold**            <strong>
 *   *italic*            <em>
 *   [text](/url)        <a href="/url">
 *   new line in cell    <br>
 *   <b>..</b>, <span class="x">..</span>, <a class="x" href="..">..</a>   any other allowed inline tag
 *   \*  \[  \]  \<  \\   a literal * [ ] < or \
 * Empty decorative elements at the start or end of a value (an empty <span class="..">) are kept
 * out of the cell and put back unchanged.
 *
 * Blocks (paragraphs and lists, e.g. FAQ answers and rich text sections): one block per paragraph,
 * blocks separated by an empty line; "- item" lines make a bulleted list, "1. item" lines a numbered one.
 *
 * Every function here is pure; the round trip parse(render(v)) === v is checked for every field
 * (fields that do not round-trip are shown as read-only).
 */

export const INLINE_TAGS = new Set(["a", "strong", "b", "em", "i", "span", "br", "sup", "sub", "small", "u", "mark", "abbr", "code", "s", "q", "cite", "time"]);
const BLOCK_TAGS = new Set(["p", "h2", "h3", "h4", "h5", "blockquote", "ul", "ol"]);
const ATTR_OUT = { className: "class", htmlFor: "for" };
const ATTR_IN = { class: "className", for: "htmlFor" };

export class FormatError extends Error {}

/* ------------------------------------------------------------------ kinds */
export function isInline(n) {
  return typeof n === "string" || (n && typeof n === "object" && typeof n.tag === "string" && INLINE_TAGS.has(n.tag) && !("items" in n));
}
export function isRich(v) {
  return Array.isArray(v) && v.every(isInline);
}
export function isBlocks(v) {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((b) => b && typeof b === "object" && BLOCK_TAGS.has(b.tag) && (Array.isArray(b.c) || Array.isArray(b.items)))
  );
}
/** "plain" | "rich" | "blocks" | null for values that are not text */
export function kindOf(v) {
  if (typeof v === "string") return "plain";
  if (isRich(v)) return "rich";
  if (isBlocks(v)) return "blocks";
  return null;
}

/* ------------------------------------------------------------------ plain text */
export function plainOf(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (isBlocks(v)) return v.map((b) => (b.items ? b.items.map(plainOf).join(" ") : plainOf(b.c))).join(" ");
  if (Array.isArray(v)) return v.map((n) => (typeof n === "string" ? n : n.tag === "br" ? " " : plainOf(n.c || []))).join("");
  return "";
}
export const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/* ------------------------------------------------------------------ rich -> cell */
const esc = (t) => t.replace(/[\\*[\]<]/g, (c) => "\\" + c);

function styleToCss(st) {
  return Object.entries(st)
    .map(([k, v]) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + v)
    .join(";");
}
function attrsOut(attrs) {
  let s = "";
  for (const [k, v] of Object.entries(attrs || {})) {
    let val = v;
    if (k === "style" && v && typeof v === "object") val = styleToCss(v);
    else if (typeof v !== "string") throw new FormatError("attribute " + k + " is not text");
    if (/"/.test(val)) throw new FormatError('attribute value contains "');
    s += ` ${ATTR_OUT[k] || k}="${val}"`;
  }
  return s;
}
const hasOnly = (attrs, keys) => Object.keys(attrs || {}).every((k) => keys.includes(k));
const empty = (n) => typeof n !== "string" && n.tag !== "br" && !plainOf(n.c || []).length && !(n.c || []).some((x) => typeof x !== "string");

function inlineOut(nodes) {
  let out = "";
  for (const n of nodes) {
    if (typeof n === "string") {
      if (n.includes("\n")) throw new FormatError("text contains a line break");
      out += esc(n);
      continue;
    }
    const inner = inlineOut(n.c || []);
    const a = n.attrs || {};
    if (n.tag === "br" && !Object.keys(a).length && !(n.c || []).length) out += "\n";
    else if (n.tag === "strong" && !Object.keys(a).length && inner) out += `**${inner}**`;
    else if (n.tag === "em" && !Object.keys(a).length && inner) out += `*${inner}*`;
    else if (n.tag === "a" && hasOnly(a, ["href"]) && typeof a.href === "string" && a.href && !/[\s()]/.test(a.href) && inner) out += `[${inner}](${a.href})`;
    else if (n.tag === "br") out += `<br${attrsOut(a)}>`;
    else out += `<${n.tag}${attrsOut(a)}>${inner}</${n.tag}>`;
  }
  return out;
}

/** Split off empty decorative elements at both ends (kept out of the cell). */
function ends(v) {
  let i = 0;
  let j = v.length;
  while (i < j && typeof v[i] !== "string" && empty(v[i])) i++;
  while (j > i && typeof v[j - 1] !== "string" && empty(v[j - 1])) j--;
  return { head: v.slice(0, i), mid: v.slice(i, j), tail: v.slice(j) };
}

export function richToCell(v) {
  if (typeof v === "string") return esc(v);
  return inlineOut(ends(v).mid);
}

/* ------------------------------------------------------------------ cell -> rich */
function parseAttrs(src, where) {
  const attrs = {};
  const re = /\s+([a-zA-Z_:][\w:.-]*)="([^"]*)"/y;
  let pos = 0;
  while (pos < src.length) {
    re.lastIndex = pos;
    const m = re.exec(src);
    if (!m) throw new FormatError(`could not read the attributes "${src.trim()}" ${where}`);
    let [, k, v] = m;
    k = ATTR_IN[k] || k;
    if (k === "style") {
      const st = {};
      for (const part of v.split(";")) {
        if (!part.trim()) continue;
        const [p, ...rest] = part.split(":");
        st[p.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = rest.join(":").trim();
      }
      attrs.style = st;
    } else attrs[k] = v;
    pos = re.lastIndex;
  }
  return attrs;
}

/** Parse a cell of rich text into inline segments. Throws FormatError with a readable message. */
export function parseRich(cell) {
  const s = String(cell ?? "").replace(/\r\n?/g, "\n");
  let i = 0;
  // stack of open containers: {kind: "root"|"strong"|"em"|"link"|"tag", tag?, attrs?, c: []}
  const stack = [{ kind: "root", c: [] }];
  const top = () => stack[stack.length - 1];
  const pushText = (t) => {
    const c = top().c;
    if (typeof c[c.length - 1] === "string") c[c.length - 1] += t;
    else c.push(t);
  };
  const close = (kind, label) => {
    const n = stack.pop();
    if (n.kind !== kind) throw new FormatError(`"${label}" closes something that was not opened (open: ${describe(n)})`);
    return n;
  };
  const describe = (n) => (n.kind === "tag" ? `<${n.tag}>` : n.kind === "strong" ? "**" : n.kind === "em" ? "*" : n.kind === "link" ? "[" : "nothing");
  while (i < s.length) {
    const ch = s[i];
    if (ch === "\\" && i + 1 < s.length && /[\\*[\]<]/.test(s[i + 1])) {
      pushText(s[i + 1]);
      i += 2;
      continue;
    }
    if (ch === "\n") {
      top().c.push({ tag: "br" });
      i++;
      continue;
    }
    if (s.startsWith("**", i)) {
      if (top().kind === "strong") {
        const n = close("strong", "**");
        top().c.push({ tag: "strong", c: n.c });
      } else stack.push({ kind: "strong", c: [] });
      i += 2;
      continue;
    }
    if (ch === "*") {
      if (top().kind === "em") {
        const n = close("em", "*");
        top().c.push({ tag: "em", c: n.c });
      } else stack.push({ kind: "em", c: [] });
      i++;
      continue;
    }
    if (ch === "[") {
      stack.push({ kind: "link", c: [] });
      i++;
      continue;
    }
    if (ch === "]" && top().kind === "link") {
      const m = /^\]\(([^\s()]+)\)/.exec(s.slice(i));
      if (!m) throw new FormatError('a link needs the form [text](/address) — "](" not found after "["');
      const n = close("link", "]");
      top().c.push({ tag: "a", attrs: { href: m[1] }, c: n.c });
      i += m[0].length;
      continue;
    }
    if (ch === "]") throw new FormatError('"]" without a matching "[" (write \\] for a literal bracket)');
    if (ch === "<") {
      const closeTag = /^<\/([a-z][a-z0-9]*)\s*>/.exec(s.slice(i));
      if (closeTag) {
        const n = stack.pop();
        if (n.kind !== "tag" || n.tag !== closeTag[1]) throw new FormatError(`</${closeTag[1]}> closes something that was not opened (open: ${describe(n)})`);
        const node = { tag: n.tag };
        if (Object.keys(n.attrs).length) node.attrs = n.attrs;
        if (n.c.length) node.c = n.c;
        top().c.push(node);
        i += closeTag[0].length;
        continue;
      }
      const open = /^<([a-z][a-z0-9]*)((?:\s+[a-zA-Z_:][\w:.-]*="[^"]*")*)\s*(\/?)>/.exec(s.slice(i));
      if (!open) throw new FormatError('could not read a tag starting with "<" (write \\< for a literal <)');
      const [, tag, rawAttrs, selfClose] = open;
      if (!INLINE_TAGS.has(tag)) throw new FormatError(`<${tag}> is not allowed here (allowed: ${[...INLINE_TAGS].join(", ")})`);
      const attrs = parseAttrs(rawAttrs, `in <${tag}>`);
      for (const k of Object.keys(attrs)) if (/^on/i.test(k)) throw new FormatError(`${k} is not allowed`);
      if (tag === "a" && attrs.href !== undefined && /^\s*javascript:/i.test(attrs.href)) throw new FormatError("javascript: links are not allowed");
      if (tag === "br" || selfClose) {
        const node = { tag };
        if (Object.keys(attrs).length) node.attrs = attrs;
        top().c.push(node);
      } else stack.push({ kind: "tag", tag, attrs, c: [] });
      i += open[0].length;
      continue;
    }
    pushText(ch);
    i++;
  }
  if (stack.length > 1) throw new FormatError(`${describe(top())} is opened but not closed`);
  return stack[0].c;
}

/** Cell -> stored value, keeping the shape of the old value (plain string stays a string when possible). */
export function cellToRich(cell, old) {
  const segs = parseRich(cell);
  if (typeof old === "string" || old === undefined) {
    if (segs.length === 0) return "";
    if (segs.length === 1 && typeof segs[0] === "string") return segs[0];
    return segs;
  }
  const { head, tail } = ends(old);
  return [...head, ...segs, ...tail];
}

/* ------------------------------------------------------------------ blocks */
export function blocksToCell(blocks) {
  return blocks
    .map((b) => {
      if (b.attrs && Object.keys(b.attrs).length) throw new FormatError("block with attributes");
      if (b.tag === "ul") return b.items.map((it) => "- " + richToCell(it)).join("\n");
      if (b.tag === "ol") return b.items.map((it, i) => `${i + 1}. ` + richToCell(it)).join("\n");
      const text = richToCell(b.c);
      if (text.includes("\n")) throw new FormatError("line break inside a paragraph");
      if (b.tag === "p") {
        if (/^(- |\d+\. |#{2,5} |> )/.test(text) || text === "") throw new FormatError("paragraph that looks like a list");
        return text;
      }
      if (b.tag === "blockquote") return "> " + text;
      return "#".repeat(Number(b.tag[1])) + " " + text;
    })
    .join("\n\n");
}

export function parseBlocks(cell) {
  const s = String(cell ?? "").replace(/\r\n?/g, "\n").trim();
  if (!s) return [];
  const out = [];
  for (const chunk of s.split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((l) => l.trimEnd());
    if (lines.every((l) => /^- /.test(l))) out.push({ tag: "ul", items: lines.map((l) => parseRich(l.slice(2))) });
    else if (lines.every((l) => /^\d+\. /.test(l))) out.push({ tag: "ol", items: lines.map((l) => parseRich(l.replace(/^\d+\. /, ""))) });
    else {
      const text = lines.join(" ");
      const h = /^(#{2,5}) (.*)$/.exec(text);
      if (h) out.push({ tag: "h" + h[1].length, c: parseRich(h[2]) });
      else if (text.startsWith("> ")) out.push({ tag: "blockquote", c: parseRich(text.slice(2)) });
      else out.push({ tag: "p", c: parseRich(text) });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ dispatch by kind */
export function toCell(kind, v) {
  if (kind === "plain") return v;
  if (kind === "rich") return richToCell(v);
  if (kind === "blocks") return blocksToCell(v);
  throw new FormatError("unknown kind " + kind);
}

export function fromCell(kind, cell, old) {
  if (kind === "plain") return String(cell ?? "");
  if (kind === "rich") return cellToRich(cell, old);
  if (kind === "blocks") return parseBlocks(cell);
  throw new FormatError("unknown kind " + kind);
}

/** Does the value survive a round trip through its cell form? */
export function roundTrips(kind, v) {
  try {
    const cell = toCell(kind, v);
    return JSON.stringify(fromCell(kind, cell, v)) === JSON.stringify(v);
  } catch {
    return false;
  }
}
