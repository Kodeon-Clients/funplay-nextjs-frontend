"""HTML -> JSX building blocks: attribute mapping, style objects, text literals, inline (rich) segments.

Used by templ.py (component generator). Everything here works on BeautifulSoup nodes parsed with
html.parser, which lower-cases attribute names (so SVG names are restored from a table)."""
import json
import re
from bs4 import NavigableString, Tag, Comment

# HTML attribute -> React prop
ATTR = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "maxlength": "maxLength", "minlength": "minLength",
    "readonly": "readOnly", "autocomplete": "autoComplete", "autofocus": "autoFocus", "autoplay": "autoPlay",
    "playsinline": "playsInline", "frameborder": "frameBorder", "allowfullscreen": "allowFullScreen",
    "srcset": "srcSet", "crossorigin": "crossOrigin", "enctype": "encType", "novalidate": "noValidate",
    "referrerpolicy": "referrerPolicy", "fetchpriority": "fetchPriority", "itemscope": "itemScope",
    "itemtype": "itemType", "itemprop": "itemProp", "colspan": "colSpan", "rowspan": "rowSpan",
    "datetime": "dateTime", "accesskey": "accessKey", "contenteditable": "contentEditable", "spellcheck": "spellCheck",
    "inputmode": "inputMode", "enterkeyhint": "enterKeyHint", "cellpadding": "cellPadding", "cellspacing": "cellSpacing",
    "usemap": "useMap", "formaction": "formAction", "hreflang": "hrefLang", "charset": "charSet", "http-equiv": "httpEquiv",
    # SVG (html.parser lower-cases them)
    "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio", "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap", "stroke-linejoin": "strokeLinejoin", "stroke-miterlimit": "strokeMiterlimit",
    "stroke-dasharray": "strokeDasharray", "stroke-dashoffset": "strokeDashoffset", "stroke-opacity": "strokeOpacity",
    "fill-rule": "fillRule", "fill-opacity": "fillOpacity", "clip-rule": "clipRule", "clip-path": "clipPath",
    "stop-color": "stopColor", "stop-opacity": "stopOpacity", "gradientunits": "gradientUnits",
    "gradienttransform": "gradientTransform", "xlink:href": "xlinkHref", "xmlns:xlink": "xmlnsXlink",
    "font-size": "fontSize", "font-family": "fontFamily", "text-anchor": "textAnchor",
    "defaultvalue": "defaultValue", "defaultchecked": "defaultChecked",
}
BOOL = {"allowfullscreen", "controls", "disabled", "hidden", "required", "open", "itemscope", "autoplay", "muted", "loop",
        "playsinline", "readonly", "multiple", "novalidate", "checked", "selected", "async", "defer", "reversed", "autofocus"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
INLINE = {"a", "strong", "b", "em", "i", "span", "br", "sup", "sub", "small", "u", "mark", "abbr", "code", "s", "q", "cite", "time"}
# tags that are inline-level for whitespace purposes
INLINE_LEVEL = INLINE | {"img", "input", "button", "select", "label", "textarea", "svg", "iframe", "video", "canvas"}
# rich elements whose leading/trailing spaces never render (block or inline-block boxes)
RICH_TRIM = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "label", "button", "figcaption", "blockquote",
             "summary", "dt", "dd", "option", "div", "caption", "address"}
RICH_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "span", "a", "label", "button", "td", "th", "figcaption",
             "blockquote", "strong", "b", "em", "small", "summary", "dt", "dd", "option", "sup", "div", "caption", "address"}
ICON_PREFIXES = ("bi-", "fa-", "icon-feather-", "line-icon-", "ti-", "feather-")


def is_icon(el):
    if not isinstance(el, Tag) or el.name not in ("i", "span"):
        return False
    cls = el.get("class") or []
    return any(c.startswith(ICON_PREFIXES) for c in cls) and not el.get_text(strip=True)


def is_rich(el):
    """Element whose content is only text and inline formatting (no icons, images or blocks)."""
    if el.name not in RICH_TAGS:
        return False
    for c in el.descendants:
        if isinstance(c, Tag):
            if c.name not in INLINE or is_icon(c):
                return False
    return True


