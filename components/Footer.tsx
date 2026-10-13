import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-dark bg-black" style={{ paddingTop: 50, paddingBottom: 0 }}>
      <div className="container">
        <div className="row justify-content-center mb-5 md-mb-8 sm-mb-40px">
          <div className="col-6 col-lg-3 last-paragraph-no-margin order-sm-1 md-mb-40px xs-mb-30px">
            <a href="/" className="footer-logo mb-15px d-inline-block" aria-label="FunPlay Systems home">
              <img src="/images/logo-white.png" alt="FunPlay Systems logo" width={216} height={92} loading="lazy" style={{ width: 150, height: "auto", maxHeight: "none" }} />
            </a>
            <p className="w-90 lg-w-100">{SITE.tagline}</p>
            <div className="elements-social social-icon-style-02 mt-20px xs-mt-15px">
              <ul className="small-icon light">
                <li className="my-0"><a className="facebook" aria-label="Facebook" href={SITE.social.facebook} target="_blank" rel="noopener"><i className="fa-brands fa-facebook-f"></i></a></li>
                <li className="my-0"><a className="linkedin" aria-label="LinkedIn" href={SITE.social.linkedin} target="_blank" rel="noopener"><i className="fa-brands fa-linkedin"></i></a></li>
                <li className="my-0"><a className="youtube" aria-label="YouTube" href={SITE.social.youtube} target="_blank" rel="noopener"><i className="fa-brands fa-youtube"></i></a></li>
                <li className="my-0"><a className="instagram" aria-label="Instagram" href={SITE.social.instagram} target="_blank" rel="noopener"><i className="fa-brands fa-instagram"></i></a></li>
              </ul>
            </div>
          </div>
          <div className="col-6 col-lg-2 col-sm-4 xs-mb-30px order-sm-3 order-lg-2">
            <span className="fs-17 fw-500 d-block text-white mb-5px">Company</span>
            <ul>{NAV.footerCompany.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ul>
          </div>
          <div className="col-6 col-lg-2 col-sm-4 xs-mb-30px order-sm-4 order-lg-3">
            <span className="fs-17 fw-500 d-block text-white mb-5px">Customer</span>
            <ul>{NAV.footerCustomer.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ul>
          </div>
          <div className="col-6 col-lg-2 col-sm-4 xs-mb-30px order-sm-5 order-lg-4">
            <span className="fs-17 fw-500 d-block text-white mb-5px">Say hello</span>
            <span className="d-inline-flex w-100">Need support?</span>
            <a href={`mailto:${SITE.email.sales}`} className="text-white lh-22 d-inline-block mb-20px">{SITE.email.sales}</a>
            <span className="d-inline-flex w-100">Sales Support</span>
            <a href={`tel:${SITE.phone.sales.tel}`} className="text-white lh-22 d-inline-flex">{SITE.phone.sales.display}</a>
            <span className="d-inline-flex w-100">After Sales Support</span>
            <a href={`tel:${SITE.phone.afterSales.tel}`} className="text-white lh-22 d-inline-flex">{SITE.phone.afterSales.display}</a>
          </div>
          <div className="col-lg-3 col-sm-6 ps-30px sm-ps-15px md-mb-40px xs-mb-0 order-sm-2 order-lg-5">
            <span className="fs-17 fw-500 d-block text-white mb-5px">Subscribe our newsletter</span>
            <p className="mb-20px">Subscribe our newsletter to get the latest news and updates!</p>
            <div className="d-inline-block w-100 newsletter-style-02 position-relative mb-15px">
              <form action="/api/newsletter" method="post" className="position-relative w-100" data-fp-form="newsletter" noValidate>
                <label htmlFor="footer-newsletter-email" className="visually-hidden">Email address</label>
                <input id="footer-newsletter-email" className="input-small bg-transparent-white-light fs-14 border-color-transparent w-100 form-control pe-50px ps-20px lg-ps-15px required" type="email" name="email" placeholder="Enter your email" required maxLength={120} autoComplete="email" />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="fp-hp" aria-hidden="true" />
                <button className="btn pe-20px submit" aria-label="Subscribe" type="submit"><i className="icon bi bi-envelope icon-small text-dark-gray"></i></button>
                <div className="form-results border-radius-4px pt-5px pb-5px ps-15px pe-15px fs-14 lh-22 mt-10px w-100 text-center position-absolute d-none" role="status" aria-live="polite"></div>
              </form>
            </div>
          </div>
        </div>
        <div className="border-top border-color-transparent-white-light pt-35px pb-35px text-center">
          <span className="fs-13 w-60 lg-w-70 md-w-100 d-block mx-auto lh-22">
            This site is protected by reCAPTCHA and our <a href="/privacy-policy.html" className="text-white text-decoration-line-bottom">privacy policy</a> and{" "}
            <a href="/terms-of-service.html" className="text-white text-decoration-line-bottom">terms of service</a> apply. You must not use this website if you disagree with any of these website standard terms and conditions.
            <br />
            Copyright {year} © Fun Play Systems Pvt. Ltd.
          </span>
        </div>
      </div>
    </footer>
  );
}
