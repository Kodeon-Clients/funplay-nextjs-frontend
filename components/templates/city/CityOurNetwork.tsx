export type CityOurNetworkProps = { pText: string; h4Text: string };

/** 606 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-adoni.html */
export default function CityOurNetwork(p: CityOurNetworkProps) {
  return (
    <section className="pb-15px" style={{"textAlign": "justify", "backgroundColor": "#ffffff"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-12 last-paragraph-no-margin"><h3 className="h4 descriptionheading text-dark-gray alt-font fw-600" style={{"textAlign": "center", "paddingBottom": "10px"}}>Our Network</h3><p>{p.pText}</p></div><h4 className="descriptionheading text-dark-gray alt-font fw-600" style={{"textAlign": "center", "paddingTop": "50px", "paddingBottom": "50px"}}>{p.h4Text}</h4></div></div></section>
  );
}
