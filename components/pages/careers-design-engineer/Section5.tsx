import type React from "react";
import R, { type Rich } from "@/components/ui/Rich";

export type Section5Props = {
  text: string;
  items: Record<string, never>[];
  text2: string;
  items2: Record<string, never>[];
  text3: string;
  items3: Record<string, never>[];
  bText: Rich;
  items4: { liText: string }[];
  bText2: Rich;
  items5: { liText: string }[];
  bText3: Rich;
  items6: { liText: string }[];
  text4: string;
  items7: Record<string, never>[];
  text5: string;
  bText4: Rich;
  items8: Record<string, never>[];
  text6: string;
  items9: {
    inputClass: React.ComponentProps<"input">["className"];
    inputName: React.ComponentProps<"input">["name"];
    inputPlaceholder: React.ComponentProps<"input">["placeholder"];
    inputType: React.ComponentProps<"input">["type"];
    inputAriaLabel: React.ComponentProps<"input">["aria-label"];
    inputPattern?: React.ComponentProps<"input">["pattern"];
    inputRequired?: React.ComponentProps<"input">["required"];
    inputTitle?: React.ComponentProps<"input">["title"];
  }[];
  labelText: string;
  pText: string;
};

export default function Section5(p: Section5Props) {
  return (
    <section>
      <div className="container" style={{ paddingTop: "32px" }}>
        <div className="career-inner-row row gap-5">
          <div className="col-lg-6">
            {p.text}
            {p.items.map((_, i) => (
              <br key={i} />
            ))}
            {p.text2}
            {p.items2.map((_, i) => (
              <br key={i} />
            ))}
            {p.text3}
            {p.items3.map((_, i) => (
              <br key={i} />
            ))}{" "}
            <b>
              <R v={p.bText} />
            </b>{" "}
            <ul>
              {p.items4.map((px, i) => (
                <li key={i}>{px.liText}</li>
              ))}
            </ul>{" "}
            <br />{" "}
            <b>
              <R v={p.bText2} />
            </b>{" "}
            <ul>
              {p.items5.map((px, i) => (
                <li key={i}>{px.liText}</li>
              ))}
            </ul>{" "}
            <br />{" "}
            <b>
              <R v={p.bText3} />
            </b>{" "}
            <ul>
              {p.items6.map((px, i) => (
                <li key={i}>{px.liText}</li>
              ))}
            </ul>{" "}
            <br />
            {p.text4}
            {p.items7.map((_, i) => (
              <br key={i} />
            ))}
            {p.text5}
            <b>
              <R v={p.bText4} />
            </b>{" "}
            {p.items8.map((_, i) => (
              <br key={i} />
            ))}
            {p.text6}
          </div>
          <div className="col-lg-5">
            <form
              action="/api/career"
              className="row contact-form-style-02"
              encType="multipart/form-data"
              id="careerForm"
              method="post"
              data-fp-form="career"
              noValidate
            >
              {p.items9.map((px, i) => (
                <div key={i} className="col-12 mb-15px">
                  <input
                    className={px.inputClass}
                    name={px.inputName}
                    placeholder={px.inputPlaceholder}
                    type={px.inputType}
                    aria-label={px.inputAriaLabel}
                    pattern={px.inputPattern}
                    required={px.inputRequired}
                    title={px.inputTitle}
                  />
                </div>
              ))}
              <div style={{ textAlign: "right" }}>
                <label
                  className="form-control box-shadow-quadruple-large career-cv-resume-label"
                  htmlFor="career-cv-resume-file"
                  id="career-cv-resume-label"
                >
                  {p.labelText}
                </label>{" "}
                <input
                  accept=".pdf,.doc,.docx"
                  id="career-cv-resume-file"
                  name="career-cv-resume-file"
                  required
                  type="file"
                />{" "}
                <small id="file-error" style={{ color: "red" }}></small>
              </div>
              <div className="col-12 last-paragraph-no-margin">
                <p className="text-center text-md-start fs-16">{p.pText}</p>
              </div>
              <div className="col-12 text-center text-md-end mt-20px">
                <input
                  name="redirect"
                  type="hidden"
                  value="https://funplaysystems.com/thank-you.html"
                />{" "}
                <input
                  name="title"
                  type="hidden"
                  value="Design Engineer (SolidWorks)"
                />{" "}
                <input
                  className="btn btn-medium btn-dark-gray btn-box-shadow btn-round-edge submit"
                  id="submitBtn"
                  type="submit"
                  value="send message"
                />
              </div>
              <div className="col-12">
                <div className="form-results mt-20px d-none"></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
