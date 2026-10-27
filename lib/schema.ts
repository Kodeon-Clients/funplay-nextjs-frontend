import { SITE } from "./site";
import type { PageMeta } from "./page";

/**
 * Structured data (schema.org JSON-LD) generated from each page's own data.
 * - Every page: Organization, LocalBusiness (factory) and WebSite, plus a WebPage node of the right kind.
 * - BreadcrumbList from the page's breadcrumb trail.
 * - Product (product pages), Service with areaServed (city pages), BlogPosting (blog posts),
 *   JobPosting (career pages), CollectionPage with ItemList (series), FAQPage where the page shows FAQs.
 * No ratings, reviews or offers: FunPlay does not publish prices or on-page reviews.
 */

/** [name, url] pairs and [question, answer] pairs are stored as two-item arrays in the page JSON. */
type Pair = (string | null)[];
export type SchemaData = {
  pageType?: string;
  breadcrumb?: Pair[];
  itemList?: Pair[];
  faq?: Pair[];
  product?: { name: string; sku?: string; images?: string[]; description?: string; category?: string; line?: string; series?: string; colours?: string[]; specs?: Pair[] };
  service?: { name: string; serviceType: string; areaServed: { city?: string; state?: string; country?: string; name?: string }; description?: string };
  article?: { headline: string; description?: string; image?: string; datePublished?: string; dateModified?: string; author?: string };
  job?: { title: string; description: string; employmentType?: string; email?: string; datePosted?: string };
  project?: { name: string; location?: string };
};

type Node = Record<string, unknown>;
const ORG = `${SITE.url}/#organization`;
const WEBSITE = `${SITE.url}/#website`;
const abs = (u?: string | null) => (!u ? undefined : u.startsWith("http") ? u : SITE.url + encodeURI(u));

const address = {
  "@type": "PostalAddress",
  streetAddress: `${SITE.address.street}, ${SITE.address.locality}`,
  addressLocality: SITE.address.locality,
  addressRegion: SITE.address.region,
  postalCode: SITE.address.postalCode,
  addressCountry: SITE.address.country,
};

/** Organization, factory and website: the same on every page. */
export function siteGraph(): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": ORG,
      name: SITE.name,
      legalName: SITE.legalName,
      alternateName: ["FunPlay", "Fun Play Systems"],
      url: `${SITE.url}/`,
      logo: { "@type": "ImageObject", url: `${SITE.url}/images/logo-black.png` },
      description:
        "FunPlay Systems designs, manufactures and installs outdoor playground equipment, outdoor gym equipment and garden furniture in India. In-house design, roto-moulding and fabrication at a 45,000 sq ft factory in Vasai, Maharashtra.",
      foundingDate: String(SITE.foundingYear),
      founder: { "@type": "Person", name: "Suraj Shetty", jobTitle: "Director" },
      numberOfEmployees: { "@type": "QuantitativeValue", minValue: 150 },
      award: "Red Dot Design Award 2024",
      address,
      email: SITE.email.sales,
      telephone: "+91-90283-02266",
      contactPoint: [
        { "@type": "ContactPoint", contactType: "sales", telephone: "+91-90283-02266", email: SITE.email.sales, areaServed: "IN", availableLanguage: ["en", "hi", "mr"] },
        { "@type": "ContactPoint", contactType: "customer support", name: "After Sales Support", telephone: "+91-73853-00921", email: SITE.email.afterSales, areaServed: "IN" },
      ],
      sameAs: [SITE.social.facebook, SITE.social.linkedin, SITE.social.youtube, "https://www.instagram.com/funplayindia/"],
      knowsAbout: ["Playground equipment", "Outdoor gym equipment", "Playground design", "Rotational moulding", "Playground safety surfacing"],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${SITE.url}/#factory`,
      name: "FunPlay Systems: Factory & Head Office",
      parentOrganization: { "@id": ORG },
      image: `${SITE.url}/images/logo-black.png`,
      url: `${SITE.url}/contact-us.html`,
      telephone: "+91-90283-02266",
      email: SITE.email.sales,
      address,
      geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
      hasMap: SITE.googleBusinessProfile,
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: SITE.hours.opens, closes: SITE.hours.closes },
      ],
      areaServed: { "@type": "Country", name: "India" },
    },
    { "@type": "WebSite", "@id": WEBSITE, url: `${SITE.url}/`, name: SITE.name, publisher: { "@id": ORG }, inLanguage: "en-IN" },
  ];
}

