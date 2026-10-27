import localFont from "next/font/local";

/**
 * Self-hosted fonts through next/font: font-display swap, latin subset, metric-matched fallbacks
 * so text does not jump when the font arrives. Characters outside latin (₹ and a few accented
 * letters) come from the latin-ext faces declared in styles/site.css.
 */
export const quicksand = localFont({
  src: "../node_modules/@fontsource-variable/quicksand/files/quicksand-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-quicksand",
});

export const nunito = localFont({
  src: "../node_modules/@fontsource-variable/nunito/files/nunito-latin-wght-normal.woff2",
  weight: "200 1000",
  style: "normal",
  display: "swap",
  variable: "--font-nunito",
});

/** Inter is only used on the paid-ads landing pages, so it is not preloaded elsewhere. */
export const inter = localFont({
  src: "../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  preload: false,
});
