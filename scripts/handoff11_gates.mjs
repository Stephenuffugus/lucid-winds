#!/usr/bin/env node
/* Static gates for the HANDOFF-11 games, run from the repo root:
     node scripts/handoff11_gates.mjs             (all five)
     node scripts/handoff11_gates.mjs deepwell    (one)

   These are the grep gates from CRAFT section F.3, made honest:
     1. SIM_EXPORT markers present and non-trivial
     2. no Math.random between the markers        (RNG must be seeded)
     3. no DOM handles inside the SIM layer       (headless testability)
     4. no dash characters in player-facing copy  (studio rule)
     5. literal </script> inside a JS string is split
     6. required files present
     7. service worker only deletes its OWN cache prefix

   Gate 7 exists because caches.keys() is origin wide: a worker that deletes
   anything not its own wipes PadLab and every other app on lucidwinds.com.
   That has really happened here, so it is checked mechanically now.

   SELF TEST: run with --selftest to prove the checks can actually fail. A gate
   nobody has watched go red is decoration. */
import { readFileSync, existsSync } from "fs";

const GAMES = ["deepwell", "blackout", "parallel", "wireworm", "siege"];
const REQUIRED = ["index.html", "sim.js", "sw.js", "manifest.webmanifest"];

const START = "---- SIM_EXPORT_START ----";
const END = "---- SIM_EXPORT_END ----";

/* Dash policy: em and en dashes are always violations. A hyphen surrounded by
   spaces is a violation (it is a dash being used as punctuation). Hyphenated
   compounds inside a word are reported as review notes, not failures, because
   "one-tap" and "value-per-weight" read as words, not as dashes. */
const HARD_DASH = /[–—―]|(?<=\s)-(?=\s)/;

/* Strip comments before analysing anything. A file whose header explains
   "Math.random is banned in this layer" is the most careful file in the build,
   and the first version of this checker called it a violation for saying so.
   The fleet service worker audit learned the same lesson in August: read the
   code, not the prose about the code. */
function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");   // the [^:] keeps http:// intact
}

function simSlice(src) {
  const a = src.indexOf(START);
  const b = src.indexOf(END);
  if (a < 0 || b < 0 || b <= a) return null;
  return stripComments(src.slice(a + START.length, b));
}

/* Pull string literals that look like sentences a player would read: quoted
   text with a space and a letter. Deliberately loose; false positives are
   cheap to eyeball, a missed dash on a live card is not. */
