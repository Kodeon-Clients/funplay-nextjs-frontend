export type CityOutdoorGymEquipmentManufacturer2Props = { h1Text: string; pText: string };

/** 1 city page, e.g. /outdoor-gym-equipment-manufacturer-supplier-india.html */
export default function CityOutdoorGymEquipmentManufacturer2(p: CityOutdoorGymEquipmentManufacturer2Props) {
  return (
    <section className="pb-50px" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h1 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px">{p.h1Text}</h1><p>{p.pText}</p></div></div></div></section>
  );
}
