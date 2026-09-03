#!/usr/bin/env node
/* GATE FOR THE 3D AND VR AUDIT.
     node scripts/vr_audit_check.mjs

   docs/3d-vr-audit.json is the source of truth for the audit and
   docs/3D-VR-AUDIT.md is generated from it, so the only thing that can go
   wrong quietly is the JSON: a row dropped, a field blanked, a lane invented.
   This asserts the three things a reader would otherwise have to trust.

     1. every catalog row is judged. The count comes from scripts/catalog.mjs,
        never from a regex and never from a number typed in here, because the
        catalog grew from 186 to 187 between the VR plan being written and this
        audit and a hardcoded total would have hidden that.
     2. every row carries lane, route, effort and comfort, and a cite or the
        word UNREAD. A row with no cite and no UNREAD is a guess wearing a
        verdict, which is the one thing this audit is not allowed to contain.
     3. every lane, route, effort and comfort value is a word from section 4 of
        HANDOFF-3D-VR.md. The vocabulary is binding; a synonym that creeps in
        ("SEATED", "PORT", "MEDIUM") makes the table unsortable and the counts
        wrong, and nothing else would catch it.

   ⛔ Watched to fail before it was trusted: blanking one row's `comfort` and
   one row's `cite`, dropping a row, and writing `lane:"SEATED"`, each red on
   its own line. */
import { readFileSync } from "fs";
import { catalog } from "./catalog.mjs";

const JSON_PATH = "docs/3d-vr-audit.json";

/* Section 4 of HANDOFF-3D-VR.md, verbatim. */
export const LANES    = ["WINDOW", "TABLETOP", "STANDING", "NEVER-IMMERSIVE"];
export const ROUTES   = ["PRERENDER", "RIDE", "SKIN", "NONE"];
export const EFFORTS  = ["S", "M", "L"];
export const COMFORTS = ["SAFE", "CARE", "HAZARD"];
export const FIELDS   = ["name", "url", "kind", "gated", "renderer", "split", "camera",
                         "cite", "input", "area", "lane", "route", "effort", "comfort",
                         "hands", "notes"];

export function check(jsonPath = JSON_PATH) {
  const rows = JSON.parse(readFileSync(jsonPath, "utf8"));
  const c = catalog();
  const fails = [];
  const bad = (m) => fails.push(m);

  if (!Array.isArray(rows)) { bad("the audit is not an array"); return fails; }

  /* 1. one row per catalog row, by name, no extras and no gaps */
  if (rows.length !== c.total)
    bad(`row count ${rows.length} does not equal catalog().total ${c.total}`);
  const seen = new Set(), catNames = c.all.map(g => g.name);
  for (const r of rows) {
    if (seen.has(r.name)) bad(`duplicate row: ${r.name}`);
    seen.add(r.name);
  }
  for (const n of catNames) if (!seen.has(n)) bad(`catalog row missing from the audit: ${n}`);
  for (const r of rows) if (!catNames.includes(r.name)) bad(`audit row is not in the catalog: ${r.name}`);

  /* 2 and 3. every field present, every word from the list */
  for (const r of rows) {
    const at = `${r.name}: `;
    for (const f of FIELDS)
      if (!(f in r)) bad(at + `missing field \`${f}\``);
    for (const [f, list] of [["lane", LANES], ["route", ROUTES], ["effort", EFFORTS], ["comfort", COMFORTS]]) {
      if (!r[f]) { bad(at + `\`${f}\` is empty`); continue; }
      if (!list.includes(r[f])) bad(at + `\`${f}\` is "${r[f]}", not one of ${list.join(", ")}`);
    }
    for (const f of ["renderer", "split", "camera", "input", "area", "hands", "notes"])
      if (f in r && !String(r[f] || "").trim()) bad(at + `\`${f}\` is blank`);
    const cite = String(r.cite || "").trim();
    if (!cite) bad(at + "no cite and no UNREAD");
    else if (!/^UNREAD\b/.test(cite) && !/[^\s:]+:\d+/.test(cite))
      bad(at + `cite "${cite}" is neither a file:line nor UNREAD`);
    /* an UNREAD row must say why, in the cite itself */
    if (/^UNREAD$/.test(cite)) bad(at + "UNREAD with no reason");
  }
  return fails;
}

/* ⛔ ONLY WHEN RUN AS THE GATE. This file exports the word lists, and
   scripts/vr_audit_md.mjs imports them; without this guard the import would
   run the check and could exit the generator. That is exactly the defect
   found in scripts/quest_triage.mjs this morning, where catalog.mjs ran its
   selftest at import time and the triage gate never reached its own. Once is
   a bug, twice would be a habit. */
if (import.meta.url !== "file://" + process.argv[1]) {
  /* imported for the vocabulary only */
} else {
const fails = check();
if (fails.length) {
  console.log("VR AUDIT CHECK FAILED\n");
  for (const f of fails) console.log("  FAIL " + f);
  console.log(`\n${fails.length} problem${fails.length === 1 ? "" : "s"}`);
  process.exit(1);
}
const rows = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const c = catalog();
const tally = (f, list) => list.map(v => v + " " + rows.filter(r => r[f] === v).length).join(" · ");
console.log(`VR AUDIT CHECK PASSED   ${rows.length} rows, catalog().total ${c.total}`);
console.log("  lane     " + tally("lane", LANES));
console.log("  route    " + tally("route", ROUTES));
console.log("  effort   " + tally("effort", EFFORTS));
console.log("  comfort  " + tally("comfort", COMFORTS));
console.log("  UNREAD   " + rows.filter(r => /^UNREAD\b/.test(r.cite)).length);
}
