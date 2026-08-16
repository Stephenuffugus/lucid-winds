#!/usr/bin/env node
/* Which service workers on this origin delete caches that are not theirs?

   caches.keys() is ORIGIN-wide. Every app on lucidwinds.com shares one cache
   namespace, so an activate handler that deletes "everything that is not my
   current version" takes the whole fleet offline the first time anyone opens
   it. This fleet has been black screened by exactly that, and Hush arrived
   with the same bug on 2026-08-16.

   This reads every worker in the repo and reports how each one decides what to
   delete. It is a static read, so it is a shortlist to look at rather than a
   verdict: anything flagged gets opened by a human.

     node scripts/sw_purge_audit.js */
"use strict";
const fs = require("fs");
const { execSync } = require("child_process");

const files = execSync(
  "find . -name 'sw*.js' -not -path './node_modules/*' -not -path './.git/*' " +
  "-not -path '*/node_modules/*' -not -path './scripts/*' -not -path './sim/*' " +
  "-not -path './incoming/*' | sort"
).toString().trim().split("\n").filter(Boolean);

/* Strip comments before reading anything. Several of these workers carry a
   header explaining the origin-wide bug, so a search for caches.keys() lands
   in the prose rather than the code and every careful worker looks careless.
   Not a hypothetical: it happened on the first run of this script. */
function stripComments(t) {
  return t.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/[^\n]*$/gm, " ");
}

let risky = 0, safe = 0, none = 0;
const rows = [];

/* The detector, as a function, so it can be pointed at known-bad and
   known-good code below. A checker nobody has watched get it wrong is just an
   opinion with a green tick next to it. */
function verdictFor(raw) {
  const src = stripComments(raw);
  if (!/caches\s*\.\s*keys\s*\(/.test(src)) return "no sweep";
  const at = src.search(/caches\s*\.\s*keys\s*\(/);
  const region = src.slice(at, at + 700);
  if (!/caches\s*(\.|\[["'])delete/.test(region)) return "no sweep";
  const narrows =
    /startsWith\s*\(\s*["'][A-Za-z0-9_-]+/.test(region) ||
    /indexOf\s*\(\s*["'][A-Za-z0-9_-]+["']\s*\)\s*===?\s*0/.test(region) ||
    /\.match\s*\(\s*\/\^/.test(region) ||
    /keep\s*\.\s*(includes|indexOf)/.test(region) ||
    /\bkeep\b[\s\S]{0,60}\bindexOf\b/.test(region);
  return narrows ? "scoped" : "ORIGIN-WIDE";
}

/* ---- the other half of the same law ----
   A fetch handler that can resolve to undefined paints nothing: the browser
   sits on a blank page until a reload, which is the other way this fleet has
   been black screened. The pattern to catch is a catch() or a fallback that
   hands back caches.match(...) with no final Response behind it, since a miss
   there resolves to undefined rather than throwing. */
function undefinedResponseRisk(raw) {
  const src = stripComments(raw);
  if (!/respondWith/.test(src)) return null;
  const risks = [];
  // catch(() => caches.match(x))  with nothing after it
  const bareCatch = /catch\s*\(\s*\(\s*\)\s*=>\s*caches\s*\.\s*match\s*\([^)]*\)\s*\)/.test(src) ||
                    /catch\s*\(\s*function\s*\([^)]*\)\s*\{\s*return\s+caches\s*\.\s*match\s*\([^;]*;\s*\}\s*\)/.test(src);
  if (bareCatch) risks.push("catch falls back to caches.match with no Response behind it");
  // a handler with no new Response / Response.error anywhere at all
  if (!/new\s+Response|Response\s*\.\s*(error|redirect)/.test(src))
    risks.push("no Response is ever constructed, so every path depends on a cache hit");
  return risks.length ? risks : null;
}

/* Self test. These two are the shapes that actually matter: the one that took
   the fleet down, and the fix. If the detector cannot tell them apart it has
   no business reporting on anything else. */
const SELF = [
  ["the bug", "ORIGIN-WIDE",
   'self.addEventListener("activate", e => { e.waitUntil(caches.keys()' +
   '.then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); });'],
  ["the fix", "scoped",
   'self.addEventListener("activate", e => { e.waitUntil(caches.keys()' +
   '.then(keys => Promise.all(keys.filter(k => k.indexOf("mine-") === 0 && k !== CACHE)' +
   '.map(k => caches.delete(k))))); });'],
  ["a worker that only mentions it in prose", "no sweep",
   '/* caches.keys() is origin wide, so we never sweep at all */\n' +
   'self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));']
];
/* The blank screen detector gets the same treatment, against the two workers
   this repo actually has: the one Hush arrived with, whose catch resolves to
   undefined on a cache miss, and the rewrite that always hands back a real
   Response. Both files are in the tree, so this checks the real thing rather
   than a sketch of it. */
const BLANK_SELF = [
  ["incoming/hush/sw.js", true],   // the drop: catch(() => caches.match(...))
  ["hush/sw.js", false]            // the rewrite
];

let selfBad = 0;
for (const [name, want, code] of SELF) {
  const got = verdictFor(code);
  if (got !== want) { selfBad++; console.log("  SELF TEST FAILED: " + name + " read as " + got + ", expected " + want); }
}
for (const [file, shouldFlag] of BLANK_SELF) {
  let got = null;
  try { got = undefinedResponseRisk(fs.readFileSync(file, "utf8")); } catch (e) { continue; }
  if (!!got !== shouldFlag) {
    selfBad++;
    console.log("  SELF TEST FAILED: " + file + " " + (shouldFlag ? "should" : "should not") +
      " have been flagged for a blank screen");
  }
}
if (selfBad) { console.log("\nthe detector is broken, so its report below means nothing"); process.exit(2); }

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const verdict = verdictFor(raw);
  const src = stripComments(raw);
  const at = src.search(/caches\s*\.\s*keys\s*\(/);
  const snippet = at < 0 ? "never calls caches.keys()"
    : src.slice(at, at + 700).replace(/\s+/g, " ").slice(0, 96).trim();
  rows.push({ f, verdict, detail: verdict === "no sweep" && at >= 0
    ? "lists caches but deletes none of them" : snippet });
  if (verdict === "scoped") safe++;
  else if (verdict === "no sweep") none++;
  else risky++;
}

const pad = (s, n) => (s + " ".repeat(n)).slice(0, n);
console.log("SERVICE WORKER CACHE SWEEP AUDIT\n");
for (const r of rows.sort((a, b) => a.verdict.localeCompare(b.verdict))) {
  const mark = r.verdict === "scoped" ? "  ok " : r.verdict === "no sweep" ? "  -- " : "  !! ";
  console.log(mark + pad(r.verdict, 12) + pad(r.f, 38) + r.detail);
}
console.log("\n" + safe + " scoped, " + none + " never sweep, " + risky + " to look at");

console.log("\nBLANK SCREEN RISK (a fetch path that can settle as undefined)\n");
let blank = 0;
for (const f of files) {
  const r = undefinedResponseRisk(fs.readFileSync(f, "utf8"));
  if (r) { blank++; console.log("  !! " + pad(f, 38) + r.join("; ")); }
}
if (!blank) console.log("  every worker that answers fetches can always produce a real Response");
console.log("\n" + blank + " worker(s) worth opening");
process.exit(risky || blank ? 1 : 0);
