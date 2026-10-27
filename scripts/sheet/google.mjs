/**
 * Minimal Google Sheets API client (service account, no SDK).
 *
 * Environment:
 *   CONTENT_SHEET_ID          the spreadsheet id (from its URL: /spreadsheets/d/<id>/edit)
 *   GOOGLE_SERVICE_ACCOUNT    the service account key file (JSON), as text or base64
 * The spreadsheet must be shared with the service account's e-mail address as Editor.
 */
import crypto from "node:crypto";

const API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const b64url = (b) => Buffer.from(b).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

export function serviceAccount(raw = process.env.GOOGLE_SERVICE_ACCOUNT) {
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT is not set");
  const text = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  const key = JSON.parse(text);
  if (!key.client_email || !key.private_key) throw new Error("GOOGLE_SERVICE_ACCOUNT is not a service account key (client_email / private_key missing)");
  return key;
}

/** Signed JWT for the OAuth token exchange. */
export function assertion(key, now = Math.floor(Date.now() / 1000)) {
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const sig = crypto.createSign("RSA-SHA256").update(`${head}.${claims}`).sign(key.private_key);
  return `${head}.${claims}.${b64url(sig)}`;
}

export async function accessToken(key) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: assertion(key) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`Google sign-in failed (${res.status}): ${data.error_description || data.error || "no token"}`);
  return data.access_token;
}

