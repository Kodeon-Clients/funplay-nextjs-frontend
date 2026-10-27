import Icon from "@/components/ui/Icon";

export type Section5Props = { pText: string };

export default function Section5(p: Section5Props) {
  return (
    <section className="page-title-big-typography bg-dark-gray ipad-top-space-margin xs-py-0 fl100vh" data-parallax-background-ratio="0.5" style={{"backgroundImage": "url('/images/Swing-mark.jpg')"}}><div className="opacity-light bg-dark-gray"></div><div className="container"><div className="row align-items-center justify-content-center small-screen"><div className="col-lg-6 col-md-8 position-relative text-center page-title-extra-small" data-anime={"{ \"el\": \"childs\", \"translateY\": [30, 1], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\":200, \"easing\": \"easeOutQuad\" }"}><div className="mb-5px alt-font text-white fw-400"><span className="opacity-10"></span></div><p className="h2 mb-0 text-white alt-font text-shadow-double-large fw-500">{p.pText}</p></div><div className="down-section text-center" data-anime={"{ \"translateY\": [100, 0], \"opacity\": [0,1], \"easing\": \"easeOutQuad\" }"}><a className="section-link" href="#down-section" aria-label="Scroll down"><div className="fs-30 sm-fs-32 text-white"><Icon className="bi bi-mouse" /></div></a></div></div></div></section>
  );
}
