export type Section4Props = { pText: string };

/** Section shared by 3 pages; its text is in content/shared-sections.json. */
export default function Section4(p: Section4Props) {
  return (
    <section><div className="products-installed-wrapper"><div className="products-installed-header"><p className="heading-text-para text-dark-gray fw-700" style={{"fontSize": "2.375rem", "lineHeight": "2.7rem"}}>{p.pText}</p></div><div className="products-installed-grid" id="productsInstalled-grid"></div></div></section>
  );
}
