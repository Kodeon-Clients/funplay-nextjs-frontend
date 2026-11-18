import type React from "react";
import Img from "@/components/ui/Img";
import { STATES } from "@/lib/site";
import { PlIcon, Sun, Wave, WhatsAppIcon } from "./icons";

/*
  Paid-ads landing page for playground buyers: one component, two audiences (builders & housing
  societies, schools). All copy and data come from content/pages/<page>.json, so the content sheet
  can edit it. Styles: /css/pages/play-lp.css. Behaviour (forms, catalogue code, tabs, video,
  lightbox): /js/play-lp.js. Nothing here runs in the browser.
*/

type Link = { label: string; href: string };
type Badge = { src: string; title: string; sub: string };
type Stat = { value: string; label: string; icon: string; color: string };
type Logo = { src: string; alt: string };
type Moment = { image: string; alt: string; position: string; color: string; word: string; text: string };
type WhyItem = { icon: string; bg: string; title: string; text: string };
type Product = { image: string; name: string; series: string; activities: string; facts: string[] };
type Range = { id: string; name: string; tint: string; blurb: string; items: Product[] };
type Photo = { src: string; alt: string; caption: string; w: number; h: number; width: number };
type Step = { color: string; title: string; text: string };
type Quote = { quote: string; name: string; org: string; color: string };
export type PlayFooter = { company: string; address: string; phone: Link; email: string; hours: string };

export type PlayLandingProps = {
  audience: "builders" | "schools";
  phone: Link;
  whatsapp: Link;
  badges: { reddot: Badge; trust: Badge };
  hero: { eyebrow: string; h1: string; sub: string; image: string; imageAlt: string; imagePosition: string; video?: string; bubbleImage: string; bubbleAlt: string; bubbleText: string };
  form: {
    title: string; sub: string; orgField: "companyname" | "institutionname"; orgLabel: string; orgPlaceholder: string;
    roleLabel: string; roles: string[]; messagePlaceholder: string; button: string; note: string; source: string; redirect: string;
  };
  catalogue: { title: string; sub: string; customerTypes: string[]; customerTypeDefault?: string; customerTypeLabel: string; thankYou: string; button: string };
  stats: Stat[];
  clients: { title: string; sub: string; logos: Logo[]; namesLead: string; names: string };
  moments: { eyebrow: string; title: string; sub: string; items: Moment[] };
  why: { eyebrow: string; title: string; items: WhyItem[] };
  ranges: { eyebrow: string; title: string; tabs: Range[]; moreTitle: string };
  video: { eyebrow: string; title: string; sub: string; src: string; poster: string; caption: string };
  gallery: { eyebrow: string; title: string; sub: string; rows: Photo[][] };
  steps: { eyebrow: string; title: string; items: Step[] };
  testimonials: { eyebrow: string; title: string; items: Quote[] };
  clientList: { eyebrow: string; title: string; items: string[] } | null;
  cta: { title: string; sub: string };
  footer: PlayFooter;
};

const DOTS = ["#ffc23d", "#3b9be0", "#2fa36b", "#ff8a3d", "#d74951"];

export function PlayHeader({ phone, landing }: { phone: Link; landing?: string }) {
  return (
    <header className="pl-header">
      <div className="pl-wrap pl-header-in">
        <a href={landing || "#top"} aria-label="FunPlay Systems">
          <img src="/images/logo-black.png" alt="FunPlay Systems" width={216} height={92} className="pl-logo" />
        </a>
        <div className="pl-header-actions">
          <a href={phone.href} className="pl-header-phone pl-hide-m">
            <PlIcon name="phone" size={18} color="#d74951" /> {phone.label}
          </a>
          {landing ? null : (
            <a href="#catalogue" data-pl-catalogue="" className="pl-btn pl-btn-sm">Get the Catalogue</a>
          )}
        </div>
      </div>
    </header>
  );
}

