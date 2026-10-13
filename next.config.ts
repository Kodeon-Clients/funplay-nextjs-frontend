import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

type Redirect = { source: string; destination: string };

/** Escape characters that path-to-regexp treats as syntax so old URLs match literally. */
function literal(p: string) {
  return p.replace(/[()[\]{}?*+:!]/g, (c) => `\\${c}`).replace(/ /g, "%20");
}

const redirects: Redirect[] = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "redirects.json"), "utf8"));

const nextConfig: NextConfig = {
  // Images are pre-optimised by scripts/optimize-images.mjs (WebP variants + compressed originals).
  images: { unoptimized: true },
  poweredByHeader: false,
  async redirects() {
    const out: { source: string; destination: string; statusCode: 301 }[] = [];
    for (const r of redirects) {
      const variants = new Set([r.source, encodeURI(r.source)]);
      for (const v of variants) out.push({ source: literal(v), destination: r.destination, statusCode: 301 });
    }
    return out;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/_img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
