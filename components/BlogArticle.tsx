import { articles } from "@/content/blog/articles";
import { mdxComponents } from "@/mdx-components";

/** The body of a blog post, written in MDX (content/blog/<slug>.mdx). */
export default function BlogArticle({ slug }: { slug: string }) {
  const Article = articles[slug as keyof typeof articles];
  if (!Article) throw new Error(`No article content for ${slug}`);
  return <Article components={mdxComponents} />;
}
