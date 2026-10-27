"""Template inference: turn many HTML fragments that share a structure into one React component plus
plain-data props per fragment. A single fragment gives a component with everything written inline.

build(nodes) walks the fragments in parallel. Whatever is identical in all of them is written into the
component as JSX; whatever differs becomes a prop (text, attribute values, rich text as structured
segments, repeated children as arrays). Lists are detected where instances repeat a sibling a different
number of times."""
import json
import re
from bs4 import BeautifulSoup, NavigableString, Tag, Comment
from htmljsx import (RICH_TRIM, VOID, INLINE_LEVEL, is_icon, is_rich, react_attrs, attr_jsx, text_jsx, js, norm_ws,
                     segments, seg_plain, segments_jsx)

PLAIN_IMG = [False]  # landing pages keep plain <img> (they never had the responsive image upgrade)
# Text as data: when set, every visible text (and rich text) becomes a prop even if it is the same in all
# instances, so it lives in the page's JSON and can be edited from the content sheet. Used for sections
# that belong to one page only; text shared by many pages of a family stays in the template.
TEXT_PROPS = [False]
NO_TEXT_PROPS_IN = {"select", "option", "textarea", "script", "style", "svg"}
REC = {}        # id(node) -> page record (for special hooks that need page data)
USED = set()    # helper components referenced by generated code
BLOCK_COMPONENTS = {"faq": "Faq", "city-facts": "CityFacts", "rich-text": "RichText", "local-links": "LocalLinks"}
BLOCK_TAGS = {"div", "section", "ul", "ol", "li", "p", "h1", "h2", "h3", "h4", "h5", "h6", "form", "table", "thead",
              "tbody", "tr", "td", "th", "nav", "header", "footer", "figure", "article", "aside", "main", "details",
              "summary", "dl", "dt", "dd", "blockquote", "fieldset", "hr", "br", "select", "option"}
NO_TEXT_PARENTS = {"ul", "ol", "table", "thead", "tbody", "tr", "select", "dl", "colgroup"}


class Text:
    __slots__ = ("t",)

    def __init__(self, t):
        self.t = t

    def __str__(self):
        return self.t


# ---------------------------------------------------------------- children with HTML whitespace rules
def kids(el):
    raw = [c for c in el.children if not isinstance(c, Comment)]
    out = []
    block_parent = el.name in BLOCK_TAGS or el.name in ("[document]",)
    for i, c in enumerate(raw):
        if isinstance(c, NavigableString):
            s = str(c)
            if s.strip():
                t = norm_ws(s)
                if block_parent and not out:
                    t = t.lstrip()
                if block_parent and i == len(raw) - 1:
                    t = t.rstrip()
                if t:
                    out.append(Text(t))
                continue
            if el.name in NO_TEXT_PARENTS:
                continue
            prev = next((x for x in reversed(raw[:i]) if not isinstance(x, Comment)), None)
            nxt = next((x for x in raw[i + 1:] if not isinstance(x, Comment)), None)
            if prev is None or nxt is None:
                if block_parent:
                    continue
            inline = any(isinstance(x, Tag) and (x.name in INLINE_LEVEL or is_icon(x)) for x in (prev, nxt))
            if inline and out and not isinstance(out[-1], Text):
                out.append(Text(" "))
            continue
        out.append(c)
    # a trailing " " separator at the end of a block parent never renders
    if block_parent and out and isinstance(out[-1], Text) and out[-1].t == " ":
        out.pop()
    return out


# ---------------------------------------------------------------- skeletons
def kind(n):
    if isinstance(n, Text):
        return "T" if n.t != " " else "_"
    if n.name == "fp-block":
        return "B:" + n.get("data-name", "")
    if n.name == "fp-article":
        return "A"
    if is_icon(n):
        return "I"
    if n.get("id") in SPECIAL:
        return "S:" + n["id"]
    if is_rich(n):
        return f"R<{n.name}>"
    return f"<{n.name}>"


def skel(n, top=False):
    k = kind(n)
    if not (k.startswith("<")):
        return k
    head = f"<{n.name}" + (" ." + ".".join(sorted(n.get("class", []))) if top else "") + ">"
    parts, prev = [], None
    for c in kids(n):
        s = skel(c)
        if s == prev:
            continue
        parts.append(s)
        prev = s
    return head + "(" + ",".join(parts) + ")"


