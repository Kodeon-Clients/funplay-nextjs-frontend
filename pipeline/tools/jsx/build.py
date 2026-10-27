"""Generate the JSX source of the site from the stored page records (one-off migration).

- Templated families (city pages, product pages): one component per distinct section structure in
  components/templates/<family>/, and one plain-data JSON per page in content/<family>/.
- Every other page (home, core pages, series, projects, careers): its own route file
  app/(site)/<route>/page.tsx with metadata, and its sections as components in components/pages/<page>/.
  Sections that are identical on several pages go to components/shared/.

Usage: python3 -I tools/jsx/build.py site
"""
import collections, hashlib, json, os, re, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bs4 import BeautifulSoup, Tag, Comment  # noqa: E402
import templ  # noqa: E402
from templ import Scope, build, component_source, skel, REC, USED  # noqa: E402
from htmljsx import js  # noqa: E402

SITE = sys.argv[1]
# the extracted page records (HTML bodies) the migration starts from; produced by tools/compose.py
RECORDS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "records")
FAMILIES = {"city": ("city-gym", "city-playground"), "product": ("product",), "blog": ("blog",)}
PER_PAGE = {"home", "page", "series", "project", "career"}
# pages that had their own header and footer instead of the site's
# pages rendered in another route group (own stylesheet order); see app/(ads)/layout.tsx
ROUTE_GROUP = {"/ads.html": "(ads)"}
OWN_SHELL = {"/ads.html": os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "fixed", "ads.html")}
SKIP_PATHS = {"/campaign.html", "/school.html", "/builders.html", "/generic.html"}  # landing pages: separate step
FORM_KINDS = [(r"contact-form\.php|/api/contact", "contact"), (r"career-form\.php|/api/career", "career"),
              (r"subscribe-newsletter\.php|/api/newsletter", "newsletter"), (r"download-form\.php|/api/download", "download")]
UTILITY = re.compile(r"^(m|p|mt|mb|ms|me|mx|my|pt|pb|ps|pe|px|py|fs|fw|lh|ls|w|h|text|bg|d|col|row|g|gx|gy|justify|align|"
                     r"position|top|left|right|bottom|z|border|rounded|opacity|overflow|sm|md|lg|xl|xxl|xs|alt|order|flex|"
                     r"btn|icon|shadow|offset|min|max|ipad|big|cover|box|last|transition|hover|feather|swiper|container|"
                     r"section|space|background|page|full|one|two|three|vh|bg|sticky|mobile|xl|lg|md|sm|xs|position|top|"
                     r"ps|pe|on|has|is|data|fp)(-|$)")
report = collections.defaultdict(list)


# ---------------------------------------------------------------- records
def load_records():
    recs = []
    for f in sorted(os.listdir(os.path.join(RECORDS, "pages"))):
        recs += json.load(open(os.path.join(RECORDS, "pages", f), encoding="utf-8"))
    ov = {}
    od = os.path.join(RECORDS, "overrides")
    for f in sorted(os.listdir(od)) if os.path.isdir(od) else []:
        ov.update(json.load(open(os.path.join(od, f), encoding="utf-8")))
    for r in recs:
        o = ov.get(r["path"])
        if o:
            for find, repl in o.get("bodyReplace", []):
                assert find in r["body"], find[:60]
                r["body"] = r["body"].replace(find, repl)
    return recs


def react_fix(soup):
    """Form state attributes React wants as defaultValue / defaultChecked."""
    for s in soup.find_all("select"):
        opt = s.find("option", selected=True)
        if opt is not None:
            s["defaultvalue"] = opt.get("value", opt.get_text())
            for o in s.find_all("option"):
                if o.has_attr("selected"):
                    del o["selected"]
    for i in soup.find_all("input"):
        t = (i.get("type") or "text").lower()
        if i.has_attr("value") and t not in ("hidden", "submit", "button", "reset", "image", "radio", "checkbox"):
            i["defaultvalue"] = i["value"]
            del i["value"]
        if i.has_attr("checked"):
            del i["checked"]
            i["defaultchecked"] = ""
    for t in soup.find_all("textarea"):
        txt = t.get_text()
        if txt.strip():
            t["defaultvalue"] = txt
        t.clear()
    return soup


