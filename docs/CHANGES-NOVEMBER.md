# November fixes: change note

Base: the code delivered on 22 October (unchanged since). This package contains only the files that
changed or are new. No media files, no new packages.

## How to apply

1. Copy the contents of this package over the project root (same folder structure).
2. Delete `lib/fonts.ts` (replaced by `styles/fonts.css`).
3. `npm run build`. Nothing else is needed: no new dependencies, no environment variables.

`pipeline/tools/jsx/landing.py` is the landing-page generator; it is included so that regenerating the
landing pages keeps the banner change. The site does not need it to build.

## Bug fixes and improvements

| # | Item | What was wrong | Fix | Files |
| --- | --- | --- | --- | --- |
| 1 | References | Not changed, as agreed. | | |
| 2 | Home hero cursor | The theme hides the mouse pointer over sliders marked `magic-cursor` and draws its own round "drag" cursor with a jQuery/GSAP script that the rebuild did not carry over, so the pointer simply vanished. | The round cursor is rebuilt without jQuery: 70px dark circle with arrows (sliders marked `drag-cursor`: frosted circle reading "< DRAG >"), grows in when entering the slider, follows the mouse, hides over links and buttons as before. The pointer is only hidden once that cursor exists, and only on devices with a mouse. | `lib/behaviors.ts` (`magicCursor`), `styles/site.css` |
| 3 | Gallery popup close | The close button was placed inside the image frame, where a theme rule stretched it to full width and the loaded image covered it. | The button sits outside the image, as in the theme (white round button, top right). Clicking the image or the dark area and the Esc key also close it. The gallery video now opens in the same popup instead of navigating to the raw video file. Arrows are disabled when the gallery has one item. | `lib/behaviors.ts` (`lightbox`) |
| 4 | Blog banner | The blog page banner (`/blog.html`, parallax) had `background-size: cover` but repeated. Blog posts already had cover / no-repeat. | `background-size: cover; background-repeat: no-repeat` on the blog page banner. | `styles/site.css` |
| 5 | "Keeping sand out of a desert playground" spacing | The city-page content wrapper uses the class `pt-80px`, which the theme does not define, so on desktop the first content block touched the section above. Tablet and mobile had 50px. | 80px top padding on desktop. It applies to the first content block of every city page (same wrapper), not only the four desert-city pages. | `styles/site.css` |
| 6 | Slider arrows | Looping sliders kept clickable arrows with one slide; Swiper hid (instead of disabling) arrows when there was nothing to slide. | Looping sliders: both arrows disabled when there is only one slide. Non-looping sliders: arrows disabled at the first and last slide. Applies to Swiper sliders and the product image carousels (392 product colour variants have a single image; the state updates when the colour swatch changes). Disabled arrows are dimmed and not clickable. All current Swiper sliders loop. | `lib/behaviors.ts`, `styles/site.css` |
| 7 | Catalogue popup on tablet | The form fields are wrapped per step in an element with `display: contents`, which breaks Bootstrap's `.row > *` gutters: fields ran edge to edge and overflowed (on desktop too). A character counter had also been added that the original popup did not have. | Gutters restored for the wrapped fields; counter removed. Layout now matches the original on tablet portrait and landscape and on desktop. | `components/DownloadPopup.tsx`, `styles/site.css` |
| 8 | Popups on mobile and tablet | The contact popup was taller than a phone screen; the whole overlay scrolled and the close button scrolled away. | Below 1200px the contact popup is capped at the screen height and its content scrolls inside; the catalogue popup does the same at every size. The close buttons stay in the corner. | `styles/site.css`, `components/DownloadPopup.tsx` |
| 9 | Banner loading | Page banners are CSS backgrounds, found by the browser only after the stylesheet has loaded; many are large JPGs (median 275 KB, up to 800 KB). | Each page's banner is preloaded from the HTML. Below desktop width it is served from its existing 1600px WebP copy (about half the bytes; no new files were made), and each screen size downloads only one file. The three ads landing pages that use `.box` banners get the same. | `components/HeroPreload.tsx` (new), `components/PageShell.tsx`, `content/hero-images.json` (new), `scripts/hero-images.mjs` (new), `app/(landing)/{school,builders,generic}.html/page.tsx`, `pipeline/tools/jsx/landing.py` |
| 10 | Legacy JavaScript | Next.js adds its own polyfills (`Array.prototype.at`, `Object.hasOwn`, …) to every page regardless of `browserslist`. | Replaced with an empty module in the browser bundle; every browser in the supported range has these features (nothing in the shipped code uses the one feature, `URL.canParse`, that Safari 16.4 lacks). The 10 KiB left in the report is the Tawk.to chat script, which is loaded by Google Tag Manager. | `next.config.ts`, `lib/no-polyfills.js` (new) |
| 10 | Render-blocking requests | Two stylesheets blocked the first paint on every page: the main one and a separate 1 KB font stylesheet from `next/font`. | The font rules (same files, `font-display: swap`, same metric-matched fallbacks) are now part of the main stylesheet: one blocking request instead of two. | `styles/fonts.css` (new), `app/globals.css`, `app/(ads)/ads.css`, `app/(landing)/layout.tsx` (new), `app/layout.tsx`, `lib/fonts.ts` (deleted) |