def runs(n):
    """Children grouped into runs of consecutive siblings with the same skeleton."""
    out = []
    for c in kids(n):
        s = skel(c)
        if out and out[-1][0] == s:
            out[-1][1].append(c)
        else:
            out.append((s, [c]))
    return out


# ---------------------------------------------------------------- scopes and prop naming
class Scope:
    def __init__(self, var):
        self.var = var
        self.used = set()
        self.types = {}

    def key(self, base, typ):
        parts = re.split(r"[^A-Za-z0-9]+", base)
        base = "".join(w[:1].upper() + w[1:] for w in parts if w) or "v"
        base = base[0].lower() + base[1:]
        k, n = base, 2
        while k in self.used:
            k, n = f"{base}{n}", n + 1
        self.used.add(k)
        self.types[k] = typ
        return k

    def ref(self, k):
        return f"{self.var}.{k}"


def type_of(scope):
    if not scope.types:
        return "Record<string, never>"
    return "{ " + "; ".join(f"{k}{'?' if t.endswith('|undefined') else ''}: {t.replace('|undefined', '')}" for k, t in scope.types.items()) + " }"


def nice(name, attr):
    return name + "-" + attr


# ---------------------------------------------------------------- special elements
def gallery_props(n):
    rec = REC.get(id(n)) or {}
    d = rec.get("data") or {}
    return {"colours": d.get("colours") or [], "name": d.get("name") or ""}


SPECIAL = {
    "carouselImages": ("ProductGallery", gallery_props),
    "projects-container": ("ProjectsGrid", lambda n: {}),
}


# ---------------------------------------------------------------- constant emission
def tagname(n):
    if is_icon(n):
        USED.add("Icon")
        return "Icon"
    if n.name == "img":
        name = "PlainImg" if PLAIN_IMG[0] else "Img"
        USED.add(name)
        return name
    return n.name


def const(n):
    if isinstance(n, Text):
        return text_jsx(n.t)
    if n.name == "fp-article":
        USED.add("BlogArticle")
        return f'<BlogArticle slug="{n["data-slug"]}" />'
    if n.name == "fp-block":
        comp = BLOCK_COMPONENTS[n["data-name"]]
        USED.add(comp)
        return f"<{comp} {{...{js(block_props(n))}}} />"
    if n.get("id") in SPECIAL:
        comp, fn = SPECIAL[n["id"]]
        USED.add(comp)
        attrs = " ".join(attr_jsx(k, v) for k, v in react_attrs(n))
        props = fn(n)
        extra = (" {..." + js(props) + "}") if props else ""
        return f"<{comp} {attrs}{extra} />"
    t = tagname(n)
    ra = react_attrs(n)
    parts = gallery_attrs([attr_jsx(k, v) for k, v in ra], {k: js(v) for k, v in ra if k in ("data-alts", "data-imgs")})
    attrs = " ".join(parts)
    head = t + (" " + attrs if attrs else "")
    if n.name in VOID or t in ("Icon", "Img", "PlainImg"):
        return f"<{head} />"
    if is_rich(n):
        return f"<{head}>{segments_jsx(segments(n, trim=n.name in RICH_TRIM))}</{n.name}>"
    return f"<{head}>" + "".join(const(c) for c in kids(n)) + f"</{n.name}>"


def has_text(n):
    """Does this subtree hold visible text that TEXT_PROPS turns into props?"""
    if isinstance(n, Text):
        return bool(n.t.strip())
    if n.name == "fp-block":
        return True
    if n.name == "fp-article" or n.get("id") in SPECIAL or is_icon(n) or n.name in NO_TEXT_PROPS_IN:
        return False
    if is_rich(n):
        return bool(n.get_text().strip())
    return any(has_text(c) for c in kids(n))


def gallery_attrs(parts, exprs):
    """Colour swatches carry their photos and alt texts as JSON in data-imgs / data-alts; both go
    through lib/image-seo so image swaps and alt texts from the content sheet apply to them too."""
    if "data-alts" not in exprs and "data-imgs" not in exprs:
        return parts
    USED.add("gallery")
    imgs = exprs.get("data-imgs", '""')
    out = []
    for p in parts:
        if p.startswith("data-alts="):
            p = f"data-alts={{galleryAlts({imgs}, {exprs['data-alts']})}}"
        elif p.startswith("data-imgs="):
            p = f"data-imgs={{galleryImgs({imgs})}}"
        out.append(p)
    return out


def same(nodes):
    a = str(nodes[0])
    return all(str(x) == a for x in nodes[1:])


