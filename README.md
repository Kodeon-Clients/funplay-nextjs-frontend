# FunPlay Systems website (funplaysystems.com)

Next.js rebuild of funplaysystems.com. Same design, same URLs and the same features as the
current site, with the SEO fix pack, programmatic city pages, new copy and server-side forms.

- Next.js 16 (App Router, static generation), React 19, TypeScript, Tailwind 4 (prefix `tw:`)
- 1,048 pages generated at build time, 1,031 of them in the XML sitemaps
- Forms run as Vercel functions (Mailgun email, optional Mailchimp and reCAPTCHA v3)
- No database, no CMS. Pages are React components; their data lives in `content/` as JSON and MDX

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
npm run lint                 # ESLint (flat config, eslint-config-next)
npm run build && npm start   # production build
ONLY_PATHS="/,/about-us.html" npm run build   # quick build of a few templated pages
```

### How pages are built

Every page is React (JSX) rendered on the server. No page stores HTML as a string and nothing uses
`dangerouslySetInnerHTML`.

- **Core and one-off pages** (home, about, contact, products hub, careers, policies and so on) each have
  their own route file, for example `app/(site)/about-us.html/page.tsx`. The route exports its metadata
  from `content/pages/<page>.json` and renders section components from `components/pages/<page>/`,
  passing each one its text from the same JSON (`section<Props>(page, "Name")`).
- **Page families** that share one layout (668 city pages, 248 product pages, 53 blog posts) are rendered by
  `app/(site)/[...slug]/page.tsx`. Their data lives in `content/city/`, `content/product/` and
  `content/blog/` as JSON: SEO tags, structured-data inputs and a list of sections, each naming a
  component from `components/templates/<family>/` and the props it takes. Text with inline formatting
  is stored as structured data (`string` or a list of `{ tag, attrs, c }` segments), rendered by
  `components/ui/Rich.tsx`.
- **Blog article bodies** are MDX files in `content/blog/<slug>.mdx`, indexed in `content/blog/articles.ts`.
- **Paid-ads landing pages** (`campaign`, `school`, `builders`, `generic`) live in `app/(landing)/` with
  their own stylesheets; `/ads.html` lives in `app/(ads)/` with the stylesheet order of the original page.

### Where things are

| Path | What it holds |
| --- | --- |
| `app/(site)/<page>.html/page.tsx` | One route file per core page |
| `app/(site)/[...slug]/page.tsx` | City, product and blog pages from `content/{city,product,blog}/` |
| `app/(landing)/`, `app/(ads)/` | Landing pages that keep their own CSS stack |
| `app/api/*` | Form handlers: `contact`, `career`, `newsletter`, `download` |
| `app/sitemap*.xml`, `app/search-index.json` | Sitemaps and the site search index, generated from `lib/pages.ts` |
| `content/pages/*.json` | SEO tags and structured-data inputs of each core page |
| `content/{city,product,blog}/` | Data of the templated pages; blog bodies as `.mdx` |
| `content/redirects.json` | 301 redirects (loaded in `next.config.ts`); `case-redirects.json` is handled in `proxy.ts` |
| `content/images.json` | Image sizes and WebP variants used for `srcset` |
| `components/pages/`, `components/templates/`, `components/shared/` | Section components of the pages (their text comes from the JSON) |
| `content/shared-sections.json`, `content/image-seo.json` | Text of shared sections; alt texts and image swaps from the content sheet |
| `scripts/sheet/`, `.github/workflows/content-sheet.yml`, `docs/apps-script/` | Content sheet sync (see `docs/CONTENT-SHEET.md`) |
| `components/ui/` | `Img` (srcset, alt texts from the sheet), `Icon`, `Rich` (formatted text), `Blocks`, galleries |
| `lib/page.ts` | Page type and `buildMetadata()` |
| `lib/pages.ts` | List of all pages (sitemaps, search index, static params) |
| `lib/schema.ts`, `components/PageSchema.tsx` | JSON-LD: Organization, LocalBusiness, WebSite, plus page-level types |
| `lib/fonts.ts` | Quicksand, Nunito and Inter self-hosted through `next/font` (`font-display: swap`) |
| `lib/behaviors.ts` | Front-end behaviour that replaced jQuery and the theme scripts |
| `styles/theme/` | Theme CSS with unused rules removed (generated, see below) |
| `styles/legacy/` | Original theme CSS, the input of the CSS clean-up |
| `styles/icons.css` | Icons as inline SVG (generated, replaces the five icon fonts) |
| `public/` | Images, videos, PDFs, text fonts, `robots.txt`, `llms.txt`, `ai.txt` |
| `docs/` | Forms set-up, refactor report, keyword map, review list for FunPlay |

### Editing content

**The SEO and content team edit through the content sheet** (Google Sheets: titles, meta descriptions,
H1s, Open Graph, alt texts, image replacements and all page text). Publishing from the sheet commits to
this repository and Vercel deploys it. Set-up and rules: `docs/CONTENT-SHEET.md`.

In the code:

- **Text of any page:** the `sections` of its JSON file (`content/pages/`, `content/city/`,
  `content/product/`); text of sections shared by several pages is in `content/shared-sections.json`.
- **Title, description, canonical, Open Graph of any page:** the `seo` block of its JSON file.
- **Blog post body:** the `.mdx` file in `content/blog/`; Markdown for text, JSX for images (`<Img />`) and FAQs (`<Faq />`).
- **Alt texts and image swaps set from the sheet:** `content/image-seo.json`.
- **Images:** put new files in `public/images/` and run `npm run optimize-images` to create WebP variants.

Changes made in the code flow back into the sheet automatically. Rebuild and deploy afterwards.

### CSS and icons

The theme CSS in `styles/legacy/` is the source. Two steps produce what the site loads, and only need to
run again after the theme CSS or the page markup changes a lot:

1. `npm run purge-css` removes rules no page uses (`scripts/purge-css.mjs`, with a safelist for classes
   added by scripts) and writes `styles/theme/`.
2. `python3 -I pipeline/tools/icons.py .` turns the icon-font rules into SVG masks in `styles/icons.css`
   and removes the icon `@font-face` rules. The icon fonts it reads are in `pipeline/tools/icon-fonts/`
   and are not served. Python 3.11+ with `fonttools` is needed.

`npm run build-landing-css` compiles the Tailwind utilities of the thank-you and landing pages.

## Generators (`pipeline/`)

The page components and JSON were generated from the original site, and the scripts that did it are in
`pipeline/tools/`, with the written copy in `pipeline/content-src/`. Day-to-day edits do not need them, and
**running a generator again overwrites the files it writes**, including any hand edits made since.
Publish pending content-sheet edits before regenerating, and run the sheet set-up again afterwards
(`docs/CONTENT-SHEET.md`, "Working on the code with the sheet in use").
`pipeline/` is excluded from the Vercel upload (`.vercelignore`) and from TypeScript.

From inside `pipeline/` (Python 3.11+ with `beautifulsoup4`, `openpyxl`, `fonttools`):

1. `python3 -I tools/jsx/build.py ..` page records (`tools/records/`) to route files, components and JSON
2. `python3 -I tools/jsx/landing.py ..` landing pages
3. `python3 -I tools/jsx/schema_data.py ..` structured-data inputs in each page's JSON
4. In the site root: `npm run purge-css`, `python3 -I pipeline/tools/icons.py .`, `npm run build`

The page records in `tools/records/` were produced from the original site files and the SEO fix pack
(`tools/fixpack/`, `tools/extract.py`, `tools/compose.py` with `tools/records` as output,
`tools/standalone.py`); the input files those need (original site, Search Console export, SEO fix list,
catalogue PDF) are not in this package.

Checks (run against a local `npm start`): `tools/check_urls.py` (every old URL still answers),
`tools/schema_audit.py` (JSON-LD), `tools/a11y_audit.py` (labels, alt text, headings, landmarks),
`tools/seo_audit.py`, `tools/validate_content.py` (copy rules), `tools/keyword_map.py tools/records ../docs`.
