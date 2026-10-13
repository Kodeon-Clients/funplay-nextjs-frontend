"""Validate written content files against the writing brief.

Usage: python3 tools/validate_content.py <file-or-folder> [<file-or-folder> ...] [--assigned assigned.json]

Checks: JSON shape, banned characters and phrases, word counts by page type and tier, sentence
length, allowed HTML, internal links, numbers that are not in the fact sheets, and sentences
repeated across pages. Exit code 1 when any ERROR is found.
"""
import glob, json, os, re, sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
CITIES = json.load(open(os.path.join(ROOT, "briefs", "cities.json")))
PRODUCTS = json.load(open(os.path.join(ROOT, "briefs", "products.json")))
LINKS = json.load(open(os.path.join(ROOT, "briefs", "link-targets.json")))
EXTRA_PATHS = set()
for f in ("competitors.json", "pages.json"):
    p = os.path.join(ROOT, "briefs", f)
    if os.path.exists(p):
        EXTRA_PATHS |= set(json.load(open(p)).keys())
VALID_LINKS = set(LINKS["products"]) | set(LINKS["series"]) | set(LINKS["pages"]) | set(CITIES) | {"/", "/contact-us.html", "/Projects.html", "/our-network.html", "/corecraft.html", "/funplay-originals.html", "/nexlev-series.html", "/Products.html"} | EXTRA_PATHS
VALID_LINKS |= {p for d in CITIES.values() for _, p in d.get("projects", [])}

BANNED_CHARS = {"—": "em dash", "–": "en dash", "!": "exclamation mark"}
BANNED = [
    r"\bit'?s not (just )?\w+[^.]{0,40}, it'?s\b", r"\bnot just\b", r"\bmore than just\b", r"\bisn'?t about\b",
    r"\bin today'?s\b", r"\bfast-paced\b", r"\bwhether you'?re\b", r"\blook no further\b", r"\bwhen it comes to\b",
    r"\brest assured\b", r"\bpeace of mind\b", r"\bone-stop\b", r"\bhassle-free\b", r"\bseamless(ly)?\b", r"\brobust\b",
    r"\bunlock\w*\b", r"\belevat\w*\b", r"\bdelv\w*\b", r"\bvibrant\b", r"\bbustling\b", r"\bnestled\b", r"\btapestry\b",
    r"\btestament\b", r"\bembark\w*\b", r"\bjourney\b", r"\brealm\b", r"\blandscape\b", r"\bleverag\w*\b",
    r"\bcutting-edge\b", r"\bstate-of-the-art\b", r"\btop-notch\b", r"\bworld-class\b", r"\bgame-changer\b",
    r"\bunparalleled\b", r"\bmeticulous\w*\b", r"\bboasts?\b", r"\bfurthermore\b", r"\bmoreover\b", r"\badditionally\b",
    r"\bin conclusion\b", r"\bit is worth noting\b", r"\bplays? a crucial role\b", r"\ba wide range of\b", r"\bwide variety\b",
    r"\bbest quality\b", r"\bhigh-quality\b", r"\btrusted by\b", r"\bleading\b", r"\bperfect for\b", r"\bideal for\b",
    r"\btransform\w*\b", r"\bthriv\w*\b", r"\bempower\w*\b", r"\bfoster\w*\b", r"\benhanc\w*\b", r"\bensur\w*\b",
    r"\beffortless\w*\b", r"\bcater(s|ing)? to\b", r"\bnurtur\w*\b", r"\bthe result\?", r"\bthe best part\b",
    r"\bno\s+\w+,\s*no\s+\w+", r"\bISO\b", r"\bEN ?1176\b", r"\bASTM\b", r"\b100% safe\b", r"\bNo\. ?1\b", r"\bnumber one\b",
    r"\bbest (playground|outdoor|gym)\b",
]
BANNED_RE = [re.compile(p, re.I) for p in BANNED]
ALLOWED_TAGS = {"p", "ul", "ol", "li", "a", "strong"}
ALLOWED_NUMBERS = {"2002", "45,000", "45000", "150", "15,000", "15000", "15", "3", "1", "2", "4", "5", "6", "8", "10", "12", "902", "830", "2266", "738", "530", "0921", "91", "9", "30", "6:30", "9:00", "18"}

