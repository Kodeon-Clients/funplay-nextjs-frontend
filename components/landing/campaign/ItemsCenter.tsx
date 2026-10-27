import { PlainImg } from "@/components/ui/Img";
import R, { type Rich } from "@/components/ui/Rich";

export type ItemsCenterProps = { divText: Rich };

export default function ItemsCenter(p: ItemsCenterProps) {
  return (
    <header className="bg-[#ffffff] text-black py-4 px-6 flex justify-between items-center shadow-lg sticky top-0 z-50"><a href="/"><PlainImg src="/images/logo-black.png" alt="FunPlay Systems logo" className="h-12 transition-transform hover:scale-105" width="216" height="92" style={{"height": "48px", "width": "auto"}} />{" "}</a>{" "}<div className="space-x-4 hidden md:flex items-center"><R v={p.divText} /></div></header>
  );
}
