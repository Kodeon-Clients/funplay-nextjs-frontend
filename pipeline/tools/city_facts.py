"""Build the fact sheet for every city/state location page (input for writers and for the
programmatic blocks). Output: tools/briefs/cities.json"""
import json, math, re, collections, openpyxl

FIXLIST = "/root/.claude/uploads/edc57836-ba21-5b6f-a1ee-e86b56115075/5a05850f-FunPlay-SEO-Fix-List.xlsx"
GSC = "/root/.claude/uploads/edc57836-ba21-5b6f-a1ee-e86b56115075/fc9d64e1-funplaysystems.com-Performance-on-Search-2026-10-10.xlsx"
VASAI = (19.3719, 72.9067)
HOST = "https://funplaysystems.com"

# pages that become redirects (duplicates); no content is written for them
DUPLICATES = {
    "/outdoor-gym-equipment-manufacturer-supplier-bengaluru.html": "/outdoor-gym-equipment-manufacturer-supplier-bangalore.html",
    "/outdoor-gym-equipment-manufacturer-supplier-raurkela-industrial-township.html": "/outdoor-gym-equipment-manufacturer-supplier-rourkela.html",
    "/outdoor-playground-equipment-manufacturer-in-pimpri-chinchwada.html": "/outdoor-playground-equipment-manufacturer-in-pimpri-chinchwad.html",
}
# pages the audit sheet did not cover: city, state, lat, lng, level
EXTRA = {
    "bathinda": ("Bathinda", "Punjab", 30.21, 74.95, "City"),
    "buxar": ("Buxar", "Bihar", 25.56, 83.98, "City"),
    "hubli-dharwad": ("Hubli-Dharwad", "Karnataka", 15.36, 75.12, "City"),
    "mahbubnagar": ("Mahbubnagar", "Telangana", 16.74, 78.00, "City"),
    "medininagar": ("Medininagar", "Jharkhand", 24.03, 84.07, "City"),
    "mumbai": ("Mumbai", "Maharashtra", 19.08, 72.88, "City"),
    "nagaon": ("Nagaon", "Assam", 26.35, 92.68, "City"),
    "sasaram": ("Sasaram", "Bihar", 24.95, 84.03, "City"),
    "surat": ("Surat", "Gujarat", 21.17, 72.83, "City"),
    "jammu-and-kashmir": (None, "Jammu and Kashmir", 33.78, 76.58, "State"),
    "madhya-pradesh": (None, "Madhya Pradesh", 23.47, 77.95, "State"),
    "maharashtra": (None, "Maharashtra", 19.66, 75.30, "State"),
    "telangana": (None, "Telangana", 17.85, 79.10, "State"),
}
# real FunPlay projects whose state is known from the project pages
PROJECTS = {
    "Tamil Nadu": [("Resort playground, Dindigul", "/projects/dindigul-resorts-tamil-nadu.html")],
    "Maharashtra": [("Raymond, Thane", "/projects/raymond-thane.html"), ("Dighe Garden, Thane", "/projects/dighe-garden.html"), ("Nakshatravan, Thane", "/projects/nakshatravan.html"), ("Nicon Vista, Mumbai", "/projects/nicon-vista.html"), ("Royal Mangalam, Mumbai", "/projects/royal-mangalam.html")],
    "Gujarat": [("Praharsh Highland", "/projects/praharsh-highland.html"), ("Ratnakar Aravali", "/projects/ratnakar-aravali.html"), ("Ratnakar Prestine", "/projects/ratnakar-prestine.html"), ("Turquoise Grandeure", "/projects/turquoise-grandeure.html")],
    "Telangana": [("St. Andrews High School", "/projects/st-andrews-school.html")],
    "Karnataka": [("SWR Railways, Bengaluru", "/projects/swr-railways.html")],
}


def km(a, b):
    la1, lo1, la2, lo2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return round(2 * 6371 * math.asin(math.sqrt(h)))


def rel(u):
    return u.replace(HOST, "") if u else None