LIMITS = {
    # (kind, level, tier): (intro_min, intro_max, sections_min, sections_max, sec_min_words, sec_max_words, faq_min, faq_max, total_min, total_max)
    ("city", "A"): (110, 200, 3, 4, 55, 170, 4, 4, 600, 950),
    ("city", "B"): (120, 240, 1, 1, 70, 160, 3, 3, 330, 520),
    ("state", "A"): (140, 230, 2, 2, 90, 170, 4, 4, 480, 800),
    ("state", "B"): (140, 230, 1, 2, 90, 170, 3, 3, 380, 700),
}


def words(s):
    return len(re.findall(r"[A-Za-z0-9'’]+", re.sub(r"<[^>]+>", " ", s or "")))


def sentences(s):
    t = re.sub(r"<[^>]+>", " ", s or "")
    return [x.strip() for x in re.split(r"(?<=[.?])\s+", t) if x.strip()]


def check_text(path, label, s, errs, warns, allowed_nums):
    for ch, name in BANNED_CHARS.items():
        if ch in s:
            errs.append(f"{path} [{label}]: contains {name}")
    for rx in BANNED_RE:
        m = rx.search(re.sub(r"<[^>]+>", " ", s))
        if m:
            errs.append(f"{path} [{label}]: banned phrase '{m.group(0)}'")
    for sen in sentences(s):
        n = words(sen)
        if n > 32:
            errs.append(f"{path} [{label}]: sentence over 32 words ({n}): {sen[:80]}...")
    for num in re.findall(r"\d[\d,:]*\d|\d", re.sub(r"<[^>]+>", " ", s)):
        if num not in allowed_nums:
            warns.append(f"{path} [{label}]: number '{num}' is not in the fact sheet")


def check_html(path, label, h, errs):
    for tag in re.findall(r"</?([a-zA-Z0-9]+)", h):
        if tag.lower() not in ALLOWED_TAGS:
            errs.append(f"{path} [{label}]: tag <{tag}> not allowed")
    if re.search(r"\s(class|style|id)=", h):
        errs.append(f"{path} [{label}]: attributes other than href are not allowed")
    links = re.findall(r'href="([^"]+)"', h)
    for l in links:
        if l == path:
            errs.append(f"{path} [{label}]: links to itself")
        elif not l.startswith("/") or l.split("#")[0] not in VALID_LINKS:
            errs.append(f"{path} [{label}]: unknown link {l}")
    return len(links)


def city_nums(d):
    out = set(ALLOWED_NUMBERS)
    if d.get("km"):
        k = int(d["km"])
        for v in {k, round(k, -1), round(k, -2)}:
            out.add(str(v)); out.add(f"{v:,}")
    return out


def product_nums(d):
    out = set(ALLOWED_NUMBERS)
    blob = json.dumps(d, ensure_ascii=False)
    out |= set(re.findall(r"\d[\d,:.]*\d|\d", blob))
    return out


