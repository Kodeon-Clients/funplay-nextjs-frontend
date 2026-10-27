import "../globals.css";
import Behaviors from "@/components/Behaviors";

/** Main site: theme CSS and the front-end behaviours (menu, popups, sliders, forms). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Behaviors />
    </>
  );
}
