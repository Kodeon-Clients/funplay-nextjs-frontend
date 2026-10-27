import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type ProductsProps = { h2Text: string; items: { divStyle: React.ComponentProps<"div">["style"]; h3Text: string; pText: string; divText: Rich }[] };

export default function Products(p: ProductsProps) {
  return (
    <section id="products" className="py-20 px-6 bg-[#e6f5fc]" style={{"backgroundImage": "url('/images/Group11.svg')"}}><div className="max-w-6xl mx-auto text-center"><h2 className="text-4xl font-normal mb-12 text-gray-900">{p.h2Text}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{p.items.map((px, i) => (<div key={i} className="product-card bg-white p-6 rounded-xl shadow-md"><div className="img-placeholder" style={px.divStyle}></div><h3 className="text-xl font-normal mt-4 text-gray-900">{px.h3Text}</h3><p className="text-gray-600 mb-4">{px.pText}</p><div className="flex gap-4 justify-center"><R v={px.divText} /></div></div>))}</div></div></section>
  );
}
