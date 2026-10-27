export type ThankYouContainerProps = { h1Text: string; pText: string; aText: string };

/** Section shared by 2 pages; its text is in content/shared-sections.json. */
export default function ThankYouContainer(p: ThankYouContainerProps) {
  return (
    <div className="thank-you-container"><div className="thank-you-message"><h1 className="thank-you-title">{p.h1Text}</h1><p className="thank-you-text">{p.pText}</p>{" "}<a className="thank-you-button" href="/">{p.aText}</a></div></div>
  );
}
