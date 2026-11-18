"use client";

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CUSTOMER_TYPES, STATES } from "@/lib/site";
import { recaptchaToken } from "@/lib/behaviors";

/*
  Homepage catalogue popup (replaces js/popup-injector.js). Same markup classes and look as the
  original: it appears about a second after the page has loaded, at most once per browser
  session. Flow: details form -> /api/download validates, emails the lead and saves it to the CMS
  -> the browser downloads the catalogue and the popup closes.
*/

const SEEN_KEY = "fp_catalogue_popup_seen";
const SHOW_DELAY_MS = 1000;

type Msg = { text: string; tone: "ok" | "error" } | null;
type Errors = Partial<Record<string, string>>;
type ApiResult = { ok?: boolean; message?: string; download?: string };

const FALLBACK = "Something went wrong. Please try again, or call us.";

function seenThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked: the popup may show again on the next page load, which is acceptable */
  }
}

/** Saves the file instead of opening it (the URL is same-origin, so `download` is honoured). */
function startDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop() || "catalogue.pdf";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Mirrors the server rules in app/api/download/route.ts. */
function validate(fd: FormData): Errors {
  const v = (k: string) => String(fd.get(k) ?? "").trim();
  const e: Errors = {};
  if (v("name").length < 2) e.name = v("name") ? "Please enter your full name." : "Please enter your name.";
  if (!v("email")) e.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v("email"))) e.email = "Please enter a valid email address.";
  if (!/^\d{10}$/.test(v("phone").replace(/[\s-]/g, ""))) e.phone = "Please enter a valid 10 digit phone number.";
  if (v("location").length < 2) e.location = "Please enter your location.";
  if (!v("state")) e.state = "Please select your state.";
  if (!v("customerType")) e.customerType = "Please select your category.";
  if (v("comment").length < 2) e.comment = "Please enter your message.";
  return e;
}

async function post(fd: FormData): Promise<ApiResult & { status: number }> {
  const res = await fetch("/api/download", { method: "POST", body: fd, headers: { Accept: "application/json" }, credentials: "same-origin" });
  const data = (await res.json().catch(() => ({}))) as ApiResult;
  return { ...data, ok: res.ok && !!data.ok, status: res.status };
}