def clean_label(t):
    t = re.sub(r"\s+", " ", (t or "").replace("*", "")).strip()
    t = re.sub(r"^(please )?select (your )?", "", t, flags=re.I)
    return t[:1].upper() + t[1:] if t else t


def card_heading(a):
    """Text of the heading of the card a link sits in (for icon-only links)."""
    el = a
    for _ in range(5):
        el = el.parent
        if el is None:
            return None
        h = el.find(re.compile(r"^h[1-6]$")) or el.find("span", class_=re.compile(r"fw-(5|6|7)00"))
        if h is None:
            h = next((x for x in el.find_all("a") if x is not a and x.get_text(strip=True)), None)
        if h is not None and h.get_text(strip=True):
            return " ".join(h.get_text(" ").split())
        img = el.find("img", alt=True)
        if img is not None and img["alt"].strip():
            return img["alt"].strip()
    return None


def a11y_fix(soup, rec_path=""):
    """Accessible names for fields and icon-only links, alt on images, no skipped heading levels.
    Nothing visible changes: names come from the placeholder, the card heading or the link's purpose."""
    for el in soup.find_all(["input", "textarea", "select"]):
        if el.name == "input" and (el.get("type") or "text").lower() in ("hidden", "submit", "button", "reset", "image"):
            continue
        if el.get("aria-label") or el.get("aria-labelledby") or el.find_parent("label"):
            continue
        if el.get("id") and soup.find("label", attrs={"for": el["id"]}):
            continue
        if el.get("name") == "website":
            el["aria-label"] = "Leave this field empty"
            continue
        label = el.get("placeholder")
        if el.name == "select":
            first = el.find("option")
            label = first.get_text() if first is not None else None
        label = clean_label(label) or clean_label((el.get("name") or "").replace("_", " "))
        if label:
            el["aria-label"] = label
            report["a11y: field labelled"].append(rec_path)
    for a in soup.find_all(["a", "button"]):
        if a.get_text(strip=True) or a.get("aria-label") or a.get("aria-labelledby"):
            continue
        if any((i.get("alt") or "").strip() for i in a.find_all("img")):
            continue
        if a.get("href") == "#down-section":
            a["aria-label"] = "Scroll down"
        elif a.find("video"):
            a["aria-label"] = "Play video"
        else:
            h = card_heading(a)
            if h:
                a["aria-label"] = h
            elif a.get("title"):
                continue
            else:
                report["a11y: link without name"].append((rec_path, str(a)[:120]))
                continue
        report["a11y: link named"].append(rec_path)
    for img in soup.find_all("img"):
        if not img.has_attr("alt"):
            img["alt"] = ""
    for fr in soup.find_all("iframe"):
        if not fr.get("title"):
            fr["title"] = "FunPlay Systems location on Google Maps" if "google.com/maps" in (fr.get("src") or "") else "Embedded content"
    # scrollable carousels must be reachable by keyboard
    for el in soup.find_all(class_=re.compile(r"^overflow-(auto|x-auto|scroll)$")):
        if not el.has_attr("tabindex") and el.get("id"):
            el["tabindex"] = "0"
            el["role"] = "region"
            el["aria-label"] = re.sub(r"(?<!^)([A-Z])", r" \1", el["id"]).replace("-", " ").capitalize()
    # headings: never skip a level (h1 -> h3 becomes h2, keeping the original size through the .hN class)
    last = 0
    for h in soup.find_all(re.compile(r"^h[1-6]$")):
        lvl = int(h.name[1])
        if last and lvl > last + 1:
            new = last + 1
            h["class"] = (h.get("class") or []) + [h.name]
            report["a11y: heading level fixed"].append((rec_path, h.name, f"h{new}", h.get_text(" ", strip=True)[:40]))
            h.name = f"h{new}"
            lvl = new
        last = lvl
    return soup


