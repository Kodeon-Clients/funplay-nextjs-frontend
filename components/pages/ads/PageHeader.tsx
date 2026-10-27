import Img from "@/components/ui/Img";

export default function PageHeader() {
  return (
    <header className="custom-header"><a href="/"><Img src="/images/logo-black.png" alt="FunPlay Systems logo" width="216" height="92" />{" "}</a>{" "}<div className="header-actions"><a href="/files/Funplay-Originals.pdf" download="" className="catalogue-button">Download Catalogue</a>{" "}<a href="tel:+919028302266"><button className="call-button">+91 902 830 2266</button>{" "}</a></div></header>
  );
}
