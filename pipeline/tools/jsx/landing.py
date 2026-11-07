"""Paid-ads landing pages (campaign, school, builders, generic) -> React pages in app/(landing)/.

They keep their own stylesheets (no theme CSS), so they live in their own route group. Their scripts
run through next/script; inline scripts move to public/js/<page>-page.js.

Usage: python3 -I tools/jsx/landing.py site
"""
import json, os, re, shutil, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bs4 import BeautifulSoup, Tag, Comment  # noqa: E402
import templ  # noqa: E402
from templ import Scope, build, component_source, USED, kids, PLAIN_IMG  # noqa: E402

PLAIN_IMG[0] = True
from htmljsx import js  # noqa: E402
from build import section_name, write, react_fix, a11y_fix, report  # noqa: E402

SITE = sys.argv[1]
PAGES = ["campaign", "school", "builders", "generic"]
READY = ("function fpReady(fn) {\n  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);\n"
         "  else fn();\n}\n")


def meta(soup, name, attr="name"):
    el = soup.find("meta", attrs={attr: name})
    return el.get("content") if el else None


def page(name):
    src = open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "records", "standalone", name + ".html"), encoding="utf-8").read()
    soup = BeautifulSoup(src, "html.parser")
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    head, body = soup.head, soup.body
    seo = {
        "title": head.title.get_text().strip() if head.title else "",
        "description": meta(head, "description") or "",
        "canonical": (head.find("link", rel="canonical") or {}).get("href") if head.find("link", rel="canonical") else None,
        "robots": meta(head, "robots"),
        "og": {k: meta(head, k, "property") for k in ("og:title", "og:description", "og:image", "og:url", "og:type") if meta(head, k, "property")},
        "twitter": {k: meta(head, k) for k in ("twitter:card", "twitter:title", "twitter:description", "twitter:image") if meta(head, k)},
    }
    # stylesheets, in order; inline <style> blocks become files
    links, scripts, inline_js = [], [], []
    n_style = 0
    for el in soup.find_all(["link", "style", "script"]):
        if el.name == "link" and "stylesheet" in (el.get("rel") or []):
            if "fonts.googleapis.com" not in el["href"]:  # fonts come from next/font (lib/fonts.ts)
                links.append(el["href"])
        elif el.name == "style":
            n_style += 1
            fn = f"/css/pages/{name}-{n_style}.css"
            css_text = el.get_text().replace("Quicksand, sans-serif", "var(--font-quicksand), Quicksand, sans-serif")
            write(os.path.join(SITE, "public", fn.lstrip("/")), css_text)
            links.append(fn)
        elif el.name == "script":
            if el.get("src"):
                scripts.append(el["src"])
            elif el.get("type") == "application/ld+json" or "googletagmanager" in el.get_text():
                pass  # structured data: lib/schema.ts; GTM: root layout
            else:
                inline_js.append(el.get_text())
        el.extract()
    react_fix(soup)
    a11y_fix(soup.body, f"/{name}.html")
    for el in soup.find_all(attrs={"oninput": True}):  # digits-only phone fields, handled in campaign-lp.js
        del el["oninput"]
        el["data-fp-digits"] = ""
    for ns in soup.find_all("noscript"):
        ns.extract()  # GTM noscript iframe: root layout
    if inline_js:
        js_file = f"/js/{name}-page.js"
        code = "\n".join(inline_js)
        code = code.replace('document.addEventListener("DOMContentLoaded", function () {', "fpReady(function () {")
        # libraries load asynchronously through next/script: wait for them
        code = ("/* Inline scripts of the original " + name + ".html, run once Swiper and AOS are available. */\n" + READY +
                "(function wait(n) {\n  if ((window.Swiper && window.AOS) || n > 100) return fpReady(function () {\n" +
                "\n".join("    " + l for l in code.strip().splitlines()) + "\n  });\n  setTimeout(function () { wait(n + 1); }, 100);\n})(0);\n")
        write(os.path.join(SITE, "public", js_file.lstrip("/")), code)
        scripts.append(js_file)
    html_cls = " ".join(soup.html.get("class") or [])
    body_cls = " ".join(body.get("class") or [])
    # On the original page Bootstrap's body rules (line-height, colour, background) override these
    # Tailwind classes on <html>/<body>; on a wrapper <div> they would apply, so they are left out.
    overridden = {"leading-relaxed", "bg-white", "text-gray-800"}
    wrap_cls = " ".join(c for c in (html_cls + " " + body_cls).split() if c not in overridden)
    has_main = body.find("main") is not None
    # body -> section components
    comp_dir = os.path.join(SITE, "components", "landing", name)
    shutil.rmtree(comp_dir, ignore_errors=True)
    taken, imports, parts, sections = set(), [], [], []
    for n in kids(body):
        if not isinstance(n, Tag):
            if str(n).strip():
                print("loose text", name, str(n)[:40])
            continue
        cname = section_name(n, taken)
        USED.clear()
        sc = Scope("p")
        templ.TEXT_PROPS[0] = True  # the page's text goes to its JSON (content sheet)
        jsx, datas = build([n], sc)
        templ.TEXT_PROPS[0] = False
        write(os.path.join(comp_dir, cname + ".tsx"), component_source(cname, jsx, sc))
        if sc.types:
            sections.append({"component": cname, "props": datas[0]})
            imports.append(f'import {cname}, {{ type {cname}Props }} from "@/components/landing/{name}/{cname}";')
            parts.append(f'      <{cname} {{...section<{cname}Props>(page, "{cname}")}} />')
        else:
            imports.append(f'import {cname} from "@/components/landing/{name}/{cname}";')
            parts.append(f"      <{cname} />")
    page_meta = {"path": f"/{name}.html", "type": "landing", "seo": seo}
    if sections:
        page_meta["sections"] = sections
    h1 = body.find("h1")
    if h1 is not None:
        page_meta["h1"] = " ".join(h1.get_text(" ").split())
    write(os.path.join(SITE, "content", "pages", name + ".json"), json.dumps(page_meta, ensure_ascii=False, indent=1))
    links_jsx = "\n".join(f'      <link rel="stylesheet" href="{h}" precedence="landing" />' for h in links)
    # pages styled by /css/campaign.css show its .box banner: preload it (components/HeroPreload.tsx)
    hero = "/css/campaign.css" in links
    if hero:
        links_jsx = ('      {/* banner: the .box background in /css/campaign.css */}\n'
                     '      <HeroPreload src="/images/campaign/banners/funplay-banner.webp" selector=".box" />\n' + links_jsx)
    scripts_jsx = "\n".join(f'      <Script src="{s}" strategy="afterInteractive" />' for s in scripts)
    out = (
        'import type { Metadata } from "next";\nimport Script from "next/script";\n'
        'import PageSchema from "@/components/PageSchema";\n' + ('import HeroPreload from "@/components/HeroPreload";\n' if hero else "") +
        f'import {{ buildMetadata, {"section, " if sections else ""}type PageMeta }} from "@/lib/page";\n' + f'import meta from "@/content/pages/{name}.json";\n' + "\n".join(imports) + "\n\n"
        "const page = meta as PageMeta;\n\nexport const metadata: Metadata = buildMetadata(page);\n\n"
        f"/** Paid-ads landing page with its own header, footer and styles. */\nexport default function Page() {{\n  return (\n"
        f'    <div className="{wrap_cls}">\n' if wrap_cls else
        'import type { Metadata } from "next";\nimport Script from "next/script";\n'
        'import PageSchema from "@/components/PageSchema";\n' + ('import HeroPreload from "@/components/HeroPreload";\n' if hero else "") +
        f'import {{ buildMetadata, {"section, " if sections else ""}type PageMeta }} from "@/lib/page";\n' + f'import meta from "@/content/pages/{name}.json";\n' + "\n".join(imports) + "\n\n"
        "const page = meta as PageMeta;\n\nexport const metadata: Metadata = buildMetadata(page);\n\n"
        f"/** Paid-ads landing page with its own header, footer and styles. */\nexport default function Page() {{\n  return (\n    <>\n"
    )
    # page content between the landing header and footer goes in <main> (landmarks)
    first = 1 if parts and "Header" in parts[0] else 0
    last = len(parts) - 1 if parts and "Footer" in parts[-1] else len(parts)
    if not has_main:
        parts = parts[:first] + ["      <main>"] + parts[first:last] + ["      </main>"] + parts[last:]
    out += links_jsx + "\n" + "\n".join(parts) + "\n" + scripts_jsx + "\n      <PageSchema page={page} />\n"
    out += ("    </div>\n" if wrap_cls else "    </>\n") + "  );\n}\n"
    write(os.path.join(SITE, "app", "(landing)", f"{name}.html", "page.tsx"), out)
    print(name, len(parts), "sections", len(links), "stylesheets", len(scripts), "scripts")


for p in PAGES:
    shutil.rmtree(os.path.join(SITE, "app", f"{p}.html"), ignore_errors=True)
    page(p)
for k, v in report.items():
    print(k, len(v), v[:3])
