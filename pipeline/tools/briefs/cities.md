# Brief: unique copy for FunPlay city and state pages

Read `/home/claude/funplay/tools/briefs/style.md` first. Every rule there applies.

## The job

FunPlay has one landing page per place for two services:

- **playground city page**: target keyword "playground equipment manufacturer in {place}" (also "outdoor playground equipment supplier in {place}"). Buyers: schools, housing societies and builders, municipal parks, resorts and clubs, corporates.
- **outdoor gym city page**: target keyword "outdoor gym equipment supplier in {place}" (also "open gym equipment", "outdoor fitness equipment"). Buyers: municipal corporations and councils (parks, walking tracks, lake fronts, smart-city projects), housing societies, schools and colleges, corporate campuses, RWAs, senior citizens' areas, PSU townships.

Today these pages are near-duplicates with the city name swapped. Google does not index many of them. Your copy
is what makes each page useful and different. The page layout, the hero, the H1 and the link blocks already
exist. The code adds a fact list (factory, distance from Vasai, installation) and the nearby-city links, so
do not repeat those as lists.

## Input

A JSON array. Each item: `path`, `page_type`, `place`, `state`, `level` (city, state or country), `km_from_vasai_factory`
(straight line), `tier` (A or B), `nearby_places`, `gsc_clicks_12m`, `gsc_impressions_12m`.

Gym and playground pages for the same place are usually next to each other in your batch. They must read
completely differently: different angle, different opening, different sentences.

## Output

Write ONE JSON file (UTF-8, valid JSON) to the output path you were given, mapping each input `path` to an object:

```json
{
  "/outdoor-playground-equipment-manufacturer-in-pune.html": {
    "tier": "B",
    "city": "Pune",
    "intro": ["paragraph 1", "paragraph 2"],
    "faq": [{"q": "...", "a": "..."}, {"q": "...", "a": "..."}]
  }
}
```

Tier A items also get `"sections"`: a list of 3 or 4 objects `{"h": "heading", "html": "<p>...</p>"}`. The
html may use only `<p>`, `<ul><li>`, `<ol><li>`, `<strong>` and `<a href="...">` with an href taken from
`/home/claude/funplay/tools/data/link-targets.json` or the page's own twin (swap
`outdoor-playground-equipment-manufacturer-in-` and `outdoor-gym-equipment-manufacturer-supplier-` in the
path; only link a twin if it is listed in `/home/claude/funplay/tools/data/cities.json`). No other tags, no classes, no inline styles.

### Tier B (most pages)

- `intro`: 2 paragraphs, 150 to 230 words in total. Paragraph 1 says plainly what we supply in this place and
  to whom, and uses the target keyword phrase once in natural form. Paragraph 2 gives practical, place-aware
  advice: what suits the local climate or ground, the kind of sites common there, what to plan for (shade,
  drainage, surfacing, age groups, space), or how a project is handled from Vasai. Pick an angle that fits this
  place. Do not use the same angle for every page.
- `faq`: 2 questions a buyer in this place would actually ask, with 25 to 60 word answers. Vary them
  across pages. Good topics: delivery and installation to this place, what equipment suits a small society or
  school ground, open gym equipment for a municipal park, surfacing, warranty, maintenance in the local
  climate, how to get a layout drawing. Keep at least half of your FAQs specific to the place.

### Tier A (pages that already get clicks)

- `intro`: 2 paragraphs, 120 to 200 words.
- `sections`: 3 or 4 sections, 450 to 650 words in total. Use headings that make a claim or answer a question,
  for example "Choosing playground equipment for Pune's hot summers and heavy monsoon" or "Open gyms for
  municipal parks in Ahmedabad". One section can be a short ordered list of how a project in this place works.
  One section should point buyers to the right equipment with 2 to 4 internal links.
- `faq`: 4 questions, 30 to 70 word answers.

### State and country pages (`level` = state or country)

Write about the state as a whole: the kinds of places and buyers across the state, the range of climates if it
varies, and the fact that we supply cities across it (the page lists them). For the gym "india" page, write
about outdoor gyms across India.

## Example of the standard we want (Tier A, Chennai)

See `/home/claude/funplay/content-src/cities.json`. Match its quality, not its wording. Do not reuse its
sentences or its structure for other cities.

## Before you finish

1. Run `python3 -I /home/claude/funplay/tools/check_copy.py <your output file>` and fix every issue until it says
   `TOTAL ISSUES: 0`. "sentence repeated on N pages" means two of your pages share a sentence: rewrite one.
2. Confirm every input path is in your output and the JSON loads.
3. Reply with only: the output path, the number of pages written, and any place where you were unsure of a fact
   and left it out.
