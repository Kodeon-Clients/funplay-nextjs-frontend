import type React from "react";
import fs from "node:fs";
import path from "node:path";
import images from "@/content/images.json";
import { altFor, srcFor } from "@/lib/image-seo";

type ImageInfo = { w: number; h: number; variants: [number, string][] };
const MAP = images as unknown as Record<string, ImageInfo>;

/** Sizes and WebP variants written by scripts/optimize-images.mjs. */
export function imageInfo(src?: string | null): ImageInfo | undefined {
  return src ? MAP[src] : undefined;
}

/** Does an optimised copy exist in public/? (Pages are built ahead of time, so this runs at build time.)
 * Copies deleted after a media clean-up are simply left out of srcset. */
const exists = new Map<string, boolean>();
let publicDir: boolean | undefined;
export function variantExists(url: string): boolean {
  // a page rendered on the server at request time may not have public/ on disk: keep every copy then
  publicDir ??= fs.existsSync(path.join(process.cwd(), "public", "_img"));
  if (!publicDir) return true;
  let ok = exists.get(url);
  if (ok === undefined) {
    try {
      ok = fs.existsSync(path.join(process.cwd(), "public", decodeURIComponent(url)));
    } catch {
      ok = true;
    }
    exists.set(url, ok);
  }
  return ok;
}

export function srcSetFor(src?: string | null): string | undefined {
  const info = imageInfo(src);
  const variants = info ? info.variants.filter(([, u]) => variantExists(u)) : [];
  if (!info || variants.length === 0) return undefined;
  return variants.map(([w, u]) => `${u} ${w}w`).join(", ");
}

/**
 * <img> with intrinsic size and a responsive srcset taken from the image manifest, so pages keep
 * their original markup while the browser picks the right WebP variant. Images are pre-optimised at
 * build time, which is why this is a plain <img> rather than next/image.
 */
export default function Img({ src: codeSrc, alt, width, height, srcSet, sizes, decoding, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const orig = typeof codeSrc === "string" ? codeSrc : undefined;
  const src = orig ? srcFor(orig) : codeSrc;
  alt = altFor(orig, alt);
  const info = typeof src === "string" ? imageInfo(src) : undefined;
  if (info) {
    if (width == null && height == null) {
      width = info.w;
      height = info.h;
    }
    const ss = srcSetFor(src as string);
    if (ss && !srcSet) {
      srcSet = ss;
      sizes = sizes || `(max-width: ${info.w}px) 100vw, ${info.w}px`;
    }
  }
  return <img src={src} alt={alt ?? ""} width={width} height={height} srcSet={srcSet} sizes={sizes} decoding={decoding ?? "async"} {...rest} />;
}

/** Plain <img> (landing pages): only the content sheet's image replacement and alt text are applied. */
export function PlainImg({ src, alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const orig = typeof src === "string" ? src : undefined;
  return <img src={orig ? srcFor(orig) : src} alt={altFor(orig, alt) ?? ""} {...rest} />;
}
