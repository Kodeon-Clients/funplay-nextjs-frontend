"""Replace the theme's icon fonts with SVG icons (Lighthouse: font-display, 1.1 MB icomoon font).

Every CSS rule that draws an icon glyph (content:"\\f154" with an icon font) is matched to its font,
the glyph is read from the font file with fontTools and written into styles/icons.css as an inline SVG
(CSS mask, coloured with currentColor). The markup keeps its icon classes, so nothing in the pages
changes and class swaps done by scripts (accordion arrows) keep working. Only the glyphs the site
actually uses are emitted; the icon @font-face rules are removed from the theme CSS.

Usage: python3 -I tools/icons.py site
"""
import os, re, sys, urllib.parse
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SITE = sys.argv[1]
THEME = os.path.join(SITE, "styles", "theme")
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon-fonts")  # source fonts, not served
FILES = {
    "bootstrap-icons": "bootstrap-icons.woff2", "feather": "feather.ttf", "icomoon": "icomoon.ttf", "themify": "themify.ttf",
    "fa-solid": "fa-solid-900.ttf", "fa-brands": "fa-brands-400.ttf", "fa-regular": "fa-regular-400.ttf",
}
BRANDS = {"facebook-f", "facebook", "instagram", "linkedin", "linkedin-in", "youtube", "twitter", "whatsapp", "x-twitter", "pinterest"}
# extra baseline shift the theme gives some icon sets (Bootstrap Icons: vertical-align:-.125em)
BASE_VALIGN = {"bootstrap-icons": -0.125}
_fonts = {}


def font(name):
    if name not in _fonts:
        _fonts[name] = TTFont(os.path.join(FONTS, FILES[name]))
    return _fonts[name]


def glyph_svg(name, cp):
    f = font(name)
    gname = f.getBestCmap().get(cp)
    if gname is None:
        return None
    gs = f.getGlyphSet()
    upm = f["head"].unitsPerEm
    asc, desc = f["hhea"].ascent, f["hhea"].descent
    adv = f["hmtx"][gname][0]
    pen = SVGPathPen(gs)
    gs[gname].draw(TransformPen(pen, (1, 0, 0, -1, 0, asc)))  # y-up font units -> y-down, origin at the em box top
    d = pen.getCommands()
    w, h = adv, asc - desc
    svg = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}'><path d='{d}'/></svg>"
    # minimal escaping for a data URI inside url("..."): %, #, <, > and "
    uri = "data:image/svg+xml," + svg.replace("%", "%25").replace("#", "%23").replace("<", "%3C").replace(">", "%3E").replace('"', "'")
    return {"uri": uri, "w": round(adv / upm, 4), "h": round(h / upm, 4), "v": round(desc / upm + BASE_VALIGN.get(name, 0), 4)}


def rules(css):
    """Top-level and @media rules as (selector, declarations, start, end)."""
    out = []
    for m in re.finditer(r"([^{}@;][^{}]*)\{([^{}]*)\}", css):
        out.append((m.group(1).strip(), m.group(2), m.start(), m.end()))
    return out


def family_of(sel, decls, fam_by_sel):
    m = re.search(r"font-family\s*:\s*([^;!]+)", decls)
    fam = m.group(1).strip().strip("'\"").lower() if m else fam_by_sel.get(sel, "")
    weight = re.search(r"font-weight\s*:\s*(\d+)", decls)
    if "bootstrap-icons" in fam or re.search(r"\.bi[-:.]|\.bi\b", sel):
        return "bootstrap-icons"
    if "feather" in fam or ".icon-feather-" in sel:
        return "feather"
    if "icomoon" in fam or ".line-icon-" in sel:
        return "icomoon"
    if "themify" in fam or re.search(r"\.ti-", sel):
        return "themify"
    if "brands" in fam:
        return "fa-brands"
    if "font awesome" in fam or "fontawesome" in fam or ".fa-" in sel:
        name = re.search(r"\.fa-([a-z0-9-]+)", sel)
        if name and name.group(1) in BRANDS:
            return "fa-brands"
        if weight and weight.group(1) == "400" and "free" in fam:
            return "fa-regular"
        return "fa-solid"
    return None


