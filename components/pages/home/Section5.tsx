export type Section5Props = { pText: string };

export default function Section5(p: Section5Props) {
  return (
    <section className="big-section position-relative" style={{"backgroundImage": "url('/images/Vector.svg')", "backgroundPosition": "center center", "backgroundRepeat": "no-repeat", "backgroundSize": "contain"}}><div className="container position-relative"><div className="row justify-content-center" data-anime={"{ \"el\": \"childs\", \"translateY\": [30, 1], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\":200, \"easing\": \"easeOutQuad\" }"}><div className="col-12 col-xl-8 text-center mb-0"><p className="heading-text-para text-dark-gray fw-600 lh-38 ls-minus-0px mb-0px" style={{"fontSize": "2rem"}}>{p.pText}</p></div></div></div></section>
  );
}
