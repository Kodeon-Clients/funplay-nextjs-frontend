import data from "@/content/image-seo.json";

/**
 * Site-wide image settings from the content sheet (Images tab), keyed by the image path used in the code:
 * - alt: alt text used everywhere the image appears (instead of the alt written in the page data)
 * - replace: another image file to show instead (must exist in public/ and in content/images.json)
 */
type ImageSeo = { alt?: string; replace?: string };
const MAP = data as Record<string, ImageSeo>;

export function srcFor(src: string): string;
export function srcFor(src: string | undefined): string | undefined;
export function srcFor(src: string | undefined) {
  return (src && MAP[src]?.replace) || src;
}

export function altFor(src: string | undefined, alt: string | undefined): string | undefined {
  const a = src ? MAP[src]?.alt : undefined;
  return a !== undefined && a !== "" ? a : alt;
}

function parse(json: string | undefined): string[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** data-alts of a colour swatch (JSON list, parallel to data-imgs) with the sheet's alt texts applied. */
export function galleryAlts(imgs: string | undefined, alts: string | undefined): string | undefined {
  if (alts === undefined) return undefined;
  const src = parse(imgs);
  const a = parse(alts);
  if (!src.some((s) => MAP[s])) return alts;
  return JSON.stringify(a.map((x, i) => altFor(src[i], x) ?? x));
}

/** data-imgs of a colour swatch with image replacements applied. */
export function galleryImgs(imgs: string | undefined): string | undefined {
  if (imgs === undefined) return undefined;
  const src = parse(imgs);
  if (!src.some((s) => MAP[s]?.replace)) return imgs;
  return JSON.stringify(src.map((s) => srcFor(s)));
}
