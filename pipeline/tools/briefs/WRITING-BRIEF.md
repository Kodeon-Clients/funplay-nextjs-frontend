# FunPlay Systems website rebuild: writing brief

You are writing page copy for **funplaysystems.com**, the website of Fun Play Systems Pvt. Ltd. (brand: FunPlay), an Indian designer and manufacturer of outdoor playground equipment and outdoor gym equipment. The copy is for buyers in India: builders, housing societies, schools, municipal bodies, resorts, hotels, corporates and architects. The goal is pages that rank on Google for their target keyword and read like a knowledgeable person at FunPlay wrote them.

Read this whole brief before writing. Your output is checked by `python3 tools/validate_content.py <your file>`. Run it on every file you write and fix every error before you finish.

## 1. Voice

- Write as FunPlay, in the first person plural ("we", "our factory").
- Plain Indian business English, British spelling: colour, centre, metre, programme, organise, galvanised, moulded.
- Talk to the buyer ("you", "your site"). Short paragraphs, 2 to 4 sentences.
- Vary sentence length. Most sentences under 22 words; none over 32.
- Specific beats general. Every paragraph should carry at least one concrete fact from the fact sheet or from stable local knowledge.
- Confident and calm. No hype, no exclamation marks.

## 2. Banned patterns (the validator rejects these)

- Em dashes (—) and en dashes (–) anywhere. Use a full stop, comma, colon or "to" ("3 to 8 years").
- Contrast reveals: "It's not X, it's Y", "not just X but Y", "more than just", "isn't about X, it's about Y".
- Negation lists: "No X, no Y, no Z."
- Self-answered questions or colon reveals inside body copy: "The result? ...", "The best part: ...". (FAQ questions are fine.)
- Stock phrases and filler words: in today's, fast-paced, whether you're, look no further, when it comes to, rest assured, peace of mind, one-stop, hassle-free, seamless, robust, unlock, elevate, delve, vibrant, bustling, nestled, tapestry, testament, embark, journey (figurative), realm, landscape (figurative), leverage, cutting-edge, state-of-the-art, top-notch, world-class, game-changer, unparalleled, meticulous, boasts, furthermore, moreover, additionally, in conclusion, it is worth noting, plays a crucial role, a wide range of, wide variety, best quality, high-quality, trusted by, leading, perfect for, ideal for, transform, thrive, empower, foster, enhance, ensure, seamlessly, effortlessly, cater to, nurture.
- At most one list of three items per section, and no trailing comma pile-ons ("..., keeping X, saving Y, and Z").
- No sentence may appear twice across your pages. Do not reuse the same opening sentence pattern on page after page. Vary structure and angle per page.

## 3. Facts you may state about FunPlay (closed list)

Use only these. Never invent anything else about the company.

- Fun Play Systems Pvt. Ltd., founded in **2002**. Brand name: FunPlay.
- Factory: Vasai East, Palghar district, Maharashtra (near Mumbai). **45,000 sq ft** manufacturing facility. **150+ employees**.
- **15,000+ installations** across India.
- In-house design, roto-moulding and fabrication. Tested and certified raw materials, in-house quality inspection, weather-proof and corrosion-resistant materials. **15+ roto-moulded colour shades**. Design customisation on request. Wooden and composite products in some ranges.
- Product ranges: **CoreCraft** (multi play systems, themed play stations, individual equipment such as swings, slides, see-saws, spring riders, climbers and merry-go-rounds, Fun Fitness outdoor gym equipment, garden decor such as benches, gazebos and pergolas), **Funplay Originals** (play structures designed by our own team, many inspired by Indian games and nature), **NexLev Series** (newer, larger play towers and wooden structures).
- Also supplies rubber flooring for play areas.
- Warranty: 3 years on galvanised pipes, roto-moulded parts, composite laminates and play rope; 1 year on springs, bearings and spare parts. Covers manufacturing defects when installed and maintained as per FunPlay's instructions.
- Installation methods: self-standing or grouting, depending on the ground.
- Delivery and installation anywhere in India: equipment is made in Vasai, sent by road, installed by our installation team or a local dealer. Dealers in all four regions of India.
- Process: client shares site size, age group and photos, we suggest equipment and send a layout drawing with the safe play area marked, client approves layout and quote, we manufacture, dispatch and install.
- Sales: +91 902 830 2266, sales@funplaysystems.com. After sales: +91 738 530 0921, aftersales@funplaysystems.com.
- Working hours: Monday to Saturday, 9:00 AM to 6:30 PM.
- Projects: only the ones listed in the page's fact sheet (`projects`). Never claim any other installation, client, school or society in a city.

Never state: delivery times, prices or discounts, certifications (ISO, EN 1176, IS standards, ASTM), awards for a specific product, numbers of installations in a city or state, offices or warehouses outside Vasai, testimonials or reviews, "best" or "No. 1" claims, safety guarantees ("100% safe").

## 4. Local knowledge (city and state pages)