Also changed: `components/ui/Img.tsx` leaves out of `srcset` any WebP copy that has been deleted (so
removing the unused copies from the audit can never break an image); `package.json` adds the
`hero-images` and `audit-media` scripts; `README.md`, `.gitignore`.

## PageSpeed (Lighthouse, mobile)

Same six pages as in October, the 22 October build and this build side by side on the same machine,
median of three runs each.

| Page | Score | First paint | Largest paint (LCP) | Render-blocking requests (est. saving) | Legacy JS (site / total) | Images |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 69 → 70 | 1.4 → 1.1 s | 3.8 → 3.8 s | 2 (770 ms) → 1 (310 ms) | 13 / 24 → 0 / 10 KiB | 460 → 436 KB |
| About us | 61 → 69 | 1.4 → 1.7 s | 4.9 → 4.0 s | 2 (770 ms) → 1 (310 ms) | 13 / 24 → 0 / 10 KiB | 484 → 395 KB |
| Blog post | 62 → 66 | 1.4 → 1.1 s | 5.0 → 3.9 s | 2 (770 ms) → 1 (310 ms) | 13 / 24 → 0 / 10 KiB | 469 → 270 KB |
| Product | 73 → 81 | 1.4 → 1.1 s | 3.2 → 2.0 s | 2 (770 ms) → 1 (310 ms) | 13 / 24 → 0 / 10 KiB | 29 → 29 KB |
| City (Pune) | 70 → 71 | 1.5 → 1.8 s | 3.9 → 3.5 s | 3 (1,230 ms) → 2 (920 ms) | 13 / 24 → 0 / 10 KiB | 208 → 137 KB |
| Landing (school) | 64 → 65 | 1.7 → 1.8 s | 8.2 → 5.5 s | 4 → 4 (landing stylesheets) | 13 / 24 → 0 / 10 KiB | 2,147 → 2,012 KB |

First paint moves between about 1.1 s and 1.7 s from one run to the next on both builds (the median
can land on either side), so the first-paint column is within noise. The remaining legacy JavaScript is Tawk.to's; the remaining
total blocking time is mostly Google Tag Manager tags and Tawk.to. The Pune page keeps a second blocking
request: its own page stylesheet. The landing pages load four stylesheets of their own.

Tested and not used: preloading the banners with high priority (made first paint slower by competing
with the stylesheet) and serving 960px banner copies on phones (visibly softer, banners are cropped to
cover tall areas).

## Audits

`funplay-media-and-forms-audit.xlsx` (separate file): unused media (332 files, 13.9 MB; 331 safe to
delete, all of them generated WebP copies or theme icons), media used only by the old standalone pages
(`Catalog1.html`, `audio1-3.html`), missing media (8, with fixes) and all 13 forms with their pages,
fields, destination and spam protection. To repeat the media audit at any time:
`npm run build && npm run audit-media`.

## Checks run

- `npm run build`, `npm run lint`, `tsc --noEmit`, `npm run sheet -- test`: pass.
- HTML of all 1,046 pages compared with the 22 October build: only the expected head changes (banner
  preload) differ; page markup is unchanged.
- Old URLs (1,072), structured data (1,033 pages) and accessibility audit (1,037 pages): no problems.
- Browser tests at 390×844, 844×390, 768×1024, 1024×768 and 1366×900: gallery popup (close button,
  image click, Esc, video), hero cursor (desktop on, touch off), blog banner, section spacing, slider
  arrows (one image / several images / home hero), catalogue and contact popups (fit the screen, scroll
  inside, close button visible and working). No script errors.
- Full-page screenshots of 12 pages at desktop, tablet and phone sizes, old build against new: no
  visible differences apart from the requested changes (banner copies on tablet/phone differ by less
  than 0.01% of pixels). Before/after screenshots: `funplay-visual-checks.pdf`.