def preprocess(soup, rec):
    """Make the stored markup React-ready without changing what renders."""
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    react_fix(soup)
    for f in soup.find_all("form"):
        act = f.get("action") or ""
        for pat, kind in FORM_KINDS:
            if re.search(pat, act):
                f["action"] = f"/api/{kind}"
                f["data-fp-form"] = kind
                f["novalidate"] = ""
                break
    for el in soup.find_all(attrs={"onmouseover": True}):
        del el["onmouseover"]
        if el.has_attr("onmouseout"):
            del el["onmouseout"]
        el["class"] = (el.get("class") or []) + ["fp-hover-brand"]
        report["hover handlers"].append(rec["path"])
    for el in soup.find_all(attrs={"oninput": True}):
        del el["oninput"]
        el["data-fp-digits"] = ""
    for el in soup.find_all(attrs={"p": True}):
        del el["p"]
    a11y_fix(soup, rec["path"])
    for el in soup.find_all(["script", "style"]):
        report["script/style in body"].append(rec["path"])
        el.extract()
    return soup


def top_nodes(rec):
    soup = preprocess(BeautifulSoup(rec["body"], "html.parser"), rec)
    nodes = [c for c in soup.children if isinstance(c, Tag)]
    stray = [str(c).strip() for c in soup.children if not isinstance(c, Tag) and str(c).strip()]
    if stray:
        report["stray top-level text"].append((rec["path"], stray[:2]))
    for n in nodes:
        REC[id(n)] = rec
        for d in n.find_all(True):
            REC[id(d)] = rec
    return nodes


# ---------------------------------------------------------------- naming
def pascal(s):
    words = re.findall(r"[A-Za-z0-9]+", s)
    out = "".join(w[:1].upper() + w[1:].lower() for w in words)
    return re.sub(r"^\d+", "", out) or "Section"


def section_name(n, taken, prefix=""):
    cands = []
    for c in n.get("class", []):
        if not UTILITY.match(c) and not re.search(r"\d", c):
            cands.append(c)
    if n.get("id"):
        cands.insert(0, n["id"])
    h = n.find(re.compile(r"^h[1-4]$"))
    head = h.get_text(" ", strip=True) if h else ""
    if cands:
        base = pascal(cands[0])
    elif head:
        base = pascal(" ".join(head.split()[:4]))
    else:
        base = pascal(n.name)
    base = prefix + base
    if base[:1].isdigit():
        base = "S" + base
    name, k = base, 2
    while name in taken:
        name, k = f"{base}{k}", k + 1
    taken.add(name)
    return name


def page_key(path):
    if path == "/":
        return "home"
    return re.sub(r"[^a-z0-9]+", "-", path.lower().replace(".html", "")).strip("-")


def route_dir(path):
    """App Router folder for an original URL (the .html suffix is part of the folder name)."""
    if path == "/":
        return ""
    return path.strip("/")


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, "w", encoding="utf-8").write(text)


def meta_of(rec):
    seo = dict(rec.get("seo") or {})
    seo.pop("jsonld", None)
    m = {"path": rec["path"], "type": rec["type"], "header": rec.get("header") or "transparent", "seo": seo}
    d = dict(rec.get("data") or {})
    if d.get("popupTitle"):
        m["popupTitle"] = d.pop("popupTitle")
    if rec.get("styles"):
        m["styles"] = rec["styles"]
    css = [c for c in rec.get("css") or [] if c.startswith("/css/")]
    if rec["path"] == "/thankyou.html":
        css.append("/css/landing-tw.css")
    if css:
        m["css"] = css
    if rec.get("h1"):
        m["h1"] = rec["h1"]
    if d:
        m["data"] = d
    return m