def camel(prop):
    if prop.startswith("--"):
        return prop
    if prop.startswith("-ms-"):
        prop = prop[1:]
    parts = prop.split("-")
    out = parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:])
    if prop.startswith("-"):
        out = out[:1].upper() + out[1:]
    return out


def style_obj(css):
    out = {}
    for decl in re.split(r";(?![^(]*\))", css or ""):
        if ":" not in decl:
            continue
        k, v = decl.split(":", 1)
        k, v = k.strip().lower(), v.strip()
        if k and v:
            out[camel(k)] = norm_ws(v)
    return out


def js(v):
    """JS literal for a Python value (strings, numbers, dicts, lists)."""
    return json.dumps(v, ensure_ascii=False)


NUMERIC = {"tabindex", "rows", "cols", "maxlength", "minlength", "colspan", "rowspan", "size", "span", "start"}
# attributes that are not valid on the element and have no effect in browsers
INVALID = {("img", "preload"), ("span", "for"), ("div", "for"), ("p", "for")}


def react_attrs(el):
    """Ordered list of (react_name, value) where value is str | int | True | dict(style)."""
    out = []
    for k, v in el.attrs.items():
        if k in ("p",) or (el.name, k) in INVALID:  # stray / invalid attributes in the source markup
            continue
        if isinstance(v, list):
            v = " ".join(v)
        name = ATTR.get(k, k)
        if k == "style":
            out.append(("style", style_obj(v)))
            continue
        if k in BOOL and (v == "" or v == k):
            out.append((name, True))
            continue
        if k in NUMERIC and re.fullmatch(r"-?\d+", str(v).strip()):
            out.append((name, int(v)))
            continue
        out.append((name, v))
    return out


def attr_jsx(name, value):
    if value is True:
        return name
    if isinstance(value, int) and not isinstance(value, bool):
        return f"{name}={{{value}}}"
    if isinstance(value, dict):
        return f"{name}={{{js(value)}}}"
    if isinstance(value, str) and '"' not in value and "\\" not in value and "\n" not in value and "{" not in value:
        return f'{name}="{value}"'
    return f"{name}={{{js(value)}}}"


def norm_ws(t):
    return re.sub(r"\s+", " ", t)


def text_jsx(t):
    """A text run as JSX. Plain words go in as-is; anything with edge spaces or JSX-special characters as a literal."""
    if not t:
        return ""
    if re.fullmatch(r"[^{}<>&\"'`\s]([^{}<>&\"'`]*[^{}<>&\"'`\s])?", t) and "  " not in t:
        return t
    return "{" + js(t) + "}"


# ---------------------------------------------------------------- inline (rich) segments
def segments(el, trim=True):
    """Content of a rich element as data: list of str | {tag, attrs?, c?}. Whitespace collapsed like HTML."""
    def walk(n):
        out = []
        for c in n.children:
            if isinstance(c, Comment):
                continue
            if isinstance(c, NavigableString):
                t = norm_ws(str(c))
                if t:
                    if out and isinstance(out[-1], str):
                        out[-1] += t
                    else:
                        out.append(t)
                continue
            seg = {"tag": c.name}
            a = {k: v for k, v in react_attrs(c)}
            if a:
                seg["attrs"] = a
            if c.name != "br":
                kids = walk(c)
                if kids:
                    seg["c"] = kids
            out.append(seg)
        return out
    segs = walk(el)
    if trim and segs:
        if isinstance(segs[0], str):
            segs[0] = segs[0].lstrip()
        if isinstance(segs[-1], str):
            segs[-1] = segs[-1].rstrip()
        segs = [s for s in segs if s != ""]
    return segs


def seg_plain(segs):
    """Rich segments that are just one string -> that string."""
    if len(segs) == 1 and isinstance(segs[0], str):
        return segs[0]
    if not segs:
        return ""
    return None


def segments_jsx(segs):
    """Constant rich content as JSX."""
    out = []
    for s in segs:
        if isinstance(s, str):
            out.append(text_jsx(s))
            continue
        attrs = " ".join(attr_jsx(k, v) for k, v in (s.get("attrs") or {}).items())
        head = s["tag"] + (" " + attrs if attrs else "")
        if s["tag"] in VOID:
            out.append(f"<{head} />")
        else:
            out.append(f"<{head}>{segments_jsx(s.get('c') or [])}</{s['tag']}>")
    return "".join(out)
