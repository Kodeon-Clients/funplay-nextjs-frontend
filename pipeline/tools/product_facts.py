"""Fact sheet for every product page (input for writers). Output: tools/briefs/products.json"""
import json, re
from bs4 import BeautifulSoup

CATALOGUE_TXT = "/tmp/orig.txt"  # pdftotext -layout of Funplay_Originals.pdf


def catalogue():
    """Parse the Funplay Originals catalogue (pdftotext raw output) into name -> specs."""
    out = {}
    try:
        t = open("/tmp/orig_raw.txt", encoding="utf-8").read()
    except FileNotFoundError:
        return out
    parts = t.split("Product Specification")
    for i in range(1, len(parts)):
        before = [l.strip() for l in parts[i - 1].split("\n") if l.strip()]
        name = before[-1] if before else ""
        body = parts[i]
        def grab(label):
            m = re.search(label + r"\s*:\s*([^\n]+)", body)
            return m.group(1).strip() if m else None
        if name and grab("Product Area"):
            out[name.lower()] = {"name": name, "product_area": grab("Product Area"), "safe_play_area": grab("Safe Play Area"), "age_group": grab("Age Group")}
    return out


def text(el):
    return re.sub(r"\s+", " ", el.get_text(" ", strip=True)) if el else ""


def main():
    cat = catalogue()
    recs = json.load(open("tools/extracted/pages/products.json"))
    out = {}
    for r in recs:
        b = BeautifulSoup(r["body"], "html.parser")
        d = r.get("data", {})
        h1 = b.find("h1")
        sub = h1.find("span") if h1 else None
        f = {
            "path": r["path"],
            "name": d.get("name"),
            "subtitle": text(sub) if sub else None,
            "sku": d.get("sku"),
            "line": {"corecraft": "CoreCraft", "funplay-originals": "Funplay Originals", "nexlev-series": "NexLev Series"}[d["line"]],
            "breadcrumb": d.get("breadcrumb"),
            "current_description": d.get("description"),
            "colours": [c["name"] for c in d.get("colours", [])],
            "image_descriptions": [a for c in d.get("colours", [])[:1] for a in c.get("alts", [])][:5],
            "title": r["seo"]["title"],
        }
        spec = None
        for h in b.find_all(["h2", "h4", "p"]):
            if text(h) == "Specifications":
                nxt = h.find_next("p")
                spec = text(nxt)
                break
        f["current_spec_paragraph"] = spec
        rows = {}
        for row in b.select(".row.g-0.align-items-center"):
            spans = [text(x) for x in row.find_all(["span", "p"]) if text(x)]
            if len(spans) >= 3 and re.fullmatch(r"\d{2}", spans[0]):
                rows[spans[1]] = spans[2]
        f["spec_rows"] = rows
        dims = {}
        for it in b.select(".dimension-item"):
            lab, val = it.select_one(".dimension-label"), it.select_one(".dimension-value")
            if lab and val:
                dims[text(lab)] = text(val)
        f["dimensions"] = dims
        # activities / skills: titles inside the accordion panels
        acts, skills = [], []
        for item in b.select(".accordion-item"):
            title = text(item.select_one(".accordion-title"))
            vals = [text(x) for x in item.select(".feature-box-content span, .feature-box-content .alt-font, .icon-with-text-style-08 span") if text(x)]
            if title.lower().startswith("activities"):
                acts = list(dict.fromkeys(vals))
            elif title.lower().startswith("skills"):
                skills = list(dict.fromkeys(vals))
        f["activities"], f["skills"] = acts, skills
        warr = b.find(string=re.compile(r"years? warranty"))
        f["warranty"] = re.sub(r"\s+", " ", warr.parent.get_text(" ", strip=True))[:300] if warr else None
        c = cat.get((f["name"] or "").lower())
        if c:
            f["catalogue"] = c
        out[r["path"]] = f
    json.dump(out, open("tools/briefs/products.json", "w"), ensure_ascii=False, indent=1)
    print(len(out), "with catalogue match:", sum(1 for v in out.values() if v.get("catalogue")), "catalogue entries:", len(cat))
    print(json.dumps(out["/corecraft/individual-equipment/swing/curve-post-swing.html"], ensure_ascii=False)[:1200])


main()
