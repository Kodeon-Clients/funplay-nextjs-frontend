"""Structured-data audit of the running build: every sitemap page plus landing pages.
Checks JSON-LD parses, expected types per page type, Google's required properties
(Product, BlogPosting, BreadcrumbList, FAQPage, JobPosting, Service), FAQ text visible on the page,
and that no ratings/reviews/offers remain. Usage: python3 tools/schema_audit.py"""
import collections, concurrent.futures as cf, json, re, urllib.request, urllib.parse
from bs4 import BeautifulSoup

BASE, HOST = "http://localhost:3456", "https://funplaysystems.com"


def get(p):
    return urllib.request.urlopen(BASE + urllib.parse.quote(p), timeout=60).read().decode("utf-8", "replace")


urls = []
for sm in re.findall(r"<loc>([^<]+)</loc>", get("/sitemap.xml")):
    urls += [u.replace("&amp;", "&").replace(HOST, "") or "/" for u in re.findall(r"<loc>([^<]+)</loc>", get(sm.replace(HOST, "")))]
urls += ["/campaign.html", "/generic.html"]
REQ = {
    "Product": ["name", "image"],
    "BlogPosting": ["headline", "image", "datePublished", "author"],
    "BreadcrumbList": ["itemListElement"],
    "FAQPage": ["mainEntity"],
    "JobPosting": ["title", "description", "datePosted", "hiringOrganization", "jobLocation"],
    "Service": ["name", "provider", "areaServed"],
}
EXPECT = {"product": {"Product", "BreadcrumbList"}, "blog": {"BlogPosting", "BreadcrumbList"},
          "city": {"Service", "BreadcrumbList", "FAQPage"}, "series": {"CollectionPage", "BreadcrumbList"},
          "project": {"BreadcrumbList"}, "career": {"JobPosting", "BreadcrumbList"}}


def kind(p):
    if p.startswith("/blog/"):
        return "blog"
    if p.startswith("/careers/"):
        return "career"
    if p.startswith("/projects/"):
        return "project"
    if p.startswith("/outdoor-") and ("manufacturer-in-" in p or "supplier-" in p):
        return "city"
    if p.count("/") >= 3 and p.split("/")[1] in ("corecraft", "funplay-originals", "nexlev-series"):
        return "product"
    if p.count("/") == 2 and p.split("/")[1] in ("corecraft", "funplay-originals", "nexlev-series"):
        return "series"
    return "page"


def audit(p):
    h = get(p)
    s = BeautifulSoup(h, "html.parser")
    blocks = s.find_all("script", type="application/ld+json")
    probs, types = [], []
    nodes = []
    for b in blocks:
        try:
            d = json.loads(b.string)
        except Exception as e:
            probs.append(f"invalid JSON {e}")
            continue
        nodes += d.get("@graph", [d])
    for n in nodes:
        t = n.get("@type")
        types.append(t)
        for r in REQ.get(t, []):
            if not n.get(r):
                probs.append(f"{t} missing {r}")
    blob = json.dumps(nodes)
    for bad in ("aggregateRating", '"review"', '"offers"', '"Offer"'):
        if bad in blob:
            probs.append(f"contains {bad}")
    k = kind(p)
    if k == "product" and "CollectionPage" in types:
        k = "series"  # sub-ranges such as /corecraft/individual-equipment/climber.html
    for e in EXPECT.get(k, set()):
        if e not in types:
            probs.append(f"missing {e}")
    for n in nodes:
        if n.get("@type") == "FAQPage":
            txt = " ".join(s.get_text(" ").split()).lower()
            for q in n.get("mainEntity") or []:
                if q["name"].lower()[:50] not in txt:
                    probs.append("FAQ question not on page")
                    break
        if n.get("@type") == "BreadcrumbList":
            items = n["itemListElement"]
            if any(not i.get("item") for i in items[:-1]) or any(not i.get("name") for i in items):
                probs.append("breadcrumb item incomplete")
    if len(blocks) != 1:
        probs.append(f"{len(blocks)} JSON-LD blocks")
    return p, k, types, probs


res = list(cf.ThreadPoolExecutor(16).map(audit, urls))
by = collections.defaultdict(collections.Counter)
cnt = collections.Counter()
probs = collections.Counter()
ex = {}
for p, k, types, pr in res:
    cnt[k] += 1
    for t in set(types):
        by[k][t] += 1
    for x in pr:
        probs[x] += 1
        ex.setdefault(x, p)
print("pages audited:", len(res))
for k in sorted(cnt):
    print(f"{k} ({cnt[k]}):", dict(by[k].most_common()))
print("\nproblems:", "none" if not probs else "")
for x, n in probs.most_common():
    print(f"  {n:4} {x}   e.g. {ex[x]}")
