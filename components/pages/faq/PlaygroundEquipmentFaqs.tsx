export type PlaygroundEquipmentFaqsProps = { h1Text: string };

export default function PlaygroundEquipmentFaqs(p: PlaygroundEquipmentFaqsProps) {
  return (
    <section className="page-title-center-alignment cover-background top-space-padding" style={{"backgroundImage": "url('/images/faq-image.jpg')"}}><div className="container"><div className="row"><div className="col-12 text-center position-relative page-title-extra-large"><h1 className="alt-font d-inline-block fw-600 text-white mb-10px mt-3 md-mt-50px">{p.h1Text}</h1></div></div></div></section>
  );
}
