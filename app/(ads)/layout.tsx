import "./ads.css";
import Behaviors from "@/components/Behaviors";

/** The ads landing page (/ads.html): theme design with its own header, footer and stylesheet order. */
export default function AdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Behaviors />
    </>
  );
}
