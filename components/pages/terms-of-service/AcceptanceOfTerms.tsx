import R, { type Rich } from "@/components/ui/Rich";

export type AcceptanceOfTermsProps = { h2Text: string; pText: string; h3Text: string; pText2: string; h4Text: string; pText3: string; items: { h5Text: string; pText: Rich }[]; pText4: string };

export default function AcceptanceOfTerms(p: AcceptanceOfTermsProps) {
  return (
    <div className="container my-5"><div className="mb-4"><h2 className="h5 text-dark-gray fs-24 fw-600">{p.h2Text}</h2><p>{p.pText}</p></div><div className="mb-4"><h3 className="h5 text-dark-gray fs-24 fw-600">{p.h3Text}</h3><p>{p.pText2}</p></div><div className="mb-4"><h4 className="h5 text-dark-gray fs-24 fw-600">{p.h4Text}</h4><p>{p.pText3}</p></div>{p.items.map((it, i) => (<div key={i} className="mb-4"><h5 className="text-dark-gray fs-24 fw-600">{it.h5Text}</h5><p><R v={it.pText} /></p></div>))}<p>{p.pText4}</p></div>
  );
}
