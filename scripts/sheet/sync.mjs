/**
 * Two-way sync between the content sheet and the repository.
 *
 * For every editable cell the last synced value is remembered (as a hash) in content/.sheet-base.json:
 *   sheet changed, code unchanged  -> the sheet edit is written into the code (publish)
 *   code changed, sheet unchanged  -> the sheet is updated (a developer changed the code)
 *   both changed                   -> the sheet wins; the conflict is listed in the publish log
 * New fields (new pages, sections, images) get new rows; rows whose field no longer exists are marked.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { extract, apply, ROOT, PAGE_COLUMNS, IMAGE_COLUMNS, CONTENT_COLUMNS } from "./model.mjs";
import { validate, checkMdx } from "./validate.mjs";

export const BASE_FILE = path.join(ROOT, "content", ".sheet-base.json");
export const LOG_TAB = "Publish log";
const HOST = "https://funplaysystems.com";
const GONE = "Not on the site any more";

export const TABS = {
  Pages: { columns: PAGE_COLUMNS, key: "path" },
  Images: { columns: IMAGE_COLUMNS, key: "src" },
  Content: { columns: CONTENT_COLUMNS, key: "key" },
};
const LOG_COLUMNS = ["Time (IST)", "Target", "Result", "Changes", "Warnings", "Details", "Link"];

/* ------------------------------------------------------------------ helpers */
export const normCell = (v) => String(v ?? "").replace(/\r\n?/g, "\n").replace(/[ \t]+$/gm, "").trim();
export const hash = (v) => crypto.createHash("sha1").update(normCell(v)).digest("hex").slice(0, 12);

export function loadBase() {
  return fs.existsSync(BASE_FILE) ? JSON.parse(fs.readFileSync(BASE_FILE, "utf8")) : {};
}
export function saveBase(base) {
  const keys = Object.keys(base).sort();
  // one entry per line keeps git diffs small
  fs.writeFileSync(BASE_FILE, "{\n" + keys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(base[k])).join(",\n") + "\n}\n");
}

const colIndex = (tab) => Object.fromEntries(TABS[tab].columns.map(([id], i) => [id, i]));
const letter = (i) => String.fromCharCode(65 + i);

/** Header formulas for computed columns (lengths, previews, links). */
export function formulas(tab) {
  const c = colIndex(tab);
  const L = (id) => letter(c[id]);
  const f = [];
  const arr = (id, header, expr) => f.push({ row: 0, col: c[id], value: `={"${header}";ARRAYFORMULA(${expr})}` });
  if (tab === "Pages") {
    arr("titleLen", "Title length", `IF(${L("title")}2:${L("title")}="",,LEN(${L("title")}2:${L("title")}))`);
    arr("descLen", "Description length", `IF(${L("description")}2:${L("description")}="",,LEN(${L("description")}2:${L("description")}))`);
    arr("url", "Open page", `IF(A2:A="",,HYPERLINK("${HOST}"&A2:A,"open"))`);
  } else if (tab === "Images") {
    arr("preview", "Preview", `IF(A2:A="",,IMAGE("${HOST}"&A2:A))`);
  } else if (tab === "Content") {
    arr("chars", "Characters", `IF(${L("text")}2:${L("text")}="",,LEN(${L("text")}2:${L("text")}))`);
  }
  return f;
}
const FORMULA_COLS = { Pages: ["titleLen", "descLen", "url"], Images: ["preview"], Content: ["chars"] };

/** Sheet layout for GoogleSheet.setup() */
export function layout(rows) {
  const widths = { path: 300, type: 110, title: 360, description: 420, h1: 340, robots: 80, canonical: 200, ogTitle: 220, ogDescription: 260, ogImage: 200, url: 60, status: 190, src: 300, preview: 90, alt: 380, currentAlt: 380, replace: 220, count: 80, example: 260, page: 300, section: 200, field: 170, format: 140, text: 560, chars: 80, key: 120, titleLen: 70, descLen: 70 };
  const out = {};
  for (const [tab, spec] of Object.entries(TABS)) {
    out[tab] = {
      rows: rows[tab].length,
      freezeCols: 1,
      columns: spec.columns.map(([id, header, editable]) => ({
        header,
        editable,
        width: widths[id],
        wrap: ["text", "description", "alt", "currentAlt", "h1", "title"].includes(id),
        hidden: id === "key",
        choices: id === "robots" ? ["index", "noindex"] : undefined,
        rules:
          id === "titleLen"
            ? [{ formula: `=AND(ISNUMBER(${letter(colIndex(tab).titleLen)}2),${letter(colIndex(tab).titleLen)}2>60)`, color: { red: 0.99, green: 0.85, blue: 0.85 } }]
            : id === "descLen"
              ? [{ formula: `=AND(ISNUMBER(${letter(colIndex(tab).descLen)}2),OR(${letter(colIndex(tab).descLen)}2>160,${letter(colIndex(tab).descLen)}2<70))`, color: { red: 0.99, green: 0.85, blue: 0.85 } }]
              : undefined,
      })),
    };
  }
  out[LOG_TAB] = { rows: 0, freezeCols: 0, columns: LOG_COLUMNS.map((h, i) => ({ header: h, editable: false, width: [150, 70, 160, 70, 70, 600, 260][i], wrap: i === 5 })) };
  return out;
}

