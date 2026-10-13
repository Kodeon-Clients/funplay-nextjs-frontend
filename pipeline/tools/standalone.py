"""The paid-ads landing pages (campaign, school, builders, generic) are self-contained documents with
their own header, footer and CSS stack (Tailwind CDN + campaign.css or vendors.min.css, no theme
style.css). Rendering them inside the site layout changes how they look, so each one is served as
its own HTML document by a route handler (app/<page>.html/route.ts, via lib/standalone.ts).

This script turns the fixed source pages into site/content/standalone/<page>.html:
- CDN Tailwind -> /css/standalone-tw.css (compiled by scripts/build-landing-css.mjs, native layers kept)
- Swiper self-hosted, AOS pinned; theme jQuery scripts dropped
- forms post to /api/contact (honeypot + source tag); campaign.js replaced by /js/campaign-lp.js,
  campaign.html uses /js/standalone-forms.js
- "Live Chat Now" links open Tawk when GTM loads it, otherwise WhatsApp
- relative asset URLs made absolute, SEO head fixed (title, description, canonical, robots, one H1)
- em dashes removed from the copy (tools/textfix.py)

Usage: python3 -I tools/standalone.py tools/fixed site
"""
import html as htmllib, os, re, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from textfix import PHRASES, no_dashes  # noqa: E402

SRC, SITE = sys.argv[1], sys.argv[2]
HOST = "https://funplaysystems.com"
PAGES = {
    # name: (title, description, robots)
    "campaign.html": ("Playground Equipment Manufacturer in India | FunPlay Systems",
                      "FunPlay Systems offers award-winning, safe and customisable playground equipment across India. Transform your space into a world of play.",
                      "noindex, follow"),
    "school.html": ("School Playground Equipment for Schools & Preschools | FunPlay",
                    "Safe, engaging school playground equipment from FunPlay Systems, designed for early learners and schools across India. Get a free custom quote and site plan.",
                    "index, follow"),
    "builders.html": ("Playground Equipment for Builders & Developers | FunPlay",
                      "Award-winning playground equipment for builders, developers and housing societies in India. Site plan integration, installation by our team. Get a free quote.",
                      "index, follow"),
    "generic.html": ("Outdoor Playground Equipment Manufacturer in India | FunPlay",
                     "FunPlay Systems designs and installs outdoor playground equipment for schools, societies and public spaces across India. Get a free custom quote.",
                     "noindex, follow"),
}
HONEYPOT = ('<input type="hidden" name="source" value="{src}" /><div class="fp-hp" aria-hidden="true">'
            '<input type="text" name="website" tabindex="-1" autocomplete="off" /></div>')


def set_meta(h, name, title, desc, robots):
    h = re.sub(r"<title>.*?</title>", "<title>" + htmllib.escape(title) + "</title>", h, count=1, flags=re.S)
    h = re.sub(r'\s*<meta\s+name="(description|robots)"[^>]*>', "", h, flags=re.S | re.I)
    h = re.sub(r'\s*<link\s+rel="canonical"[^>]*>', "", h, flags=re.I)
    for prop, val in (("og:title", title), ("og:description", desc), ("twitter:title", title), ("twitter:description", desc)):
        h = re.sub(r'(<meta\s+(?:property|name)="' + prop + r'"\s+content=")[^"]*(")', lambda m: m.group(1) + htmllib.escape(val) + m.group(2), h)
    head = (f'\n  <meta name="description" content="{htmllib.escape(desc)}" />\n  <meta name="robots" content="{robots}" />\n'
            f'  <link rel="canonical" href="{HOST}/{name}" />')
    return re.sub(r"(<title>.*?</title>)", lambda m: m.group(1) + head, h, count=1, flags=re.S)


