export type OutdoorPlaygroundSwingSetsProps = { h1Text: string; pText: string };

export default function OutdoorPlaygroundSwingSets(p: OutdoorPlaygroundSwingSetsProps) {
  return (
    <section className="pb-75px" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h1 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px">{p.h1Text}</h1><p>{p.pText}</p></div></div></div></section>
  );
}
