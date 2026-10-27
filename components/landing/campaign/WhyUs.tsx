import type React from "react";

export type WhyUsProps = { h2Text: string; items: { pClass: React.ComponentProps<"p">["className"]; pathD: React.ComponentProps<"path">["d"]; text: string }[] };

export default function WhyUs(p: WhyUsProps) {
  return (
    <section id="why-us" className="py-20 bg-white px-6"><div className="max-w-6xl mx-auto text-center"><h2 className="text-4xl font-normal mb-12 text-gray-900">{p.h2Text}</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">{p.items.map((px, i) => (<div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow fade-in"><p className={px.pClass}><svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#d74951"><path d={px.pathD}></path></svg>{px.text}</p></div>))}</div></div></section>
  );
}
