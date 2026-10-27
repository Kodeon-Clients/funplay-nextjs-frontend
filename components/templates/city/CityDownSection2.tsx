export type CityDownSection2Props = { h1Text: string };

/** 2 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-agartala.html */
export default function CityDownSection2(p: CityDownSection2Props) {
  return (
    <section className="pb-75px" id="down-section" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h1 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px">{p.h1Text}</h1></div></div></div></section>
  );
}
