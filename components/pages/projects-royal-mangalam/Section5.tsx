import Img from "@/components/ui/Img";

export type Section5Props = { pText: string };

export default function Section5(p: Section5Props) {
  return (
    <section><div className="school-playground-wrapper"><div className="school-playground-header"><p className="heading-text-para text-dark-gray fw-700" style={{"fontSize": "2.375rem", "lineHeight": "2.7rem"}}>{p.pText}</p></div><div className="school-playground-grid" id="schoolPlayGroundSetup-grid"><div className="sps-products-solution-img"><Img alt="Royal Mangalam playground project, photo 1" className="grid-image" loading="lazy" src="/images/projects/royal-mangalam-mumbai/1.jpg" /></div><div className="sps-products-solution-img"><Img alt="Royal Mangalam playground project, photo 2" className="grid-image" loading="lazy" src="/images/projects/royal-mangalam-mumbai/2.jpg" /></div></div></div></section>
  );
}