You may use stable, widely known facts about a place: its state and region, climate type and seasons (monsoon months, hot summers, cold winters, humidity, coastal salt air, heavy rain, hill terrain, desert heat, dust), terrain, what the city is broadly known for (port, IT hub, textile centre, pilgrimage town, steel city, education hub, cantonment, hill station, industrial belt), and the type of buyers that exist there (schools, colleges, housing societies, municipal parks, industrial townships, hotels, resorts, temple trusts).

- Name a civic body or development authority only when you are certain it exists under that name (for example "Pune Municipal Corporation", "Greater Chennai Corporation"). If unsure, say "the municipal corporation".
- Name neighbourhoods or roads only for large cities where you are sure.
- No population figures, rankings, new-infrastructure claims or statistics.
- For small towns you are unsure about, stay with what is certain (state, region, climate) and focus on practical buying advice. Generic and true is better than specific and wrong. If you genuinely know nothing reliable, say so in `notes`.
- Use the distance from the fact sheet as "about N km from our Vasai factory" (round to the nearest 10 km over 100 km).

## 5. Page types and lengths

### Playground city pages (kind = playground, level = City)
Target keyword: "playground equipment manufacturer in {City}" plus variants (outdoor playground equipment {City}, play equipment supplier {City}, school/society playground {City}).

- **Tier A** (fact sheet `tier: "A"`): `intro` 2 paragraphs (120 to 180 words together), `sections` 3 or 4 (h2 heading + 60 to 160 words each, HTML), `faq` 4 items (answers 30 to 60 words). Total 600 to 900 words.
- **Tier B**: `intro` 2 paragraphs (130 to 230 words together), `sections` 1 (h2 + 80 to 150 words, practical local angle: weather and materials, site type, or who buys there), `faq` 3 items (answers 25 to 50 words). Total 350 to 500 words.

### Outdoor gym city pages (kind = gym)
Target keyword: "outdoor gym equipment supplier in {City}" plus variants (open gym equipment, outdoor fitness equipment, open air gym). Write about outdoor gyms for parks, societies, walking tracks, schools, colleges and corporate campuses. Mention 2 to 4 specific machines from `fitness_products` in link-targets.json and link to them. Same tier lengths as playground pages.

### State and region pages (level = State or Country)
Target keyword: "playground equipment manufacturer in {State}" (or outdoor gym for gym kind). `intro` 2 paragraphs (150 to 220 words), `sections` 1 or 2 about supplying different parts of the state, climate differences inside the state and typical buyers (100 to 160 words each), `faq` 3 items. Tier A state pages get 2 sections and 4 FAQs.

### Product pages
- `description`: 80 to 150 words. What the product is, who it suits (age group), how children play on it (activities, skills), capacity and safe play area when known, the colour(s), the warranty line, and a closing line inviting a layout drawing or quote. Use `image_descriptions` to describe what it looks like. Use only facts in the product fact sheet and the closed company list. If the fact sheet has a `catalogue` entry, its age group may be used; for dimensions use the website values in `spec_rows` and add a `flags` note when they differ from the catalogue.
- `spec_paragraph`: 40 to 70 words, different from the description: construction and safety angle (materials from the warranty line, installation method, safe play area, age suitability, maintenance).
- `flags`: list of strings for anything that looks wrong in the fact sheet (name and image mismatch, product in the wrong category, odd capacity like "15 kg", missing data).

## 6. HTML in `sections[].html` and links

- Allowed tags: `<p>`, `<ul>`, `<ol>`, `<li>`, `<a href="...">`, `<strong>`. No headings inside html (the h2 comes from `h`), no classes, no inline styles.
- Internal links must be root-relative paths that exist in `tools/briefs/link-targets.json` or in the page's fact sheet (`twin`, `nearby`, `hub`, `projects`). 1 to 4 links per page. Good targets: the twin page (gym or playground in the same city), 1 or 2 relevant products or series, the Fun Fitness range for gym pages.
- Do not link to the page itself. No external links.

## 7. Output format

One JSON object per file, keyed by page path:

```json
{
  "/outdoor-playground-equipment-manufacturer-in-kolhapur.html": {
    "intro": ["paragraph one", "paragraph two"],
    "sections": [{"h": "Section heading", "html": "<p>...</p>"}],
    "faq": [{"q": "Question?", "a": "Answer."}],
    "notes": "optional: anything you were unsure about"
  }
}
```

Products:

```json
{
  "/corecraft/individual-equipment/swing/curve-post-swing.html": {
    "description": "...",
    "spec_paragraph": "...",
    "flags": []
  }
}
```

Write files of 10 to 15 pages each into your assigned folder, named `001.json`, `002.json` and so on. Validate each file as you go.

## 8. Examples

See `tools/briefs/examples.json`. Match their quality and specificity, not their wording. Never copy their sentences.

## 9. Before you finish

1. Every assigned path is present exactly once across your files.
2. `python3 tools/validate_content.py <folder>` passes with zero errors.
3. Re-read three random pages aloud in your head. If any line would fit a competitor's site unchanged, rewrite it with a fact.
