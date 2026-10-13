"""Shared copy clean-up: phrase fixes and em-dash removal (used by compose.py and standalone.py)."""
import re

# phrase fixes for copy kept from the old site (customer testimonials are quoted as given and not touched)
PHRASES = [
    ("From seamless install integration to boosting buyer appeal", "From smooth installation to stronger buyer appeal"),
    ("ensuring seamless integration with our manufacturing", "making sure it fits our manufacturing"),
    ("We embark on a quest to truly understand", "We set out to understand"),
    ("transports children into realms of wonder", "takes children into worlds of wonder"),
    ("They blend seamlessly with landscape design", "They blend well with landscape design"),
    ("when nestled in landscaped zones", "when set in landscaped zones"),
    ("can merge play and nature seamlessly", "can merge play and nature smoothly"),
    ("climbing and sliding into seamless loops", "climbing and sliding into continuous loops"),
    ("invites children to embark on thrilling journeys", "invites children on thrilling journeys"),
]
_SENT = {"it", "it's", "it’s", "they", "they're", "they’re", "these", "this", "that's", "that’s", "both", "we", "you", "thanks", "there's", "there’s"}
_COMMA = {"especially", "while", "and", "but", "not", "ideal", "which", "so", "or", "from", "with", "without", "whether"}


def no_dashes(t):
    """Replace em dashes (and spaced en dashes used as dashes) with ordinary punctuation."""
    if not t or ("\u2014" not in t and " \u2013 " not in t):
        return t
    t = t.replace(" \u2013 ", " \u2014 ")
    # a dash that opens a text run (attribution lines such as "— Mumbai School Principal") is dropped
    t = re.sub(r"^(\s*)\u2014\s*", r"\1", t)
    # paired dashes inside one sentence work as commas: "a — b — c" -> "a, b, c"
    t = re.sub(r"\s*\u2014\s*([^\u2014.<>!?]{1,80}?)\s*\u2014\s*", r", \1, ", t)

    def one(m):
        nxt = m.group(1)
        w = re.sub(r"[^\w'’]", "", nxt.split()[0]).lower() if nxt.split() else ""
        if w in _SENT:
            return ". " + nxt[0].upper() + nxt[1:]
        if w in _COMMA or w.endswith("ing"):
            return ", " + nxt
        return ": " + nxt
    t = re.sub(r"\s*\u2014\s*(\S[^<]*)", one, t)
    return t.replace("\u2014", ",")


def tidy(rec):
    b = rec.get("body") or ""
    for a, z in PHRASES:
        b = re.sub(r"\s+".join(map(re.escape, a.split())), z, b)
    b = re.sub(r">([^<]*)<", lambda m: ">" + no_dashes(m.group(1)) + "<", b)
    b = re.sub(r'(alt|title|aria-label)="([^"]*)"', lambda m: m.group(1) + '="' + no_dashes(m.group(2)) + '"', b)
    rec["body"] = b

    def walk(o):
        if isinstance(o, dict):
            return {k: (v if k in ("body", "path", "redirect") else walk(v)) for k, v in o.items()}
        if isinstance(o, list):
            return [walk(x) for x in o]
        return no_dashes(o) if isinstance(o, str) else o
    new = walk(rec)
    rec.clear(); rec.update(new)


