import type React from "react";
import Icon from "@/components/ui/Icon";

export type OurLocationsAcrossIndiaProps = { h2Text: string; pText: string; items: { aHref: React.ComponentProps<"a">["href"]; text: string }[] };

export default function OurLocationsAcrossIndia(p: OurLocationsAcrossIndiaProps) {
  return (
    <div className="container mt-4"><div className="row justify-content-center"><div className="col-12 text-center pb-10px"><h2 className="fw-500 text-base-color">{p.h2Text}</h2><p>{p.pText}</p></div></div><div className="row text-left">{p.items.map((px, i) => (<div key={i} className="col-lg-3 col-md-4 col-6 mb-2"><a className="btn btn-link fp-hover-brand" href={px.aHref} style={{"color": "#232323", "textDecoration": "none", "display": "block", "borderBottom": "0px", "textAlign": "left"}}><Icon className="bi bi-geo-alt-fill" style={{"color": "inherit"}} />{px.text}</a></div>))}</div></div>
  );
}
