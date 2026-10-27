import R, { type Rich } from "@/components/ui/Rich";

export type OutdoorGymEquipmentManufacturerProps = { h2Text: Rich; items: { pText: string }[] };

export default function OutdoorGymEquipmentManufacturer(p: OutdoorGymEquipmentManufacturerProps) {
  return (
    <section className="pb-75px" style={{"textAlign": "center"}}><div className="container"><div className="row justify-content-center"><div className="col-12 col-xl-8 last-paragraph-no-margin"><h2 className="h1 descriptionheading text-dark-gray alt-font fw-600 fs-40 pb-10px"><R v={p.h2Text} /></h2>{p.items.map((px, i) => (<p key={i}>{px.pText}</p>))}</div></div></div></section>
  );
}
