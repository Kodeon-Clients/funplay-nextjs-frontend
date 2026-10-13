/**
 * The thank-you page was styled with the
 * Tailwind browser CDN on top of the theme. This compiles the same utilities once, at build time,
 * into public/css/landing-tw.css. The output sits in a cascade layer *below* the theme ("tw-landing"),
 * which reproduces the original behaviour where the unlayered theme CSS won over Tailwind's layers.
 */
import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const root = process.cwd();
const pages = ["/thankyou.html"];
const recs = JSON.parse(fs.readFileSync(path.join(root, "content/pages/core.json"), "utf8"));
const html = recs.filter((r) => pages.includes(r.path)).map((r) => r.body).join("\n");
const tmpDir = path.join(root, ".landing-tmp");
fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(path.join(tmpDir, "content.html"), html);
const input = `@import "tailwindcss" source(none);\n@source "./content.html";\n`;
const result = await postcss([tailwind({ base: tmpDir, optimize: { minify: true } })]).process(input, { from: path.join(tmpDir, "input.css") });
let css = result.css;
const props = [];
css = css.replace(/@property[^{]+\{[^}]*\}/g, (m) => (props.push(m), ""));
const out = props.join("") + "@layer tw-landing{" + css + "}";
fs.mkdirSync(path.join(root, "public/css"), { recursive: true });
fs.writeFileSync(path.join(root, "public/css/landing-tw.css"), out);
fs.rmSync(tmpDir, { recursive: true, force: true });
// standalone landing pages (content/standalone): their Tailwind keeps the native layers (as the CDN did), so the
// unlayered vendors.min.css wins over it just like on the original page.
{
  fs.mkdirSync(tmpDir, { recursive: true });
  const sa = path.join(root, "content/standalone");
  fs.writeFileSync(path.join(tmpDir, "content.html"), fs.readdirSync(sa).map((f) => fs.readFileSync(path.join(sa, f), "utf8")).join("\n"));
  const r = await postcss([tailwind({ base: tmpDir, optimize: { minify: true } })]).process(input, { from: path.join(tmpDir, "input.css") });
  fs.writeFileSync(path.join(root, "public/css/standalone-tw.css"), r.css);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log("standalone-tw.css", r.css.length, "bytes");
}
console.log("landing-tw.css", out.length, "bytes from", pages.length, "pages");
