import { CUSTOMER_TYPES, STATES } from "@/lib/site";

type Props = { idPrefix: string; source?: string };

/**
 * Enquiry form used in the contact popup and on the contact page. The markup and classes
 * follow the original theme; submission and validation are handled in lib/behaviors.ts,
 * which posts to /api/contact.
 */
export default function EnquiryForm({ idPrefix, source = "contact-popup" }: Props) {
  const id = (n: string) => `${idPrefix}-${n}`;
  return (
    <form action="/api/contact" method="post" className="row contact-form-style-02" data-fp-form="contact" noValidate>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("name")} className="visually-hidden">Your name</label>
        <input id={id("name")} className="box-shadow-quadruple-large input-name form-control required" type="text" name="name" placeholder="Your name*" required minLength={2} maxLength={80} autoComplete="name" />
      </div>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("email")} className="visually-hidden">Your email address</label>
        <input id={id("email")} className="box-shadow-quadruple-large form-control required" type="email" name="email" placeholder="Your email address*" required maxLength={120} autoComplete="email" />
      </div>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("phone")} className="visually-hidden">Your phone number</label>
        <input id={id("phone")} className="box-shadow-quadruple-large form-control required" type="tel" name="phone" placeholder="Your phone number*" pattern="^[0-9]{10}$" inputMode="numeric" maxLength={10} title="Please enter a valid 10 digit phone number only." required autoComplete="tel-national" />
      </div>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("location")} className="visually-hidden">Your location</label>
        <input id={id("location")} className="box-shadow-quadruple-large form-control required" type="text" name="location" placeholder="Your location*" required minLength={2} maxLength={80} autoComplete="address-level2" />
      </div>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("state")} className="visually-hidden">Your state</label>
        <select id={id("state")} className="box-shadow-quadruple-large form-control required" name="state" required defaultValue="">
          <option value="">Please select your state*</option>
          {STATES.map((s) => <option value={s} key={s}>{s}</option>)}
        </select>
      </div>
      <div className="col-md-6 mb-15px">
        <label htmlFor={id("type")} className="visually-hidden">Your category</label>
        <select id={id("type")} className="box-shadow-quadruple-large form-control required" name="customerType" required defaultValue="">
          <option value="">Select your category</option>
          {CUSTOMER_TYPES.map((s) => <option value={s} key={s}>{s}</option>)}
        </select>
      </div>
      <div className="col-md-12 mb-30px">
        <label htmlFor={id("comment")} className="visually-hidden">Your message</label>
        <textarea id={id("comment")} className="box-shadow-quadruple-large form-control required comment-textarea" cols={40} rows={4} name="comment" placeholder="Your message*" maxLength={300} required minLength={5}></textarea>
        <div className="charCount" style={{ textAlign: "left" }} aria-live="polite">0 / 300</div>
      </div>
      <div className="col-md-7 last-paragraph-no-margin">
        <p className="text-center text-md-start fs-16">We are committed to protecting your privacy. We will never collect information about you without your explicit consent.</p>
      </div>
      <div className="col-md-5 text-center text-md-end sm-mt-20px">
        <input type="hidden" name="source" value={source} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="fp-hp" aria-hidden="true" />
        <button className="btn btn-medium btn-dark-gray btn-box-shadow btn-round-edge submit" type="submit">send message</button>
      </div>
      <div className="col-12">
        <div className="form-results mt-20px d-none" role="status" aria-live="polite"></div>
      </div>
    </form>
  );
}
