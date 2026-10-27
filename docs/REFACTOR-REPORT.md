# Refactor report

Response to the developer brief "funplay-reform-2" (storage and rendering refactor, accessibility,
performance) and the structured-data review. Ground rule followed throughout: no visible content was
changed. Text, headings, links, image paths, class names, IDs and layout are the same as before; only how
pages are stored and rendered changed. Where a change to the markup was unavoidable it is listed under
"Needs review" at the end.

## 1. Pages moved out of `core.json`

| Before | After |
| --- | --- |
| `content/pages/core.json` (and `cities.json`, `series.json`, `utility.json`) held every page as one HTML string | Deleted |
| One catch-all route `app/[[...slug]]` turned HTML into React at request time (`lib/render.tsx` + `html-react-parser`) | Deleted |
| Landing pages served as raw HTML documents by route handlers (`app/<page>.html/route.ts`, `lib/standalone.ts`) | Deleted |

Now:

- **68 core and one-off pages** each have a route file, e.g. `app/(site)/about-us.html/page.tsx`. Each one
  exports its own `metadata` built from `content/pages/<page>.json` (title, description, canonical,
  robots, Open Graph, Twitter) and renders real JSX section components from `components/pages/<page>/`
  (173 components) plus 8 shared ones in `components/shared/`.
- **Page families** with one layout (667 city pages + the Mumbai page, 248 products, 53 blog posts) use
  `app/(site)/[...slug]/page.tsx`. Their sections are typed components in `components/templates/<family>/`
  (city 23, product 13, blog 11). Each page's JSON holds metadata plus a list of `{ component, props }`.
- **Blog article bodies** are MDX (`content/blog/<slug>.mdx`, 53 files), rendered by `components/BlogArticle.tsx`.
- **Landing pages** `campaign`, `school`, `builders`, `generic` are App Router pages in `app/(landing)/`
  with their own stylesheets; `/ads.html` is in `app/(ads)/` so its stylesheet order matches the original.
- Sitemaps, the search index and `generateStaticParams` read the page list from `lib/pages.ts`. Every old
  URL is unchanged (see section 5).

## 2. No HTML strings in JSON, no HTML injection

Mixed content (text with links, bold, line breaks) is stored as structured data:
`string | Inline[]`, where an inline is `{ tag, attrs, c }`. `components/ui/Rich.tsx` renders it with a
whitelist of inline tags. Paragraph and list blocks are `{ type, c }` / `{ type, items }`
(`components/ui/Blocks.tsx`).

JSON-LD is rendered as the text child of `<script type="application/ld+json">` with `<`, `>` and `&`
escaped (`components/PageSchema.tsx`), so it needs no `dangerouslySetInnerHTML`.

Search results (run on the final build):

```
HTML tags or entities inside JSON string values:
  1,047 JSON files, 126,404 strings checked, 0 with HTML

grep -rnE "dangerouslySetInnerHTML|\.innerHTML|outerHTML|insertAdjacentHTML|html-react-parser" \
  app components lib content scripts public/js mdx-components.tsx
  -> no matches in project code
     (only public/js/swiper-bundle.min.js, the unmodified Swiper library loaded by campaign.html)

html-react-parser in package.json / package-lock.json: 0
```

`lib/behaviors.ts` used `innerHTML` to build the popup and lightbox markup; it now builds those elements
with `document.createElement` (an `el()` helper) and restores button labels with `replaceChildren`.

## 3. Accessibility

- Form fields without a visible label have an `aria-label` (from the placeholder, or the first option of a
  select). Honeypot fields are hidden from assistive tech (`aria-hidden`, out of tab order).
- Icon-only links and buttons have names ("Scroll down", "Play video", the card heading, social network
  names). All icon elements are `aria-hidden`.
