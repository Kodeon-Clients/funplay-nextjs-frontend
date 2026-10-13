import parse from "html-react-parser";

/** Pre-rendered local link block (breadcrumbs, nearby cities, twin page, state hub). */
export default function LocalLinks({ html }: { html: string }) {
  return <>{parse(html)}</>;
}
