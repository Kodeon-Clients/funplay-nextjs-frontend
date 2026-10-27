#!/usr/bin/env node
/**
 * Content sheet commands (run from the site folder):
 *
 *   npm run sheet -- push [--force]                  first set-up: write every page, image and text into the sheet
 *   npm run sheet -- publish --target=live|preview   apply the sheet's edits to the code (used by the GitHub Action)
 *   npm run sheet -- refresh                         copy code changes into the sheet (keeps unpublished edits)
 *   npm run sheet -- check                           list the sheet's unpublished edits and any problems
 *   npm run sheet -- log --status=ok|failed [--link=…] [--run=…]   add the result to the "Publish log" tab
 *   npm run sheet -- export --out=<folder>           write the sheet as CSV files (offline copy)
 *   npm run sheet -- test                            self-test: every field survives the sheet round trip
 *
 * Options: --sheet=dir:<folder> uses CSV files in a folder instead of Google Sheets (tests, dry runs);
 *          --dry-run (publish) reports what would change without writing anything.
 * Google access: CONTENT_SHEET_ID and GOOGLE_SERVICE_ACCOUNT (see docs/CONTENT-SHEET.md).
 */
import fs from "node:fs";
import path from "node:path";
import { GoogleSheet } from "./google.mjs";
import { LocalSheet } from "./local.mjs";
import { sync, push, logPublish, TABS, LOG_TAB } from "./sync.mjs";
import { extract, ROOT } from "./model.mjs";
import { roundTrips, toCell, fromCell } from "./format.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.filter((a) => a.startsWith("--")).map((a) => {
  const [k, ...v] = a.slice(2).split("=");
  return [k, v.length ? v.join("=") : true];
}));
const OUT_DIR = path.join(ROOT, ".sheet-sync");
const RESULT = path.join(OUT_DIR, "result.json");

function doc() {
  const s = opt.sheet || process.env.CONTENT_SHEET || "google";
  if (String(s).startsWith("dir:")) return new LocalSheet(path.resolve(String(s).slice(4)));
  return new GoogleSheet();
}

function print(result) {
  const lines = [];
  lines.push(`${result.mode} (${result.target}): ${result.changes.length} sheet edit(s), ${result.toSheet} code change(s) for the sheet, ${result.newRows} new row(s), ${result.gone} removed`);
  for (const c of result.changes.slice(0, 50)) lines.push(`  edit  ${c.where}: ${c.from} -> ${c.to}`);
  for (const e of result.errors) lines.push(`  ERROR ${e.where}: ${e.msg}`);
  for (const w of result.warnings.slice(0, 50)) lines.push(`  warn  ${w.where}: ${w.msg}`);
  for (const c of result.conflicts) lines.push(`  both changed (sheet wins) ${c.where}`);
  console.log(lines.join("\n"));
}

function commitMessage(result) {
  const n = result.changes.length;
  const head = `Content sheet: ${n} edit${n === 1 ? "" : "s"}${result.target === "preview" ? " (preview)" : ""}`;
  return [head, "", ...result.changes.slice(0, 100).map((c) => `- ${c.where}: ${c.to}`), ...(n > 100 ? [`- … ${n - 100} more`] : [])].join("\n");
}

async function main() {
  switch (cmd) {
    case "push": {
      const counts = await push(doc(), { force: !!opt.force });
      console.log("sheet written:", counts);
      break;
    }
    case "publish":
    case "refresh":
    case "check": {
      const target = opt.target === "preview" ? "preview" : "live";
      const result = await sync(doc(), { mode: cmd, target, dryRun: !!opt["dry-run"] });
      fs.mkdirSync(OUT_DIR, { recursive: true });
      fs.writeFileSync(RESULT, JSON.stringify(result, null, 1));
      fs.writeFileSync(path.join(OUT_DIR, "commit-message.txt"), commitMessage(result));
      print(result);
      if (!result.ok) process.exitCode = 2;
      break;
    }
    case "log": {
      const result = fs.existsSync(RESULT) ? JSON.parse(fs.readFileSync(RESULT, "utf8")) : null;
      await logPublish(doc(), result, { status: opt.status || "ok", link: opt.link || "", runUrl: opt.run || "" });
      break;
    }
    case "export": {
      const out = path.resolve(String(opt.out || "sheet-export"));
      await push(new LocalSheet(out), { force: true, keepBase: true });
      console.log("CSV files written to", out);
      break;
    }
    case "test": {
      const { fields, rows } = extract();
      let bad = 0;
      for (const f of fields.values()) {
        if (f.locked || f.kind === "markdown" || f.tab !== "Content") continue;
        const props = f.shared ? null : f.page.meta.sections[f.section].props;
        if (!props) continue;
        const v = f.propPath.split(".").reduce((o, k) => o[k], props);
        if (!roundTrips(f.kind, v) || JSON.stringify(fromCell(f.kind, toCell(f.kind, v), v)) !== JSON.stringify(v)) {
          bad++;
          if (bad < 10) console.log("does not round-trip:", f.id);
        }
      }
      const locked = [...fields.values()].filter((f) => f.locked).length;
      console.log(`${fields.size} fields (${rows.Pages.length} pages, ${rows.Images.length} images, ${rows.Content.length} text rows); ${locked} read-only; ${bad} failures`);
      if (bad) process.exitCode = 1;
      break;
    }
    default:
      console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0]);
      process.exitCode = cmd ? 1 : 0;
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exitCode = 1;
});

export { TABS, LOG_TAB };
