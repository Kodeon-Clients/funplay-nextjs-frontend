"""Compare every page of the running build (localhost:3456) with the saved baseline HTML.

Both <main> elements (and the <head> SEO tags) are reduced to a canonical form: element tags,
attributes (styles parsed, React-only differences removed) and whitespace-normalised text. Any page
whose canonical form differs is reported with the first differing lines.
Usage: python3 tools/compare.py <baseline-dir> [path ...]"""
import concurrent.futures as cf, difflib, os, re, sys, urllib.parse, urllib.request
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

BASE = "http://localhost:3456"
DIR = sys.argv[1]
IGNORE_ATTR = {"preload"}
# accessibility attributes added in the refactor (names, roles, aria-hidden on icons) are not content changes
A11Y = os.environ.get("STRICT") != "1"


def style_norm(v):
    d = {}
    for decl in re.split(r";(?![^(]*\))", v or ""):
        if ":" in decl:
            k, x = decl.split(":", 1)
            k = k.strip().lower()
            x = re.sub(r"\s+", " ", x.strip()).replace(", ", ",")
            if k:
                d[k] = x
    return ";".join(f"{k}:{d[k]}" for k in sorted(d))


def canon(el, out, depth=0):
    for c in el.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            t = re.sub(r"\s+", " ", str(c)).strip()
            if t:
                out.append("  " * depth + "T " + t)
            continue
        if c.name in ("script", "style", "link", "template"):
            continue
        attrs = []
        for k, v in sorted(c.attrs.items()):
            if k in IGNORE_ATTR or k.startswith("on") or (A11Y and (k.startswith("aria-") or k in ("role", "tabindex") or (k == "title" and c.name == "iframe"))):
                continue
            if isinstance(v, list):
                v = " ".join(x for x in v if x != "fp-hover-brand")
            if k == "style":
                v = style_norm(v)
            if k in ("for",) and c.name != "label":
                continue
            attrs.append(f"{k}={v}")
        out.append("  " * depth + f"<{c.name} " + " ".join(attrs))
        canon(c, out, depth + 1)


def canonical(html):
    s = BeautifulSoup(html, "html.parser")
    out = []
    m = s.find("main")
    if m is not None:
        canon(m, out)
    head = []
    t = s.find("title")
    head.append("TITLE " + (t.get_text() if t else ""))
    for sel in ['meta[name="description"]', 'meta[name="robots"]', 'link[rel="canonical"]', 'meta[property="og:title"]']:
        e = s.select_one(sel)
        head.append(sel + " " + (e.get("content") or e.get("href") or "" if e else "-"))
    h1 = len(s.find_all("h1"))
    return head + [f"H1 x{h1}"] + out


def fname(p):
    return os.path.join(DIR, p.strip("/").replace("/", "__") or "index")


def check(p):
    try:
        new = urllib.request.urlopen(BASE + urllib.parse.quote(p), timeout=60).read().decode("utf-8", "replace")
    except Exception as e:
        return p, [f"FETCH {e}"]
    old = open(fname(p), encoding="utf-8", errors="replace").read()
    a, b = canonical(old), canonical(new)
    if a == b:
        return p, []
    d = [l for l in difflib.unified_diff(a, b, n=0, lineterm="") if not l.startswith(("---", "+++"))]
    return p, d


def main():
    paths = sys.argv[2:]
    if not paths:
        paths = []
        for f in sorted(os.listdir(DIR)):
            paths.append("/" if f == "index" else "/" + f.replace("__", "/"))
    res = list(cf.ThreadPoolExecutor(12).map(check, paths))
    bad = [(p, d) for p, d in res if d]
    print(f"{len(res)} pages compared, {len(res) - len(bad)} identical, {len(bad)} different")
    for p, d in bad[:int(os.environ.get("SHOW", "15"))]:
        print("\n==", p, len(d), "diff lines")
        print("\n".join(x[:220] for x in d[:int(os.environ.get("LINES", "12"))]))
    open("/tmp/compare-bad.txt", "w").write("\n".join(p for p, _ in bad))


main()