/** Page-level nodes for one page. */
export function pageGraph(page: PageMeta & { schema?: SchemaData }): Node[] {
  const s = page.schema ?? {};
  const url = page.seo.canonical || SITE.url + encodeURI(page.path);
  const id = (frag: string) => `${url}#${frag}`;
  const title = page.seo.title.split(" | ")[0];
  const out: Node[] = [];

  const webPage: Node = {
    "@type": s.pageType || (page.type === "series" ? "CollectionPage" : "WebPage"),
    "@id": id("webpage"),
    url,
    name: title,
    description: page.seo.description || undefined,
    isPartOf: { "@id": WEBSITE },
    inLanguage: "en-IN",
  };
  if (page.path === "/") webPage.about = { "@id": ORG };
  const crumbs = (s.breadcrumb ?? []).filter(([n]) => n);
  if (crumbs.length > 1) {
    webPage.breadcrumb = { "@id": id("breadcrumb") };
    out.push({
      "@type": "BreadcrumbList",
      "@id": id("breadcrumb"),
      itemListElement: crumbs.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, ...(item ? { item } : {}) })),
    });
  }
  if (s.itemList?.length) {
    webPage.mainEntity = {
      "@type": "ItemList",
      numberOfItems: s.itemList.length,
      itemListElement: s.itemList.map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, url: u, name })),
    };
  }
  out.unshift(webPage);

  if (s.product) {
    const p = s.product;
    webPage.mainEntity = { "@id": id("product") };
    out.push({
      "@type": "Product",
      "@id": id("product"),
      name: p.name,
      sku: p.sku || undefined,
      mpn: p.sku || undefined,
      url,
      image: (p.images ?? []).map(abs),
      description: p.description,
      brand: { "@type": "Brand", name: SITE.name },
      manufacturer: { "@id": ORG },
      category: p.category || undefined,
      color: p.colours?.length ? p.colours.join(", ") : undefined,
      countryOfOrigin: "IN",
      additionalProperty: p.specs?.length ? p.specs.map(([name, value]) => ({ "@type": "PropertyValue", name, value })) : undefined,
    });
  }
  if (s.service) {
    const v = s.service;
    const a = v.areaServed;
    const area = a.city
      ? { "@type": "City", name: a.city, ...(a.state ? { containedInPlace: { "@type": "State", name: a.state } } : {}) }
      : a.state
        ? { "@type": "State", name: a.state }
        : a.country
          ? { "@type": "Country", name: a.country }
          : { "@type": "Place", name: a.name };
    out.push({
      "@type": "Service",
      "@id": id("service"),
      name: v.name,
      serviceType: v.serviceType,
      provider: { "@id": ORG },
      areaServed: area,
      url,
      description: v.description,
    });
  }
  if (s.article) {
    const a = s.article;
    out.push({
      "@type": "BlogPosting",
      "@id": id("article"),
      headline: a.headline,
      description: a.description,
      image: abs(a.image),
      datePublished: a.datePublished,
      dateModified: a.dateModified || a.datePublished,
      author: { "@type": "Organization", name: a.author || SITE.name, url: `${SITE.url}/about-us.html` },
      publisher: { "@id": ORG },
      mainEntityOfPage: { "@id": id("webpage") },
      inLanguage: "en-IN",
    });
  }
  if (s.job) {
    const j = s.job;
    out.push({
      "@type": "JobPosting",
      "@id": id("job"),
      title: j.title,
      description: j.description,
      datePosted: j.datePosted,
      employmentType: j.employmentType,
      hiringOrganization: { "@id": ORG, "@type": "Organization", name: SITE.name, sameAs: `${SITE.url}/` },
      jobLocation: { "@type": "Place", address },
      directApply: true,
      url,
    });
  }
  if (s.project) {
    webPage.about = { "@type": "Place", name: s.project.name, ...(s.project.location ? { address: { "@type": "PostalAddress", addressRegion: s.project.location, addressCountry: "IN" } } : {}) };
  }
  if (s.faq?.length) {
    const questions = s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));
    if (webPage["@type"] === "FAQPage") webPage.mainEntity = questions; // the FAQ page itself
    else out.push({ "@type": "FAQPage", "@id": id("faq"), mainEntity: questions });
  }
  return out;
}

/** The complete JSON-LD document for a page. */
export function pageJsonLd(page: PageMeta & { schema?: SchemaData }) {
  return { "@context": "https://schema.org", "@graph": [...siteGraph(), ...pageGraph(page)] };
}