/** Row of a tab as an array in column order (formula columns left empty). */
function rowArray(tab, row, status = "") {
  return TABS[tab].columns.map(([id]) => (FORMULA_COLS[tab].includes(id) ? "" : id === "status" ? status || (row.notes && Object.values(row.notes)[0]) || "" : row.values[id] ?? ""));
}

/** Read the sheet into { cells: Map<fieldId, value>, rows: Map<tab|key, rowIndex>, size: {tab: n} } */
export function readSheet(tabs) {
  const cells = new Map();
  const rows = new Map();
  const size = {};
  const missing = [];
  for (const [tab, spec] of Object.entries(TABS)) {
    const data = tabs[tab];
    if (!data) {
      missing.push(tab);
      continue;
    }
    size[tab] = data.length;
    const header = (data[0] || []).map((h) => String(h).trim());
    const idx = {};
    for (const [id, label] of spec.columns) {
      const i = header.indexOf(label);
      if (i < 0 && !FORMULA_COLS[tab].includes(id)) throw new Error(`The "${tab}" tab has no column "${label}". Do not rename or delete columns.`);
      idx[id] = i;
    }
    for (let r = 1; r < data.length; r++) {
      const key = String(data[r][idx[spec.key]] ?? "").trim();
      if (!key) continue;
      if (rows.has(tab + "|" + key)) throw new Error(`The "${tab}" tab has "${key}" twice (row ${rows.get(tab + "|" + key) + 1} and ${r + 1}). Delete the copy.`);
      rows.set(tab + "|" + key, r);
      for (const [id, , editable] of spec.columns) {
        if (!editable) continue;
        const fid = tab === "Pages" ? `P|${key}|${id}` : tab === "Images" ? `I|${key}|${id}` : `C|${key}`;
        cells.set(fid, String(data[r][idx[id]] ?? ""));
      }
    }
  }
  return { cells, rows, size, missing };
}

/** Keep the leading and trailing spaces the stored text had (they separate it from neighbouring links). */
function keepEdges(oldCell, cell) {
  const o = String(oldCell ?? "");
  const lead = /^\s*/.exec(o)[0].replace(/\n/g, "");
  const trail = /\s*$/.exec(o)[0].replace(/\n/g, "");
  return lead + String(cell ?? "").replace(/\r\n?/g, "\n").trim() + trail;
}

const describe = (f) => (f.tab === "Pages" ? `${f.rowKey} · ${f.column}` : f.tab === "Images" ? `${f.rowKey} · ${f.column === "alt" ? "alt text" : "replacement"}` : f.rowKey.replace("#", " · "));
const short = (s, n = 90) => {
  const t = normCell(s).replace(/\n/g, " / ");
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
};

/** Contents of every file an edit can touch, to undo a publish that fails its checks. */
function snapshot(edits) {
  const files = new Set([path.join(ROOT, "content", "image-seo.json"), path.join(ROOT, "content", "shared-sections.json")]);
  for (const { field: f } of edits) {
    if (f.page) files.add(f.page.file);
    if (f.mdx) files.add(path.join(ROOT, "content", "blog", f.mdx.slug + ".mdx"));
  }
  return new Map([...files].map((f) => [f, fs.existsSync(f) ? fs.readFileSync(f) : null]));
}
function restore(snap) {
  for (const [f, data] of snap) {
    if (data === null) fs.rmSync(f, { force: true });
    else fs.writeFileSync(f, data);
  }
}

/* ------------------------------------------------------------------ the sync */
/**
 * mode: "publish" (sheet edits -> code, code changes -> sheet), "refresh" (code -> sheet only), "check" (report only)
 * target: "live" | "preview" (preview applies edits to the code but writes nothing back to the sheet)
 */
