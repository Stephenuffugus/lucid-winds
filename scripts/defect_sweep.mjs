#!/usr/bin/env node
/* SWEEP THE STANDING DEFECT CLASSES ACROSS EVERY SATELLITE.
     node scripts/defect_sweep.mjs            report, exits 1 if anything is found
     node scripts/defect_sweep.mjs --selftest  proves every detector can fire AND stay quiet

   The nine classes live in incoming/FLEET-AUDIT-COVERAGE.md. Five of them are
   mechanically detectable from source and those are the ones here. The other
   four (a stated promise that is not true, an overlay covering a control, touch
   targets as RENDERED px, two-tab clobber semantics) need a browser or a human
   reading the copy, and pretending otherwise would be worse than not checking.

   ⛔ EVERY HIT IS A CANDIDATE, NOT A DEFECT. Today this project produced six
   false positives from checkers in one session, including 19 games "blocked"
   for a pinch gesture they were actually SUPPRESSING. Nothing here gets fixed
   until it has been opened and confirmed by hand. The value is narrowing 40
   games to a handful of places to look, not issuing verdicts.
*/
import { readFileSync, existsSync, readdirSync } from "fs";

/* strip comments and string bodies before analysing: a `//` inside a URL and the
   word "window" inside a clue about a house have both cost real time here. */
