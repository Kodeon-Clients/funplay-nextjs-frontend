import Icon from "@/components/ui/Icon";

export type Section5Props = { pText: string; h1Text: string; h2Text: string; pText2: string; text: string };

export default function Section5(p: Section5Props) {
  return (
    <section className="cover-background full-screen ipad-top-space-margin md-h-550px" style={{"backgroundImage": "url('/images/404-bg1.jpg')"}}><div className="container h-100"><div className="row align-items-center justify-content-center h-100"><div className="col-12 col-xl-6 col-lg-7 col-md-9 text-center" data-anime={"{ \"el\": \"childs\", \"translateY\": [50, 0], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\": 300, \"easing\": \"easeOutQuad\" }"}><p className="h6 text-white fw-600 mb-5px text-uppercase">{p.pText}</p><h1 className="fs-200 sm-fs-170 text-white fw-700 ls-minus-8px">{p.h1Text}</h1><h2 className="h4 text-white fw-600 sm-fs-22 mb-10px ls-minus-1px">{p.h2Text}</h2><p className="mb-30px lh-28 sm-mb-30px w-55 md-w-80 sm-w-95 mx-auto text-white">{p.pText2}</p>{" "}<a className="btn btn-large left-icon btn-rounded btn-dark-gray btn-box-shadow text-transform-none mb-20px" href="/"><Icon className="fa-solid fa-arrow-left" />{p.text}</a></div></div></div></section>
  );
}