def validate(files, assigned=None):
    errs, warns = [], []
    seen = {}
    sent_pages = defaultdict(set)
    for f in files:
        try:
            data = json.load(open(f, encoding="utf-8"))
        except Exception as e:
            errs.append(f"{f}: invalid JSON ({e})")
            continue
        for path, page in data.items():
            if path.startswith("_"):
                continue
            if path in seen:
                errs.append(f"{path}: duplicated in {seen[path]} and {f}")
            seen[path] = f
            if path in CITIES:
                d = CITIES[path]
                lvl = "state" if d.get("level") in ("State", "Country") else "city"
                lim = LIMITS[(lvl, d["tier"])]
                nums = city_nums(d)
                intro = page.get("intro") or []
                if not isinstance(intro, list) or len(intro) != 2:
                    errs.append(f"{path}: intro must be a list of 2 paragraphs")
                iw = sum(words(p) for p in intro)
                if not lim[0] <= iw <= lim[1]:
                    errs.append(f"{path}: intro has {iw} words, expected {lim[0]} to {lim[1]}")
                for i, p in enumerate(intro):
                    if "<" in p:
                        errs.append(f"{path}: intro paragraph {i+1} must be plain text")
                    check_text(path, f"intro {i+1}", p, errs, warns, nums)
                secs = page.get("sections") or []
                if not lim[2] <= len(secs) <= lim[3]:
                    errs.append(f"{path}: {len(secs)} sections, expected {lim[2]} to {lim[3]}")
                total, nlinks = iw, 0
                for i, s in enumerate(secs):
                    sw = words(s.get("html", ""))
                    total += sw + words(s.get("h", ""))
                    if not lim[4] <= sw <= lim[5]:
                        errs.append(f"{path}: section {i+1} has {sw} words, expected {lim[4]} to {lim[5]}")
                    check_text(path, f"section {i+1} heading", s.get("h", ""), errs, warns, nums)
                    check_text(path, f"section {i+1}", s.get("html", ""), errs, warns, nums)
                    nlinks += check_html(path, f"section {i+1}", s.get("html", ""), errs)
                    for sen in sentences(s.get("html", "")):
                        if words(sen) >= 12:
                            sent_pages[re.sub(r"\W+", " ", sen.lower()).strip()].add(path)
                faq = page.get("faq") or []
                if not lim[6] <= len(faq) <= lim[7]:
                    errs.append(f"{path}: {len(faq)} FAQs, expected {lim[6]} to {lim[7]}")
                for i, q in enumerate(faq):
                    aw = words(q.get("a", ""))
                    total += aw + words(q.get("q", ""))
                    if not q.get("q", "").endswith("?"):
                        errs.append(f"{path}: FAQ {i+1} question must end with '?'")
                    if not 20 <= aw <= 70:
                        errs.append(f"{path}: FAQ {i+1} answer has {aw} words, expected 20 to 70")
                    check_text(path, f"faq {i+1}", q.get("q", "") + " " + q.get("a", ""), errs, warns, nums)
                if not lim[8] <= total <= lim[9]:
                    errs.append(f"{path}: total {total} words, expected {lim[8]} to {lim[9]}")
                if nlinks == 0:
                    warns.append(f"{path}: no internal links in sections")
                for p in intro:
                    for sen in sentences(p):
                        if words(sen) >= 12:
                            sent_pages[re.sub(r"\W+", " ", sen.lower()).strip()].add(path)
            elif path in PRODUCTS:
                d = PRODUCTS[path]
                nums = product_nums(d)
                desc, spec = page.get("description", ""), page.get("spec_paragraph", "")
                dw, sw = words(desc), words(spec)
                if not 80 <= dw <= 155:
                    errs.append(f"{path}: description has {dw} words, expected 80 to 150")
                if not 38 <= sw <= 75:
                    errs.append(f"{path}: spec_paragraph has {sw} words, expected 40 to 70")
                if "<" in desc or "<" in spec:
                    errs.append(f"{path}: product copy must be plain text")
                check_text(path, "description", desc, errs, warns, nums)
                check_text(path, "spec_paragraph", spec, errs, warns, nums)
                for sen in sentences(desc) + sentences(spec):
                    if words(sen) >= 12:
                        sent_pages[re.sub(r"\W+", " ", sen.lower()).strip()].add(path)
                if not isinstance(page.get("flags", []), list):
                    errs.append(f"{path}: flags must be a list")
            elif path in EXTRA_PATHS:
                for k, v in page.items():
                    if isinstance(v, str):
                        check_text(path, k, v, errs, warns, set(re.findall(r"\d[\d,:.]*\d|\d", json.dumps(page))) | ALLOWED_NUMBERS)
            else:
                errs.append(f"{path}: not a known page path")
    for sen, pages in sent_pages.items():
        if len(pages) > 1:
            errs.append(f"repeated sentence on {len(pages)} pages ({', '.join(sorted(pages)[:3])}): {sen[:90]}")
    if assigned is not None:
        missing = sorted(set(assigned) - set(seen))
        for m in missing:
            errs.append(f"{m}: assigned but not written")
    return errs, warns


def main():
    args = sys.argv[1:]
    assigned = None
    if "--assigned" in args:
        i = args.index("--assigned")
        assigned = json.load(open(args[i + 1]))
        args = args[:i] + args[i + 2:]
    files = []
    for a in args:
        files += sorted(glob.glob(os.path.join(a, "*.json"))) if os.path.isdir(a) else [a]
    errs, warns = validate(files, assigned)
    for w in warns[:80]:
        print("WARN ", w)
    if len(warns) > 80:
        print(f"WARN  ... {len(warns) - 80} more warnings")
    for e in errs:
        print("ERROR", e)
    print(f"{len(files)} files, {len(errs)} errors, {len(warns)} warnings")
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
