"""Accessibility checks over every page of the running build (static HTML):
form fields without an accessible name, icon-only links/buttons without a name, images without alt,
more than one <h1>, skipped heading levels, missing <html lang>. Usage: python3 tools/a11y_audit.py"""
import collections, concurrent.futures as cf, re, urllib.parse, urllib.request
from bs4 import BeautifulSoup

BASE, HOST = "http://localhost:3456", "https://funplaysystems.com"


def get(p):
    return urllib.request.urlopen(BASE + urllib.parse.quote(p), timeout=60).read().decode("utf-8", "replace")


urls = []
for sm in re.findall(r"<loc>([^<]+)</loc>", get("/sitemap.xml")):
    urls += [u.replace("&amp;", "&").replace(HOST, "") or "/" for u in re.findall(r"<loc>([^<]+)</loc>", get(sm.replace(HOST, "")))]
urls += ["/campaign.html", "/generic.html", "/thank-you.html", "/search-result.html", "/ads.html", "/nonexistent-page-for-404"]


def name_of(el, s):
    if el.get("aria-label", "").strip() or el.get("aria-labelledby") or el.get("title", "").strip():
        return True
    if el.get("id") and s.find("label", attrs={"for": el["id"]}):
        return True
    if el.find_parent("label"):
        return True
    return False


def text_name(el):
    if el.get("aria-label", "").strip() or el.get("title", "").strip() or el.get("aria-labelledby"):
        return True
    if el.get_text(strip=True):
        return True
    for img in el.find_all(["img", "svg"]):
        if (img.get("alt") or "").strip() or img.get("aria-label"):
            return True
    if el.name == "input" and el.get("value"):
        return True
    return False


def audit(p):
    try:
        h = get(p)
    except urllib.error.HTTPError as e:
        h = e.read().decode("utf-8", "replace")
    s = BeautifulSoup(h, "html.parser")
    out = []
    if not (s.html and s.html.get("lang")):
        out.append(("html lang missing", ""))
    for el in s.find_all(["input", "textarea", "select"]):
        if el.name == "input" and (el.get("type") or "text").lower() in ("hidden", "submit", "button", "reset", "image"):
            continue
        if el.find_parent(attrs={"aria-hidden": "true"}):
            continue
        if not name_of(el, s):
            out.append(("form field without name", f"{el.name}[name={el.get('name')}]"))
    for el in s.find_all(["a", "button"]):
        if el.find_parent(attrs={"aria-hidden": "true"}) or el.get("aria-hidden") == "true":
            continue
        if not text_name(el):
            out.append((f"{el.name} without accessible name", (el.get("href") or "") + " " + " ".join(el.get("class") or [])[:60]))
    for img in s.find_all("img"):
        if img.get("alt") is None:
            out.append(("img without alt", img.get("src")))
    main = s.find("main") or s.body
    h1 = s.find_all("h1")
    if len(h1) != 1:
        out.append((f"h1 count {len(h1)}", ""))
    last = 0
    for hd in (main.find_all(re.compile(r"^h[1-6]$")) if main else []):
        lvl = int(hd.name[1])
        if last and lvl > last + 1:
            out.append(("heading level skipped", f"h{last}->h{lvl} '{hd.get_text(' ', strip=True)[:40]}'"))
        last = lvl
    return p, out


res = list(cf.ThreadPoolExecutor(16).map(audit, urls))
c = collections.Counter()
ex = collections.defaultdict(collections.Counter)
pages = collections.defaultdict(set)
for p, out in res:
    for k, d in out:
        c[k] += 1
        ex[k][d] += 1
        pages[k].add(p)
print("pages:", len(res))
for k, n in c.most_common():
    print(f"\n{n:6}  {k}  on {len(pages[k])} pages, e.g. {sorted(pages[k])[:2]}")
    for d, m in ex[k].most_common(8):
        print(f"        {m:5}  {d}")
