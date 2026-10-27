/**
 * The same interface as GoogleSheet, backed by a folder of CSV files (one per tab). Used by the tests,
 * for dry runs without Google access, and to export the sheet for Excel.
 */
import fs from "node:fs";
import path from "node:path";

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let i = 0;
  let quoted = false;
  text = text.replace(/^﻿/, "");
  while (i < text.length) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        quoted = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (ch === "\n" || ch === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += ch === "\r" && text[i + 1] === "\n" ? 2 : 1;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell !== "" || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (rows) => "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

export class LocalSheet {
  constructor(dir) {
    this.dir = dir;
    fs.mkdirSync(dir, { recursive: true });
  }
  file(tab) {
    return path.join(this.dir, tab + ".csv");
  }
  load(tab) {
    return fs.existsSync(this.file(tab)) ? parseCsv(fs.readFileSync(this.file(tab), "utf8")) : null;
  }
  save(tab, rows) {
    fs.writeFileSync(this.file(tab), toCsv(rows));
  }
  async readTabs(names) {
    const out = {};
    for (const n of names) {
      const r = this.load(n);
      if (r) out[n] = r;
    }
    return out;
  }
  async update(cells) {
    const tabs = new Map();
    for (const c of cells) {
      if (!tabs.has(c.tab)) tabs.set(c.tab, this.load(c.tab) || []);
      const rows = tabs.get(c.tab);
      while (rows.length <= c.row) rows.push([]);
      const r = rows[c.row];
      while (r.length <= c.col) r.push("");
      r[c.col] = c.formula ? "" : c.value ?? "";
    }
    for (const [t, rows] of tabs) this.save(t, rows);
  }
  async writeTab(tab, rows) {
    this.save(tab, rows);
  }
  async appendRow(tab, values) {
    const rows = this.load(tab) || [];
    rows.push(values);
    this.save(tab, rows);
  }
  async setup() {}
  async ensureRows() {}
}