def main():
    files = sorted(f for f in os.listdir(THEME) if f.endswith(".css"))
    css = {f: open(os.path.join(THEME, f), encoding="utf-8").read() for f in files}
    # selector -> font-family / has explicit size, across all theme files
    fam_by_sel, sized = {}, set()
    for f in files:
        for sel, decls, _, _ in rules(css[f]):
            for s in sel.split(","):
                s = s.strip()
                m = re.search(r"font-family\s*:\s*([^;!]+)", decls)
                if m:
                    fam_by_sel[s] = m.group(1).strip().strip("'\"").lower()
                if re.search(r"(^|;)\s*(width|height)\s*:", decls):
                    sized.add(s)
    out, seen, missing = [], set(), []
    for f in files:
        for sel, decls, _, _ in rules(css[f]):
            m = re.search(r"content\s*:\s*[\"']\\([0-9a-fA-F]{2,5})[\"']", decls)
            if not m or not re.search(r"::?(before|after)", sel):
                continue
            cp = int(m.group(1), 16)
            for s in [x.strip() for x in sel.split(",")]:
                fam = family_of(s, decls, fam_by_sel)
                if not fam or (s, cp) in seen:
                    continue
                g = glyph_svg(fam, cp)
                if g is None:
                    missing.append((s, hex(cp), fam))
                    continue
                seen.add((s, cp))
                mask = f'url("{g["uri"]}")'
                box = "" if s in sized else f"width:{g['w']}em;height:{g['h']}em;"
                size = f"{g['w']}em {g['h']}em"
                out.append(f"{s}{{--fp-icon:{mask};content:\"\";display:inline-block;box-sizing:content-box;{box}vertical-align:{g['v']}em;"
                           f"background-color:currentColor;-webkit-mask:var(--fp-icon) center/{size} no-repeat;mask:var(--fp-icon) center/{size} no-repeat}}")
    # rules that empty an icon pseudo-element in a particular state (e.g. li:last-child:after{content:""})
    # must also drop the mask, or the icon would still be drawn
    icon_sels = {x for x, _ in seen}
    for f in files:
        for sel, decls, _, _ in rules(css[f]):
            if not re.search(r"content\s*:\s*(\"\"|''|none)", decls):
                continue
            for s in [x.strip() for x in sel.split(",")]:
                base = re.sub(r":(last-child|first-child|nth-child\([^)]*\)|nth-last-child\([^)]*\)|last-of-type|first-of-type|only-child)", "", s)
                if base != s and base in icon_sels:
                    out.append(f"{s}{{-webkit-mask:none;mask:none;background-color:transparent}}")
    header = ("/* Icons as inline SVG masks, generated by tools/icons.py from the theme's icon fonts.\n"
              "   Only the icons the site uses are included; colour follows the text colour. */\n")
    open(os.path.join(SITE, "styles", "icons.css"), "w", encoding="utf-8").write(header + "\n".join(out) + "\n")
    # drop the icon @font-face rules (and with them the font downloads)
    icon_fams = ("bootstrap-icons", "feather", "icomoon", "themify", "Font Awesome", "FontAwesome")
    removed = 0
    for f in files:
        new = re.sub(r"@font-face\s*\{[^}]*\}", lambda m: "" if any(x.lower() in m.group(0).lower() for x in icon_fams) else m.group(0), css[f])
        removed += css[f].count("@font-face") - new.count("@font-face")
        open(os.path.join(THEME, f), "w", encoding="utf-8").write(new)
    print(len(out), "icon rules written,", removed, "icon @font-face rules removed")
    if missing:
        print("glyphs not found:", missing[:10])


main()
