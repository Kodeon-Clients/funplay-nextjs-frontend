import { PlainImg } from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type QuickLinksProps = { pText: string; h3Text: string; items: { liText: Rich }[]; h4Text: string; items2: { pText: string }[] };

export default function QuickLinks(p: QuickLinksProps) {
  return (
    <footer className="bg-black text-white py-12 px-6"><div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-sm"><div><PlainImg src="/images/logo-white.png" alt="FunPlay Systems logo (white)" className="h-10 mb-4" width="216" height="92" />{" "}<p>{p.pText}</p></div><div><h3 className="h4 font-semibold mb-4 text-lg">{p.h3Text}</h3><ul className="space-y-2">{p.items.map((px, i) => (<li key={i}><R v={px.liText} /></li>))}</ul></div><div><h4 className="font-semibold mb-4 text-lg">{p.h4Text}</h4>{p.items2.map((px, i) => (<p key={i} className="mb-2">{px.pText}</p>))}</div></div></footer>
  );
}
