/**
 * Removes theme CSS rules that no page uses (Lighthouse "unused CSS").
 * Source: styles/legacy/*.css (the original theme files, kept unchanged for reference).
 * Output: styles/theme/*.css, imported by app/globals.css.
 *
 * Class names are collected from every component, page, MDX article and content JSON file, and from
 * lib/behaviors.ts (classes added at runtime). Classes that only appear at runtime from libraries
 * (Swiper, the lightbox, menu and accordion states) are kept through the safelist.
 * Run after changing markup: npm run purge-css
 */
import fs from "node:fs";
import path from "node:path";
import { PurgeCSS } from "purgecss";

const root = process.cwd();
const FILES = ["vendors.css", "icon.css", "style.css", "responsive.css"];
const content = [
  "app/**/*.{ts,tsx}",
  "components/**/*.{ts,tsx}",
  "lib/**/*.{ts,tsx}",
  "content/**/*.{json,mdx}",
  "mdx-components.tsx",
].map((g) => path.join(root, g));

const safelist = {
  standard: ["html", "body", "show", "active", "open", "collapsed", "collapsing", "sticky", "sticky-active", "appear", "anime-complete", "d-none", "is-invalid", "navbar-collapse-show", "show-search-popup", "active-accordion"],
  greedy: [/^swiper/, /^mfp/, /sticky/, /collaps/, /^fp-/],
};

fs.mkdirSync(path.join(root, "styles", "theme"), { recursive: true });
let before = 0;
let after = 0;
for (const f of FILES) {
  const src = path.join(root, "styles", "legacy", f);
  const [res] = await new PurgeCSS().purge({ content, css: [src], safelist, keyframes: true, fontFace: false, variables: false });
  fs.writeFileSync(path.join(root, "styles", "theme", f), res.css);
  before += fs.statSync(src).size;
  after += Buffer.byteLength(res.css);
  console.log(f, fs.statSync(src).size, "->", Buffer.byteLength(res.css));
}
console.log("theme CSS", before, "->", after, "bytes");
