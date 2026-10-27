# Content sheet

The website's titles, meta descriptions, H1s, Open Graph tags, image alt texts and page text can be
edited in a Google Sheet. **Publish** in the sheet's *Website* menu puts the edits on the site, with no
developer in between. The code stays the master copy: every publish is a normal commit to the
repository, so there is a full history and any change can be undone.

```
Google Sheet ──Website ▸ Publish──▶ GitHub Action ──checks + commit──▶ main ──▶ Vercel ──▶ funplaysystems.com
     ▲                                                                   │
     └──────────── code changes by developers flow back into the sheet ◀─┘ (after every push, and nightly)
```

- **Publish to preview**: the edits go to a preview copy of the site (link in the *Publish log*), not live.
- **Publish live**: the edits go to the live site. The site updates about 15 minutes later.
- If any edited cell has a problem (an empty title, a broken link format), **nothing** is published and
  the *Publish log* lists the cells to fix. The live site is never half-updated.

---

## Part 1: for the SEO team

### The tabs

| Tab | One row per | You can edit |
| --- | --- | --- |
| **Pages** | page (1,042) | Title, Meta description, H1, Index (index/noindex), Canonical URL, OG title, OG description, OG image |
| **Images** | image used on the site (1,221) | Alt text, Replace with (another image file) |
| **Content** | piece of text on a page (about 34,000) | Text: headings, paragraphs, buttons, FAQ questions and answers, city facts, blog paragraphs |
| **Publish log** | publish | nothing (written by the website) |

Edit only the columns with a **light yellow background**. Grey columns are filled in by the website;
Sheets warns you if you try to change them. Use the filter row (the funnel icons) to find pages: for
example, filter Content by *Page* or *Page type*, or search with Ctrl+F.

When you change a cell, its row's **Status** says *Edited, not published yet*. After a live publish the
mark is cleared.

### Rules

1. **Do not add, delete, move or sort-and-save rows, and do not rename columns.** Each row is tied to
   one spot on the site by its first column (and the hidden *Key* column on the Content tab). Filtering
   and sorting the view is fine.
2. **New pages, new sections, new FAQ questions, layout changes** are developer work. The sheet edits
   what exists. New pages appear in the sheet by themselves once the developer has added them.
3. **Text cannot be emptied** (a heading or paragraph cannot be removed from the sheet). Ask the developer.
4. **One person publishes at a time.** A publish takes about 2 minutes; the next one waits its turn.

### Writing formatted text

The **Format** column of the Content tab says what a cell accepts:

| Format | What you type |
| --- | --- |
| plain text | just text. `**` and `[...](...)` are shown exactly as typed. |
| text with links/bold | `**bold**`, `*italic*`, `[link text](/page.html)`; a new line in the cell (Ctrl+Enter, or ⌘+Enter on a Mac) is a line break |
| paragraphs and lists | as above, plus: an empty line between paragraphs; lines starting with `- ` make a bullet list, `1. ` a numbered list |
| markdown (blog articles) | one paragraph, heading (`## Heading`) or list per cell, in the same style |
| read-only | cannot be changed from the sheet |

