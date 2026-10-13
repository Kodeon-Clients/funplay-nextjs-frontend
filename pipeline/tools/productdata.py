"""Pull structured facts from every product page (and the Originals catalogue) for the writers.

Usage: python3 -I tools/productdata.py <extracted_dir> <catalogue_txt> <out_json>
"""
import collections, json, re, sys
from bs4 import BeautifulSoup

EXTRACTED, CATALOGUE, OUT = sys.argv[1:4]
recs = json.load(open(f"{EXTRACTED}/pages/products.json", encoding="utf-8"))
series = {r["path"]: r for r in json.load(open(f"{EXTRACTED}/pages/series.json", encoding="utf-8"))}


def clean(t):
    return re.sub(r"\s+", " ", t or "").strip()


# catalogue: product description paragraphs keyed by the product name that opens them
cat = open(CATALOGUE, encoding="utf-8").read()
cat_entries = {}
for blk in re.split(r"\n(?=[^\n]*Product Specification)", cat):
    lines = [l for l in blk.split("\n")]
    text = clean(" ".join(re.split(r"\s{3,}", l.strip())[0] for l in lines if l.strip()))
    m = re.search(r"Product Area\s*:\s*([^\n]+?)\s{2,}|Product Area\s*:\s*(\S+ x \S+)", blk)
    pa = re.search(r"Product Area\s*:\s*(\S+\s*x\s*\S+)", blk)
    sa = re.search(r"Safe Play Area\s*:\s*(\S+\s*x\s*\S+)", blk)
    ag = re.search(r"Age Group\s*:\s*([^\n]+?)(?:\s{2,}|\n)", blk)
    sk = re.search(r"Skills Enhanced\s*(.*?)(?:Funplay Originals|\n\s*\n)", blk, re.S)
    cat_entries[text[:400]] = {
        "text": text[:900],
        "product_area": pa.group(1) if pa else None,
        "safe_area": sa.group(1) if sa else None,
        "age": clean(ag.group(1)) if ag else None,
    }

desc_count = collections.Counter(clean(r["data"].get("description", ""))[:160] for r in recs)
out = {}
for r in recs:
    b = BeautifulSoup(r["body"], "html.parser")
    d = r["data"]
    facts = {}
    for row in b.select(".accordion-collapse .row.g-0"):
        cols = row.find_all("div", class_=re.compile(r"col-sm"))
        if len(cols) >= 3:
            facts[clean(cols[1].get_text(" "))] = clean(cols[2].get_text(" "))
    sections = {}
    for item in b.select(".accordion-item"):
        title = clean(item.select_one(".accordion-title").get_text(" ")) if item.select_one(".accordion-title") else ""
        body = item.select_one(".accordion-collapse")
        if not body:
            continue
        if title in ("Activities", "Skills developed", "Skills Developed", "Material", "Materials"):
            names = [clean(x.get_text(" ")) for x in body.select(".feature-box-content span, .feature-box-content .fs-18, span.fw-600, .text-dark-gray.fw-600")]
            names = [n for n in dict.fromkeys(names) if n and len(n) < 40]
            sections[title] = names
        elif title == "Warranties":
            sections[title] = clean(body.get_text(" "))[:220]
    dims = {clean(x.select_one(".dimension-label").get_text()): clean(x.select_one(".dimension-value").get_text())
            for x in b.select(".dimension-item") if x.select_one(".dimension-label") and x.select_one(".dimension-value")}
    spec_p = None
    h = b.find(string=re.compile("^\\s*Specifications\\s*$"))
    if h and h.parent:
        nxt = h.parent.find_next("p")
        spec_p = clean(nxt.get_text(" ")) if nxt else None
    name = d.get("name") or r["h1"]
    cat_hit = None
    if r["path"].startswith("/funplay-originals/"):
        key = name.split()[0].lower()
        for k, v in cat_entries.items():
            if re.search(r"\b" + re.escape(name.lower()) + r"\b", k.lower()) or (len(key) > 4 and k.lower().startswith(key)):
                cat_hit = v
                break
    desc = clean(d.get("description", ""))
    srec = series.get(d.get("series") or "")
    out[r["path"]] = {
        "path": r["path"],
        "name": name,
        "h1": r["h1"],
        "sku": d.get("sku"),
        "line": {"corecraft": "CoreCraft", "funplay-originals": "Funplay Originals", "nexlev-series": "NexLev Series"}[r["path"].split("/")[1]],
        "series_path": d.get("series"),
        "series_name": (srec["h1"] if srec else None),
        "breadcrumb": d.get("breadcrumb"),
        "colours": [c["name"] for c in d.get("colours", [])],
        "image_alts": (d.get("colours") or [{}])[0].get("alts", [])[:4],
        "current_description": desc,
        "description_shared_with": desc_count[desc[:160]] - 1,
        "specifications_text": spec_p,
        "details": facts,
        "dimensions": dims,
        "activities": sections.get("Activities", []),
        "skills": sections.get("Skills developed", sections.get("Skills Developed", [])),
        "warranty": sections.get("Warranties"),
        "catalogue": cat_hit,
        "title": r["seo"]["title"],
        "meta_description": r["seo"]["description"],
    }
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
shared = sum(1 for v in out.values() if v["description_shared_with"] > 0)
nospec = sum(1 for v in out.values() if not v["details"])
print("products", len(out), "shared descriptions", shared, "no detail rows", nospec, "catalogue matches", sum(1 for v in out.values() if v["catalogue"]))
