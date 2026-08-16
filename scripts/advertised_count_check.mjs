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
import { readFileSync } from "fs";

const PORTAL = "portal/index.html";

/* ---------- what a visitor can actually open ------------------------------ */
export function openable(src) {
  const sats = [...src.matchAll(/\{nm:"([^"]+)",(.*?)\},?\n/g)];
  const natives = [...src.matchAll(/^\s*\["([a-z0-9-]+)","([^"]+)","([a-z]+)","([^"]*)"\]/gm)];
  /* beta:true is the dev gate. Those cards render but a stranger cannot open
     them, so they are catalog, not inventory. */
  const gated = sats.filter(m => /beta:true/.test(m[2])).length;
  return { total: sats.length + natives.length, gated,
           open: sats.length + natives.length - gated };
}

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

  const fake = `{nm:"A",url:"/satellites/a/",cat:"action"},\n` +
               `{nm:"B",url:"/satellites/b/",cat:"action",beta:true},\n` +
               `    ["c","C","puzzle","d"]\n`;
  const c = openable(fake);
  say(c.total === 3 && c.gated === 1 && c.open === 2,
      "counts total 3, gated 1, openable 2 (got " + c.total + "/" + c.gated + "/" + c.open + ")");

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
const c = openable(readFileSync(PORTAL, "utf8"));
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
