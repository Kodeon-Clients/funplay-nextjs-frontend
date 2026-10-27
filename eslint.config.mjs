import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The pages keep the original site's markup (refactor rule: no visible changes), so these
    // Next.js suggestions do not apply:
    // - plain <a> links: every page is a full page load with its own stylesheet and theme scripts;
    // - <img>: images are served pre-sized with srcset from content/images.json (components/ui/Img.tsx);
    // - <link rel="stylesheet">: page-specific stylesheets are loaded with React's precedence ordering.
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-css-tags": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts", "public/js/**", "pipeline/**"]),
]);
