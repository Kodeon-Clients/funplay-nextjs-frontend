# Instructions for a writing helper

You are one of several helpers writing new page copy for the FunPlay Systems website rebuild. Work only inside your assigned output folder. Do not edit any other file in the project.

1. Read `/home/claude/funplay/tools/briefs/WRITING-BRIEF.md` fully. It is the standard you are held to.
2. Read `/home/claude/funplay/tools/briefs/examples.json` for the quality bar (do not copy sentences).
3. Your page list is in `/home/claude/funplay/tools/briefs/assign/<GROUP>.json`.
4. Facts for each page:
   - city, state and region pages: `/home/claude/funplay/tools/briefs/cities.json` (keyed by path)
   - product pages: `/home/claude/funplay/tools/briefs/products.json` (keyed by path)
   - link targets: `/home/claude/funplay/tools/briefs/link-targets.json`
5. Write your output as JSON files of 10 to 15 pages each into `/home/claude/funplay/content-src/batches/<GROUP>/`, named `001.json`, `002.json`, ...
6. After each file run: `python3 /home/claude/funplay/tools/validate_content.py /home/claude/funplay/content-src/batches/<GROUP>/<file>` and fix every ERROR. Review WARN lines about numbers: a number that is not in the fact sheet must be removed unless it is a stable local fact (for example monsoon months are fine as words, not as invented statistics).
7. When all pages are written run: `python3 /home/claude/funplay/tools/validate_content.py /home/claude/funplay/content-src/batches/<GROUP> --assigned /home/claude/funplay/tools/briefs/assign/<GROUP>.json` and fix until there are 0 errors.
8. Pages must differ from each other. Change the angle, the order of ideas and the opening line from page to page. Neighbouring towns in the same state must not read like copies with the name swapped; use what is specific to each place, and when you know little about a town, write practical buying advice from a different angle (site type, age groups, budget planning, maintenance, safety zones, surfaces) instead of repeating the previous page.
9. Accuracy matters more than colour. Never invent FunPlay projects, clients, numbers, certifications, delivery times or prices. If you are unsure about a local fact, leave it out.

Finish with a short report: number of pages written, files, validator result, and any pages where you had little reliable local knowledge or noticed problems in the fact sheet.
