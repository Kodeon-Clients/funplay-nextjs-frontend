import EnquiryForm from "./EnquiryForm";

/** Floating "Contact us" button and the enquiry popup opened by any `.popup-with-form` link. */
export default function ContactPopup({ title = "Contact Us" }: { title?: string }) {
  const isQuote = title !== "Contact Us";
  return (
    <div className="contactpopup">
      <a href="#contact-form" className="btn btn-base-color popup-with-form">CONTACT US</a>
      <div id="contact-form" className="container p-0 contact-form-style-01 position-relative text-center mfp-hide" role="dialog" aria-modal="true" aria-labelledby="contact-form-title">
        <div className="row g-0">
          <div className="col-lg-5 cover-background md-h-600px xs-h-400px" style={{ backgroundImage: "url('/images/popup-image.jpg')" }}></div>
          <div className="col-lg-7">
            <div className="p-5 lg-p-5 bg-white">
              <span className="fs-18 mb-5px">Ready to bring fun to your space?</span>
              <p id="contact-form-title" style={isQuote ? undefined : { fontSize: "2.813rem", lineHeight: "3.125rem" }} className={isQuote ? "h3 d-inline-block fw-600 text-dark-gray mb-5" : "fw-600 text-dark-gray mb-5"}>{title}</p>
              <EnquiryForm idPrefix="popup" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