- Every `<img>` has `alt` (decorative images `alt=""`), every `<iframe>` has a `title`.
- Scrollable carousels are keyboard reachable (`tabindex="0"`, `role="region"`, `aria-label`).
- Heading order: one `<h1>` per page. Where a level was skipped, the element was retagged to the right
  level and keeps its old size through the theme's `h3`/`h4` class, so it looks the same (4 pages, listed below).
- `<html lang="en-IN">`; landing pages have a `<main>` landmark; the contact popup is an `<aside>`.

Checks: `tools/a11y_audit.py` over 1,037 pages: no missing labels, names, alt text, titles, heading
skips or multiple H1s. axe-core on 14 pages of every kind (home, core pages, product, city, blog, landing, ads, careers): only `color-contrast` remains (theme colours, see "Needs review").

## 4. Performance

| Brief item | What was done |
| --- | --- |
| Render-blocking CSS (183.8 KiB chunk) | Theme CSS cleaned with PurgeCSS (`scripts/purge-css.mjs`, safelist for classes added by scripts): 1,513 KB to 222 KB raw. Page-specific CSS is a separate small file per page, not part of the global chunk. Home page CSS transfer: 210 KiB to 72 KiB |
| Fonts: `font-display: swap` | Quicksand, Nunito and Inter self-hosted with `next/font/local` (`lib/fonts.ts`): swap, size-adjusted fallback, only the Latin files preloaded |
| icomoon 1,150 KiB and the other icon fonts | All five icon fonts (icomoon, Font Awesome solid/brands, Bootstrap Icons, Feather, Themify) replaced with inline SVG: `tools/icons.py` reads the 66 glyphs the site uses from the font files and writes them as CSS masks (`styles/icons.css`). Class names in the markup are unchanged. Home page font transfer: 1,643 KiB to 67 KiB |
| Google Fonts `@import` in landing CSS | Removed; landing pages use the same `next/font` files |
| Legacy JS | `browserslist`: Chrome/Edge/Firefox 111+, Safari 16.4+ |
| Unused JS | jQuery, the theme's `main.js` and `vendors.min.js` were already replaced by `lib/behaviors.ts` (20 KB); the unused files are now deleted. Swiper loads with a dynamic `import()` only on pages with a slider. The catalogue popup (home page only) is loaded with `next/dynamic`, so other pages no longer download it. GTM stays on `afterInteractive`. Only two client components: `Behaviors` and `DownloadPopup` |
| Bundle / dependency review | `depcheck`: no unused packages (the `@fontsource-variable/*` packages are the font file source for `next/font`). `html-react-parser` removed |

`experimental.inlineCss` was tested and rejected: it made first paint slower (1.4 s to 2.0 s) and every
HTML page much larger.

### Lighthouse, before and after

Mobile, simulated throttling, local production build, same six pages. "Before" is the previous
delivery (one run); "after" is the median of three runs. Lighthouse scores move by 10 points or more
between runs on the same build, so compare the byte figures first; they do not vary.

