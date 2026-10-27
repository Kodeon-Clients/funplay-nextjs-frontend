export type ThankYouContainer2Props = { h1Text: string; pText: string; aText: string };

export default function ThankYouContainer2(p: ThankYouContainer2Props) {
  return (
    <div className="thank-you-container"><div className="thank-you-message"><h1 className="thank-you-title">{p.h1Text}</h1><p className="thank-you-text">{p.pText}</p>{" "}<a className="bg-[#D74951] px-6 py-3 rounded-full font-semibold text-white" href="/">{p.aText}</a></div></div>
  );
}