def main():
    wb = openpyxl.load_workbook(FIXLIST, read_only=True)
    rows = list(wb["City pages"].iter_rows(values_only=True))
    hdr = rows[0]
    sheet = {rel(r[0]): dict(zip(hdr, r)) for r in rows[1:] if r[0]}
    g = openpyxl.load_workbook(GSC, read_only=True)
    gsc = {}
    for r in list(g["Pages"].iter_rows(values_only=True))[1:]:
        if r[0]:
            gsc[rel(r[0])] = (int(r[1] or 0), int(r[2] or 0), float(r[4] or 0))
    recs = json.load(open("tools/extracted/pages/cities.json"))
    paths = {r["path"] for r in recs}
    out = {}
    for r in recs:
        p = r["path"]
        if p in DUPLICATES:
            continue
        kind = "gym" if r["type"] == "city-gym" else "playground"
        slug = re.sub(r"^/outdoor-(gym-equipment-manufacturer-supplier|playground-equipment-manufacturer-in)-", "", p)[:-5]
        twin = ("/outdoor-playground-equipment-manufacturer-in-" if kind == "gym" else "/outdoor-gym-equipment-manufacturer-supplier-") + slug + ".html"
        src = sheet.get(p) or sheet.get(twin)
        d = {"path": p, "kind": kind, "slug": slug}
        if src:
            d.update(city=src["City"], state=src["State"], level=src["Level"], km=src["Straight-line km from Vasai factory"])
            near = [rel(src.get(f"Nearby {i}")) for i in range(1, 6)]
            if sheet.get(p) is None:  # borrowed from twin: map nearby to this page type
                near = [re.sub(r"outdoor-(playground-equipment-manufacturer-in|gym-equipment-manufacturer-supplier)-", "outdoor-gym-equipment-manufacturer-supplier-" if kind == "gym" else "outdoor-playground-equipment-manufacturer-in-", n) for n in near if n]
            d["nearby"] = [n for n in near if n and n in paths and n not in DUPLICATES]
            d["hub"] = rel(src.get("Parent hub (breadcrumb)")) if sheet.get(p) else None
        elif slug in EXTRA or slug.replace("ΓÇô", "-") in EXTRA:
            c, s, la, lo, lvl = EXTRA.get(slug) or EXTRA[slug.replace("ΓÇô", "-")]
            d.update(city=c, state=s, level=lvl, km=km(VASAI, (la, lo)), nearby=[], hub=None)
        else:
            d.update(city=None, state=None, level=None, km=None, nearby=[], hub=None)
        if d.get("level") == "Country":
            d["city"] = "India"
        d["twin"] = twin if twin in paths and twin not in DUPLICATES else None
        d["h1"] = r.get("h1")
        c, i, pos = gsc.get(p, (0, 0, 0))
        d["gsc"] = {"clicks": c, "impressions": i, "position": round(pos, 1)}
        d["tier"] = "A" if c >= 3 else "B"
        d["projects"] = PROJECTS.get(d.get("state") or "", [])
        out[p] = d
    # nearby fill for pages without a list: other pages of the same kind in the same state
    by_state = collections.defaultdict(list)
    for d in out.values():
        if d.get("level") == "City" and d.get("state"):
            by_state[(d["kind"], d["state"])].append(d)
    for d in out.values():
        if not d.get("nearby") and d.get("state"):
            same = [x for x in by_state[(d["kind"], d["state"])] if x["path"] != d["path"]]
            same.sort(key=lambda x: abs((x.get("km") or 0) - (d.get("km") or 0)))
            d["nearby"] = [x["path"] for x in same[:5]]
    json.dump(out, open("tools/briefs/cities.json", "w"), ensure_ascii=False, indent=1)
    t = collections.Counter((d["kind"], d["tier"], d.get("level")) for d in out.values())
    print(len(out), t, "missing city/state:", [d["path"] for d in out.values() if not d.get("state")])
    json.dump(DUPLICATES, open("tools/briefs/city-duplicates.json", "w"), indent=1)


main()
