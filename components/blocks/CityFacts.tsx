type Fact = { label: string; value: string; href?: string };

/** "FunPlay in {City}" fact list from the programmatic city data. */
export default function CityFacts({ heading, facts }: { heading: string; facts: Fact[] }) {
  if (!facts?.length) return null;
  return (
    <section className="fp-city-facts pt-0">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <h2 className="alt-font fw-600 text-dark-gray fs-32 mb-20px">{heading}</h2>
            <dl className="row g-0 mb-0">
              {facts.map((f, i) => (
                <div className="col-12 border-bottom border-color-extra-medium-gray pt-15px pb-15px d-sm-flex" key={i}>
                  <dt className="fw-600 text-dark-gray col-sm-4 pe-20px">{f.label}</dt>
                  <dd className="col-sm-8 mb-0">{f.href ? <a href={f.href} className="text-dark-gray">{f.value}</a> : f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
