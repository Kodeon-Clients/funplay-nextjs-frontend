import type React from "react";

export type Section5Props = { items: { divClass: React.ComponentProps<"div">["className"]; h2Text: string; pText: string }[] };

export default function Section5(p: Section5Props) {
  return (
    <div className="row row-cols-1 row-cols-md-4 row-cols-sm-2 justify-content-center text-center pt-30px" data-anime={"{\"el\": \"childs\", \"opacity\": [0,1], \"translateX\": [50, 0], \"duration\": 800, \"delay\":300, \"staggervalue\": 300, \"easing\": \"easeOutQuad\" }"}>{p.items.map((it, i) => (<div key={i} className={it.divClass}><h2 className="alt-font fw-900 text-dark-gray m-0">{it.h2Text}</h2><p>{it.pText}</p></div>))}</div>
  );
}