# ---------------------------------------------------------------- families
def article_container(soup):
    sec = soup.select_one("section.blog-inner-content")
    if sec is None:
        return None
    col = sec.select_one("div.col-lg-12")
    if col is not None:
        return col
    el = next((c for c in sec.children if isinstance(c, Tag)), None)
    while el is not None:
        kids_ = [c for c in el.children if isinstance(c, Tag)]
        if len(kids_) > 2:
            return el
        el = kids_[0] if kids_ else None
    return None


def blog_nodes(r):
    """Blog page: the article text goes to content/blog/<slug>.mdx, the rest is templated."""
    from mdx import to_mdx
    soup = preprocess(BeautifulSoup(r["body"], "html.parser"), r)
    art = article_container(soup)
    slug = r["path"].rsplit("/", 1)[1][:-5]
    if art is None:
        report["blog without article container"].append(r["path"])
    else:
        write(os.path.join(SITE, "content", "blog", slug + ".mdx"), to_mdx(art))
        art.clear()
        marker = soup.new_tag("fp-article")
        marker["data-slug"] = slug
        art.append(marker)
    nodes = [c for c in soup.children if isinstance(c, Tag)]
    for n in nodes:
        REC[id(n)] = r
        for d in n.find_all(True):
            REC[id(d)] = r
    return nodes


def gen_family(fam, types, recs):
    recs = [r for r in recs if r["type"] in types]
    groups = collections.OrderedDict()
    page_secs = {}
    if fam == "blog":
        shutil.rmtree(os.path.join(SITE, "content", "blog"), ignore_errors=True)
    for r in recs:
        nodes = blog_nodes(r) if fam == "blog" else top_nodes(r)
        page_secs[r["path"]] = []
        for i, n in enumerate(nodes):
            k = skel(n, top=True)
            groups.setdefault(k, []).append((r, i, n))
            page_secs[r["path"]].append(k)
    comp_dir = os.path.join(SITE, "components", "templates", fam)
    shutil.rmtree(comp_dir, ignore_errors=True)
    taken = set()
    names, props = {}, {}
    prefix = {"city": "City", "product": "Product", "blog": "Blog"}[fam]
    for k, items in sorted(groups.items(), key=lambda kv: -len(kv[1])):
        nodes = [n for _, _, n in items]
        name = section_name(nodes[0], taken, prefix)
        USED.clear()
        sc = Scope("p")
        templ.TEXT_PROPS[0] = len(nodes) == 1  # a section only one page has: its text goes to the page's JSON
        jsx, datas = build(nodes, sc)
        templ.TEXT_PROPS[0] = False
        doc = f"{len(nodes)} {fam} page{'s' if len(nodes) != 1 else ''}, e.g. {items[0][0]['path']}"
        write(os.path.join(comp_dir, name + ".tsx"), component_source(name, jsx, sc, doc))
        names[k] = name
        for (r, i, _), d in zip(items, datas):
            props[(r["path"], i)] = d
    # registry
    reg = "\n".join(f'import {n} from "./{n}";' for n in sorted(names.values()))
    reg += "\n\n/** Section components for " + fam + " pages, keyed by the name stored in each page's JSON. */\n"
    reg += "export const sections = {\n" + "".join(f"  {n},\n" for n in sorted(names.values())) + "};\n\nexport type SectionName = keyof typeof sections;\n"
    write(os.path.join(comp_dir, "index.ts"), reg)
    # data
    data_dir = os.path.join(SITE, "content", fam)
    if fam != "blog":
        shutil.rmtree(data_dir, ignore_errors=True)
    os.makedirs(data_dir, exist_ok=True)
    for r in recs:
        m = meta_of(r)
        m["sections"] = [{"component": names[k], "props": props[(r["path"], i)]} for i, k in enumerate(page_secs[r["path"]])]
        write(os.path.join(data_dir, page_key(r["path"]) + ".json"), json.dumps(m, ensure_ascii=False, indent=1))
    if fam == "blog":
        slugs = sorted(f[:-4] for f in os.listdir(data_dir) if f.endswith(".mdx"))
        ident = lambda x: "a_" + re.sub(r"[^A-Za-z0-9]", "_", x)
        idx = "\n".join(f'import {ident(x)} from "./{x}.mdx";' for x in slugs)
        idx += "\n\n/** Blog article bodies, one MDX file per post. */\nexport const articles = {\n" + "".join(f'  "{x}": {ident(x)},\n' for x in slugs) + "};\n"
        write(os.path.join(data_dir, "articles.ts"), idx)
    print(fam, len(recs), "pages,", len(names), "section components")


