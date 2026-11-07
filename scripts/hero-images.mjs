/**
 * Finds each page's banner image (the CSS background of the first section in <main>, which is the
 * page's largest element on load) in the built HTML, and writes content/hero-images.json.
 * components/PageShell.tsx preloads that image (and its 1600px WebP copy below desktop width), so the browser starts loading it
 * straight away instead of after the stylesheet has been parsed.
 *
 * Run after a build when banners have changed:  npm run build && npm run hero-images && npm run build
 * (A stale entry only means a banner is not preloaded or an old one is; nothing breaks.)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BUILT = path.join(ROOT, ".next", "server", "app");
const OUT = path.join(ROOT, "content", "hero-images.json");

function htmlFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

if (!fs.existsSync(BUILT)) {
  console.error("No build found (.next/server/app). Run npm run build first.");
  process.exit(1);
}
const heroes = {};
for (const file of htmlFiles(BUILT)) {
  const html = fs.readFileSync(file, "utf8");
  // the page path is in the canonical link
  const canon = /<link rel="canonical" href="https:\/\/funplaysystems\.com([^"]*)"/.exec(html);
  if (!canon) continue;
  const main = html.indexOf('<main id="main"');
  if (main < 0) continue;
  const first = html.indexOf("<section", main);
  if (first < 0) continue;
  const next = html.indexOf("<section", first + 8);
  const block = html.slice(first, next > 0 ? next : first + 20000);
  const m = /background-image:\s*url\(([^)]+)\)/.exec(decode(block));
  if (!m) continue;
  const src = m[1].trim().replace(/^['"]|['"]$/g, "");
  if (!src.startsWith("/") || !/\.(jpe?g|png|webp|avif|gif)$/i.test(src)) continue;
  heroes[decodeURI(canon[1]) || "/"] = src;
}
const sorted = Object.fromEntries(Object.entries(heroes).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 1) + "\n");
console.log(`${Object.keys(sorted).length} pages with a banner image -> ${path.relative(ROOT, OUT)}`);