export async function sync(doc, { mode = "publish", target = "live", dryRun = false } = {}) {
  const repo = extract();
  const tabs = await doc.readTabs(Object.keys(TABS));
  const sheet = readSheet(tabs);
  if (sheet.missing.length) throw new Error(`The sheet has no ${sheet.missing.join(", ")} tab. Run "npm run sheet -- push" first.`);
  const base = loadBase();

  const edits = [];
  const toSheet = [];
  const conflicts = [];
  const newRows = { Pages: new Map(), Images: new Map(), Content: new Map() };
  for (const f of repo.fields.values()) {
    const sv = sheet.cells.get(f.id);
    if (sv === undefined) {
      const row = repo.rows[f.tab].find((r) => r.key === f.rowKey);
      if (row && !sheet.rows.has(f.tab + "|" + f.rowKey)) newRows[f.tab].set(f.rowKey, row);
      continue;
    }
    const r = hash(f.cell);
    const s = hash(sv);
    const b = base[f.id];
    if (r === s) continue;
    if (b === undefined || r === b) edits.push({ field: f, cell: sv, noHistory: b === undefined });
    else if (s === b) toSheet.push({ field: f, value: f.cell });
    else {
      edits.push({ field: f, cell: sv });
      conflicts.push({ id: f.id, where: describe(f), code: short(f.cell), sheet: short(sv) });
    }
  }
  // rows whose field is gone
  const gone = [];
  for (const [k] of sheet.rows) {
    const [tab, ...rest] = k.split("|");
    const key = rest.join("|");
    const exists = tab === "Content" ? repo.fields.has(`C|${key}`) : repo.rows[tab].some((r) => r.key === key);
    if (!exists) gone.push({ tab, key, row: sheet.rows.get(k) });
  }

  const all = new Map([...repo.fields.values()].map((f) => [f.id, f.cell]));
  if (mode === "publish") for (const e of edits) all.set(e.field.id, e.cell);
  const { errors, warnings } = mode === "publish" || mode === "check" ? validate(edits, all) : { errors: [], warnings: [] };
  // cells Google Sheets turned into a formula error
  for (const e of edits) if (/^#(ERROR!|NAME\?|REF!|VALUE!|N\/A|DIV\/0!)$/.test(normCell(e.cell))) errors.push({ id: e.field.id, where: describe(e.field), msg: `Sheets shows ${normCell(e.cell)}: start the cell with an apostrophe (') so it is kept as text` });

  const result = {
    mode,
    target,
    ok: errors.length === 0,
    errors,
    warnings,
    conflicts,
    changes: edits.map((e) => ({ id: e.field.id, where: describe(e.field), from: short(e.field.cell), to: short(e.cell) })),
    toSheet: toSheet.length,
    newRows: Object.values(newRows).reduce((n, m) => n + m.size, 0),
    gone: gone.length,
    files: [],
  };
  if (dryRun || mode === "check" || (mode === "publish" && !result.ok)) return result;

  // ---- write edits into the code
  if (mode === "publish" && edits.length) {
    const prepared = edits.map((e) => ({ field: e.field, cell: ["plain", "rich"].includes(e.field.kind) ? keepEdges(e.field.cell, e.cell) : e.cell }));
    const backup = snapshot(prepared);
    const changed = apply(prepared);
    result.files = [...new Set(changed.map((c) => path.relative(ROOT, c.file)))];
    const mdx = await checkMdx(result.files.filter((f) => f.endsWith(".mdx")).map((f) => path.join(ROOT, f)));
    if (mdx.length) {
      restore(backup);
      result.ok = false;
      result.errors.push(...mdx.map((m) => ({ id: m.file, where: m.file, msg: "the article would not build: " + m.msg })));
      result.files = [];
      return result;
    }
  }
  if (target === "preview") return result;

  // ---- update the sheet (live publish and refresh)
  const after = mode === "publish" && edits.length ? extract() : repo;
  const cells = [];
  const ci = Object.fromEntries(Object.keys(TABS).map((t) => [t, colIndex(t)]));
  const put = (tab, key, col, value) => cells.push({ tab, row: sheet.rows.get(tab + "|" + key), col: ci[tab][col], value });
  for (const t of toSheet) put(t.field.tab, t.field.rowKey, t.field.column, t.value);
  if (mode === "publish") {
    for (const e of edits) {
      const f = after.fields.get(e.field.id);
      // the cell is shown the way the code stores it (e.g. <strong> written as **)
      if (f && normCell(f.cell) !== normCell(e.cell)) put(e.field.tab, e.field.rowKey, e.field.column, f.cell);
    }
    // clear "edited" marks of published rows
    const done = new Set(edits.map((e) => e.field.tab + "|" + e.field.rowKey));
    for (const k of done) {
      const [tab, ...rest] = k.split("|");
      const key = rest.join("|");
      const row = after.rows[tab].find((r) => r.key === key);
      put(tab, key, "status", (row && row.notes && Object.values(row.notes)[0]) || "");
    }
  }
  for (const g of gone) cells.push({ tab: g.tab, row: g.row, col: ci[g.tab].status, value: GONE });
  // new rows go to the end of their tab
  for (const [tab, m] of Object.entries(newRows)) {
    if (m.size) await doc.ensureRows(tab, sheet.size[tab] + m.size + 1);
    let r = sheet.size[tab];
    for (const row of m.values()) {
      rowArray(tab, row).forEach((v, c) => {
        if (!FORMULA_COLS[tab].includes(TABS[tab].columns[c][0])) cells.push({ tab, row: r, col: c, value: v });
      });
      r++;
    }
  }
  if (cells.length) await doc.update(cells.filter((c) => c.row !== undefined));

  // ---- remember what is in sync now
  const nb = { ...base };
  for (const f of after.fields.values()) {
    const sv = sheet.cells.get(f.id);
    const pendingSheetEdit = mode === "refresh" && sv !== undefined && hash(sv) !== hash(f.cell) && !toSheet.some((t) => t.field.id === f.id);
    if (!pendingSheetEdit) nb[f.id] = hash(f.cell);
  }
  for (const id of Object.keys(nb)) if (!after.fields.has(id)) delete nb[id];
  saveBase(nb);
  result.files.push(path.relative(ROOT, BASE_FILE));
  return result;
}

/** Write the whole sheet from the code (first set-up, or a full reset with --force). */
export async function push(doc, { force = false, keepBase = false } = {}) {
  const repo = extract();
  const tabs = await doc.readTabs(Object.keys(TABS));
  if (Object.keys(tabs).length && !force) {
    const sheet = readSheet(tabs);
    const base = loadBase();
    const pending = [...repo.fields.values()].filter((f) => {
      const sv = sheet.cells.get(f.id);
      return sv !== undefined && hash(sv) !== hash(f.cell) && hash(sv) !== base[f.id];
    });
    if (pending.length) throw new Error(`The sheet has ${pending.length} unpublished edits (e.g. ${pending[0].id}). Publish them first, or use --force to overwrite them.`);
  }
  await doc.setup(layout(repo.rows));
  for (const tab of Object.keys(TABS)) {
    const rows = [TABS[tab].columns.map(([, h]) => h), ...repo.rows[tab].map((r) => rowArray(tab, r))];
    await doc.writeTab(tab, rows, formulas(tab));
  }
  const log = await doc.readTabs([LOG_TAB]);
  if (!log[LOG_TAB] || !log[LOG_TAB].length) await doc.writeTab(LOG_TAB, [LOG_COLUMNS]);
  if (!keepBase) {
    const base = {};
    for (const f of repo.fields.values()) base[f.id] = hash(f.cell);
    saveBase(base);
  }
  return Object.fromEntries(Object.entries(repo.rows).map(([t, r]) => [t, r.length]));
}

/** A line in the "Publish log" tab. */
export async function logPublish(doc, result, { status, link = "", runUrl = "" }) {
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  let res;
  let details = [];
  if (!result) {
    res = "Failed";
    details.push("The publish job stopped with an error. Nothing was changed on the site." + (runUrl ? " Details: " + runUrl : ""));
  } else if (!result.ok) {
    res = "Not published: fix the sheet";
    details.push("Nothing was changed. Fix these cells and publish again:");
    details.push(...result.errors.slice(0, 40).map((e) => `✗ ${e.where}: ${e.msg}`));
    if (result.errors.length > 40) details.push(`… and ${result.errors.length - 40} more`);
  } else if (status !== "ok") {
    res = "Failed";
    details.push("The sheet was fine but saving the change failed. Nothing was changed on the site." + (runUrl ? " Details: " + runUrl : ""));
  } else if (!result.changes.length) {
    res = "Nothing to publish";
    details.push("The sheet has no unpublished edits.");
  } else {
    res = result.target === "preview" ? "Preview building" : "Published (live in ~15 min)";
    details.push(...result.changes.slice(0, 60).map((c) => `• ${c.where}: ${c.to}`));
    if (result.changes.length > 60) details.push(`… and ${result.changes.length - 60} more`);
  }
  if (result?.ok && result.warnings.length) {
    details.push("", "Warnings (published anyway):", ...result.warnings.slice(0, 30).map((w) => `! ${w.where}: ${w.msg}`));
  }
  if (result?.conflicts?.length) {
    details.push("", "Changed in the sheet and by the developer since the last publish (the sheet's text was used):", ...result.conflicts.slice(0, 20).map((c) => `⇄ ${c.where} (code had: ${c.code})`));
  }
  const text = details.join("\n").slice(0, 45000);
  await doc.appendRow(LOG_TAB, [time, result?.target || "", res, String(result?.changes?.length ?? 0), String(result?.warnings?.length ?? 0), text, link]);
}