# ---------------------------------------------------------------- per-page routes
def gen_pages(recs):
    recs = [r for r in recs if r["type"] in PER_PAGE and r["path"] not in SKIP_PATHS and r.get("body")]
    # identical sections across pages -> shared components
    count = collections.Counter()
    page_nodes = {}
    for r in recs:
        page_nodes[r["path"]] = top_nodes(r)
        for n in page_nodes[r["path"]]:
            count[hashlib.md5(str(n).encode()).hexdigest()] += 1
    shared_dir = os.path.join(SITE, "components", "shared")
    pages_dir = os.path.join(SITE, "components", "pages")
    for d in (shared_dir, pages_dir):
        shutil.rmtree(d, ignore_errors=True)
    meta_dir = os.path.join(SITE, "content", "pages")
    for f in os.listdir(meta_dir) if os.path.isdir(meta_dir) else []:
        if f.endswith(".json") and f not in ("campaign.json", "school.json", "builders.json", "generic.json"):
            os.remove(os.path.join(meta_dir, f))
    shared_names, taken_shared = {}, set()
    shared_props, has_props = {}, {}
    for r in recs:
        for n in page_nodes[r["path"]]:
            h = hashlib.md5(str(n).encode()).hexdigest()
            if count[h] > 1 and h not in shared_names:
                shared_names[h] = section_name(n, taken_shared)
    built_shared = set()
    for r in recs:
        key = page_key(r["path"])
        taken = set(taken_shared)
        imports, body, sections = [], [], []
        for n in page_nodes[r["path"]]:
            h = hashlib.md5(str(n).encode()).hexdigest()
            if count[h] > 1:
                name = shared_names[h]
                if h not in built_shared:
                    USED.clear()
                    sc = Scope("p")
                    templ.TEXT_PROPS[0] = True
                    jsx, datas = build([n], sc)
                    templ.TEXT_PROPS[0] = False
                    write(os.path.join(shared_dir, name + ".tsx"), component_source(name, jsx, sc, f"Section shared by {count[h]} pages; its text is in content/shared-sections.json."))
                    built_shared.add(h)
                    has_props[("shared", name)] = bool(sc.types)
                    if sc.types:
                        shared_props[name] = datas[0]
                withp = has_props[("shared", name)]
                imp = f'import {name}{", { type " + name + "Props }" if withp else ""} from "@/components/shared/{name}";'
                line = f"      <{name} {{...sharedSection<{name}Props>(\"{name}\")}} />" if withp else f"      <{name} />"
            else:
                name = section_name(n, taken)
                USED.clear()
                sc = Scope("p")
                templ.TEXT_PROPS[0] = True
                jsx, datas = build([n], sc)
                templ.TEXT_PROPS[0] = False
                write(os.path.join(pages_dir, key, name + ".tsx"), component_source(name, jsx, sc))
                withp = bool(sc.types)
                if withp:
                    sections.append({"component": name, "props": datas[0]})
                imp = f'import {name}{", { type " + name + "Props }" if withp else ""} from "@/components/pages/{key}/{name}";'
                line = f"      <{name} {{...section<{name}Props>(page, \"{name}\")}} />" if withp else f"      <{name} />"
            if imp not in imports:
                imports.append(imp)
            body.append(line)
        helpers = "".join(h + ", " for h in ("section", "sharedSection") if any(f"{{...{h}<" in b for b in body))
        m = meta_of(r)
        if sections:
            m["sections"] = sections
        if r["path"] in ROUTE_GROUP:
            m.pop("styles", None)  # loaded by the route group's own stylesheet, in the original order
        shell_props = ""
        if r["path"] in OWN_SHELL:
            # the page keeps its own header and footer from the original file
            src_soup = BeautifulSoup(open(OWN_SHELL[r["path"]], encoding="utf-8").read(), "html.parser")
            for part, tag in (("header", "header"), ("footer", "footer")):
                el = src_soup.body.find(tag, recursive=False)
                for img in el.find_all("img"):
                    img["src"] = re.sub(r"^(\.\./)+|^https://funplaysystems\.com", "/", img["src"]).replace("//", "/")
                a11y_fix(el, r["path"])
                pname = "Page" + part.capitalize()
                USED.clear()
                sc = Scope("p")
                jsx, _ = build([el], sc)
                write(os.path.join(pages_dir, key, pname + ".tsx"), component_source(pname, jsx, sc))
                imports.append(f'import {pname} from "@/components/pages/{key}/{pname}";')
                shell_props += f" {part}={{<{pname} />}}"
        if r["path"] == "/404.html":
            write(os.path.join(SITE, "content", "pages", key + ".json"), json.dumps(m, ensure_ascii=False, indent=1))
            src = (
                'import type { Metadata } from "next";\n'
                'import "./globals.css";\n'
                'import Behaviors from "@/components/Behaviors";\n'
                'import PageShell from "@/components/PageShell";\n'
                f'import {{ {helpers}type PageMeta }} from "@/lib/page";\n'
                + f'import meta from "@/content/pages/{key}.json";\n'
                + "\n".join(imports) + "\n\n"
                + "const page = meta as PageMeta;\n\n"
                + 'export const metadata: Metadata = { title: { absolute: "Page not found | FunPlay Systems" }, robots: { index: false, follow: true } };\n\n'
                + "/** 404 page, with the original 404 design. */\nexport default function NotFound() {\n  return (\n    <>\n      <PageShell page={page}>\n"
                + "\n".join(body) + "\n      </PageShell>\n      <Behaviors />\n    </>\n  );\n}\n"
            )
            write(os.path.join(SITE, "app", "not-found.tsx"), src)
            continue
        write(os.path.join(SITE, "content", "pages", key + ".json"), json.dumps(m, ensure_ascii=False, indent=1))
        src = (
            'import type { Metadata } from "next";\n'
            'import PageShell from "@/components/PageShell";\n'
            f'import {{ buildMetadata, {helpers}type PageMeta }} from "@/lib/page";\n'
            + f'import meta from "@/content/pages/{key}.json";\n'
            + "\n".join(imports) + "\n\n"
            + "const page = meta as PageMeta;\n\n"
            + "export const metadata: Metadata = buildMetadata(page);\n\n"
            + "export default function Page() {\n  return (\n    <PageShell page={page}" + shell_props + ">\n"
            + "\n".join(body) + "\n    </PageShell>\n  );\n}\n"
        )
        group = ROUTE_GROUP.get(r["path"], "(site)")
        if group != "(site)" and route_dir(r["path"]):
            shutil.rmtree(os.path.join(SITE, "app", "(site)", route_dir(r["path"])), ignore_errors=True)
        write(os.path.join(SITE, "app", group, route_dir(r["path"]), "page.tsx"), src)
    write(os.path.join(SITE, "content", "shared-sections.json"), json.dumps(shared_props, ensure_ascii=False, indent=1))
    print("pages", len(recs), "routes,", len(shared_names), "shared sections")


def main():
    recs = load_records()
    only = sys.argv[2].split(",") if len(sys.argv) > 2 else None
    for fam, types in FAMILIES.items():
        if not only or fam in only:
            gen_family(fam, types, recs)
    if not only or "pages" in only:
        gen_pages(recs)
    for k, v in report.items():
        print(k, len(v), v[:3])


if __name__ == "__main__":
    main()