Links: use the page's path for pages on this site (`/contact-us.html`), and the full address for
other sites (`https://...`). A few cells contain tags such as `<span class="fw-600">...</span>`:
these keep the look of the original design (a bold part of a heading, a coloured word). Change the
words inside, and leave the tags as they are. To show a literal `*`, `[`, `]` or `<`, type `\` before it.

### Each tab in more detail

**Pages**
- *Title* and *Meta description*: the lengths are counted next to them and turn red when a title is
  over 60 characters or a description is outside 70–160. Duplicate titles and descriptions are listed as warnings in the Publish log.
- *H1*: the page's main heading as shown on the page. On 2 pages (the thank-you pages) the H1 sits in a
  section shared with another page; the Status column says where to edit it instead.
- *Index*: `noindex` keeps a page out of Google (it stays on the site and in internal links).
- *Canonical URL*: leave as it is unless you know you need it. Pointing it at another page removes this
  page from Google in favour of that one.
- *OG title / OG description*: what Facebook, LinkedIn and WhatsApp show. Empty means "same as the title /
  meta description", so they follow your title edits automatically.
- *OG image*: a path like `/images/name.jpg` (the file must already be on the site).

The structured data (FAQ, breadcrumb, product and service schema) is updated with the text: change an FAQ
answer or an H1 and the schema follows.

**Images**
- *Alt text* is applied **everywhere the image appears**, on every page. Leave it empty to keep the alt
  texts written on each page (shown in *Alt text on the pages now*).
- *Replace with*: show a different image file in this image's place on every page, for example a
  renamed copy with a descriptive file name (`/images/outdoor-gym-multi-station-pune.jpg`). The new file
  must already be uploaded by the developer, who also creates its optimised sizes.
- Background images (set in CSS) are not listed: they have no alt text.

**Content**
- *Page* "All pages with this section (n)": text in a section that several pages share. One edit changes
  it on all of them.
- City and product pages: the text that is the **same on every city page** (for example the "Get a
  Quote" button) is part of the page template and not in the sheet; changing it for all 668 city pages at
  once is a developer task. Everything that differs per page is in the sheet.
- The header menu, the footer and the forms are not in the sheet.

### Publishing

1. **Website ▸ Check my edits**: quick check of your edited rows.
2. **Website ▸ Publish to preview**: after about 2 minutes the *Publish log* has a new line. Open its
   link about 15 minutes later to see the preview site.
3. **Website ▸ Publish live**.
4. Read the new line in the **Publish log**:
   - *Published (live in ~15 min)*: done. The changes are listed, with any warnings.
   - *Not published: fix the sheet*: nothing changed. Fix the listed cells and publish again.
   - *Failed*: nothing changed; tell the developer (the line has a link to the details).

To undo a change, type the old text back and publish (the developer can also restore any earlier
version from the repository history).

---

## Part 2: for the developer

### What is in the code

| Path | What it does |
| --- | --- |
| `scripts/sheet/` | the sync tool (`npm run sheet -- <command>`), no extra dependencies |
| `scripts/sheet/format.mjs` | cell format for rich text and blocks; checked to convert back exactly |
| `scripts/sheet/model.mjs` | which fields are editable and how edits are written into `content/` |
| `scripts/sheet/sync.mjs` | three-way sync (sheet, code, last sync state in `content/.sheet-base.json`) |
| `scripts/sheet/google.mjs` | Google Sheets API (service account) |
| `.github/workflows/content-sheet.yml` | publish / refresh / setup job |
| `docs/apps-script/Code.gs` | the sheet's *Website* menu |
| `content/image-seo.json` | alt texts and image replacements from the Images tab (read by `lib/image-seo.ts`) |
| `content/shared-sections.json` | text of sections shared by several pages |
| `vercel.json` | skips a Vercel build when a commit only changes the sync state |

All page text now lives in the page JSON files (`content/pages/`, `content/city/`, `content/product/`,
`content/blog/`): core pages pass their section props with `section<Props>(page, "Name")`. Rendering is
unchanged: the HTML of all 1,046 pages is identical to before.

### One-time set-up (about 30 minutes)

1. **Google Cloud** (any Google account; free):
   1. console.cloud.google.com, create a project (e.g. "funplay-content-sheet").
   2. *APIs & Services ▸ Library*: enable **Google Sheets API**.
   3. *IAM & Admin ▸ Service accounts ▸ Create*: name "content-sheet", no roles needed.
   4. Open it, *Keys ▸ Add key ▸ JSON*. Keep the downloaded file safe; do not commit it or share it.
2. **The sheet**: create an empty Google Sheet named "FunPlay website content". Share it with the
   service account's e-mail (`content-sheet@<project>.iam.gserviceaccount.com`) as **Editor**, and with
   the SEO team as Editors. The sheet id is the long part of its URL: `/spreadsheets/d/<id>/edit`.
3. **GitHub** (the website repository): *Settings ▸ Secrets and variables ▸ Actions*:
   - secret `CONTENT_SHEET_ID`: the sheet id
   - secret `GOOGLE_SERVICE_ACCOUNT`: the whole content of the JSON key file
   - variable `PREVIEW_URL`: the Vercel URL of the `content-preview` branch, normally
     `https://<vercel-project>-git-content-preview-<vercel-team>.vercel.app` (it exists after the first preview)
   - *Settings ▸ Actions ▸ General*: Workflow permissions **Read and write**.
4. **Fill the sheet**: *Actions ▸ Content sheet ▸ Run workflow*, target **setup**. It writes all tabs
   (about 2 minutes) and commits `content/.sheet-base.json`. Open the sheet to check it.
5. **The menu**: in the sheet, *Extensions ▸ Apps Script*, paste `docs/apps-script/Code.gs`, save.
   *Project Settings ▸ Script properties*: `GITHUB_REPO` = `owner/repo`, `GITHUB_TOKEN` = a
   fine-grained personal access token limited to this repository with **Actions: Read and write** only.
   (Anyone who can edit the sheet can read script properties, which is why the token can only start
   workflows: it cannot change code.) Reload the sheet, run *Website ▸ Check my edits* once and allow access.
6. **Test**: change one title, *Publish to preview*, check the Publish log and the preview; then
   *Publish live*.

Vercel needs nothing new: commits to `main` deploy as before, `content-preview` gets preview deploys.
If Vercel's project settings have their own *Ignored Build Step*, keep the rule from `vercel.json`.

### Working on the code with the sheet in use

- Edits you make to `content/` in the code reach the sheet automatically (the workflow runs after each
  push to `main` and nightly). If the sheet was edited in the same cell, the sheet's text wins at the next
  publish and the Publish log lists it.
- New pages, sections and images get new rows at the end of their tab. Rows whose text no longer
  exists are marked *Not on the site any more*.
- **Regenerating pages with the generators** (`pipeline/tools/jsx/`) rewrites the JSON and may rename
  section props, which changes row keys. Publish any pending sheet edits first, regenerate, then run the
  workflow with target **setup** to rewrite the sheet cleanly. Setup refuses to run while the sheet
  has unpublished edits (`npm run sheet -- push --force` overrides that).
- Local commands (need `CONTENT_SHEET_ID` and `GOOGLE_SERVICE_ACCOUNT` in the environment):
  `npm run sheet -- check` lists unpublished edits and problems; `npm run sheet -- publish --dry-run`
  shows what a publish would change. `--sheet=dir:<folder>` runs any command against CSV files
  instead of Google (`npm run sheet -- export --out=<folder>` writes them).
- `npm run sheet -- test` checks that every text field converts to a cell and back exactly; run it after
  changing components or data shapes.
