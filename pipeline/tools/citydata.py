"""Build the city dataset used for programmatic city content and local links.

Usage: python3 -I tools/citydata.py <fixlist.xlsx> <extracted_dir> <out_json>
Sources: the fix list's "City pages" sheet (398 pages), the playground twin for gym pages the
fix pack did not cover, and a short hand-checked table for the few pages with neither.
"""
import json, math, re, sys
import openpyxl

XLSX, EXTRACTED, OUT = sys.argv[1:4]
FACTORY = (19.3719, 72.9067)

# pages with no fix-list row and no twin: approximate city-centre coordinates and state
MANUAL = {
    "bathinda": ("Bathinda", "Punjab", 30.21, 74.95),
    "buxar": ("Buxar", "Bihar", 25.56, 83.98),
    "hubli-dharwad": ("Hubli-Dharwad", "Karnataka", 15.36, 75.12),
    "mahbubnagar": ("Mahbubnagar", "Telangana", 16.74, 78.00),
    "medininagar": ("Medininagar", "Jharkhand", 24.03, 84.07),
    "mumbai": ("Mumbai", "Maharashtra", 19.08, 72.88),
    "nagaon": ("Nagaon", "Assam", 26.35, 92.68),
    "sasaram": ("Sasaram", "Bihar", 24.95, 84.03),
    "surat": ("Surat", "Gujarat", 21.17, 72.83),
    "jehanabad": ("Jehanabad", "Bihar", 25.21, 84.99),
}
STATE_LEVEL = {
    "jammu-and-kashmir": "Jammu and Kashmir",
    "madhya-pradesh": "Madhya Pradesh",
    "maharashtra": "Maharashtra",
    "telangana": "Telangana",
}


def km(lat, lng):
    la1, lo1, la2, lo2 = map(math.radians, [FACTORY[0], FACTORY[1], lat, lng])
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return round(2 * 6371 * math.asin(math.sqrt(h)))


def slug_of(path):
    return re.sub(r"^/outdoor-(gym-equipment-manufacturer-supplier|playground-equipment-manufacturer-in)-", "", path)[:-5]


def gym(s):
    return f"/outdoor-gym-equipment-manufacturer-supplier-{s}.html"


def play(s):
    return f"/outdoor-playground-equipment-manufacturer-in-{s}.html"


wb = openpyxl.load_workbook(XLSX, read_only=True)
rows = list(wb["City pages"].iter_rows(values_only=True))
H = rows[0]
X = {r[0].replace("https://funplaysystems.com", ""): dict(zip(H, r)) for r in rows[1:] if r[0]}
recs = json.load(open(f"{EXTRACTED}/pages/cities.json", encoding="utf-8"))
paths = {r["path"] for r in recs}
rel = lambda u: (u or "").replace("https://funplaysystems.com", "") or None

out = {}
for r in recs:
    p = r["path"]
    s = slug_of(p)
    kind = "gym" if r["type"] == "city-gym" else "playground"
    d = {"path": p, "kind": kind, "slug": s, "has_local_block": "fp-local-links" in r.get("body", "")}
    x = X.get(p)
    if x:
        d.update(city=x["City"], state=x["State"], level=x["Level"].lower(), km=x["Straight-line km from Vasai factory"],
                 clicks=x["GSC clicks (12m)"] or 0, impressions=x["GSC impressions (12m)"] or 0,
                 tier="A" if str(x["Content tier"]).startswith("A") else "B",
                 hub=rel(x["Parent hub (breadcrumb)"]), twin=rel(x["Twin page (gym ↔ playground)"]),
                 nearby=[rel(x[f"Nearby {i}"]) for i in range(1, 6) if x.get(f"Nearby {i}")], source="fixlist")
    else:
        tw = play(s) if kind == "gym" else gym(s)
        tx = X.get(tw) if kind == "gym" else None
        if tx:
            near = []
            for i in range(1, 6):
                n = rel(tx.get(f"Nearby {i}"))
                if n and gym(slug_of(n)) in paths:
                    near.append(gym(slug_of(n)))
            d.update(city=tx["City"], state=tx["State"], level=tx["Level"].lower(), km=tx["Straight-line km from Vasai factory"],
                     clicks=0, impressions=0, tier="B", hub="/outdoor-gym-equipment-manufacturer-supplier-india.html",
                     twin=tw if tw in paths else None, nearby=near, source="twin")
        elif s in MANUAL:
            name, st, la, lo = MANUAL[s]
            d.update(city=name, state=st, level="city", km=km(la, lo), clicks=0, impressions=0, tier="B",
                     hub="/outdoor-gym-equipment-manufacturer-supplier-india.html" if kind == "gym" else None,
                     twin=(tw if tw in paths else None), nearby=[], source="manual")
        elif s in STATE_LEVEL:
            d.update(city=STATE_LEVEL[s], state=STATE_LEVEL[s], level="state", km=None, clicks=0, impressions=0, tier="B",
                     hub="/our-network.html", twin=None, nearby=[], source="manual")
        else:
            d.update(city=None, state=None, level=None, km=None, tier="B", source="unknown")
    out[p] = d

# playground state hubs: pages that list a state's cities (fill hub for manual playground pages)
state_hub = {}
for d in out.values():
    if d["kind"] == "playground" and d.get("level") == "state":
        for st in re.split(r"\s*(?:&|and)\s*", d["state"] or ""):
            state_hub.setdefault(st.strip(), d["path"])
for d in out.values():
    if d["kind"] == "playground" and not d.get("hub") and d.get("level") == "city":
        d["hub"] = state_hub.get(d["state"]) or "/our-network.html"

json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(d["source"] for d in out.values()), Counter(d["tier"] for d in out.values()),
      "missing local block:", sum(1 for d in out.values() if not d["has_local_block"]))
print([d["path"] for d in out.values() if d["source"] == "unknown"])
