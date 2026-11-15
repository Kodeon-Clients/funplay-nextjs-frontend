# Blog rebuild: change note

Base: the November 2026 live version (`funplay-website-final.zip`, 10 November). This package
contains only new and changed code and content files, plus a list of deleted files. No new
packages. Media: see "Images" below.

## How to apply

1. Copy the package over the project root (same folder structure).
2. Delete the files listed in `DELETE-THESE-FILES.txt` (old blog templates no longer used).
3. Optional: copy `public/_img/` from `funplay-blog-image-copies.zip` (see Images).
4. `npm run build`. (`content/hero-images.json` is already refreshed in this package.)

## What changed for visitors

- **Blog home** (`/blog.html`): topic chips, four "guides for your project" tiles (schools, housing
  societies and builders, parks, resorts and campuses), the latest guide featured, then 12 guides
  per page with numbered pages (`/blog/page/2.html` …) instead of "load more".
- **11 hub pages** (`/blog/category/<id>.html`): 4 by audience, 7 by topic, each with its own intro,
  links to the matching product ranges and every guide in it.
- **New post layout**: breadcrumb, topic, compact title block with author, dates and reading time,
  picture, key takeaways, article, a contents list that follows the reader (a dropdown on phones),
  an enquiry card, product and project cards taken from the site's own data, FAQ, author note,
  enquiry band and three related guides.
- **Guides on product, range and project pages**: a "Guides for this product / range / project"
  block lists the posts that link to that page.
- **Content**: all 53 existing posts rewritten and 30 new posts added (83 in total). URLs of
  existing posts are unchanged; their original publish dates are kept and an "Updated" date added.
  New posts are dated across October 2025 to November 2026. Authors are pen names with a team role
  (no invented qualifications). Full list with target keywords: `docs/blog-posts.csv`.
- Unverified claims in the old posts were removed: invented testimonials, "ISO/BIS certified"
  statements and the "1,000+ installations" figure.

## SEO

- Article (`BlogPosting`, author as a person with job title), FAQ and breadcrumb structured data are
  generated from each post's own fields, so they always match the page.
- Hubs are in `sitemap-blog.xml`; numbered pages are not (they have self-canonicals).
- Keywords: posts target the keyword map's blog keywords and unserved queries from the
  10 October Search Console export (e.g. "what is playground safety", "outdoor gym equipment",
  "best surface for school", "playground equipment quote", "design ideas for coloured playground
  paths and zones", "unt sawari"). No post targets the city pages' keywords.
- The old URL `/blog/do-and-don't-in-playground-for-kids.html` still redirects to the do's and
  don'ts post.

## How the blog is built (for future posts)

| What | Where |
| --- | --- |
| Post fields (title, summary, topic, audiences, author, dates, picture, takeaways, products, projects, FAQ) | `content/blog/blog-<slug>.json`, section `BlogPost` |
| Post text | `content/blog/<slug>.mdx` |
| Hubs | `content/pages/blog-category-<id>.json` |
| Authors | `content/blog-authors.json` |
| Blog home text | `content/pages/blog.json` |
| Layout and logic | `components/templates/blog/BlogPost.tsx`, `components/blog/*`, `lib/blog.ts`, `styles/blog.css` |

To add a post: create both files for a new slug (copy an existing post), add an import line to
`content/blog/articles.ts`, build. Product and project paths in a post are checked at build time,
so a mistyped path fails the build rather than shipping a broken card. Inside the MDX you can use
`<Figure>`, `<Tip>`, `<Checklist>`, `<Table>`, `<Products />` and `<Projects />` (see
`components/blog/mdx.tsx`). Post text, titles, takeaways and FAQs remain editable through the
content sheet.

## Images

Posts use photos already on the site (project, gallery and product images). No new photos were
made. 37 project photos used in the blog had no optimised WebP copies, so they would load at full
size (200 KB to 1 MB). `funplay-blog-image-copies.zip` adds 71 WebP copies (4.2 MB) for them in
`public/_img/`, and `content/images.json` lists them. **The copies are optional**: if they are not
uploaded, the site skips them and shows the original photos.

## Files

- Changed: `app/(site)/[...slug]/page.tsx`, `app/(site)/blog.html/page.tsx`, `app/globals.css`,
  `components/PageShell.tsx`, `components/templates/blog/index.ts`, `content/hero-images.json`,
  `content/images.json`, `content/pages/blog.json`, `lib/behaviors.ts`, `lib/schema.ts`,
  `lib/sitemap.ts`, `README.md`, all of `content/blog/`.
- Added: `app/(site)/blog/page/[n]/page.tsx`, `app/(site)/blog/category/[hub]/page.tsx`,
  `components/blog/*`, `components/templates/blog/BlogPost.tsx`, `content/blog-authors.json`,
  `content/pages/blog-category-*.json` (11), `lib/blog.ts`, `styles/blog.css`, 30 new posts,
  `docs/CHANGES-BLOG.md`, `docs/blog-posts.csv`.
- Deleted: the 10 old blog section templates and the 2 old blog home components.

## Checks run

- `npm run build` (1,097 pages), `npm run lint`, `tsc --noEmit`, `npm run sheet -- test`: pass.
- All 1,076 internal links in the built site return 200 (one false alarm from an `&amp;` in a URL).
- Structured data parses on every blog page; one H1 per page; no images without alt text.
- No horizontal scrolling at 360, 390 and 768 px; screenshots checked at phone, tablet and desktop.
- Enquiry button opens the existing popup; the contents list highlights the section being read.
