"""Copy any asset referenced by the composed content that is missing from site/public (resolving letter case)."""
import json, glob, os, re, shutil, urllib.parse
SRC, PUB = "source", "site/public"
lower = {}
for root, _, files in os.walk(SRC):
    for f in files:
        p = os.path.relpath(os.path.join(root, f), SRC).replace(os.sep, "/")
        lower.setdefault(p.lower(), p)
refs = set()
blobs = [open(f, encoding="utf-8").read() for f in glob.glob("site/content/**/*.json", recursive=True)]
blobs += [open(f, encoding="utf-8").read() for f in glob.glob("site/components/**/*.tsx", recursive=True) + glob.glob("site/styles/**/*.css", recursive=True)]
for b in blobs:
    for m in re.finditer(r'/(?:images|files|videos|audio)/[^"\'\s()<>\\]+?\.(?:jpe?g|png|webp|gif|svg|mp4|mov|pdf|mp3)', b, re.I):
        refs.add(urllib.parse.unquote(m.group(0)))
missing, copied = [], 0
for r in sorted(refs):
    dst = os.path.join(PUB, r.lstrip("/"))
    if os.path.exists(dst):
        continue
    src = lower.get(r.lstrip("/").lower())
    if not src:
        missing.append(r); continue
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy(os.path.join(SRC, src), dst); copied += 1
print("referenced", len(refs), "copied", copied, "missing", len(missing)); [print("  ", m) for m in missing[:40]]
