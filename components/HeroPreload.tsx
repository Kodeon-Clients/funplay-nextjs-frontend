import { imageInfo, variantExists } from "@/components/ui/Img";

/**
 * Starts loading a page's banner image with the HTML instead of after the stylesheet
 * (<link rel="preload" as="image"> in <head>, normal priority so the stylesheet is not held back).
 * Below desktop width the banner is served from its existing 1600px WebP copy (about half the bytes):
 * a small rule swaps the background of the banner element (`selector`; by default any element whose
 * inline style uses the image), and each screen size preloads only the file it uses.
 */
export default function HeroPreload({ src, selector }: { src: string; selector?: string }) {
  const small = imageInfo(src)?.variants.find(([w, u]) => w === 1600 && variantExists(u))?.[1];
  if (!small) return <link rel="preload" as="image" href={src} />;
  const css = (v: string) => v.replace(/["\\]/g, "\\$&");
  const target = selector ?? `[style*="${css(src)}"]`;
  return (
    <>
      <link rel="preload" as="image" href={small} media="(max-width: 1199.98px)" />
      <link rel="preload" as="image" href={src} media="(min-width: 1200px)" />
      <style href={`hero:${src}:${target}`} precedence="hero">{`@media (max-width:1199.98px){${target}{background-image:url("${css(small)}")!important}}`}</style>
    </>
  );
}
