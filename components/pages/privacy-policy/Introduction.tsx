import R, { type Rich } from "@/components/ui/Rich";

export type IntroductionProps = { h2Text: string; pText: string; h3Text: string; pText2: string; items: { liText: Rich }[]; h4Text: string; pText3: string; items2: { liText: string }[]; h5Text: string; pText4: string; items3: { liText: Rich }[]; items4: { h5Text: string; pText: Rich }[] };

export default function Introduction(p: IntroductionProps) {
  return (
    <div className="container my-5"><div className="mb-4"><h2 className="h5 text-dark-gray fs-24 fw-600">{p.h2Text}</h2><p>{p.pText}</p></div><div className="mb-4"><h3 className="h5 text-dark-gray fs-24 fw-600">{p.h3Text}</h3><p>{p.pText2}</p><ul>{p.items.map((px, i) => (<li key={i}><R v={px.liText} /></li>))}</ul></div><div className="mb-4"><h4 className="h5 text-dark-gray fs-24 fw-600">{p.h4Text}</h4><p>{p.pText3}</p><ul>{p.items2.map((px, i) => (<li key={i}>{px.liText}</li>))}</ul></div><div className="mb-4"><h5 className="text-dark-gray fs-24 fw-600">{p.h5Text}</h5><p>{p.pText4}</p><ul>{p.items3.map((px, i) => (<li key={i}><R v={px.liText} /></li>))}</ul></div>{p.items4.map((it, i) => (<div key={i} className="mb-4"><h5 className="text-dark-gray fs-24 fw-600">{it.h5Text}</h5><p><R v={it.pText} /></p></div>))}</div>
  );
}
