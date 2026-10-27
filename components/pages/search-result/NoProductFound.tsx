export type NoProductFoundProps = { h1Text: string; aText: string };

export default function NoProductFound(p: NoProductFoundProps) {
  return (
    <section className="pb-0 ipad-top-space-margin md-pt-0"><div className="container"><div className="row align-items-center justify-content-center"><div className="col-12 col-xl-12 col-lg-12 text-center position-relative page-title-double-large"><div className="d-flex flex-column justify-content-center extra-very-small-screen" style={{"minHeight": "400px"}}><h1 className="text-dark-gray alt-font ls-minus-1px fw-700 mb-0">{p.h1Text}</h1>{" "}<a className="btn btn-base-color btn-small d-table d-lg-inline-block lg-mb-15px md-mx-auto" href="/" style={{"width": "200px", "marginTop": "30px", "borderRadius": "50px", "alignItems": "center", "alignSelf": "center"}}>{p.aText}</a></div></div></div></div></section>
  );
}
