import { PlIcon, Sun, WhatsAppIcon } from "./icons";
import { PlayFooterBlock, PlayHeader, type PlayFooter } from "./PlayLanding";

/*
  Thank-you pages of the play landing pages: one after the enquiry form, one after the verified
  catalogue download, for each audience. Separate URLs so Google Ads and GA4 can count each
  conversion on its own (page-view triggers in GTM). /js/play-lp.js pushes a dataLayer event on
  load and, on the catalogue page, starts the PDF download.
*/

type Link = { label: string; href: string };

export type PlayThankYouProps = {
  audience: "builders" | "schools";
  kind: "enquiry" | "catalogue";
  landing: string;
  phone: Link;
  whatsapp: Link;
  eyebrow: string;
  h1: string;
  sub: string;
  image: string;
  imageAlt: string;
  steps: { title: string; text: string }[];
  primary: Link;
  secondary: Link;
  download: string | null;
  footer: PlayFooter;
};

const COLORS = ["#ffe7a8", "#cfe8fb", "#d5f1e2"];

export default function PlayThankYou(p: PlayThankYouProps) {
  const isCatalogue = p.kind === "catalogue";
  return (
    <div className={`pl-page pl-${p.audience}`} data-pl-thanks={p.kind} data-audience={p.audience} data-download={p.download || undefined}>
      <PlayHeader phone={p.phone} landing={p.landing} />
      <main className="pl-ty">
        <div className="pl-ty-confetti" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <span key={i} style={{ left: `${(i * 7 + 3) % 100}%`, animationDelay: `${(i % 5) * 0.18}s`, background: ["#ffc23d", "#3b9be0", "#d74951", "#2fa36b", "#ff8a3d"][i % 5] }} />
          ))}
        </div>
        <div className="pl-wrap pl-ty-grid">
          <div className="pl-ty-copy">
            <span className="pl-ty-check">
              <PlIcon name="check" size={40} color="#2fa36b" width={3} />
            </span>
            <span className="pl-eyebrow">{p.eyebrow}</span>
            <h1 className="pl-q pl-h2 pl-h2-lg">{p.h1}</h1>
            <p className="pl-ty-sub">{p.sub}</p>
            <div className="pl-ty-actions">
              {isCatalogue ? (
                <a href={p.primary.href} className="pl-btn" download="" data-pl-download="">
                  <PlIcon name="download" size={20} color="#ffffff" /> {p.primary.label}
                </a>
              ) : (
                <a href={p.primary.href} className="pl-btn pl-btn-wa" target="_blank" rel="noopener" data-pl-wa="">
                  <WhatsAppIcon /> {p.primary.label}
                </a>
              )}
              <a href={p.secondary.href} className="pl-btn pl-btn-outline">
                {p.secondary.label} <PlIcon name="arrow" size={18} />
              </a>
            </div>
            <p className="pl-ty-contact">
              Prefer to talk now? Call <a href={p.phone.href}>{p.phone.label}</a>
              {isCatalogue ? (
                <>
                  {" "}or WhatsApp <a href={p.whatsapp.href} target="_blank" rel="noopener" data-pl-wa="">{p.whatsapp.label}</a>
                </>
              ) : null}
              .
            </p>
          </div>
          <div className="pl-ty-visual">
            <Sun className="pl-ty-sun pl-spin" size={120} />
            <img src={p.image} alt={p.imageAlt} width={560} height={420} />
          </div>
        </div>
        <section className="pl-wrap pl-ty-next" aria-labelledby="pl-ty-next-h">
          <h2 id="pl-ty-next-h" className="pl-q">What happens next</h2>
          <ol className="pl-grid3">
            {p.steps.map((s, i) => (
              <li key={s.title} className="pl-card pl-ty-step">
                <span className="pl-q pl-step-n" style={{ background: COLORS[i % COLORS.length] }}>{i + 1}</span>
                <h3 className="pl-q">{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <PlayFooterBlock f={p.footer} />
    </div>
  );
}
