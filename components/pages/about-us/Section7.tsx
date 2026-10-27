import Img from "@/components/ui/Img";

export type Section7Props = { divText: string };

export default function Section7(p: Section7Props) {
  return (
    <section className="overflow-hidden position-relative p-0"><div className="container-fluid"><div className="row overlap-height"><div className="col-12 p-0 position-relative overlap-gap-section"><Img alt="FunPlay Systems team group photo with company banner, black and white" className="w-100" decoding="async" height="1058" loading="lazy" src="/images/teambg1.jpg" width="1920" />{" "}<div className="alt-font fw-600 fs-350 lg-fs-275 md-fs-250 xs-fs-160 ls-minus-5px xs-ls-minus-2px position-absolute right-minus-50px lg-right-minus-0px bottom-minus-80px md-bottom-minus-10px xs-bottom-minus-10px text-white text-outline text-outline-width-3px" data-bottom-top="transform: translate3d(80px, 0px, 0px);" data-top-bottom="transform: translate3d(-280px, 0px, 0px);">{p.divText}</div></div></div></div></section>
  );
}
