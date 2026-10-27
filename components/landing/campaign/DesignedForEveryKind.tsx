import type React from "react";
import { PlainImg } from "@/components/ui/Img";

export type DesignedForEveryKindProps = { h2Text: string; pText: string; items: { imgSrc: React.ComponentProps<typeof PlainImg>["src"]; imgAlt: React.ComponentProps<typeof PlainImg>["alt"]; imgWidth?: React.ComponentProps<typeof PlainImg>["width"]; imgHeight?: React.ComponentProps<typeof PlainImg>["height"]; h3Text: string; pText: string; aText: string }[] };

export default function DesignedForEveryKind(p: DesignedForEveryKindProps) {
  return (
    <section className="py-20 bg-white px-6"><div className="max-w-6xl mx-auto text-center"><h2 className="text-4xl font-bold text-gray-900 mb-4">{p.h2Text}</h2><p className="text-xl text-gray-600 mb-12">{p.pText}</p><div className="grid gap-8 md:grid-cols-3 text-left max-w-5xl mx-auto">{p.items.map((px, i) => (<div key={i} className="bg-[#e6f5fc] p-6 rounded-2xl shadow-sm hover:shadow-md transition"><PlainImg src={px.imgSrc} alt={px.imgAlt} className="w-full h-40 object-cover mb-4 rounded" width={px.imgWidth} height={px.imgHeight} loading="lazy" decoding="async" />{" "}<h3 className="text-xl font-semibold text-gray-800 mb-2">{px.h3Text}</h3><p className="text-gray-600">{px.pText}</p>{" "}<a href="#quote-form" className="text-blue-500 hover:text-blue-700 mt-4 block" style={{"textDecoration": "none", "fontWeight": "700"}}>{px.aText}</a></div>))}</div></div></section>
  );
}
