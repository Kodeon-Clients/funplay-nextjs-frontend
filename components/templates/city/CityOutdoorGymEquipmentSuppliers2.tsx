export type CityOutdoorGymEquipmentSuppliers2Props = { spanText: string; h2Text: string };

/** 7 city pages, e.g. /outdoor-gym-equipment-manufacturer-supplier-arunachal-pradesh.html */
export default function CityOutdoorGymEquipmentSuppliers2(p: CityOutdoorGymEquipmentSuppliers2Props) {
  return (
    <section className="fp-local-links pt-40px pb-40px bg-very-light-gray"><div className="container"><nav aria-label="Breadcrumb" className="fs-14 mb-15px"><a href="/">Home</a>{" › "}<a href="/our-network.html">Our Network</a>{" › "}<a href="/outdoor-gym-equipment-manufacturer-supplier-india.html">Outdoor gym equipment across India</a>{" › "}<span>{p.spanText}</span></nav><h2 className="h4">{p.h2Text}</h2><p><a href="/outdoor-gym-equipment-manufacturer-supplier-india.html">See all cities we serve in Outdoor gym equipment across India</a>{" · "}<a href="/our-network.html">All states</a>{" · "}<a href="/contact-us.html">Get a quote</a></p></div></section>
  );
}
