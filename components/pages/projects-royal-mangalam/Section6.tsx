export type Section6Props = { pText: string };

export default function Section6(p: Section6Props) {
  return (
    <section><div className="products-installed-wrapper"><div className="products-installed-header"><p className="heading-text-para text-dark-gray fw-700" style={{"fontSize": "2.375rem", "lineHeight": "2.7rem"}}>{p.pText}</p></div><div className="products-installed-grid"></div></div></section>
  );
}