# ---------------------------------------------------------------- fp-block props as plain data
def html_to_blocks(html):
    """Rich HTML written for content blocks -> list of {tag, attrs?, c} paragraphs / lists / headings."""
    soup = BeautifulSoup(html, "html.parser")
    out = []
    for el in soup.children:
        if isinstance(el, NavigableString):
            if el.strip():
                out.append({"tag": "p", "c": [norm_ws(str(el)).strip()]})
            continue
        attrs = {k: v for k, v in react_attrs(el)}
        if el.name in ("ul", "ol"):
            items = [segments(li) for li in el.find_all("li", recursive=False)]
            out.append({"tag": el.name, **({"attrs": attrs} if attrs else {}), "items": items})
        else:
            out.append({"tag": el.name, **({"attrs": attrs} if attrs else {}), "c": segments(el)})
    return out


def block_props(n):
    p = json.loads(n.get("data-props") or "{}")
    name = n["data-name"]
    if name == "rich-text" and "html" in p:
        p["content"] = html_to_blocks(p.pop("html"))
    if name == "faq":
        for it in p.get("items", []):
            if "<" in it.get("a", ""):
                it["a"] = html_to_blocks(it["a"] if it["a"].lstrip().startswith("<") else f"<p>{it['a']}</p>")
    if name == "local-links" and "html" in p:
        p["content"] = html_to_blocks(p.pop("html"))
    return p


# ---------------------------------------------------------------- the builder
def build(nodes, scope, hint="", depth=0):
    """Returns (jsx, datas) for a set of aligned nodes; datas[i] holds the props instance i contributes."""
    n0 = nodes[0]
    empty = [{} for _ in nodes]
    if isinstance(n0, Text):
        if all(x.t == n0.t for x in nodes) and not (TEXT_PROPS[0] and n0.t.strip()):
            return text_jsx(n0.t), empty
        k = scope.key(hint + "Text" if hint else "text", "string")
        return "{" + scope.ref(k) + "}", [{k: x.t} for x in nodes]
    if same(nodes) and not (TEXT_PROPS[0] and has_text(n0)):
        return const(n0), empty
    if n0.name == "fp-article":
        USED.add("BlogArticle")
        k = scope.key("article", "React.ComponentProps<typeof BlogArticle>")
        return f"<BlogArticle {{...{scope.ref(k)}}} />", [{k: {"slug": x["data-slug"]}} for x in nodes]
    if n0.name == "fp-block":
        comp = BLOCK_COMPONENTS[n0["data-name"]]
        USED.add(comp)
        k = scope.key(comp, f"React.ComponentProps<typeof {comp}>")
        return f"<{comp} {{...{scope.ref(k)}}} />", [{k: block_props(x)} for x in nodes]
    if n0.get("id") in SPECIAL:
        comp, fn = SPECIAL[n0["id"]]
        USED.add(comp)
        attrs = " ".join(attr_jsx(a, v) for a, v in react_attrs(n0))
        k = scope.key(comp, f"React.ComponentProps<typeof {comp}>")
        return f"<{comp} {attrs} {{...{scope.ref(k)}}} />", [{k: fn(x)} for x in nodes]

    t = tagname(n0)
    base = hint or n0.name
    datas = [dict() for _ in nodes]
    # attributes
    names = []
    for x in nodes:
        for a, _ in react_attrs(x):
            if a not in names:
                names.append(a)
    parts, exprs = [], {}
    for a in names:
        vals = []
        for x in nodes:
            d = dict(react_attrs(x))
            vals.append(d.get(a))
        if all(v == vals[0] for v in vals) and vals[0] is not None:
            parts.append(attr_jsx(a, vals[0]))
            if a in ("data-alts", "data-imgs"):
                exprs[a] = js(vals[0])
            continue
        if a.startswith("data-"):
            typ = "string"
        else:
            typ = f'React.ComponentProps<"{n0.name}">["{a}"]' if t == n0.name else f'React.ComponentProps<typeof {t}>["{a}"]'
        if any(v is None for v in vals):
            typ += "|undefined"
        k = scope.key(nice(base, a if a != "className" else "class"), typ)
        parts.append(f"{a}={{{scope.ref(k)}}}")
        if a in ("data-alts", "data-imgs"):
            exprs[a] = scope.ref(k)
        for i, v in enumerate(vals):
            if v is not None:
                datas[i][k] = v
    parts = gallery_attrs(parts, exprs)
    head = t + (" " + " ".join(parts) if parts else "")
    if n0.name in VOID or t in ("Icon", "Img", "PlainImg"):
        return f"<{head} />", datas

    # rich content
    if is_rich(n0):
        trim = n0.name in RICH_TRIM
        segs = [segments(x, trim=trim) for x in nodes]
        if all(s == segs[0] for s in segs) and not (TEXT_PROPS[0] and n0.get_text().strip()):
            return f"<{head}>{segments_jsx(segs[0])}</{n0.name}>", datas
        plain = all(seg_plain(s) is not None for s in segs)
        k = scope.key(base + "Text" if not hint else hint, "string" if plain else "Rich")
        for i, s in enumerate(segs):
            datas[i][k] = seg_plain(s) if plain else s
        if plain:
            return f"<{head}>{{{scope.ref(k)}}}</{n0.name}>", datas
        USED.add("R")
        return f"<{head}><R v={{{scope.ref(k)}}} /></{n0.name}>", datas

    # children, aligned run by run
    all_runs = [runs(x) for x in nodes]
    nparts = len(all_runs[0])
    assert all(len(r) == nparts for r in all_runs), "skeleton mismatch"
    body = []
    for j in range(nparts):
        groups = [r[j][1] for r in all_runs]
        if all(len(g) == 1 for g in groups):
            child = [g[0] for g in groups]
            cj, cd = build(child, scope, "", depth + 1)
            body.append(cj)
            for i, d in enumerate(cd):
                datas[i].update(d)
            continue
        items = [it for g in groups for it in g]
        var = "it" if depth == 0 and scope.var == "p" else f"{scope.var}x"
        var = re.sub(r"[^A-Za-z]", "", var) or "it"
        isc = Scope(var)
        ij, idatas = build(items, isc, "", depth + 1)
        k = scope.key("items", f"{type_of(isc)}[]")
        if ij.startswith("<") and not ij.startswith("<>"):
            m = re.match(r"<([A-Za-z][\w.]*)", ij)
            ij = ij[: m.end()] + " key={i}" + ij[m.end():]
        else:
            USED.add("Fragment")
            ij = f"<Fragment key={{i}}>{ij}</Fragment>"
        ivar = isc.var
        body.append(f"{{{scope.ref(k)}.map(({ivar}, i) => ({ij}))}}" if isc.types else f"{{{scope.ref(k)}.map((_, i) => ({ij}))}}")
        pos = 0
        for i, g in enumerate(groups):
            datas[i][k] = idatas[pos: pos + len(g)]
            pos += len(g)
    return f"<{head}>" + "".join(body) + f"</{n0.name}>", datas