| Page | Perf score | FCP | LCP | TBT | Render-blocking | Fonts without swap | Legacy JS | Unused JS | Page weight |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home `/` | 31 → 47 | 10.8 s → 1.4 s | 16.6 s → 6.3 s | 1,250 ms → 1,890 ms | 195.4 → 57.0 KiB | 5 → 0 | 23.7 → 23.7 KiB | 336 → 333 KiB | 3,280 → 1,573 KiB |
| About `/about-us.html` | 50 → 53 | 1.8 s → 1.4 s | 7.0 s → 5.7 s | 1,480 ms → 1,730 ms | 195.4 → 57.0 KiB | 3 → 0 | 23.7 → 23.7 KiB | 337 → 337 KiB | 2,000 → 1,591 KiB |
| Blog post | 40 → 54 | 4.1 s → 1.4 s | 10.8 s → 5.1 s | 1,420 ms → 1,800 ms | 195.4 → 57.0 KiB | 3 → 0 | 23.7 → 23.7 KiB | 336 → 335 KiB | 1,936 → 1,527 KiB |
| Product `/corecraft/castle-crest/crown-court-3.html` | 40 → 70 | 4.1 s → 1.4 s | 8.8 s → 2.5 s | 1,380 ms → 1,590 ms | 195.4 → 57.0 KiB | 3 → 0 | 23.7 → 23.7 KiB | 337 → 337 KiB | 1,546 → 1,137 KiB |
| City `/...-in-pune.html` | 38 → 51 | 4.1 s → 1.5 s | 9.4 s → 8.6 s | 1,410 ms → 1,240 ms | 195.4 → 57.7 KiB | 3 → 0 | 23.7 → 23.7 KiB | 337 → 336 KiB | 1,678 → 1,271 KiB |
| Landing `/school.html` | 40 → 49 | 5.9 s → 1.8 s | 14.8 s → 13.6 s | 720 ms → 1,070 ms | 12.0 → 11.7 KiB | 0 → 0 | 10.3 → 23.7 KiB | 285 → 339 KiB | 3,133 → 3,280 KiB |

What is left in these audits and why:

- **Total Blocking Time went up** although the site's own script did not grow. TBT only counts main-thread
  work after the first paint. The page now paints at about 1.4 s instead of 4 to 11 s, so the GTM and Tawk
  scripts that run after it now fall inside the measured window.
- **Unused JS (about 330 KiB)** and most of **Total Blocking Time**: almost all of it is third-party code
  loaded through Google Tag Manager (GTM, two gtag scripts, Google Ads) and the Tawk.to chat widget,
  about 720 KiB of the 930 KiB of script on the home page. The site's own code is about 195 KiB, most of
  it the React and Next.js runtime. Removing tags from GTM or loading Tawk on click would be the next big
  win; that is a marketing decision.
- **Legacy JS 23.7 KiB**: 13.4 KiB is Lighthouse's estimate for Next.js's built-in polyfill module
  (`Array.prototype.at`, `Object.hasOwn` and similar, 1.4 KB on disk, guarded so it does nothing in modern
  browsers). Next.js includes it regardless of `browserslist`. The other 10.3 KiB is in Tawk.to's script.
