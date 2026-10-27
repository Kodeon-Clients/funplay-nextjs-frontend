/**
 * FunPlay website content sheet: "Website" menu and edit marks.
 *
 * Install: in the sheet, Extensions > Apps Script, replace Code.gs with this file, save.
 * Project Settings > Script properties:
 *   GITHUB_REPO    owner/name of the website repository, e.g. kodeon/funplay-website
 *   GITHUB_TOKEN   a fine-grained GitHub token for that repository only, permission "Actions: Read and write"
 * Reload the sheet and choose Website > Check my edits once to grant access.
 */

var TABS = {
  Pages: ["Title", "Meta description", "H1", "Index", "Canonical URL", "OG title (blank = title)", "OG description (blank = meta description)", "OG image"],
  Images: ["Alt text (blank = keep the alt text on each page)", "Replace with (image path)"],
  Content: ["Text"],
};
var EDITED = "Edited, not published yet";
var WORKFLOW = "content-sheet.yml";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Website")
    .addItem("Check my edits", "checkEdits")
    .addSeparator()
    .addItem("Publish to preview", "publishPreview")
    .addItem("Publish live", "publishLive")
    .addSeparator()
    .addItem("Show unpublished edits", "showEdited")
    .addItem("Open publish log", "openLog")
    .addToUi();
}

/** Mark rows whose editable cells were changed (cleared again when they are published). */
function onEdit(e) {
  var sh = e.range.getSheet();
  var cols = TABS[sh.getName()];
  if (!cols || e.range.getRow() < 2) return;
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  var status = header.indexOf("Status") + 1;
  if (!status) return;
  var touched = false;
  for (var c = e.range.getColumn(); c < e.range.getColumn() + e.range.getNumColumns(); c++) {
    if (cols.indexOf(String(header[c - 1])) >= 0) touched = true;
  }
  if (!touched) return;
  sh.getRange(e.range.getRow(), status, e.range.getNumRows(), 1).setValue(EDITED);
}

function edited_() {
  var out = [];
  Object.keys(TABS).forEach(function (name) {
    var sh = SpreadsheetApp.getActive().getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    var data = sh.getDataRange().getDisplayValues();
    var h = data[0];
    var st = h.indexOf("Status");
    for (var r = 1; r < data.length; r++) {
      if (data[r][st] === EDITED) out.push({ tab: name, row: r + 1, values: data[r], header: h });
    }
  });
  return out;
}

/** Quick checks on edited rows (the publish job checks everything again). */
function checkEdits() {
  var rows = edited_();
  var problems = [];
  var col = function (x, name) { return x.values[x.header.indexOf(name)]; };
  rows.forEach(function (x) {
    var where = x.tab + " row " + x.row + ": ";
    if (x.tab === "Pages") {
      var t = col(x, "Title"), d = col(x, "Meta description"), h1 = col(x, "H1"), ix = col(x, "Index");
      if (!t.trim()) problems.push("✗ " + where + "title is empty");
      else if (t.length > 65) problems.push("! " + where + "title is " + t.length + " characters (about 60 show in Google)");
      if (ix !== "noindex" && !d.trim()) problems.push("✗ " + where + "meta description is empty");
      else if (d.length > 160) problems.push("! " + where + "meta description is " + d.length + " characters (about 155 show)");
      if (!h1.trim()) problems.push("✗ " + where + "H1 is empty");
      if (ix !== "index" && ix !== "noindex") problems.push("✗ " + where + 'Index must be "index" or "noindex"');
      if (h1) checkFormat_(h1, where + "H1", problems);
    } else if (x.tab === "Content") {
      var text = col(x, "Text");
      if (!text.trim()) problems.push("✗ " + where + "text is empty");
      if (col(x, "Format") !== "plain text") checkFormat_(text, where, problems);
    } else if (x.tab === "Images") {
      var alt = col(x, "Alt text (blank = keep the alt text on each page)");
      if (alt.length > 150) problems.push("! " + where + "alt text is " + alt.length + " characters (keep under about 125)");
      var rep = col(x, "Replace with (image path)");
      if (rep && rep.charAt(0) !== "/") problems.push("✗ " + where + "replacement must look like /images/name.jpg");
    }
    if (x.values.join(" ").indexOf("—") >= 0) problems.push("! " + where + "contains an em dash (—)");
  });
  var msg = rows.length + " edited row(s). " + (problems.length ? "\n\n" + problems.join("\n") + "\n\n✗ = must be fixed before publishing, ! = check" : "No problems found.");
  SpreadsheetApp.getUi().alert("Check my edits", msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function checkFormat_(s, where, problems) {
  var bold = (s.replace(/\\\*/g, "").match(/\*\*/g) || []).length;
  if (bold % 2) problems.push("✗ " + where + ": ** is opened but not closed");
  var open = (s.replace(/\\\[/g, "").match(/\[/g) || []).length;
  var links = (s.match(/\]\([^\s()]+\)/g) || []).length;
  if (open !== links) problems.push("✗ " + where + ": a link must look like [text](/address)");
}

function publishPreview() { publish_("preview"); }
function publishLive() {
  var ui = SpreadsheetApp.getUi();
  var n = edited_().length;
  var ok = ui.alert("Publish live", n + " edited row(s) will go live on funplaysystems.com in about 15 minutes. Continue?", ui.ButtonSet.OK_CANCEL);
  if (ok === ui.Button.OK) publish_("live");
}

function publish_(target) {
  var p = PropertiesService.getScriptProperties();
  var repo = p.getProperty("GITHUB_REPO"), token = p.getProperty("GITHUB_TOKEN");
  if (!repo || !token) {
    SpreadsheetApp.getUi().alert("Publishing is not set up yet: GITHUB_REPO and GITHUB_TOKEN are missing in the script properties (see docs/CONTENT-SHEET.md).");
    return;
  }
  var res = UrlFetchApp.fetch("https://api.github.com/repos/" + repo + "/actions/workflows/" + WORKFLOW + "/dispatches", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json" },
    payload: JSON.stringify({ ref: "main", inputs: { target: target } }),
    muteHttpExceptions: true,
  });
  if (res.getResponseCode() === 204) {
    SpreadsheetApp.getActive().toast(
      target === "live"
        ? "Publishing started. The result appears in the Publish log in about 2 minutes; the site updates about 15 minutes later."
        : "Preview started. The result appears in the Publish log in about 2 minutes; the preview link works about 15 minutes later.",
      "Website", 15);
  } else {
    SpreadsheetApp.getUi().alert("Could not start publishing (" + res.getResponseCode() + "): " + res.getContentText().slice(0, 300));
  }
}

function showEdited() {
  var rows = edited_();
  SpreadsheetApp.getUi().alert("Unpublished edits", rows.length ? rows.map(function (x) { return x.tab + " row " + x.row + ": " + x.values[0]; }).slice(0, 60).join("\n") : "None.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function openLog() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Publish log");
  if (sh) SpreadsheetApp.getActive().setActiveSheet(sh).setActiveRange(sh.getRange(Math.max(2, sh.getLastRow()), 1));
}
