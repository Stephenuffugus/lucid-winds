#!/usr/bin/env node
/* DOES THE ARCADE ADVERTISE A NUMBER IT CAN BACK UP?
     node scripts/advertised_count_check.mjs             exits 1 if any claim is wrong
     node scripts/advertised_count_check.mjs --selftest   proves it can fail

   WHY THIS EXISTS
   The catalog grows every week and the number in the copy does not. On
   2026-08-16 the tab title, the search description, both social cards and the
   PWA manifest all still said 140+ while the catalog held 183. That title is
   the line Google prints in search results and that manifest becomes the Meta
   Horizon Store listing, so the studio was selling itself short by forty games
   in the two places it could least afford to.

   ⛔⛔ THE TRAP, AND I FELL IN IT. The obvious fix is to advertise the total.
   It is wrong. 22 of 183 are dev gated behind the tester passcode, so a
   stranger can open 161. Advertising 183 is the same defect as every "its own
   copy is not true" bug found this week, just pointing the other way. The
   number in player-facing copy is what a VISITOR CAN OPEN, and nothing else.
   I "fixed" the hero from 160+ to 180+ before checking, and the hero had been
   right all along: it was written when the catalog was 161.

   So this checks two things, and the second one is the point:
     the claim is not STALE     it has not fallen behind the openable count
     the claim is not INFLATED  it never promises more than a visitor can play
*/
import { readFileSync, writeFileSync, unlinkSync } from "fs";

const PORTAL = "portal/index.html";

/* ⛔⛔ This used to count with its own regex over the portal, and that regex was
   WRONG: the GAMES rows carry 4, 5 or 7 fields and it hardcoded 4, so longer
   rows silently vanished. It reported 161 openable when the true figure is 162,
   and 183 carded when the true figure is 186. A regex that misses rows does not
   error, it just returns a smaller number that looks correct.
   Counting now lives in exactly one place, scripts/catalog.mjs, which parses the
   arrays instead of matching them. Never reintroduce a local count here. */
import { catalog } from "./catalog.mjs";

/* Every place a number is promised to a person. Add to this list, never prune it. */
const CLAIM = /\b(\d{2,4})\s*\+\s*(?:free\s+)?(?:browser\s+)?games?\b/gi;

function claims(files) {
  const out = [];
  for (const f of files) {
    let src;
    try { src = readFileSync(f, "utf8"); } catch (e) { continue; }
    for (const m of src.matchAll(CLAIM)) {
      const line = src.slice(0, m.index).split("\n").length;
      out.push({ file: f, line, n: +m[1], text: m[0] });
    }
  }
  return out;
}

/* ---------- selftest ------------------------------------------------------ */
if (process.argv.includes("--selftest")) {
  let bad = 0;
  const say = (ok, msg) => { console.log((ok ? "  ok   " : "  FAIL ") + msg); if (!ok) bad++; };

  /* ⛔ The counting is exercised against a real fixture file, because the whole
     class of bug being guarded against is a row shape the reader does not expect.
     Note the 5 and 7 field rows: those are exactly what the old regex dropped. */
  const fx = "/tmp/lw_catalog_fixture.html";
  writeFileSync(fx, [
    'var FEATURED = [',
    '  {nm:"A",url:"/satellites/a/",cat:"action"},',
    '  {nm:"B",url:"/satellites/b/",cat:"action",beta:true}',
    '];',
    'var GAMES = [',
    '  ["c","C","puzzle","a four field row"],',
    '  ["d","D","puzzle","a five field row","soon"],',
    '  ["e","E","puzzle","a seven field row","","x","y"]',
    '];'
  ].join("\n"));
  const c = catalog(fx);
  say(c.total === 5, "counts all 5 entries including the 5 and 7 field rows (got " + c.total + ")");
  say(c.gated === 2, "counts both a beta satellite and a soon game as gated (got " + c.gated + ")");
  say(c.open === 3, "openable is 3 (got " + c.open + ")");
  say(c.nat.length === 3, "does not drop the long native rows (got " + c.nat.length + " of 3)");
  unlinkSync(fx);

  const found = claims([]).length;
  say(found === 0, "no files means no claims");

  /* the regex has to catch every shape the copy actually uses */
  for (const s of ["160+ free games", "180+ free browser games", "160+ games free"]) {
    const hit = [...s.matchAll(CLAIM)];
    say(hit.length === 1, "matches the shape \"" + s + "\"");
  }
  /* ⛔ and must NOT fire on things that are not a catalog claim */
  for (const s of ["1443+ assertions", "a 60+ second clock"]) {
    const hit = [...s.matchAll(CLAIM)];
    say(hit.length === 0, "ignores \"" + s + "\"");
  }
  console.log(bad ? "\nSELFTEST FAILED: " + bad : "\nSELFTEST PASSED");
  process.exit(bad ? 2 : 0);
}

/* ---------- run ----------------------------------------------------------- */
const c = catalog(PORTAL);
const found = claims([PORTAL, "support.html", "portal/manifest.webmanifest"]);

console.log("catalog: " + c.total + " carded, " + c.gated + " dev gated, " +
            "\x1b[1m" + c.open + " a visitor can open\x1b[0m\n");

let bad = 0;
for (const k of found) {
  const inflated = k.n > c.open;
  /* stale = the copy has fallen more than a rounding step behind reality */
  const stale = k.n + 10 <= c.open;
  const verdict = inflated ? "INFLATED, a visitor can only open " + c.open
                : stale    ? "STALE, " + c.open + " are openable now"
                : "ok";
  if (verdict !== "ok") bad++;
  console.log("  " + (verdict === "ok" ? "ok   " : "BAD  ") +
    (k.file + ":" + k.line).padEnd(34) + k.text.padEnd(24) + verdict);
}

if (bad) {
  console.log("\n\x1b[31m" + bad + " claim(s) the arcade cannot back up.\x1b[0m");
  console.log("Advertise what a VISITOR CAN OPEN (" + c.open + "), never the carded total (" + c.total + ").");
  process.exit(1);
}
console.log("\nall " + found.length + " advertised counts are true");
