# Review list for FunPlay Systems

Things to confirm or decide before (or soon after) launch. Nothing here blocks the deploy.

## 1. Do first

- **Rotate the old credentials.** The PHP form handlers on the current server hold the live database
  password, Mailgun SMTP password, reCAPTCHA secret and Mailchimp API key. They were not copied into
  the new site. Change all four and use only the new values in Vercel.
- **Mailgun sending domain.** Forms send through the Mailgun HTTP API. The sending domain (for example
  `mg.funplaysystems.com`) must be verified in Mailgun and `MAIL_FROM` must use it.

## 2. Product facts to confirm

`docs/product-flags.csv` lists 510 points across 226 product pages where the website, the Originals
catalogue and the photos disagree, or a value looks like a placeholder. The product copy was written
to avoid stating anything doubtful. The main patterns:

- Capacity of 15 repeated across many CoreCraft units, including small single towers. Looks like a default value.
- Height or age group listed as "NA".
- Spelling errors in product and colour names in the source (corrected on the page, listed for the record).
- Image descriptions that are identical or generic, and photos that do not match the name.
- **Ulta Ghar** and **Hittu**: product area on the website differs from the catalogue. The website value was kept.
- **Crestro**: image and category look wrong (a see-saw in the Pinnacle tower series). Current image kept.
- **Dumbo Rider**: "image coming soon" placeholder. Current image kept.

## 3. Images

- Missing images were replaced with the closest real FunPlay photo:
  `playground-comparison.jpg` > `g2.jpg`, `playground-materials-cover.jpeg` > `g10.jpg`,
  `themed-playground-customization.JPG` > `g12.jpg`, `play-land-coral-cascade2` > `coral-cascade3`.
- The project pages for Homes & Private Villas and Government & Public Spaces use the same card photo. A separate photo would help.

## 4. Location pages

- Distances in the "FunPlay in <city>" box are straight-line distances from the Vasai factory, labelled as such. Road distances are longer.
- Local place names used in the city copy (neighbourhoods, roads, landmarks) were written from general knowledge. Worth a quick read by someone who knows the larger cities.
- Delivery to the Andaman & Nicobar Islands and Lakshadweep is described as possible; please confirm.
- The "Punjab & J&K" page and the separate "Jammu and Kashmir" page overlap. Consider redirecting one to the other later.
- The pages for "India" as a location (`...-manufacturer-in-india.html`, `...-supplier-india.html`) compete with the home page and the open-air gym page for national searches. The keyword map assigns national searches to those two pages.
- New page: **Playground equipment manufacturer in Mumbai** (`/outdoor-playground-equipment-manufacturer-in-mumbai.html`). Mumbai had only a gym page, while "playground equipment manufacturers in mumbai" drew about 540 impressions a year.
- Fixed: the Belgaum gym page carried Begusarai's heading and title.

## 5. Content changes worth knowing about

- About 910 pages were rewritten (city intros, product descriptions, state hubs) to remove duplicate
  copy, em dashes and stock phrases. Customer testimonials were left word for word.
- Project pages: new descriptions, titles and meta descriptions; "GUJRAT" and "TELENGANA" corrected.
- `/blog/the-role-of-organic-shapes-in-modern-playground-design.html` was a copy of the surface-materials
  article with no traffic. It now redirects (301) to `/blog/school-playground-surface-materials-which-one-is-best.html`.
- New post: **How to Choose a Playground Equipment Manufacturer in India**, a buyer's checklist aimed at
  searches like "playground equipment manufacturer" and at people comparing suppliers.
- The blog post "Best Playground Equipment Manufacturers in India" carries two short reviews credited to
  "Mumbai School Principal" and "Bangalore Park Administrator". Please confirm these are real, or remove them.
- The trust bar still says "21+ Years of Expertise". With a founding year of 2002 this could read "24+ years".
- Landing pages (`school.html`, `builders.html`) now have a proper H1 and meta description; `campaign.html`
  and `generic.html` are marked noindex because they repeat the home page content.

## 6. Competitors

Of the 31 names supplied, 21 could not be identified as an Indian playground company, and 7 are foreign
brands or not comparable. Only **Funriders** (direct competitor) and **KinderPlay** (direct, but the
public information dates from 2012) could be researched with sources. That is not enough for fair
"FunPlay vs X" pages, so none were published. The new buyer's guide covers the same searches without
naming anyone. If you want comparison pages later, send the competitors' websites and we can build them
from what each company publishes. Indian names that came up in the research and may be closer rivals:
Kidzlet, Koochie, Arihant Play, GN Enterprises, Play On India, Nidhi Play System.

## 7. Small behaviour notes

- "Live Chat Now" on the landing pages opens Tawk.to when it is loaded through Google Tag Manager, as on
  the current site. If Tawk is not loaded, the button opens WhatsApp (+91 902 830 2266) instead of doing nothing.
- Vercel limits a form upload to about 4.5 MB, so CVs above that size fail with a clear message. The form text says 5 MB; you may want to change it to 4 MB.
- The home page "Get started now" button opens the home page in a new tab, as on the current site. Point it somewhere useful (for example the contact page) if you agree.
- "eromofy" (NexLev) was left exactly as it is; it is one of the best performing pages.

## 8. After launch

- Submit `https://funplaysystems.com/sitemap.xml` in Search Console and watch the Pages report for 404s for two to three weeks.
- Use `docs/keyword-map.xlsx` as the reference for titles and H1s: one main keyword per page, and the Search Console queries each page should win.