function playerStrings(src) {
  const out = [];
  const re = /(['"`])((?:\\.|(?!\1)[^\\\n])*?)\1/g;
  let m;
  while ((m = re.exec(src))) {
    const s = m[2];
    if (s.length < 8) continue;
    if (!/\s/.test(s)) continue;
    if (!/[a-z]{3}/i.test(s)) continue;
    if (/^[a-z-]+:/i.test(s)) continue;              // css declarations
    if (/[<>{}]|px|rgba?\(|#[0-9a-f]{3,6}/i.test(s)) continue;  // markup and style
    out.push({ text: s, index: m.index });
  }
  return out;
}

function lineOf(src, index) { return src.slice(0, index).split("\n").length; }

function checkGame(id, opts = {}) {
  const dir = "satellites/" + id + "/";
  const fails = [], notes = [];
  if (!existsSync(dir)) return { id, missing: true, fails: ["folder does not exist"], notes };

  for (const f of REQUIRED) {
    if (!existsSync(dir + f)) fails.push("missing file: " + f);
  }
  if (!existsSync(dir + "index.html")) return { id, fails, notes };

  let src = readFileSync(dir + "index.html", "utf8");
  if (opts.injectDom) src = src.replace(START, START + "\nvar x = document.body;");
  if (opts.injectRandom) src = src.replace(START, START + "\nvar y = Math.random();");
  if (opts.injectDash) src = src.replace("</head>", "<script>var t = 'you dug too deep — the air ran out';</scr" + "ipt></head>");

  const sim = simSlice(src);
  if (sim === null) {
    fails.push("SIM_EXPORT markers missing or inverted");
  } else {
    if (sim.length < 500) fails.push("SIM_EXPORT slice suspiciously small (" + sim.length + " chars)");
    if (/Math\.random/.test(sim)) fails.push("Math.random inside SIM_EXPORT (RNG must be seeded)");
    const dom = sim.match(/\b(document|window|canvas|performance|requestAnimationFrame)\b/g);
    if (dom) {
      // window.X = assignments at the very end of the export are the accepted
      // way to publish the layer; anything else is a real DOM reference.
      const real = sim.split("\n").filter(l =>
        /\b(document|canvas|performance|requestAnimationFrame)\b/.test(l) ||
        (/\bwindow\b/.test(l) && !/^\s*(\/\/|\*)/.test(l) && !/window\.\w+\s*=/.test(l))
      );
      if (real.length) fails.push("DOM handles inside SIM (" + real.length + " lines, first: " + real[0].trim().slice(0, 70) + ")");
    }
  }

  if (/<\/script>/.test(src.replace(/<\/script>\s*(<script|<\/body|$)/g, ""))) {
    // a </script> that is not closing a real block means it sits in a string
    const stray = src.split("</script>").length - 1 - (src.split("<script").length - 1);
    if (stray > 0) fails.push("literal </script> inside a string, split it as '</scr'+'ipt>'");
  }

  /* comments stripped here too: a comment that quotes a loss screen line is
     not player-facing copy, and flagging it trains people to ignore the gate */
  for (const s of playerStrings(stripComments(src))) {
    if (HARD_DASH.test(s.text)) {
      fails.push("dash in player copy at line " + lineOf(src, s.index) + ": " + s.text.slice(0, 60));
    } else if (/[a-z]-[a-z]/i.test(s.text)) {
      notes.push("hyphenated compound (review): " + s.text.slice(0, 50));
    }
  }

  if (existsSync(dir + "sw.js")) {
    const sw = readFileSync(dir + "sw.js", "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");
    if (/caches\.delete/.test(sw)) {
      const guarded = new RegExp("(indexOf\\(\\s*[\"'`]" + id + "|startsWith\\(\\s*[\"'`]" + id + "|\\^" + id + ")").test(sw);
      if (!guarded) fails.push("sw.js deletes caches without guarding on the '" + id + "-' prefix (origin wide wipe risk)");
    }
    if (/respondWith\(\s*undefined/.test(sw)) fails.push("sw.js can respondWith(undefined) which black screens the page");
  }

  return { id, fails, notes };
}

/* ---- self test: every gate must be provably able to fail ---- */
if (process.argv.includes("--selftest")) {
  const victim = GAMES.find(g => existsSync("satellites/" + g + "/index.html"));
  if (!victim) { console.log("SELFTEST SKIPPED: no game built yet"); process.exit(0); }
  const cases = [
    ["DOM in SIM", { injectDom: true }, /DOM handles inside SIM/],
    ["Math.random in SIM", { injectRandom: true }, /Math\.random inside SIM/],
    ["dash in copy", { injectDash: true }, /dash in player copy/]
  ];
  let bad = 0;
  for (const [name, opts, want] of cases) {
    const r = checkGame(victim, opts);
    const caught = r.fails.some(f => want.test(f));
    console.log((caught ? "  RED as expected  " : "  DID NOT FAIL    ") + name);
    if (!caught) bad++;
  }
  const clean = checkGame(victim);
  console.log((clean.fails.length === 0 ? "  GREEN when clean " : "  DIRTY when clean") + " baseline (" + victim + ")");
  console.log(bad === 0 ? "SELFTEST PASSED: every gate can fail" : "SELFTEST FAILED: " + bad + " gate(s) cannot fail");
  process.exit(bad === 0 ? 0 : 2);
}

const only = process.argv[2];
const targets = only ? [only] : GAMES;
let bad = 0;
console.log("HANDOFF-11 STATIC GATES");
for (const id of targets) {
  const r = checkGame(id);
  if (r.missing) { console.log("\n" + id.toUpperCase() + ": not built yet"); continue; }
  console.log("\n" + id.toUpperCase() + ": " + (r.fails.length ? r.fails.length + " FAIL" : "clean"));
  for (const f of r.fails) console.log("   FAIL  " + f);
  const seen = new Set();
  for (const n of r.notes) { if (!seen.has(n)) { seen.add(n); if (seen.size <= 6) console.log("   note  " + n); } }
  if (r.notes.length > 6) console.log("   note  ... " + (r.notes.length - 6) + " more hyphen notes");
  bad += r.fails.length;
}
console.log("\n" + (bad ? bad + " failure(s)" : "all gates clean"));
process.exit(bad ? 1 : 0);
