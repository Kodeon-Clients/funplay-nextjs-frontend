import R, { type Rich } from "@/components/ui/Rich";

export type CityOutdoorGymEquipmentManufacturerProps = { h1Text: Rich };

/** 324 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-adoni.html */
export default function CityOutdoorGymEquipmentManufacturer(p: CityOutdoorGymEquipmentManufacturerProps) {
  return (
    <section className="pb-50px" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h1 className="descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px"><R v={p.h1Text} /></h1></div></div></div></section>
  );
}