const colName = (i) => {
  let s = "";
  for (i += 1; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};
export const a1 = (tab, row, col) => `'${tab.replace(/'/g, "''")}'!${colName(col)}${row + 1}`;
const q = (tab) => `'${tab.replace(/'/g, "''")}'`;

export class GoogleSheet {
  constructor(id = process.env.CONTENT_SHEET_ID, key = serviceAccount()) {
    if (!id) throw new Error("CONTENT_SHEET_ID is not set");
    this.id = id;
    this.key = key;
    this.token = null;
  }

  async call(method, url, body) {
    this.token ||= await accessToken(this.key);
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if ((res.status === 429 || res.status >= 500) && attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
        continue;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(`Google Sheets ${method} failed (${res.status}): ${data.error?.message || res.statusText}`);
      return data;
    }
  }

  async meta() {
    return this.call("GET", `${API}/${this.id}?fields=sheets(properties(sheetId,title,gridProperties),protectedRanges(protectedRangeId),basicFilter,conditionalFormats)`);
  }

  /** { tabName: string[][] } (rows as shown in the sheet; missing tabs are absent) */
  async readTabs(names) {
    const meta = await this.meta();
    const have = new Set(meta.sheets.map((s) => s.properties.title));
    const want = names.filter((n) => have.has(n));
    if (!want.length) return {};
    const params = want.map((n) => "ranges=" + encodeURIComponent(q(n))).join("&");
    const data = await this.call("GET", `${API}/${this.id}/values:batchGet?${params}&valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`);
    const out = {};
    data.valueRanges.forEach((vr, i) => (out[want[i]] = vr.values || []));
    return out;
  }

  /** cells: [{ tab, row, col, value, formula? }] (0-based row/col; row 0 is the header) */
  async update(cells) {
    const raw = cells.filter((c) => !c.formula);
    const formulas = cells.filter((c) => c.formula);
    for (const [list, input] of [
      [raw, "RAW"],
      [formulas, "USER_ENTERED"],
    ]) {
      // group consecutive cells of the same row into one range
      const ranges = [];
      const sorted = [...list].sort((a, b) => a.tab.localeCompare(b.tab) || a.row - b.row || a.col - b.col);
      for (const c of sorted) {
        const last = ranges[ranges.length - 1];
        if (last && last.tab === c.tab && last.row === c.row && last.col + last.values.length === c.col) last.values.push(c.value);
        else ranges.push({ tab: c.tab, row: c.row, col: c.col, values: [c.value] });
      }
      for (let i = 0; i < ranges.length; i += 2000) {
        const data = ranges.slice(i, i + 2000).map((r) => ({ range: a1(r.tab, r.row, r.col), values: [r.values.map((v) => v ?? "")] }));
        await this.call("POST", `${API}/${this.id}/values:batchUpdate`, { valueInputOption: input, data });
      }
    }
  }

  /** Replace a whole tab: header + rows (values written as text), formula cells in row 0 as given. */
  async writeTab(tab, rows, formulas = []) {
    await this.ensureTabs([tab]);
    await this.ensureRows(tab, rows.length + 1);
    await this.call("POST", `${API}/${this.id}/values/${encodeURIComponent(q(tab))}:clear`, {});
    for (let i = 0; i < rows.length; i += 5000) {
      await this.call("POST", `${API}/${this.id}/values:batchUpdate`, {
        valueInputOption: "RAW",
        data: [{ range: a1(tab, i, 0), values: rows.slice(i, i + 5000).map((r) => r.map((v) => v ?? "")) }],
      });
    }
    if (formulas.length) await this.update(formulas.map((f) => ({ tab, row: f.row, col: f.col, value: f.value, formula: true })));
  }

  async ensureTabs(names) {
    const meta = await this.meta();
    const have = new Set(meta.sheets.map((s) => s.properties.title));
    const add = names.filter((n) => !have.has(n));
    if (add.length) await this.call("POST", `${API}/${this.id}:batchUpdate`, { requests: add.map((title) => ({ addSheet: { properties: { title } } })) });
    if (add.length) {
      // grids start at 1,000 rows x 26 columns; make room
      const m2 = await this.meta();
      return m2;
    }
    return meta;
  }

  /** Make sure a tab has at least n rows (writing below the last row of the grid is refused by the API). */
  async ensureRows(tab, n) {
    const meta = await this.meta();
    const sh = meta.sheets.find((x) => x.properties.title === tab);
    const have = sh?.properties.gridProperties?.rowCount || 0;
    if (sh && have < n) await this.call("POST", `${API}/${this.id}:batchUpdate`, { requests: [{ appendDimension: { sheetId: sh.properties.sheetId, dimension: "ROWS", length: n - have + 200 } }] });
  }

  async appendRow(tab, values) {
    await this.ensureTabs([tab]);
    await this.call("POST", `${API}/${this.id}/values/${encodeURIComponent(q(tab))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { values: [values] });
  }

  /** Layout: frozen header, widths, read-only column protection (warning), filters, validation, formats. */
  async setup(layout) {
    const meta = await this.ensureTabs(Object.keys(layout));
    const byTitle = Object.fromEntries(meta.sheets.map((s) => [s.properties.title, s]));
    const requests = [];
    for (const [tab, spec] of Object.entries(layout)) {
      const sh = byTitle[tab];
      const sheetId = sh.properties.sheetId;
      for (const pr of sh.protectedRanges || []) requests.push({ deleteProtectedRange: { protectedRangeId: pr.protectedRangeId } });
      for (let i = (sh.conditionalFormats || []).length - 1; i >= 0; i--) requests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
      // never shrink a tab (rows below the data may hold rows added since)
      const rowCount = Math.max(spec.rows + 200, 1000, sh.properties.gridProperties?.rowCount || 0);
      const columnCount = Math.max(spec.columns.length, 1);
      requests.push({ updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1, frozenColumnCount: spec.freezeCols ?? 1, rowCount, columnCount } }, fields: "gridProperties.frozenRowCount,gridProperties.frozenColumnCount,gridProperties.rowCount,gridProperties.columnCount" } });
      requests.push({ repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true }, backgroundColor: { red: 0.93, green: 0.93, blue: 0.93 }, wrapStrategy: "WRAP", verticalAlignment: "MIDDLE" } }, fields: "userEnteredFormat(textFormat,backgroundColor,wrapStrategy,verticalAlignment)" } });
      spec.columns.forEach((c, i) => {
        requests.push({ updateDimensionProperties: { range: { sheetId, dimension: "COLUMNS", startIndex: i, endIndex: i + 1 }, properties: { pixelSize: c.width || 140, hiddenByUser: !!c.hidden }, fields: "pixelSize,hiddenByUser" } });
        const range = { sheetId, startRowIndex: 1, startColumnIndex: i, endColumnIndex: i + 1 };
        if (c.editable) {
          // plain-text format: typed "+91…" or "2002" stay text; edited columns wrap and get a light background
          requests.push({ repeatCell: { range, cell: { userEnteredFormat: { numberFormat: { type: "TEXT" }, wrapStrategy: c.wrap ? "WRAP" : "CLIP", backgroundColor: { red: 1, green: 1, blue: 0.94 } } }, fields: "userEnteredFormat(numberFormat,wrapStrategy,backgroundColor)" } });
        } else {
          requests.push({ addProtectedRange: { protectedRange: { range: { sheetId, startColumnIndex: i, endColumnIndex: i + 1 }, description: `${c.header}: filled in by the website (read-only)`, warningOnly: true } } });
          requests.push({ repeatCell: { range, cell: { userEnteredFormat: { textFormat: { foregroundColor: { red: 0.35, green: 0.35, blue: 0.35 } }, wrapStrategy: "CLIP" } }, fields: "userEnteredFormat(textFormat,wrapStrategy)" } });
        }
        if (c.choices) requests.push({ setDataValidation: { range, rule: { condition: { type: "ONE_OF_LIST", values: c.choices.map((v) => ({ userEnteredValue: v })) }, strict: true, showCustomUi: true } } });
        for (const rule of c.rules || []) {
          requests.push({ addConditionalFormatRule: { index: 0, rule: { ranges: [range], booleanRule: { condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: rule.formula }] }, format: { backgroundColor: rule.color } } } } });
        }
      });
      // header row 1 also protected (warning)
      requests.push({ addProtectedRange: { protectedRange: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, description: "Header row (do not change)", warningOnly: true } } });
      requests.push({ setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, startColumnIndex: 0, endColumnIndex: spec.columns.length } } } });
    }
    for (let i = 0; i < requests.length; i += 400) await this.call("POST", `${API}/${this.id}:batchUpdate`, { requests: requests.slice(i, i + 400) });
  }
}