- **Render-blocking**: two small requests remain on most pages (the global CSS and the page's own CSS),
  57 KiB in total instead of 195 KiB. Inlining them was tested and was slower (see above).
- **Landing pages (`school.html`)**: these were plain HTML documents before. As App Router pages they now
  load the React runtime, which adds unused JS. They still render much faster (first paint 5.9 s to 1.8 s).

## 5. Final checks

| Check | Result |
| --- | --- |
| `npm run build` | Passes, 1,050 routes generated |
| `npm run lint` (ESLint 9 flat config, `eslint-config-next` core-web-vitals + TypeScript) | Passes, 0 errors, 0 warnings |
| `tsc --noEmit` | Passes |
| Old vs new HTML, all 1,046 pages (`tools/compare.py`) | 1,023 identical; 23 with expected differences only (listed below) |
| Old URLs (`tools/check_urls.py`) | 1,048 return 200, 24 return 200 after one 301, `/404.html` returns 404 |
| Structured data (`tools/schema_audit.py`) | 1,033 pages, no problems |
| Screenshots, 39 pages at desktop and mobile (`tools/vreg.py`) | Same layout; only differences are image loading timing and the 1 px icon note below |

Three ESLint rules from `eslint-config-next` are switched off in `eslint.config.mjs`, with the reason in
the file, because following them would change the markup: plain `<a>` links (every page is a full page
load with its own stylesheet), `<img>` (images are served pre-sized with `srcset` by `components/ui/Img.tsx`)
and page `<link rel="stylesheet">` tags.

## 6. Structured data

Every page carries one JSON-LD graph built by `lib/schema.ts` from the page's own data:

| Pages | Types |
| --- | --- |
| All | `Organization`, `LocalBusiness` (address, geo, phone, opening hours Mon-Sat 9:00-18:30, area served India), `WebSite`, `BreadcrumbList` (matches the visible breadcrumb) |
| Home, generic pages | `WebPage` |
| About, Contact, FAQ | `AboutPage`, `ContactPage`, `FAQPage` with all visible questions |
| Products, Projects, Blog, Gallery, Clientele, Network, series hubs (29) | `CollectionPage` (with `ItemList` where the old markup had one) |
| Product pages (248) | `Product`: name, SKU, images, description, category, brand, colours, size and capacity specs |
| City pages (667) | `Service` with `areaServed` (city, state or country) and `FAQPage` from the visible FAQ |
| Blog posts (53) | `BlogPosting` with dates and author; `FAQPage` on 4 posts whose FAQ is visible |
| Careers (2) | `JobPosting` |
| Search results | `SearchResultsPage` |

Removed because Google treats them as spam or invalid: the `AggregateRating` and `Review` entries that
were not shown on the pages, and `Offer` blocks with "Contact for Pricing" as the price. Products are
still eligible for product snippets without them.

## 7. Files and packages

**Deleted**

- `content/pages/core.json`, `cities.json`, `series.json`, `utility.json`, `content/overrides/`,
  `content/styles/`, `content/standalone/`, `content/latest-blogs.json`
- `app/[[...slug]]/page.tsx`, `app/{campaign,school,builders,generic}.html/route.ts`
- `lib/content.ts`, `lib/render.tsx`, `lib/seo.ts`, `lib/standalone.ts`
- `components/blocks.tsx`, `components/blocks/LocalLinks.tsx` (no longer used)
- `public/js/jquery.js`, `public/js/main.js`, `public/js/vendors.min.js`
- `public/css/style.css`, `responsive.css`, `icon.min.css` (the bundled theme CSS replaces them)
- 22 icon font files in `public/fonts/` (moved to `pipeline/tools/icon-fonts/` as the input of `icons.py`, not served)

The old page records are kept, outside the app, in `pipeline/tools/records/` as the input of the generators.

**Created**

- Routes: `app/(site)/` (68 page routes, `[...slug]`, layout), `app/(landing)/` (4), `app/(ads)/` (page, layout, CSS)
- Components: `components/pages/` (173), `components/templates/{city,product,blog}/` (47),
  `components/shared/` (8), `components/landing/` (18), `components/ui/{Img,Icon,Rich,Blocks,ProductGallery}.tsx`,
  `PageShell.tsx`, `PageSchema.tsx`, `BlogArticle.tsx`, `DownloadPopupLazy.tsx`, `mdx-components.tsx`
- Data: `content/pages/` (74 metadata files, landing pages included), `content/city/` (668), `content/product/` (248),
  `content/blog/` (53 JSON + 53 MDX + `articles.ts`)
- Lib: `lib/page.ts`, `lib/pages.ts`, `lib/schema.ts`, `lib/fonts.ts`
- Styles: `styles/theme/` (purged theme), `styles/icons.css`, `styles/ads-page.css`, `public/css/pages/` (19 page stylesheets)
- Tooling: `eslint.config.mjs`, `scripts/purge-css.mjs`; generators in `pipeline/tools/jsx/`, `pipeline/tools/icons.py`

**Packages**

- Removed: `html-react-parser`
- Added: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx` (blog MDX),
  `@fontsource-variable/inter` (Inter font file for `next/font`), `eslint`, `eslint-config-next` (lint),
  `postcss` (declared explicitly; was already installed through Tailwind)

## 8. Needs review

Markup that differs from the previous build (all invisible or a fix):

1. **Heading levels retagged** on 4 pages to remove skipped levels, with the old size kept by class:
   the product description heading on `parallel-bar-double`, `shoulder-press` and `curve-slide`, and the
   "Enquire" heading on `outdoor-play-equipment.html`.
2. **Phone fields** on landing and project pages: the inline `oninput` digits-only filter is now
   `data-fp-digits` handled by script, same behaviour.
3. **Invalid attributes dropped**: a stray `p=""` on `about-us.html`, `preload` on an `<img>`, `for` on
   `<span>`/`<div>`. They did nothing in browsers.
4. **Stray text removed**: "!-- start section -->" printed on the Raipur page (a broken HTML comment) and an
   empty paragraph on `junk-park.html`.
5. **Hover colour on `/our-network.html`**: 310 links used inline `onmouseover`/`onmouseout`; now a CSS
   `:hover` rule with the same colour.
6. **Landing page heads**: `og:title` on `campaign.html` and `builders.html` was "-"; now the page title.
7. **Quicksand on `/ads.html` and `/thankyou.html`**: these pages asked for Quicksand but did not load it, so
   they fell back to a system font; they now show Quicksand like the rest of the site.
8. **Icons**: product pages are 1 px shorter in places because an SVG icon's line box is 1 px smaller than
   the font glyph's.

To confirm with FunPlay:

9. **JobPosting dates**: the career pages show no posting date, so `datePosted` is set to the refactor date
   (2026-10-19) and `employmentType` to full time. Confirm or supply the real values.
10. **Blog FAQ schema**: one post had FAQ schema for questions that are not on the page; it was left out.
11. **Colour contrast**: axe flags light grey text on white and white text on some brand colours. This is
    the theme's palette; fixing it changes the look, so it is left for a design decision.
12. **Third-party scripts** (GTM tags, Tawk.to) are now the largest performance cost; worth a review of
    which tags are still needed.
13. **Fake ratings and reviews removed** from the structured data (section 6). Real reviews could be added
    later if they are shown on the pages.

## 9. Addendum: content sheet (22 October)

So that the SEO team can change titles, meta descriptions, H1s, Open Graph tags, alt texts and page
text without a developer, the site now has a Google Sheet editing layer. Set-up and rules:
`docs/CONTENT-SHEET.md`.

What changed in the code (rendered HTML unchanged: 1,046 pages compared, same result as section 5):

- The generators now store the text of every section that belongs to one page in that page's JSON
  (core pages, landing pages and one-off product layouts), not only in the city/product/blog families.
  Route files pass it with `section<Props>(page, "Name")`; shared sections read `content/shared-sections.json`.
  Text shared by every page of a family stays in the template.
- `lib/image-seo.ts` + `content/image-seo.json`: site-wide alt texts and image replacements, applied by
  `Img`, `PlainImg` (landing pages), `ProductGallery` and the colour-swatch `data-imgs`/`data-alts`.
- `scripts/sheet/` (no new dependencies apart from `@mdx-js/mdx`, already installed through
  `@mdx-js/loader`, now declared): three-way sync, validation, Google Sheets client, CSV backend.
- `.github/workflows/content-sheet.yml`: publish (preview/live), refresh after pushes and nightly, setup.
- `docs/apps-script/Code.gs`: the sheet's Website menu. `vercel.json`: skips builds for sync-state-only commits.

Checks: build, lint and `npm run sheet -- test` pass (45,096 editable fields; every one converts to a cell
and back exactly; 2 are read-only, the thank-you H1s, which are edited through their shared section).
End-to-end test with a CSV copy of the sheet: edits to a title, description, rich H1, robots, OG image,
a paragraph block with a new link and bold text, an FAQ answer, a core-page heading, a shared section,
a blog paragraph and an image alt all rendered correctly, and the FAQ and breadcrumb structured data
followed. A broken cell blocked the publish with no file changed; code changes flowed back into the sheet;
a conflicting change was resolved in favour of the sheet and reported. The Google sign-in was tested
against Google's token endpoint; the Sheets calls run for the first time at set-up (step 4 of the guide).
