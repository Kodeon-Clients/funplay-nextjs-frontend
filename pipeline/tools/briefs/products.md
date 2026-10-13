# Brief: unique product descriptions for FunPlay product pages

Read `/home/claude/funplay/tools/briefs/style.md` first. Every rule there applies.

## The job

Each product page has a "Description" paragraph. On about 200 pages it is the series blurb copied onto every
product in the series, so Google sees duplicates and does not index them. People search for these products by
name (for example "Ulta Ghar", "Card Pyramid", "Crestro", "Limlet", "Fugadi", "Abb Trainer"). Write one unique
description per product that a buyer would find useful and that answers what the product is.

## Input

A JSON array. Each item has the facts we have for one product: `name`, `h1` (may include a subtitle),
`sku`, `line` (CoreCraft, Funplay Originals or NexLev Series), `series_name`, `colours`, `image_alts` (what the
photos show; useful for the shape and features), `current_description` (often the copied series blurb),
`specifications_text`, `details` (age group, key user group, capacity, product area, safe play area),
`dimensions`, `activities`, `skills`, and `catalogue_text` (Funplay Originals catalogue copy, when matched; the
text can be jumbled because it came from a two-column PDF).

## Output

Write ONE JSON file (UTF-8, valid JSON) to the output path you were given:

```json
{
  "/corecraft/play-lands/coral-cascade.html": {
    "description": "80 to 150 words, one paragraph",
    "name": "Coral Cascade",
    "facts_used": ["capacity 15", "safe play area 34'8\" x 32'1\"", "activities: climbing, sliding, hanging"]
  }
}
```

For items where `needs_seo` is true, also add `"title"` (50 to 60 characters, product name first, ending
"| FunPlay") and `"meta"` (140 to 160 characters, says what it is, one key spec, and "Get a quote.").

## How to write each description

- Open with what the product is, using its name, in one sentence: "Coral Cascade is a castle-themed multi play
  station for children aged 5 to 12."
- Then the useful facts that exist in the input: age group, capacity, safe play area (needed for planning),
  activities and the skills they build, standout features you can see in `image_alts` or read in
  `catalogue_text`, and the colour options.
- Say who it suits (schools, housing societies, parks, resorts, open gyms, senior citizens' areas) and why, based
  on its size, capacity and age group.
- End with a short, plain next step, varied between pages ("Ask us for a layout drawing", "Send us your site size
  and we will check the fit", "Call +91 902 830 2266 for a quote").
- Use only facts in the input plus the company facts in style.md. Do not invent dimensions, weights, materials
  that are not listed, user limits, or certifications. If a value says "NA" or is missing, leave it out.
- Garden decor (gazebos, pergolas, benches) are not play equipment: describe them as garden and landscape
  furniture for societies, resorts, parks and campuses.
- Fun Fitness items are outdoor gym equipment for adults: describe the movement, the muscles or ability it works
  in plain words (only what the product name and input clearly imply, for example a leg press works the legs),
  and where it suits (municipal parks, societies, walking tracks, campuses, senior citizens' areas).
- Products in the same series must not read alike. Change the opening, the order of facts and the closing line.
- Prices are never mentioned.
- Never mention an unconfirmed dimension conflict. If the input data looks wrong (for example a capacity in kg on
  a play structure, or a safe area smaller than the product area), leave that value out and list the path in
  your final reply.

## Before you finish

1. Run `python3 -I /home/claude/funplay/tools/check_copy.py <your output file>` and fix every issue until it says
   `TOTAL ISSUES: 0`.
2. Confirm every input path is in your output and the JSON loads.
3. Reply with only: the output path, the number of products written, and the list of paths with data that looked
   wrong (with one line saying what looked wrong).