export function PlayFooterBlock({ f }: { f: PlayFooter }) {
  return (
    <footer className="pl-footer">
      <div className="pl-wrap pl-footer-in">
        <div className="pl-footer-addr">
          <strong>{f.company}</strong>
          <br />
          {f.address}
        </div>
        <div>
          <a href={f.phone.href}>{f.phone.label}</a>
          <br />
          <a href={`mailto:${f.email}`}>{f.email}</a>
          <br />
          {f.hours}
        </div>
      </div>
    </footer>
  );
}

function Badges({ b, small }: { b: PlayLandingProps["badges"]; small?: boolean }) {
  if (small) {
    return (
      <div className="pl-badges-mini">
        <img src={b.reddot.src} alt={`${b.reddot.title} ${b.reddot.sub}`} height={30} />
        <img src={b.trust.src} alt={`${b.trust.title} ${b.trust.sub}`} height={30} />
        <span>Award-winning design · Verified supplier</span>
      </div>
    );
  }
  return (
    <div className="pl-badges">
      {[b.reddot, b.trust].map((x) => (
        <div className="pl-badge" key={x.title}>
          <img src={x.src} alt={x.title} height={42} />
          <div>
            <strong>{x.title}</strong>
            <br />
            {x.sub}
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ id, label, children, optional }: { id: string; label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="pl-field">
      <label htmlFor={id}>
        {label} {optional ? <span className="pl-opt">(optional)</span> : <span className="pl-req">*</span>}
      </label>
      {children}
    </div>
  );
}

function StateSelect({ id }: { id: string }) {
  return (
    <select id={id} name="state" required defaultValue="">
      <option value="" disabled>Select state</option>
      {STATES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function EnquiryForm({ p }: { p: PlayLandingProps }) {
  const f = p.form;
  return (
    <div id="enquiry" className="pl-form-wrap">
      <div className="pl-form-card">
        <form id="pl-enquiry" data-pl-enquiry="" action="/api/contact" method="post" noValidate>
          <div className="pl-form-head">
            <h2 className="pl-q">{f.title}</h2>
            <p>{f.sub}</p>
          </div>
          <input type="hidden" name="source" value={f.source} />
          <input type="hidden" name="redirect" value={f.redirect} />
          <div className="fp-hp" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" />
          </div>
          <div className="pl-grid2">
            <Field id="en-name" label="Full name">
              <input id="en-name" name="name" type="text" autoComplete="name" placeholder="Your name" required minLength={2} maxLength={80} />
            </Field>
            <Field id="en-org" label={f.orgLabel}>
              <input id="en-org" name={f.orgField} type="text" autoComplete="organization" placeholder={f.orgPlaceholder} required maxLength={120} />
            </Field>
            <Field id="en-phone" label="Mobile number">
              <div className="pl-tel">
                <span>+91</span>
                <input id="en-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" required data-pl-digits="" maxLength={10} />
              </div>
            </Field>
            <Field id="en-email" label="Email">
              <input id="en-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required maxLength={120} />
            </Field>
            <Field id="en-city" label="City">
              <input id="en-city" name="location" type="text" autoComplete="address-level2" placeholder="e.g. Thane" required minLength={2} maxLength={80} />
            </Field>
            <Field id="en-state" label="State">
              <StateSelect id="en-state" />
            </Field>
            <Field id="en-role" label={f.roleLabel}>
              <select id="en-role" name="typeOfProject" required defaultValue="">
                <option value="" disabled>Select</option>
                {f.roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field id="en-msg" label="About your space" optional>
              <input id="en-msg" name="comment" type="text" placeholder={f.messagePlaceholder} maxLength={300} />
            </Field>
          </div>
          <p className="pl-form-error" role="alert" aria-live="polite" data-pl-error=""></p>
          <button type="submit" className="pl-btn pl-btn-block">
            {f.button} <PlIcon name="arrow" size={20} color="#ffffff" />
          </button>
          <p className="pl-form-note">
            <PlIcon name="check" size={16} color="#2fa36b" width={3} /> {f.note}
          </p>
        </form>
      </div>
      <Badges b={p.badges} small />
    </div>
  );
}

function CatalogueDialog({ p }: { p: PlayLandingProps }) {
  const c = p.catalogue;
  return (
    <dialog id="pl-catalogue" className="pl-dialog" aria-labelledby="pl-cat-title" data-thank-you={c.thankYou} data-audience={p.audience}>
      <div className="pl-dialog-card">
        <button type="button" className="pl-dialog-close" data-pl-close="" aria-label="Close">
          <PlIcon name="close" size={22} />
        </button>
        <div className="pl-dialog-head">
          <span className="pl-dialog-icon"><PlIcon name="download" size={26} color="#b8333c" /></span>
          <h2 id="pl-cat-title" className="pl-q">{c.title}</h2>
          <p data-pl-cat-intro="">{c.sub}</p>
        </div>
        <form data-pl-cat-request="" action="/api/download" method="post" noValidate>
          <input type="hidden" name="step" value="request" />
          <div className="fp-hp" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-label="Leave this field empty" />
          </div>
          <div className="pl-grid2">
            <Field id="cat-name" label="Full name">
              <input id="cat-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={80} />
            </Field>
            <Field id="cat-email" label="Email (we send the code here)">
              <input id="cat-email" name="email" type="email" autoComplete="email" required maxLength={120} />
            </Field>
            <Field id="cat-phone" label="Mobile number">
              <div className="pl-tel">
                <span>+91</span>
                <input id="cat-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required data-pl-digits="" maxLength={10} />
              </div>
            </Field>
            <Field id="cat-city" label="City">
              <input id="cat-city" name="location" type="text" autoComplete="address-level2" required minLength={2} maxLength={80} />
            </Field>
            <Field id="cat-state" label="State">
              <StateSelect id="cat-state" />
            </Field>
            <Field id="cat-type" label={c.customerTypeLabel}>
              <select id="cat-type" name="customerType" required defaultValue={c.customerTypeDefault || ""}>
                <option value="" disabled>Select</option>
                {c.customerTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <input type="hidden" name="comment" value={`Catalogue request from the ${p.audience} landing page`} />
          <p className="pl-form-error" role="alert" aria-live="polite" data-pl-error=""></p>
          <button type="submit" className="pl-btn pl-btn-block">
            <PlIcon name="mail" size={20} color="#ffffff" /> {c.button}
          </button>
        </form>
        <form data-pl-cat-verify="" action="/api/download" method="post" noValidate hidden>
          <input type="hidden" name="step" value="verify" />
          <p className="pl-code-sent" data-pl-code-msg=""></p>
          <div className="pl-field">
            <label htmlFor="cat-code">6-digit code</label>
            <input id="cat-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required data-pl-digits="" className="pl-code" />
          </div>
          <p className="pl-form-error" role="alert" aria-live="polite" data-pl-error=""></p>
          <button type="submit" className="pl-btn pl-btn-block">
            <PlIcon name="check" size={20} color="#ffffff" width={3} /> Verify &amp; download
          </button>
          <button type="button" className="pl-link-btn" data-pl-restart="">Use a different email or send a new code</button>
        </form>
      </div>
    </dialog>
  );
}

function Lightbox() {
  return (
    <dialog id="pl-lightbox" className="pl-lightbox" aria-label="Photo">
      <button type="button" className="pl-dialog-close pl-lightbox-close" data-pl-close="" aria-label="Close">
        <PlIcon name="close" size={24} color="#ffffff" />
      </button>
      <button type="button" className="pl-lb-nav pl-lb-prev" data-pl-lb="-1" aria-label="Previous photo">‹</button>
      <figure>
        <img alt="" data-pl-lb-img="" />
        <figcaption data-pl-lb-cap=""></figcaption>
      </figure>
      <button type="button" className="pl-lb-nav pl-lb-next" data-pl-lb="1" aria-label="Next photo">›</button>
    </dialog>
  );
}

function Marquee({ photos, reverse, height }: { photos: Photo[]; reverse?: boolean; height: number }) {
  // the list is rendered twice so the strip loops seamlessly; the copy is hidden from assistive tech
  const items = (copy: boolean) =>
    photos.map((ph, i) => (
      <li key={`${copy ? "c" : "o"}${i}`} aria-hidden={copy || undefined}>
        <button type="button" className="pl-tile" style={{ width: ph.width, height }} data-pl-zoom={ph.src} data-caption={ph.caption} tabIndex={copy ? -1 : 0} aria-label={`Open photo: ${ph.caption}`}>
          <Img src={ph.src} alt={copy ? "" : ph.alt} width={ph.w} height={ph.h} loading="lazy" sizes={`${ph.width}px`} />
          <span className="pl-tile-cap">{ph.caption}</span>
        </button>
      </li>
    ));
  return (
    <div className="pl-lane">
      <ul className={`pl-marq${reverse ? " pl-rev" : ""}`}>
        {items(false)}
        {items(true)}
      </ul>
    </div>
  );
}

export default function PlayLanding(p: PlayLandingProps) {
  const isSchools = p.audience === "schools";
  return (
    <div id="top" className={`pl-page pl-${p.audience}`}>
      <PlayHeader phone={p.phone} />

      <main>
        {/* HERO */}
        <section className="pl-hero">
          <img className="pl-hero-bg" src={p.hero.image} alt="" style={{ objectPosition: p.hero.imagePosition }} fetchPriority="high" />
          {p.hero.video ? (
            <video className="pl-hero-bg" data-pl-hero-video="" autoPlay muted loop playsInline preload="metadata" poster={p.hero.image} style={{ objectPosition: p.hero.imagePosition }} aria-hidden="true">
              <source src={p.hero.video} type="video/mp4" />
            </video>
          ) : null}
          <div className="pl-hero-shade" />
          <Sun className="pl-sun pl-spin" />
          <div className="pl-wrap pl-hero-grid">
            <div className="pl-hero-copy">
              <span className="pl-eyebrow-chip">{p.hero.eyebrow}</span>
              <h1 className="pl-q pl-h1">{p.hero.h1}</h1>
              <p className="pl-hero-sub">{p.hero.sub}</p>
              <Badges b={p.badges} />
              <div className="pl-bubble pl-hide-m">
                <div className="pl-bubble-img pl-bob">
                  <img src={p.hero.bubbleImage} alt={p.hero.bubbleAlt} width={132} height={132} />
                </div>
                <div className="pl-bubble-text pl-q">{p.hero.bubbleText}</div>
              </div>
            </div>
            <EnquiryForm p={p} />
          </div>
        </section>

        {/* STATS */}
        <section className="pl-stats" aria-label="FunPlay at a glance">
          <div className="pl-wrap">
            <ul className="pl-stats-card">
              {p.stats.map((s) => (
                <li key={s.label}>
                  <span className="pl-stat-icon" style={{ background: `${s.color}1a` }}>
                    <PlIcon name={s.icon} color={s.color} />
                  </span>
                  <span>
                    <strong className="pl-q">{s.value}</strong>
                    <span>{s.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CLIENTS */}
        <section className="pl-clients" aria-labelledby="pl-clients-h">
          <div className="pl-wrap pl-split-head">
            <h2 id="pl-clients-h" className="pl-q">{p.clients.title}</h2>
            <p>{p.clients.sub}</p>
          </div>
          <div className="pl-lane pl-lane-fade">
            <ul className="pl-logos">
              {[false, true].map((copy) =>
                p.clients.logos.map((l, i) => (
                  <li key={`${copy ? "c" : "o"}${i}`} aria-hidden={copy || undefined}>
                    <img src={l.src} alt={copy ? "" : l.alt} width={160} height={80} loading="lazy" />
                  </li>
                )),
              )}
            </ul>
          </div>
          <div className="pl-wrap">
            <p className="pl-names">
              <strong>{p.clients.namesLead}</strong> {p.clients.names}
            </p>
          </div>
        </section>

        {/* MOMENTS */}
        <section className="pl-moments" aria-labelledby="pl-moments-h">
          <svg aria-hidden="true" className="pl-swing-path pl-hide-m" width="420" height="140" viewBox="0 0 420 140">
            <path d="M10 120 Q210 -60 410 120" stroke="#ffc23d" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" fill="none" />
            <circle cx="210" cy="32" r="10" fill="#d74951" />
          </svg>
          <div className="pl-wrap">
            <div className="pl-sec-head">
              <span className="pl-eyebrow">{p.moments.eyebrow}</span>
              <h2 id="pl-moments-h" className="pl-q pl-h2 pl-h2-lg">{p.moments.title}</h2>
              <p>{p.moments.sub}</p>
            </div>
            <ul className="pl-grid4">
              {p.moments.items.map((m) => (
                <li key={m.word} className="pl-moment pl-card">
                  <div className="pl-moment-img">
                    <Img src={m.image} alt={m.alt} loading="lazy" style={{ objectPosition: m.position }} sizes="(max-width: 960px) 50vw, 300px" />
                    <span className="pl-q pl-moment-word" style={{ background: m.color }}>{m.word}</span>
                  </div>
                  <p>{m.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* WHY */}
        <section className="pl-why" aria-labelledby="pl-why-h">
          <Wave className="pl-wave" />
          <div className="pl-wrap">
            <div className="pl-sec-head">
              <span className="pl-eyebrow">{p.why.eyebrow}</span>
              <h2 id="pl-why-h" className="pl-q pl-h2">{p.why.title}</h2>
            </div>
            <ul className="pl-grid3">
              {p.why.items.map((w) => (
                <li key={w.title} className="pl-card pl-why-card">
                  <span className="pl-why-icon" style={{ background: w.bg }}>
                    <PlIcon name={w.icon} size={26} color="#1d2433" />
                  </span>
                  <h3 className="pl-q">{w.title}</h3>
                  <p>{w.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* RANGES */}
        <section className="pl-ranges" aria-labelledby="pl-ranges-h" data-pl-tabs="">
          <div className="pl-wrap">
            <div className="pl-split-head pl-ranges-head">
              <div>
                <span className="pl-eyebrow">{p.ranges.eyebrow}</span>
                <h2 id="pl-ranges-h" className="pl-q pl-h2">{p.ranges.title}</h2>
              </div>
              <div role="tablist" aria-label="Product ranges" className="pl-tabs">
                {p.ranges.tabs.map((t, i) => (
                  <button key={t.id} type="button" role="tab" id={`pl-tab-${t.id}`} aria-controls={`pl-panel-${t.id}`} aria-selected={i === 0} tabIndex={i === 0 ? 0 : -1} className="pl-q" data-pl-tab={t.id}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            {p.ranges.tabs.map((t, i) => (
              <div key={t.id} role="tabpanel" id={`pl-panel-${t.id}`} aria-labelledby={`pl-tab-${t.id}`} hidden={i !== 0} data-pl-panel={t.id}>
                <p className="pl-range-blurb">{t.blurb}</p>
                <ul className="pl-grid3">
                  {t.items.map((it) => (
                    <li key={it.name}>
                      <a href="#catalogue" data-pl-catalogue="" className="pl-card pl-product">
                        <span className="pl-product-img">
                          <Img src={it.image} alt={`${it.name} play structure, ${t.name}`} loading="lazy" sizes="(max-width: 960px) 100vw, 380px" />
                        </span>
                        <span className="pl-product-body">
                          <span className="pl-product-top">
                            <span className="pl-q pl-product-name">{it.name}</span>
                            <span className="pl-pill" style={{ background: t.tint }}>{it.series}</span>
                          </span>
                          <span className="pl-product-acts">{it.activities}</span>
                          <span className="pl-facts">
                            {it.facts.map((f) => (
                              <span key={f}>{f}</span>
                            ))}
                          </span>
                          <span className="pl-product-more">Full specs in the catalogue →</span>
                        </span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#catalogue" data-pl-catalogue="" className="pl-card pl-more-card">
                      <span className="pl-q">{p.ranges.moreTitle}</span>
                      <span className="pl-more-btn">Get the Catalogue</span>
                    </a>
                  </li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* VIDEO */}
        <section className="pl-video-sec" aria-labelledby="pl-video-h">
          <div className="pl-wrap">
            <div className="pl-split-head">
              <div>
                <span className="pl-eyebrow">{p.video.eyebrow}</span>
                <h2 id="pl-video-h" className="pl-q pl-h2">{p.video.title}</h2>
              </div>
              <p>{p.video.sub}</p>
            </div>
            <div className="pl-player" data-pl-player="">
              <video muted playsInline preload="none" poster={p.video.poster} data-pl-video="" aria-label={p.video.caption}>
                <source src={p.video.src} type="video/mp4" />
              </video>
              <div className="pl-player-shade" />
              <button type="button" className="pl-sound" data-pl-v="mute" aria-pressed="false">
                <span data-pl-sound-label="">Tap for sound</span>
              </button>
              <div className="pl-player-ui">
                <input type="range" min={0} max={1000} defaultValue={0} step={1} aria-label="Seek" data-pl-v="seek" className="pl-seek" />
                <div className="pl-player-row">
                  <button type="button" className="pl-pbtn pl-pbtn-main" data-pl-v="play" aria-label="Play">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" data-pl-icon="play"><path d="M7 4v16l13-8z" /></svg>
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" data-pl-icon="pause" style={{ display: "none" }}><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  </button>
                  <button type="button" className="pl-pbtn" data-pl-v="back" aria-label="Back 10 seconds">−10</button>
                  <button type="button" className="pl-pbtn" data-pl-v="fwd" aria-label="Forward 10 seconds">+10</button>
                  <span className="pl-time" data-pl-time="">0:00</span>
                  <span className="pl-grow" />
                  <button type="button" className="pl-pbtn" data-pl-v="fs" aria-label="Full screen">
                    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="pl-center">
              <a href="#catalogue" data-pl-catalogue="" className="pl-btn">
                Get the Catalogue <PlIcon name="arrow" size={20} color="#ffffff" />
              </a>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="pl-gallery" aria-labelledby="pl-gallery-h">
          <Wave className="pl-wave" />
          <div className="pl-wrap pl-sec-head pl-center-text">
            <span className="pl-eyebrow">{p.gallery.eyebrow}</span>
            <h2 id="pl-gallery-h" className="pl-q pl-h2">{p.gallery.title}</h2>
            <p>{p.gallery.sub}</p>
          </div>
          <div className="pl-gallery-rows">
            {p.gallery.rows.map((r, i) => (
              <Marquee key={i} photos={r} reverse={i % 2 === 1} height={i % 2 === 1 ? 220 : 250} />
            ))}
          </div>
          <div className="pl-center">
            <a href="#enquiry" className="pl-btn">
              Want this at your site? Get a free quote <PlIcon name="arrow" size={20} color="#ffffff" />
            </a>
          </div>
        </section>

        {/* STEPS */}
        <section className="pl-steps" aria-labelledby="pl-steps-h">
          <div className="pl-wrap">
            <div className="pl-sec-head">
              <span className="pl-eyebrow">{p.steps.eyebrow}</span>
              <h2 id="pl-steps-h" className="pl-q pl-h2">{p.steps.title}</h2>
            </div>
            <div className="pl-steps-in">
              <svg aria-hidden="true" className="pl-steps-line pl-hide-m" width="100%" height="30" viewBox="0 0 1000 30" preserveAspectRatio="none">
                <path d="M40 15 C200 -5 300 35 500 15 S800 -5 960 15" stroke="#e3e6ec" strokeWidth="3" strokeDasharray="8 10" fill="none" />
              </svg>
              <ol className="pl-grid3">
                {p.steps.items.map((s, i) => (
                  <li key={s.title} className="pl-step">
                    <span className="pl-q pl-step-n" style={{ background: s.color }}>{i + 1}</span>
                    <h3 className="pl-q">{s.title}</h3>
                    <p>{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* PROOF */}
        {p.testimonials.items.length > 0 ? (
          <section className="pl-quotes" aria-labelledby="pl-quotes-h">
            <div className="pl-wrap">
              <div className="pl-sec-head">
                <span className="pl-eyebrow">{p.testimonials.eyebrow}</span>
                <h2 id="pl-quotes-h" className="pl-q pl-h2">{p.testimonials.title}</h2>
              </div>
              <ul className="pl-grid3">
                {p.testimonials.items.map((q) => (
                  <li key={q.name}>
                    <figure className="pl-card pl-quote">
                      <svg aria-hidden="true" width="40" height="32" viewBox="0 0 40 32"><path d="M0 32V18C0 8 6 2 16 0l2 4c-6 2-9 6-9 11h8v17zm22 0V18c0-10 6-16 16-18l2 4c-6 2-9 6-9 11h8v17z" fill={q.color} /></svg>
                      <blockquote>{q.quote}</blockquote>
                      <figcaption>
                        <strong>{q.name}</strong>
                        <br />
                        {q.org}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {p.clientList ? (
          <section className="pl-list-sec" aria-labelledby="pl-list-h">
            <div className="pl-wrap">
              <div className="pl-list-card">
                <span className="pl-eyebrow">{p.clientList.eyebrow}</span>
                <h2 id="pl-list-h" className="pl-q pl-h2">{p.clientList.title}</h2>
                <ul className="pl-chips">
                  {p.clientList.items.map((n, i) => (
                    <li key={n}>
                      <span style={{ background: DOTS[i % DOTS.length] }} />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {/* CLOSING CTA */}
        <section className="pl-cta-sec">
          <div className="pl-wrap">
            <div className={`pl-cta${isSchools ? " pl-cta-blue" : ""}`}>
              <Sun className="pl-cta-sun pl-spin" size={220} />
              <div className="pl-cta-copy">
                <h2 className="pl-q pl-h2">{p.cta.title}</h2>
                <p>{p.cta.sub}</p>
              </div>
              <div className="pl-cta-actions">
                <a href="#enquiry" className="pl-btn pl-btn-white">Get a free quote</a>
                <a href="#catalogue" data-pl-catalogue="" className="pl-btn pl-btn-ghost">
                  <PlIcon name="download" size={20} color="#ffffff" /> Download the catalogue
                </a>
                <a href={p.whatsapp.href} className="pl-cta-wa" target="_blank" rel="noopener" data-pl-wa="">
                  <WhatsAppIcon /> WhatsApp {p.whatsapp.label}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PlayFooterBlock f={p.footer} />

      <a href={p.whatsapp.href} className="pl-wa-float" target="_blank" rel="noopener" aria-label="Chat with FunPlay on WhatsApp" data-pl-wa="">
        <WhatsAppIcon size={28} />
      </a>

      <nav className="pl-mbar" aria-label="Quick actions">
        <a href={p.phone.href} className="pl-mbar-call">
          <PlIcon name="phone" size={18} color="#b8333c" /> Call
        </a>
        <a href={p.whatsapp.href} className="pl-mbar-wa" target="_blank" rel="noopener" data-pl-wa="">
          <WhatsAppIcon /> Chat
        </a>
        <a href="#enquiry" className="pl-mbar-quote">Free quote</a>
      </nav>

      <CatalogueDialog p={p} />
      <Lightbox />
    </div>
  );
}
