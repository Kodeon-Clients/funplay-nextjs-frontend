import Img from "@/components/ui/Img";

export default function PageFooter() {
  return (
    <footer className="site-footer"><div className="footer-container"><div className="footer-column"><Img src="/images/logo-white.png" alt="FunPlay Systems logo (white)" className="footer-logo" width="216" height="92" />{" "}<p>{"© 2025 FunPlay Systems. "}<br />{" All rights reserved."}</p></div><div className="footer-column"><h4 className="footer-heading">Quick Links</h4><ul className="footer-links"><li><a href="#products">Products</a></li><li><a href="#why-us">Why Us</a></li><li><a href="#quote-form">Get Quote</a></li></ul></div><div className="footer-column"><h4 className="footer-heading">Contact</h4><p>📞 +91 902 830 2266</p><p>📧 sales@funplaysystems.com</p></div></div></footer>
  );
}