IMPORTS = {
    "Icon": 'import Icon from "@/components/ui/Icon";',
    "Img": 'import Img from "@/components/ui/Img";',
    "PlainImg": 'import { PlainImg } from "@/components/ui/Img";',
    "gallery": 'import { galleryAlts, galleryImgs } from "@/lib/image-seo";',
    "R": 'import R, { type Rich } from "@/components/ui/Rich";',
    "Faq": 'import Faq from "@/components/blocks/Faq";',
    "CityFacts": 'import CityFacts from "@/components/blocks/CityFacts";',
    "RichText": 'import RichText from "@/components/blocks/RichText";',
    "LocalLinks": 'import LocalLinks from "@/components/blocks/LocalLinks";',
    "ProductGallery": 'import ProductGallery from "@/components/ui/ProductGallery";',
    "ProjectsGrid": 'import ProjectsGrid from "@/components/ProjectsGrid";',
    "Fragment": 'import { Fragment } from "react";',
    "BlogArticle": 'import BlogArticle from "@/components/BlogArticle";',
}


def component_source(name, jsx, scope, doc=""):
    """Full .tsx source of a generated component (USED must hold only this component's helpers)."""
    used = sorted(USED)
    imps = [IMPORTS[u] for u in used if u in IMPORTS]
    needs_react = "React." in type_of(scope)
    if needs_react:
        imps.insert(0, 'import type React from "react";')
    if scope.types:
        props_t = f"export type {name}Props = {type_of(scope)};\n\n"
        sig = f"p: {name}Props"
    else:
        props_t, sig = "", ""
    head = (f"/** {doc} */\n" if doc else "")
    return "\n".join(imps) + ("\n\n" if imps else "") + props_t + head + f"export default function {name}({sig}) {{\n  return (\n    {jsx}\n  );\n}}\n"