export default function DownloadPopup() {
  const uid = useId();
  const id = (n: string) => `dl${uid.replace(/:/g, "")}-${n}`;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);
  const [errors, setErrors] = useState<Errors>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // Show once per session, shortly after the page has finished loading.
  useEffect(() => {
    if (seenThisSession()) return;
    let timer: number | undefined;
    const show = () => {
      timer = window.setTimeout(() => {
        if (seenThisSession()) return;
        // don't steal the screen while another popup (contact form, search) is open
        if (document.querySelector(".mfp-wrap") || document.body.classList.contains("show-search-popup")) return;
        markSeen();
        lastFocus.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }, SHOW_DELAY_MS);
    };
    if (document.readyState === "complete") show();
    else window.addEventListener("load", show, { once: true });
    return () => {
      window.removeEventListener("load", show);
      window.clearTimeout(timer);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const el = lastFocus.current;
    if (el && typeof el.focus === "function" && document.contains(el)) el.focus();
  }, []);

  // While open: lock page scroll, Escape closes, Tab stays inside the dialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]):not([tabindex='-1']), select:not([disabled]), textarea:not([disabled])"),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // Focus the first field when the popup opens.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [open]);

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy || !formRef.current) return;
    const fd = new FormData(formRef.current);
    const errs = validate(fd);
    setErrors(errs);
    const firstBad = Object.keys(errs)[0];
    if (firstBad) {
      setMsg({ text: "Please fill all required fields.", tone: "error" });
      formRef.current.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      fd.set("page_url", window.location.href);
      const token = await recaptchaToken("download");
      if (token) fd.set("g-recaptcha-response", token);
      const r = await post(fd);
      if (r.ok && r.download) {
        startDownload(r.download);
        try {
          (window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: "catalogue_download" });
        } catch { }
        close();
      } else {
        setMsg({ text: r.message || FALLBACK, tone: "error" });
      }
    } catch {
      setMsg({ text: FALLBACK, tone: "error" });
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  const err = (n: string) =>
    errors[n] ? (
      <div id={id(`err-${n}`)} className="fp-field-error">
        {errors[n]}
      </div>
    ) : null;
  const a11y = (n: string) => ({
    id: id(n),
    "aria-invalid": errors[n] ? (true as const) : undefined,
    "aria-describedby": errors[n] ? id(`err-${n}`) : undefined,
  });

  return (
    <div
      className="download-form-container"
      id="popup"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "15px", overflowY: "auto" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="container p-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id("title")}
        aria-describedby={id("intro")}
        style={{ background: "#fff", textAlign: "center", position: "relative", maxHeight: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <button title="Close (Esc)" type="button" className="mfp-close" aria-label="Close catalogue download" onClick={close}>
          ×
        </button>
        {/* the content scrolls inside the popup on small screens; the close button stays in the corner */}
        <div style={{ display: "flex", flexWrap: "wrap", minHeight: 0, overflowY: "auto", overscrollBehavior: "contain" }}>
          <div
            className="col-lg-5 cover-background md-h-600px xs-h-400px"
            style={{ backgroundImage: "url('/images/Download-Form-Banner.png')", backgroundSize: "cover", backgroundPosition: "center", minHeight: "300px", flex: 1 }}
            aria-hidden="true"
          ></div>
          <div style={{ flex: 1 }} className="col-lg-7">
            <div className="p-5 bg-white">
              <span className="fs-18 mb-5px" id={id("intro")}>
                Ready to bring fun to your space?
              </span>
              <h3 className="fw-600 text-dark-gray mb-5" id={id("title")}>
                Download our 2025 Catalogue
              </h3>
              <form ref={formRef} action="/api/download" method="post" className="row contact-form-style-02" noValidate onSubmit={submitForm} aria-busy={busy || undefined}>
                <div className="fp-row-contents" style={{ display: "contents" }}>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("name")} className="visually-hidden">Your name</label>
                    <input {...a11y("name")} className="form-control required" type="text" name="name" placeholder="Your name*" required minLength={2} maxLength={80} autoComplete="name" />
                    {err("name")}
                  </div>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("email")} className="visually-hidden">Your email address</label>
                    <input {...a11y("email")} className="form-control required" type="email" name="email" placeholder="Your email address*" required maxLength={120} autoComplete="email" />
                    {err("email")}
                  </div>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("phone")} className="visually-hidden">Your phone number</label>
                    <input {...a11y("phone")} className="form-control required" type="tel" name="phone" placeholder="Your phone number*" pattern="^[0-9]{10}$" inputMode="numeric" maxLength={10} title="Please enter a valid 10 digit phone number only." required autoComplete="tel-national" />
                    {err("phone")}
                  </div>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("location")} className="visually-hidden">Your location</label>
                    <input {...a11y("location")} className="form-control required" type="text" name="location" placeholder="Your location*" required minLength={2} maxLength={80} autoComplete="address-level2" />
                    {err("location")}
                  </div>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("state")} className="visually-hidden">Your state</label>
                    <select {...a11y("state")} className="form-control required" name="state" required defaultValue="">
                      <option value="">Please select your state*</option>
                      {STATES.map((s) => (
                        <option value={s} key={s}>{s}</option>
                      ))}
                    </select>
                    {err("state")}
                  </div>
                  <div className="col-md-6 mb-15px">
                    <label htmlFor={id("customerType")} className="visually-hidden">Your category</label>
                    <select {...a11y("customerType")} className="form-control required" name="customerType" required defaultValue="">
                      <option value="">Select your category</option>
                      {CUSTOMER_TYPES.map((s) => (
                        <option value={s} key={s}>{s}</option>
                      ))}
                    </select>
                    {err("customerType")}
                  </div>
                  <div className="col-md-12 mb-15px">
                    <label htmlFor={id("comment")} className="visually-hidden">Your message</label>
                    <textarea {...a11y("comment")} className="form-control required" cols={40} rows={4} name="comment" placeholder="Your message*" maxLength={300} required></textarea>
                    {err("comment")}
                  </div>
                </div>

                <div className="col-md-12 mb-15px">
                  <span
                    id="error-msg"
                    role={msg?.tone === "error" ? "alert" : "status"}
                    aria-live="polite"
                    style={{ display: msg ? "block" : "none", textAlign: "left", color: msg?.tone === "ok" ? "green" : "#dc3545" }}
                  >
                    {msg?.text}
                  </span>
                </div>
                <div className="col-md-7">
                  <p className="fs-16 text-center text-md-start">We are committed to protecting your privacy. We will never collect information about you without your explicit consent.</p>
                </div>
                <div className="col-md-5 text-center text-md-end sm-mt-20px">
                  <div className="fp-hp" aria-hidden="true"><input type="text" name="website" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" /></div>
                  <button className="btn btn-dark" id="download-form-submit-button" type="submit" disabled={busy} aria-busy={busy || undefined}>
                    {busy ? "please wait..." : "download now"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}