def build(name):
    title, desc, robots = PAGES[name]
    h = open(os.path.join(SRC, name), encoding="utf-8").read()
    h = re.sub(r'<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>',
               '<link rel="stylesheet" href="/css/standalone-tw.css" />', h)
    h = re.sub(r'<script src="https://cdn.jsdelivr.net/npm/framer-motion[^"]*"></script>\s*', "", h)
    h = re.sub(r'<link rel="stylesheet" href="https://unpkg.com/swiper(@[\d.]+)?/swiper-bundle.min.css"\s*/?>',
               '<link rel="stylesheet" href="/css/swiper-bundle.min.css" />', h)
    h = re.sub(r'<script src="https://unpkg.com/swiper(@[\d.]+)?/swiper-bundle.min.js"></script>',
               '<script src="/js/swiper-bundle.min.js"></script>', h)
    h = re.sub(r'\s*<script type="text/javascript" src="js/(jquery|vendors\.min|main)\.js"></script>', "", h)
    h = re.sub(r'(src|href)="(images|css|js|files|videos)/', r'\1="/\2/', h)
    h = h.replace('src="/js/campaign.js"', 'src="/js/campaign-lp.js"')
    src = name[:-5]
    h = re.sub(r'action="/?email-templates/contact-form.php"', 'action="/api/contact" data-fp-standalone', h)
    h = re.sub(r"(<form [^>]*data-fp-standalone[^>]*>)", lambda m: m.group(1) + "\n" + HONEYPOT.format(src=src), h)
    h = h.replace('value="https://funplaysystems.com/thankyou.html"', 'value="/thankyou.html"')
    h = h.replace('href="javascript:void(Tawk_API.toggle())"', 'href="https://wa.me/919028302266" target="_blank" rel="noopener" data-tawk')
    h = set_meta(h, name, title, desc, robots)
    # one H1: the hero line of the school/builders/generic template
    if "<h1" not in h:
        h = re.sub(r'<p class="text-white font_56_64\s+quicksand font-bold">(.*?)</p>', r'<h1 class="text-white font_56_64 quicksand font-bold">\1</h1>', h, count=1, flags=re.S)
    # campaign: the fix pack added width/height to the logo; keep the original 48px height
    h = h.replace('class="h-12 transition-transform hover:scale-105" width="216" height="92" />',
                  'class="h-12 transition-transform hover:scale-105" width="216" height="92" style="height:48px;width:auto" />')
    head, body = h.split("<body", 1)
    for a, z in PHRASES:
        body = re.sub(r"\s+".join(map(re.escape, a.split())), z, body)
    body = re.sub(r">([^<]*)<", lambda m: ">" + no_dashes(m.group(1)) + "<", body)
    h = head + "<body" + body
    style = ('  <style>.fp-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}'
             '.fp-err{color:#d74951;font-size:13px;margin-top:4px}</style>\n')
    h = h.replace("</head>", style + "</head>", 1)
    if name == "campaign.html":
        h = h.replace("</body>", '  <script src="/js/standalone-forms.js" defer></script>\n</body>', 1)
    assert "contact-form.php" not in h and "tailwindcss/browser" not in h and "Tawk_API.toggle" not in h, name
    assert h.count("<h1") == 1, (name, h.count("<h1"))
    out = os.path.join(SITE, "content", "standalone")
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, name), "w", encoding="utf-8").write(h)


for n in PAGES:
    build(n)

# campaign.js with the form handler pointed at /api/contact
js = open(os.path.join(SRC, "js", "campaign.js"), encoding="utf-8").read() if os.path.exists(os.path.join(SRC, "js", "campaign.js")) else open("source/js/campaign.js", encoding="utf-8").read()
old = """            fetch(form.action, {
                method: form.method,
                body: formData
            })
                .then(res => {
                    if (!res.ok) throw new Error('Network error');
                    form.reset();
                    window.location.href = 'thank-you-campaign.html';
                })
                .catch(() => {
                    errorDisplay.textContent = 'Something went wrong. Please try again.';"""
new = """            fpToken('contact')
                .then(t => {
                    if (t) formData.set('g-recaptcha-response', t);
                    return fetch(form.action, { method: 'POST', body: formData, headers: { Accept: 'application/json' } });
                })
                .then(res => res.json().catch(() => ({})).then(d => ({ ok: res.ok && d.ok, d })))
                .then(({ ok, d }) => {
                    if (!ok) throw new Error((d && d.message) || 'Something went wrong. Please try again.');
                    form.reset();
                    window.location.href = '/thank-you-campaign.html';
                })
                .catch(err => {
                    errorDisplay.textContent = err && err.message && err.message !== 'Failed to fetch' ? err.message : 'Something went wrong. Please try again.';"""
assert old in js
js = js.replace(old, new)
js = js.replace("const forms = document.querySelectorAll('.campaignForm');", "const forms = document.querySelectorAll('form[data-fp-standalone]');")
prelude = """/* FunPlay landing pages (school, builders, generic). Original campaign.js with the form handler
   posting to /api/contact (reCAPTCHA v3 when <html data-recaptcha> is set), plus Tawk/WhatsApp chat. */
function fpToken(action) {
    var key = document.documentElement.getAttribute('data-recaptcha');
    if (!key) return Promise.resolve(null);
    return new Promise(function (resolve) {
        function run() { grecaptcha.ready(function () { grecaptcha.execute(key, { action: action }).then(resolve, function () { resolve(null); }); }); }
        if (window.grecaptcha) return run();
        var s = document.createElement('script');
        s.src = 'https://www.google.com/recaptcha/api.js?render=' + encodeURIComponent(key);
        s.onload = run; s.onerror = function () { resolve(null); };
        document.head.appendChild(s);
    });
}
document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-tawk]');
    if (a && window.Tawk_API && typeof window.Tawk_API.toggle === 'function') { e.preventDefault(); window.Tawk_API.toggle(); }
});
"""
open(os.path.join(SITE, "public", "js", "campaign-lp.js"), "w", encoding="utf-8").write(prelude + js)
nm = os.path.join(SITE, "node_modules", "swiper")
shutil.copy(os.path.join(nm, "swiper-bundle.min.js"), os.path.join(SITE, "public", "js", "swiper-bundle.min.js"))
shutil.copy(os.path.join(nm, "swiper-bundle.min.css"), os.path.join(SITE, "public", "css", "swiper-bundle.min.css"))
print("standalone:", ", ".join(PAGES))
