import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from "html-react-parser";
import fs from "node:fs";
import path from "node:path";
import type { PageRecord } from "./content";
import { blockComponents } from "@/components/blocks";
import ProjectsGrid from "@/components/ProjectsGrid";

/** Responsive variants written by scripts/optimize-images.mjs: { "/images/a.jpg": { w, h, variants: [[640, "/_img/640/a.webp"], ...] } } */
type ImageInfo = { w: number; h: number; variants: [number, string][] };
let imageMap: Record<string, ImageInfo> | null = null;
function images() {
  if (imageMap) return imageMap;
  const f = path.join(process.cwd(), "content", "images.json");
  imageMap = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {};
  return imageMap!;
}

export function imageInfo(src?: string | null) {
  if (!src) return undefined;
  return images()[src];
}

export function srcSetFor(src?: string | null) {
  const info = imageInfo(src);
  if (!info || info.variants.length === 0) return undefined;
  return info.variants.map(([w, u]) => `${u} ${w}w`).join(", ");
}

const FORM_KINDS: [RegExp, string][] = [
  [/contact-form\.php|\/api\/contact/, "contact"],
  [/career-form\.php|\/api\/career/, "career"],
  [/subscribe-newsletter\.php|\/api\/newsletter/, "newsletter"],
  [/download-form\.php|\/api\/download/, "download"],
];

/** Renders a stored HTML fragment as React, upgrading images, forms, galleries and content blocks. */
export function renderBody(html: string, rec: PageRecord) {
  const options: HTMLReactParserOptions = {
    replace(node: DOMNode) {
      if (!(node instanceof Element)) return;
      const a = node.attribs;
      // New content blocks: <fp-block data-name="..." data-props='{...}'></fp-block>
      if (node.name === "fp-block") {
        const C = blockComponents[a["data-name"]];
        if (!C) return <></>;
        const props = a["data-props"] ? JSON.parse(a["data-props"]) : {};
        return <C {...props} rec={rec} />;
      }
      if (node.name === "img") {
        const src = a.src;
        const info = imageInfo(src);
        if (info) {
          if (!a.width && !a.height) {
            a.width = String(info.w);
            a.height = String(info.h);
          }
          const ss = srcSetFor(src);
          if (ss && !a.srcset) {
            a.srcset = ss;
            a.sizes = a.sizes || `(max-width: ${info.w}px) 100vw, ${info.w}px`;
          }
        }
        if (!a.decoding) a.decoding = "async";
        if (a.alt === undefined) a.alt = "";
        return;
      }
      if (node.name === "form") {
        const action = a.action || "";
        for (const [re, kind] of FORM_KINDS) {
          if (re.test(action)) {
            a.action = `/api/${kind}`;
            a["data-fp-form"] = kind;
            a.novalidate = "";
            break;
          }
        }
        return;
      }
      if (a.id === "projects-container") return <ProjectsGrid className={a.class} />;
      // Product gallery: render the first colour's images on the server so they are crawlable.
      if (a.id === "carouselImages" && rec.data?.colours?.length) {
        const c = rec.data.colours[0];
        return (
          <div className={a.class} role="listbox" id="carouselImages">
            {c.images.map((src: string, i: number) => {
              const info = imageInfo(src);
              return (
                <div className={i === 0 ? "carousel-item active" : "carousel-item"} key={src + i}>
                  <img
                    src={src}
                    srcSet={srcSetFor(src)}
                    sizes={info ? "(max-width: 1200px) 100vw, 1200px" : undefined}
                    width={info?.w}
                    height={info?.h}
                    className="d-block w-100"
                    alt={c.alts?.[i] || rec.data?.name || ""}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    decoding="async"
                  />
                </div>
              );
            })}
          </div>
        );
      }
      return;
    },
  };
  return parse(html, options);
}

export { domToReact };
