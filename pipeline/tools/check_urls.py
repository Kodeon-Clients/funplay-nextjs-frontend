"""Request every URL of the old site (and the new pages) from the local server and report status."""
import sys, urllib.request, urllib.parse, collections, json, glob
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3456"
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
op = urllib.request.build_opener(NoRedirect)
def get(path):
    url = BASE + urllib.parse.quote(path, safe="/%'()&-._~")
    try:
        r = op.open(urllib.request.Request(url, method="GET"), timeout=30); return r.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location")
paths = []
for l in open("tools/list-of-pages.txt", encoding="utf-8"):
    l = l.strip().replace("https://funplaysystems.com", "")
    if l.startswith("/") or l == "": paths.append(l or "/")
for f in glob.glob("site/content/pages/*.json"):
    for r in json.load(open(f)): paths.append(r["path"])
res = collections.Counter(); bad = []
for p in sorted(set(paths)):
    if "#" in p: continue
    s, loc = get(p)
    hops = 0
    while s in (301, 302, 307, 308) and loc and hops < 3:
        s2, loc2 = get(urllib.parse.unquote(loc.replace(BASE, "")))
        hops += 1; s, loc = s2, loc2
    res[(s, hops)] += 1
    if s != 200: bad.append((p, s))
print(dict(res)); print("non-200:", len(bad)); [print("  ", b) for b in bad[:40]]
