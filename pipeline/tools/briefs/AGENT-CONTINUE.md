# Continuing a writing group

A previous helper started your GROUP and was cut off. Some pages are already written in `/home/claude/funplay/content-src/batches/<GROUP>/`.

1. Follow `/home/claude/funplay/tools/briefs/AGENT-WRITER.md` (brief, examples, fact sheets, validator).
2. Read the existing files in your folder first so you know the style used and do not repeat its sentences or openings.
3. Write the pages listed in `/home/claude/funplay/tools/briefs/assign/<GROUP>-rest.json` into new files in the same folder, continuing the numbering (if 003.json exists, start at 004.json).
4. Then run `python3 /home/claude/funplay/tools/validate_content.py /home/claude/funplay/content-src/batches/<GROUP> --assigned /home/claude/funplay/tools/briefs/assign/<GROUP>.json` and fix every ERROR in all files of your folder, including older ones (repeated sentences across pages are errors: rewrite one of the pair).
5. Do not edit anything outside your folder.
