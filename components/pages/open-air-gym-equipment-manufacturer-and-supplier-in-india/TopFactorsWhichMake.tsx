export type TopFactorsWhichMakeProps = { h2Text: string; items: { pText: string }[] };

export default function TopFactorsWhichMake(p: TopFactorsWhichMakeProps) {
  return (
    <section className="pb-15px" style={{"textAlign": "center", "backgroundColor": "#E6F5FC"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h2 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px">{p.h2Text}</h2>{p.items.map((px, i) => (<p key={i}>{px.pText}</p>))}</div></div></div></section>
  );
}
