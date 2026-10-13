import { NAV } from "@/lib/site";

type Props = { variant?: "transparent" | "light" };

/** Site header. Markup and classes match the original theme so the existing CSS applies unchanged. */
export default function Header({ variant = "transparent" }: Props) {
  const navClass =
    variant === "light"
      ? "navbar navbar-expand-lg header-light bg-white disable-fixed header-demo"
      : "navbar navbar-expand-lg header-transparent bg-transparent header-reverse header-demo";
  return (
    <header>
      <nav className={navClass} data-header-hover="light">
        <div className="container-lg">
          <div className="col-auto me-auto ps-lg-0">
            <a className="navbar-brand" href="/" aria-label="FunPlay Systems home">
              {/* the white logo was invisible on the white header of product and blog pages; use the dark logo there */}
              <img src={variant === "light" ? "/images/logo-black.png" : "/images/logo-white.png"} alt="FunPlay Systems logo" className="default-logo" />
              <img src="/images/logo-black.png" alt="FunPlay Systems logo" className="alt-logo" />
              <img src="/images/logo-black.png" alt="FunPlay Systems logo" className="mobile-logo" />
            </a>
          </div>
          <div className="col-auto menu-order">
            <button className="navbar-toggler float-start collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-line"></span>
              <span className="navbar-toggler-line"></span>
              <span className="navbar-toggler-line"></span>
              <span className="navbar-toggler-line"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                {NAV.main.map((item) =>
                  item.dropdown ? (
                    <li className="nav-item dropdown dropdown-with-icon" key={item.href}>
                      <a href={item.href} className="nav-link">{item.label}</a>
                      <i className="fa-solid fa-angle-down dropdown-toggle" id="navbarDropdownMenuLink" role="button" tabIndex={0} aria-label="Show product ranges" data-bs-toggle="dropdown" aria-expanded="false"></i>
                      <ul className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                        {NAV.products.map((p) => (
                          <li key={p.href}>
                            <a href={p.href}>
                              <i className={`feather ${p.icon}`}></i>
                              <div className="submenu-icon-content">
                                <span>{p.label}</span>
                                <p>{p.sub}</p>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : (
                    <li className="nav-item dropdown submenu" key={item.href}>
                      <a href={item.href} className="nav-link">{item.label}</a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
          <div className="col-auto pe-lg-0">
            <div className="header-icon">
              <div className="header-search-icon icon">
                <a href="#" className="search-form-icon header-search-form" aria-label="Search"><i className="feather icon-feather-search"></i></a>
                <div className="search-form-wrapper">
                  <button title="Close" type="button" className="search-close alt-font" aria-label="Close search">×</button>
                  <form id="search-form" role="search" method="get" className="search-form text-left" action="/search-result.html">
                    <div className="search-form-box">
                      <p className="text-dark-gray text-center mb-7 fw-600" style={{ fontSize: "3.438rem" }}>What are you looking for?</p>
                      <label htmlFor="search-form-input" className="visually-hidden">Search products and pages</label>
                      <input className="search-input alt-font" id="search-form-input" placeholder="Enter your keywords..." name="s" defaultValue="" type="text" autoComplete="off" />
                      <div id="suggestions" className="suggestions-box"></div>
                      <button type="submit" className="search-button" aria-label="Search">
                        <i className="feather icon-feather-search" aria-hidden="true"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
