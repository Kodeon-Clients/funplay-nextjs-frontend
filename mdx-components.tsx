import type { MDXComponents } from "mdx/types";
import Img from "@/components/ui/Img";
import Faq from "@/components/blocks/Faq";

/** Components available inside blog MDX files. */
export const mdxComponents: MDXComponents = { Img, Faq };

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
