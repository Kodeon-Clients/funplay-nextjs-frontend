# FunPlay Systems website (funplaysystems.com)

Next.js rebuild of funplaysystems.com. Same design, same URLs and the same features as the
current site, with the SEO fix pack, programmatic city pages, new copy and server-side forms.

- Next.js 16 (App Router, static generation), React 19, TypeScript, Tailwind 4 (prefix `tw:`)
- 1,048 pages generated at build time, 1,031 of them in the XML sitemaps
- Forms run as Vercel functions (Mailgun email, optional Mailchimp and reCAPTCHA v3)
- No database, no CMS. Content lives in `content/` as JSON

## Going live on Vercel

1. Push this folder to a GitHub repository (the `.gitignore` already leaves out `node_modules`, `.next` and env files).
2. In Vercel: **Add New > Project**, import the repository. Framework preset: **Next.js**. Root directory: the repository root. Build command `npm run build`, output left at the default.
3. Add the environment variables from `.env.example` under **Settings > Environment Variables** (Production, and Preview if you want forms to work there). At minimum: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAIL_FROM`, `LEAD_RECIPIENT`, `VERIFY_SECRET`. Details are in `docs/FORMS.md`.
4. Deploy, then check the preview URL (see the checklist below).
5. Add `funplaysystems.com` and `www.funplaysystems.com` under **Settings > Domains**. Make the non-www domain primary and let Vercel redirect www to it, which matches the canonical URLs.
6. Point DNS at Vercel as Vercel shows (A record for the apex, CNAME for www).
7. In Google Search Console, submit `https://funplaysystems.com/sitemap.xml`.

Node 20 or newer is required (Vercel's default is fine).

### Before switching DNS

- Open a few pages of each kind on the preview URL: home, a product, a city page, a blog post, `/Projects.html`, `/contact-us.html`.
- Send one test enquiry, one careers application and one newsletter sign-up and confirm the emails arrive.
- Test the catalogue download popup on the home page (email code step).
- Old URLs: `/sitemap-index.xml`, any redirected city page (for example `/outdoor-gym-equipment-manufacturer-supplier-bengaluru.html`) should return a 301.

### Security note

The old PHP form handlers on the current server contain live credentials (database, Mailgun SMTP,
reCAPTCHA secret and Mailchimp API key). None of them are copied into this project. **Rotate all of
them** and put only the new values into Vercel's environment variables.

## Working on the site

```bash
npm install
cp .env.example .env.local   # fill in values if you want forms to send
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
ONLY_PATHS="/,/about-us.html" npm run build   # quick build of a few pages
```

### Where things are

| Path | What it holds |
| --- | --- |
| `app/[[...slug]]/page.tsx` | One route that renders every content page at its original `.html` URL |
| `app/{campaign,school,builders,generic}.html/route.ts` | Paid-ads landing pages served as their own documents (`lib/standalone.ts`, `content/standalone/`) |
| `app/api/*` | Form handlers: `contact`, `career`, `newsletter`, `download` |
| `app/sitemap*.xml`, `app/search-index.json` | Sitemaps and the site search index, generated from content |
| `content/pages/*.json` | Every page: SEO tags, JSON-LD and body HTML |
| `content/overrides/` | Small hand edits applied on top of the generated pages |
| `content/redirects.json` | 301 redirects (loaded in `next.config.ts`); `case-redirects.json` is handled in `proxy.ts` |
| `content/images.json` | Image sizes and WebP variants used for `srcset` |
| `components/` | Header, footer, popups and content blocks (FAQ, city facts, rich text, local links) |
| `lib/render.tsx` | Turns page HTML into React (images, forms, galleries, blocks) |
| `lib/behaviors.ts` | Front-end behaviour that replaced jQuery and the theme scripts |
| `lib/seo.ts` | Metadata and JSON-LD |
| `styles/legacy/` | Original theme CSS, loaded in a cascade layer so the design is unchanged |
| `public/` | Images, videos, PDFs, fonts, `robots.txt`, `llms.txt`, `ai.txt` |
| `docs/` | Forms set-up, keyword map, review list for FunPlay |

### Editing content

Simple text changes can be made directly in `content/pages/*.json` (search for the sentence) or as an
override in `content/overrides/`. Rebuild and deploy afterwards. Bigger changes (new city pages,
rewritten product copy) go through the content pipeline below so they are not lost on the next run.

Images: put new files in `public/images/` and run `npm run optimize-images` to create WebP variants.

## Content pipeline (`pipeline/`)

The JSON in `content/` was generated from the original site files, and the scripts that did it are in
`pipeline/tools/`, with the written copy in `pipeline/content-src/`. You only need them to regenerate
content in bulk. `pipeline/` is excluded from the Vercel upload (`.vercelignore`) and from TypeScript.

To regenerate, copy the original site into `pipeline/source/`, then from inside `pipeline/`:

1. `python3 -I tools/fixpack/script/apply_seo_fixes.py --site source --out tools/fixed` then `cp -r tools/fixpack/new-pages/. tools/fixed/` (SEO fix pack)
2. `python3 -I tools/extract.py tools/fixed source tools/extracted` (HTML to page JSON)
3. `python3 -I tools/city_facts.py` and `python3 -I tools/product_facts.py` (fact sheets; need the Search Console export, the SEO fix list and the Originals catalogue text)
4. `python3 -I tools/compose.py tools/extracted content-src ../content` (merges the written copy, city facts, FAQs, SEO fixes and redirects)
5. `python3 -I tools/standalone.py tools/fixed ..` (landing pages)
6. `python3 -I tools/sync_assets.py` (copies any referenced file missing from `public/`)
7. Back in the site root: `npm run build-landing-css`, `npm run optimize-images`, `npm run build`

Python 3.11+ with `beautifulsoup4` and `openpyxl` is needed.

Checks (run against a local `npm start`): `tools/seo_audit.py` (titles, descriptions, H1s, canonicals, JSON-LD, links), `tools/check_urls.py`
(every old URL still answers), `tools/validate_content.py` (copy rules: no em dashes, banned phrases,
word counts, links), `tools/keyword_map.py` (rebuilds `docs/keyword-map.xlsx`).

The input files referred to in steps 3 and the keyword map (Search Console export, SEO fix list,
catalogue PDF) are not in this package; paths are set at the top of each script.
