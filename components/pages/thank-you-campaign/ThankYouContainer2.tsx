import Img from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type ThankYouContainer2Props = { h1Text: string; pText: Rich; spanText: string; aText: string };

export default function ThankYouContainer2(p: ThankYouContainer2Props) {
  return (
    <div className="thank-you-container"><div className="thank-you-message"><h1 className="thank-you-title">{p.h1Text}</h1><p className="thank-you-text"><R v={p.pText} /></p>{" "}<a href="https://wa.me/919028302266?text=I%20came%20across%20your%20ad%20on%20Google%20and%20wanted%20to%20know%20more%20about%20your%20products"><Img alt="Chat on WhatsApp" decoding="async" loading="lazy" src="/images/WhatsAppButtonGreenMedium.svg" />{" "}</a>{" "}<span>{p.spanText}</span>{" "}<a className="btn btn-very-small thank-you-button" href="/" style={{"borderRadius": "8px"}}>{p.aText}</a></div></div>
  );
}
