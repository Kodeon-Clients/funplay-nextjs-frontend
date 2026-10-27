"""Article HTML -> MDX. Plain paragraphs, headings, lists, bold, italics and simple links become Markdown;
anything with attributes or structure Markdown cannot express (tables, images, classed elements,
accordions) is written as JSX inside the MDX file, on one line so MDX treats it as a single block."""
import json
import re
from bs4 import NavigableString, Tag, Comment
from htmljsx import react_attrs, attr_jsx, norm_ws, VOID

MD_INLINE = {"strong", "b", "em", "i", "a", "br"}


def esc(t):
    """Escape text so MDX shows it literally."""
    t = t.replace("\\", "\\\\")
    t = re.sub(r"([`*_{}\[\]<>#|~])", r"\\\1", t)
    t = re.sub(r"&(?=[A-Za-z#][A-Za-z0-9]*;)", r"\\&", t)
    return t


def esc_line_start(t):
    """Characters that would start a Markdown block at the beginning of a line."""
    t = re.sub(r"^(\s*)([-+=])(\s|$)", r"\1\\\2\3", t)
    t = re.sub(r"^(\s*)(\d+)([.)])(\s|$)", r"\1\2\\\3\4", t)
    return t


def md_ok(el):
    """Can this inline element be written as Markdown?"""
    if el.name in ("strong", "em"):  # <b> and <i> stay as JSX (Markdown would turn them into <strong>/<em>)
        return not el.attrs
    if el.name == "a":
        return set(el.attrs) <= {"href"} and el.get("href") and " " not in el["href"] and ")" not in el["href"]
    if el.name == "br":
        return not el.attrs
    return False


def inline(el):
    """Inline content as MDX text (Markdown where possible, JSX otherwise)."""
    out = []
    for c in el.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            out.append(esc(norm_ws(str(c))))
            continue
        if md_ok(c):
            inner = inline(c)
            if c.name == "strong":
                lead, core, trail = split_ws(inner)
                out.append(f"{lead}**{core}**{trail}" if core else inner)
            elif c.name == "em":
                lead, core, trail = split_ws(inner)
                out.append(f"{lead}*{core}*{trail}" if core else inner)
            elif c.name == "a":
                out.append(f"[{inner}]({c['href']})")
            elif c.name == "br":
                out.append("<br />")
            continue
        out.append(jsx(c, inline_ctx=True))
    return "".join(out)


def split_ws(s):
    m = re.match(r"^(\s*)(.*?)(\s*)$", s, re.S)
    return m.group(1), m.group(2), m.group(3)


def jsx(el, inline_ctx=False):
    """An element as one-line JSX. Text inside JSX is still parsed by MDX, so it is escaped too."""
    attrs = " ".join(jsx_attr(k, v) for k, v in react_attrs(el))
    head = el.name + (" " + attrs if attrs else "")
    if el.name == "img":
        return f"<Img {attrs} />"
    if el.name in VOID:
        return f"<{head} />"
    inner = []
    for c in el.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            t = norm_ws(str(c))
            if t.strip():
                inner.append(esc(t))
            elif t and inner:
                inner.append(" ")
            continue
        inner.append(jsx(c, True))
    body = "".join(inner).strip() if not inline_ctx else "".join(inner)
    return f"<{head}>{body}</{el.name}>"


def jsx_attr(k, v):
    if v is True or isinstance(v, (int, dict)):
        return attr_jsx(k, v)
    import json
    return f"{k}={{{json.dumps(v, ensure_ascii=False)}}}"


def block(el, prev=None):
    """One block-level child of the article."""
    if el.name == "fp-block":
        import json
        comp = {"faq": "Faq"}[el["data-name"]]
        props = json.loads(el.get("data-props") or "{}")
        return f"<{comp} " + " ".join(f"{k}={{{json.dumps(v, ensure_ascii=False)}}}" for k, v in props.items()) + " />"
    if el.name == "p" and not el.attrs:
        text = inline(el).strip()
        if not text or text.startswith("<"):
            return jsx(el)  # a paragraph that is only JSX would lose its <p> in MDX
        return esc_line_start(text)
    if re.fullmatch(r"h[1-6]", el.name) and not el.attrs:
        return "#" * int(el.name[1]) + " " + inline(el).strip()
    if el.name in ("ul", "ol") and not el.attrs and prev != el.name and all(isinstance(li, Tag) and li.name == "li" and not li.attrs and
                                                        not li.find(["ul", "ol", "p", "div", "table", "img"])
                                                        for li in el.children if not (isinstance(li, NavigableString) and not li.strip())):
        lines = []
        n = 1
        for li in el.find_all("li", recursive=False):
            mark = "-" if el.name == "ul" else f"{n}."
            lines.append(f"{mark} {esc_line_start(inline(li).strip())}")
            n += 1
        return "\n".join(lines)
    return jsx(el)


def to_mdx(container):
    parts = []
    prev = None
    for c in container.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            if c.strip():
                # loose text outside any paragraph: an expression keeps it out of a <p>
                parts.append("{" + json.dumps(norm_ws(str(c)).strip(), ensure_ascii=False) + "}")
            continue
        b = block(c, prev)
        # two Markdown lists in a row would merge into one; the second is written as JSX instead
        prev = c.name if c.name in ("ul", "ol") and not b.startswith("<") else None
        parts.append(b)
    return "\n\n".join(p for p in parts if p) + "\n"
