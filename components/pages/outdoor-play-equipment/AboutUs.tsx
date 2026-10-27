import Img from "@/components/ui/Img";

export type AboutUsProps = { h3Text: string; pText: string; aText: string };

export default function AboutUs(p: AboutUsProps) {
  return (
    <section className="background-position-center-top sm-background-image-none pb-5px pt-50px" id="about-us" style={{"backgroundImage": "url('/images/vertical-line-bg.svg')"}}><div className="container"><div className="row align-items-center justify-content-center mb-8 xs-mb-50px"><div className="col-md-6 position-relative" data-anime={"{ \"effect\": \"slide\", \"direction\": \"tb\", \"color\": \"#252840\", \"duration\": 1000, \"delay\": 0 }"}><Img alt="funplay" className="w-100 border-radius-5px" decoding="async" loading="lazy" src="/images/about_us.jpg" /></div><div className="col-md-6 text-center text-lg-start" data-anime={"{ \"el\": \"childs\", \"translateY\": [50, 0], \"opacity\": [0,1], \"duration\": 600, \"delay\": 0, \"staggervalue\": 300, \"easing\": \"easeOutQuad\" }"} style={{"padding": "30px"}}><h3 className="alt-font fw-600 text-dark-gray ls-minus-1px shadow-none" data-animation-delay="1500" data-shadow-animation="true">{p.h3Text}</h3><p className="mb-35px sm-mb-25px">{p.pText}</p>{" "}<a className="btn btn-base-color btn-large btn-rounded d-table d-lg-inline-block lg-mb-15px md-mx-auto popup-with-form" href="#contact-form">{p.aText}</a></div></div></div></section>
  );
}
