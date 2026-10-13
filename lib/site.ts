/** Central business details and site-wide settings. Change values here, not in templates. */
export const SITE = {
  name: "FunPlay Systems",
  legalName: "Fun Play Systems Private Limited",
  url: "https://funplaysystems.com",
  foundingYear: 2002,
  gtmId: "GTM-NGVPJR8R",
  tagline: "Designer, Manufacturer & Supplier of Outdoor Play Equipment",
  email: { sales: "sales@funplaysystems.com", afterSales: "aftersales@funplaysystems.com", leads: "marketing@funplaysystems.com" },
  phone: {
    sales: { display: "+91 902 830 2266", tel: "+919028302266" },
    afterSales: { display: "+91 738 530 0921", tel: "+917385300921" },
  },
  address: {
    street: "Unit No. 5, S. Nanda Business Park, Survey No. 33/2, Opp. Anupam Stationery, Shiv Shankar Road, Sagpada, Devdhal, Kaman Bhiwandi Road",
    locality: "Vasai East",
    district: "Palghar",
    region: "Maharashtra",
    postalCode: "401208",
    country: "IN",
  },
  geo: { lat: 19.3719319, lng: 72.9066678 },
  hours: { days: "Monday to Saturday", opens: "09:00", closes: "18:30" },
  googleBusinessProfile:
    "https://www.google.com/maps/place/Fun+Play+Systems+Pvt+Ltd/@19.3719369,72.9040929,1084m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3be7a549da045c69:0x4a34161c050b4718!8m2!3d19.3719319!4d72.9066678!16s%2Fg%2F11lfchg1kl",
  social: {
    facebook: "https://www.facebook.com/Fun-Play-Systems-224395631674041/",
    linkedin: "https://www.linkedin.com/company/68143999",
    youtube: "https://www.youtube.com/channel/UCIVzspLQgAJe7OSeiQKlHcg",
    instagram: "https://www.instagram.com/funplayindia/?hl=en",
  },
} as const;

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

export const CUSTOMER_TYPES = [
  "Architect", "Builder", "Clubs and Resort", "Corporate", "Dealer", "Government", "Hotels", "Society", "School", "Others",
];

export const NAV = {
  products: [
    { href: "/corecraft.html", icon: "icon-feather-users", label: "CoreCraft", sub: "Strength Redefined" },
    { href: "/funplay-originals.html", icon: "icon-feather-send", label: "Funplay Originals", sub: "Joyful Active Play" },
    { href: "/nexlev-series.html", icon: "icon-feather-briefcase", label: "Nexlev Series", sub: "Advanced Play Solutions" },
  ],
  main: [
    { href: "/about-us.html", label: "About Us" },
    { href: "/Products.html", label: "Products", dropdown: true },
    { href: "/Projects.html", label: "Projects" },
    { href: "/clientele.html", label: "Clientele" },
    { href: "/careers.html", label: "Careers" },
    { href: "/contact-us.html", label: "Contact Us" },
  ],
  footerCompany: [
    { href: "/about-us.html", label: "About Us" },
    { href: "/Projects.html", label: "Projects" },
    { href: "/industry.html", label: "Industry" },
    { href: "/clientele.html", label: "Clientele" },
    { href: "/careers.html", label: "Careers" },
    { href: "/our-network.html", label: "Our Network" },
  ],
  footerCustomer: [
    { href: "/blog.html", label: "Blog" },
    { href: "/gallery.html", label: "Gallery" },
    { href: "/contact-us.html", label: "Contact us" },
    { href: "/faq.html", label: "FAQ's" },
  ],
};
