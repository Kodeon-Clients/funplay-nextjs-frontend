"""Check written copy for AI tells, banned claims, length and duplication.

Usage: python3 -I tools/check_copy.py <file.json> [<file.json> ...] [--quiet]
Each file maps page path -> entry. Every string inside an entry is checked.
Length rules apply to known keys (intro, description, sections, faq).
"""
import json, re, sys
from collections import defaultdict

BANNED_WORDS = r"""delve|tapestry|testament|realm|embark|beacon|multifaceted|paradigm|synergy|myriad|plethora|meticulous|utili[sz]e|leverag\w*|supercharg\w*|game[- ]changer|unleash\w*|unlock\w*|elevat\w*|seamless\w*|cutting[- ]edge|state[- ]of[- ]the[- ]art|world[- ]class|best[- ]in[- ]class|top[- ]notch|one[- ]stop|hassle[- ]free|look no further|nestled|bustling|vibrant|thriving|rich heritage|hidden gem|boasts?|stands as|serves as|plays? a (crucial|vital|key) role|navigat\w*|landscape|ecosystem|transformative|revolutionary|holistic|renowned|most trusted|leading|unparalleled|unmatched|second to none|in today['’]s|whether you['’]re|when it comes to|imagine|here['’]s the thing|in conclusion|ultimately|at the end of the day|let['’]s dive|dive into|moreover|furthermore|additionally|it['’]s worth noting|rest assured|peace of mind"""
PATTERNS = [
    ("em/en dash", re.compile(r"[—–]")),
    ("banned word/phrase", re.compile(r"\b(" + BANNED_WORDS.replace("\n", "") + r")\b", re.I)),
    ("contrast reveal", re.compile(r"\b(it['’]?s not|isn['’]?t just|not just|not only|less \w+, more|aren['’]?t just)\b", re.I)),
    ("negation list", re.compile(r"\bno \w+(?: \w+)?, no \w+", re.I)),
    ("self-answered question", re.compile(r"\b(the result|the catch|the best part|why does this matter|the answer)\?", re.I)),
    ("colon reveal", re.compile(r"\b(the best part|here['’]s why|the secret|one word):", re.I)),
    ("exclamation", re.compile(r"!")),
    ("trailing -ing pile-on", re.compile(r", (ensuring|making|allowing|providing|enabling|offering|giving|helping|creating|delivering) [a-z]", re.I)),
    ("superlative claim", re.compile(r"\b(the best|best quality|no\. ?1|number one|top[- ]rated|#1|finest)\b", re.I)),
    ("invented-claim risk", re.compile(r"\b(ISO|EN ?1176|ASTM|BIS|certified by|award[- ]winning|guarantee[ds]?|within \d+ (days|hours|weeks)|\d+\s?% )\b")),
    ("placeholder", re.compile(r"\[NEED|\{|\}|TODO|lorem", re.I)),
]
EXEMPT_KEYS = {"path", "href", "label_key"}


def strings(obj, key=""):
    if isinstance(obj, str):
        yield key, obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k in EXEMPT_KEYS:
                continue
            yield from strings(v, k)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings(v, key)


def words(s):
    return len(re.sub(r"<[^>]+>", " ", s).split())


def sentences(s):
    t = re.sub(r"<[^>]+>", " ", s)
    return [x.strip().lower() for x in re.split(r"(?<=[.?])\s+", t) if len(x.split()) >= 8]


def check(files, quiet=False):
    issues = []
    seen = defaultdict(list)
    for f in files:
        data = json.load(open(f, encoding="utf-8"))
        for path, entry in data.items():
            for key, s in strings(entry):
                if key in ("href",):
                    continue
                for name, rx in PATTERNS:
                    for m in rx.finditer(s):
                        if name == "placeholder" and key == "html":
                            continue
                        ctx = s[max(0, m.start() - 40): m.end() + 40].replace("\n", " ")
                        issues.append((path, name, ctx))
                for sen in sentences(s):
                    seen[sen].append(path)
            # length rules
            if isinstance(entry, dict):
                if "intro" in entry:
                    n = sum(words(p) for p in entry["intro"])
                    lo, hi = (90, 260) if entry.get("tier") != "A" else (90, 320)
                    if not lo <= n <= hi:
                        issues.append((path, f"intro length {n} words (want {lo} to {hi})", ""))
                if "description" in entry:
                    n = words(entry["description"])
                    if not 70 <= n <= 170:
                        issues.append((path, f"description length {n} words (want 80 to 150)", ""))
                if entry.get("tier") == "A":
                    total = sum(words(p) for p in entry.get("intro", [])) + sum(words(s["html"]) for s in entry.get("sections", [])) + sum(words(q["q"]) + words(q["a"]) for q in entry.get("faq", []))
                    if total < 550:
                        issues.append((path, f"tier A total {total} words (want 600 to 950)", ""))
    for sen, ps in seen.items():
        ups = sorted(set(ps))
        if len(ups) > 1:
            issues.append((ups[0], f"sentence repeated on {len(ups)} pages", sen[:120]))
    if not quiet:
        for p, n, c in issues:
            print(f"{p} | {n} | {c}")
    print(f"TOTAL ISSUES: {len(issues)}")
    return issues


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check(args, "--quiet" in sys.argv)