function strip(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, " ")
          .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1")
          .replace(/(['"`])((?:\\.|(?!\1)[^\\\n])*?)\1/g, (m, q) => q + q);
}

const CLASSES = [
  { id: "exit-gated-on-frame", why: "exit affordance only renders when framed, and the portal navigates top level for /satellites/",
    test: c => /window\.parent\s*!==\s*window|parent\s*!=\s*window|self\s*!==\s*top/.test(c) && !/document\.referrer/.test(c) },
  { id: "parse-without-validation", why: "try/catch around JSON.parse is not validation; anything that merely parses is truthy",
    /* ⛔ The guard pattern must survive strip(), which blanks string BODIES. An
       earlier version looked for `typeof x !== "object"` and never matched,
       because by then the literal was `""`. Match the shape, not the word. */
    test: c => /JSON\.parse/.test(c) && !/Array\.isArray|typeof\s+\w+\s*[!=]==?\s*['"]|\w+\s*&&\s*typeof/.test(c) },
  { id: "empty-catch", why: "a swallowed error shows the player something plausible while the real thing failed",
    test: c => (c.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) || []).length >= 3 },
  { id: "img-without-onerror", why: "a missing image fails silently and leaves a hole where art should be",
    test: c => /<img[^>]+src=/.test(c) && !/onerror/.test(c) },
  { id: "fetch-without-ok-check", why: "fetch does not reject on 404 or 500, so .catch() alone is not error handling",
    test: c => /fetch\s*\(/.test(c) && !/\.ok\b|status\s*[<>=]/.test(c) }
];

/* CLASS 9, the one that has paid out most: a stated promise that is not true.
   The systemic version in this project is a game whose own copy promises the
   player Sunbeams while nothing in it can ever award one, because it was built
   to a brief that had gone stale. That is mechanically checkable: if the VISIBLE
   copy says you earn, then the SDK has to load, init has to run, and something
   has to actually call the earn path. Absence of any one is the finding. */
function earnPromiseBroken(rawFull) {
  const copy = rawFull.replace(/<script[\s\S]*?<\/script>/gi, " ")
                      .replace(/<style[\s\S]*?<\/style>/gi, " ")
                      .replace(/<!--[\s\S]*?-->/g, " ");
  const promises = /sunbeam/i.test(copy) && /\bearn|\bcollect|for your garden/i.test(copy);
  if (!promises) return null;
  /* ⛔ The SDK arrives two ways and this originally only knew one. A literal
     <script src> tag, OR a dynamically injected one: `var sc=createElement
     ('script'); sc.src='/sunbeam-sdk.js?v=7'`. Checking only for the tag called
     garden-td and pong broken when both load it correctly and init on load. */
  const loadsSdk = /<script[^>]+src="[^"]*sunbeam-sdk\.js/i.test(rawFull)
                || /\.src\s*=\s*['"][^'"]*sunbeam-sdk\.js/i.test(rawFull);
  const inits    = /Sunbeam\.init\s*\(/.test(rawFull);
  const awards   = /_sbCapEarn\s*\(|Sunbeam\.earn\s*\(/.test(rawFull);
  const missing = [];
  if (!loadsSdk) missing.push("no sunbeam-sdk.js");
  if (!inits)    missing.push("never calls Sunbeam.init");
  if (!awards)   missing.push("never calls an earn path");
  return missing.length ? missing.join(", ") : null;
}

/* dashes in player copy: class 7, a hard studio rule. Only VISIBLE text counts.
   ⛔ The first version scanned the whole file for text between > and <, which in
   a single-file game means it scanned the JavaScript too, because `a > b` and
   `x < y` look exactly like tags. 38 of its 40 hits were code and comments. Cut
   the script and style blocks out first; a dash in a comment is not player copy. */
function dashesInCopy(rawFull) {
  const raw = rawFull.replace(/<script[\s\S]*?<\/script>/gi, " ")
                     .replace(/<style[\s\S]*?<\/style>/gi, " ")
                     .replace(/<!--[\s\S]*?-->/g, " ");
  const hits = [];
  for (const m of raw.matchAll(/>([^<>]{12,220})</g)) {
    const t = m[1].trim();
    if (!/[—–]|\s-\s/.test(t)) continue;
    if (/^\s*[\d.,\s\-–—:]+$/.test(t)) continue;      /* number ranges are not copy */
    hits.push(t.replace(/\s+/g, " ").slice(0, 62));
  }
  return hits;
}

if (process.argv.includes("--selftest")) {
  let bad = 0;
  const say = (ok, m) => { console.log((ok ? "  ok   " : "  FAIL ") + m); if (!ok) bad++; };
  const T = [
    ["exit-gated-on-frame", `if(window.parent !== window){showExit();}`, `if(window.parent!==window||document.referrer){showExit();}`],
    ["parse-without-validation", `var s=JSON.parse(raw);use(s);`, `var s=JSON.parse(raw); if(!s||typeof s!=="object")return;`],
    ["empty-catch", `try{a()}catch(e){}try{b()}catch(e){}try{c()}catch(e){}`, `try{a()}catch(e){log(e)}`],
    ["img-without-onerror", `<img src="a.png">`, `<img src="a.png" onerror="this.remove()">`],
    ["fetch-without-ok-check", `fetch(u).then(r=>r.json())`, `fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()})`]
  ];
  for (const [id, fires, quiet] of T) {
    const c = CLASSES.find(x => x.id === id);
    say(c.test(strip(fires)) === true, id + " fires on a real case");
    say(c.test(strip(quiet)) === false, id + " stays quiet on a guarded case");
  }
  say(dashesInCopy(`<p>a long sentence — with an em dash in it here</p>`).length === 1, "dash check finds an em dash in copy");
  say(dashesInCopy(`<p>the score range is 10-20 across all of the levels</p>`).length === 0, "dash check ignores a number range");
  /* ⛔ the reason strip() exists at all */
  say(CLASSES[0].test(strip(`// window.parent !== window is the old way\nshowExit();`)) === false,
      "a COMMENT describing the pattern is not the pattern");
  say(CLASSES[0].test(strip(`var s="window.parent !== window";`)) === false,
      "the pattern inside a STRING is not the pattern");
  const promisesButCannot = `<p>Clear grounds to earn Sunbeams for your garden.</p>`;
  const promisesAndDoes = promisesButCannot +
    `<script src="/sunbeam-sdk.js?v=7"></script><script>Sunbeam.init({gameId:"x"});_sbCapEarn(3,"x:clear");</script>`;
  say(earnPromiseBroken(promisesButCannot) !== null, "class 9 fires when copy promises Sunbeams and nothing awards");
  say(earnPromiseBroken(promisesAndDoes) === null, "class 9 stays quiet when the SDK loads, inits and awards");
  say(earnPromiseBroken(`<p>Just pop honey and relax.</p>`) === null, "class 9 ignores a game that promises nothing");
  /* ⛔ regression guard: garden-td and pong inject the SDK instead of tagging it */
  const injects = promisesButCannot +
    `<script>var sc=document.createElement('script'); sc.src='/sunbeam-sdk.js?v=7';
     sc.onload=function(){Sunbeam.init({gameId:'x'})}; _sbCapEarn(1,'x');</script>`;
  say(earnPromiseBroken(injects) === null, "class 9 accepts a DYNAMICALLY injected SDK, not just a script tag");
  console.log(bad ? "\nSELFTEST FAILED: " + bad : "\nSELFTEST PASSED: every detector fires and can stay quiet");
  process.exit(bad ? 2 : 0);
}

/* ---------- run ----------------------------------------------------------- */
const only = process.argv.slice(2).filter(a => !a.startsWith("--"));
const dirs = readdirSync("satellites", { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync("satellites/" + d.name + "/index.html"))
  .map(d => d.name)
  .filter(n => !only.length || only.includes(n));

let total = 0;
const rows = [];
for (const d of dirs) {
  const raw = readFileSync("satellites/" + d + "/index.html", "utf8");
  const code = strip(raw);
  const hits = CLASSES.filter(c => c.test(code)).map(c => c.id);
  const dashes = dashesInCopy(raw);
  if (dashes.length) hits.push("dashes-in-copy(" + dashes.length + ")");
  const broke = earnPromiseBroken(raw);
  if (broke) hits.push("EARN-PROMISE-BROKEN: " + broke);
  if (hits.length) { rows.push({ d, hits, dashes, lines: raw.split("\n").length }); total += hits.length; }
}

/* ⛔ A class that fires on nearly every game is measuring the house style, not
   a defect, and printing it beside a real finding buries the real finding. Rate
   them and say plainly which ones discriminate. `empty-catch` hits 99 of 100
   here; that is a fact about how this codebase is written, not 99 bugs. */
const rate = {};
for (const c of CLASSES) rate[c.id] = rows.filter(r => r.hits.includes(c.id)).length;
const noisy = id => rate[id] !== undefined && rate[id] > dirs.length * 0.30;

rows.sort((a, b) => b.hits.length - a.hits.length);
console.log("DEFECT SWEEP  " + dirs.length + " satellites\n");

console.log("CLASS RATES");
for (const c of CLASSES) {
  const n = rate[c.id] || 0;
  console.log("  " + String(n).padStart(3) + "/" + dirs.length + "  " + c.id.padEnd(26) +
    (n === 0 ? "clean fleet wide" : noisy(c.id) ? "TOO COMMON TO ACT ON — house style, not a defect" : "worth opening"));
}
const dashN = rows.filter(r => r.dashes.length).length;
console.log("  " + String(dashN).padStart(3) + "/" + dirs.length + "  dashes-in-copy" + " ".repeat(15) +
  (dashN ? "worth opening" : "clean fleet wide"));

const act = rows.map(r => ({ d: r.d, hits: r.hits.filter(h => !noisy(h.replace(/\(.*/, ""))) }))
                .filter(r => r.hits.length);
console.log("\nACTIONABLE (" + act.length + " satellites)");
if (!act.length) console.log("  nothing outside the house-wide patterns");
for (const r of act) console.log("  " + r.d.padEnd(26) + r.hits.join("  ·  "));
if (rows.some(r => r.dashes.length)) {
  console.log("\nDASH CANDIDATES (class 7, verify each is really player copy):");
  for (const r of rows.filter(x => x.dashes.length)) for (const t of r.dashes.slice(0, 3))
    console.log("  " + r.d.padEnd(22) + '"' + t + '"');
}
console.log("\n⛔ Candidates, not defects. Open each before believing it.");
/* Exit on what is ACTIONABLE, not on the raw total. Gating on `total` would mean
   the house-wide patterns keep this red forever, and a gate that can never go
   green is decoration that teaches people to ignore it. */
process.exit(act.length ? 1 : 0);
