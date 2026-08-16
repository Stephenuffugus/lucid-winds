#!/usr/bin/env node
/* HUSH audit — rebuilt from the invariants in incoming/hush/HANDOFF-15.md
   (the original tests never shipped in the drop). Static, node-only: extracts
   the real data structures and small pure functions from the HTML by name and
   asserts against THEM — never a hand-mirrored copy (rarity_sim lesson).

   Usage: node scripts/hush_audit.js [path-to-html]
   Default target: incoming/hush/index-51.html (switch to hush/index.html
   after the port). Exit 0 = all green, 1 = any red.

   NOT covered here (needs headless Chrome, phase B of the build plan):
   comb-floor k/f delay check, simple-mode visible-control count, share-preset
   round trip. */
"use strict";
const fs = require("fs");
const vm = require("vm");

const path = process.argv[2] || "incoming/hush/index-51.html";
const src = fs.readFileSync(path, "utf8");

let pass = 0, fail = 0;
function ok(cond, label, detail) {
  if (cond) { pass++; console.log("  ok  " + label); }
  else { fail++; console.log("  RED " + label + (detail ? "  -- " + detail : "")); }
}

/* -- extractor: `const NAME = <expr>;` with bracket matching, string-aware -- */
function extract(name) {
  const m = src.match(new RegExp("const\\s+" + name + "\\s*=\\s*"));
  if (!m) throw new Error("cannot find `const " + name + " =` in " + path);
  let i = m.index + m[0].length, depth = 0, inStr = null, started = false;
  const open = "[{(", close = "]})";
  for (let j = i; j < src.length; j++) {
    const c = src[j], p = src[j - 1];
    if (inStr) { if (c === inStr && p !== "\\") inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") { inStr = c; continue; }
    if (open.includes(c)) { depth++; started = true; }
    else if (close.includes(c)) depth--;
    else if (c === ";" && depth === 0) return src.slice(i, j);
  }
  throw new Error("unbalanced extraction for " + name);
}
function evalExpr(name) { return vm.runInNewContext("(" + extract(name) + ")", {}); }

/* -- extract a whole function by header regex, to its balanced closing brace -- */
function extractFn(header) {
  const m = src.match(header);
  if (!m) throw new Error("cannot find function " + header);
  let i = src.indexOf("{", m.index), depth = 0, inStr = null;
  for (let j = i; j < src.length; j++) {
    const c = src[j], p = src[j - 1];
    if (inStr) { if (c === inStr && p !== "\\") inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return src.slice(m.index, j + 1); }
  }
  throw new Error("unbalanced function " + header);
}

const S = evalExpr("S");
const PROGRAMS = evalExpr("PROGRAMS");
const INFO = evalExpr("INFO");
const PRESETS = evalExpr("PRESETS");
const GUIDE_Q = evalExpr("GUIDE_Q");
const GUIDE_MAP = evalExpr("GUIDE_MAP");
const SHORTLIST = evalExpr("SHORTLIST");

console.log("HUSH AUDIT on " + path);

/* 1. Programs: bounded gains, gentle steps, and EVERY program ends silent.
   "Do not add a program that never reaches zero — that's the whole product
   thesis." (handoff v2) */
console.log("[programs]");
ok(PROGRAMS.length >= 5, "programs present (" + PROGRAMS.length + ")");
for (const p of PROGRAMS) {
  const ph = p.phases;
  ok(ph.length > 0 && ph.every(x => x.m > 0 && x.g >= 0 && x.g <= 1),
    p.id + ": phases valid, gains in [0,1]");
  ok(ph[ph.length - 1].g === 0, p.id + ": ends at exactly zero",
    "last g=" + ph[ph.length - 1].g);
  let prev = ph[0].g, gentle = true, worst = 0;
  for (const x of ph) {
    const step = Math.abs(x.g - prev) / (x.m * 2); // per-30s at linear ramp
    worst = Math.max(worst, step); prev = x.g;
    if (step > 0.35) gentle = false;
  }
  ok(gentle, p.id + ": no 30s step exceeds 0.35", "worst=" + worst.toFixed(3));
}

/* 2. Evidence tiers: labels carry information only if scarce. */
console.log("[evidence tiers]");
const infoIds = Object.keys(INFO);
const t1 = infoIds.filter(k => INFO[k].tier === 1);
ok(t1.length <= 3, "at most 3 sounds claim good evidence", "tier1=" + t1.join(","));
ok(infoIds.every(k => [1, 2, 3, 4].includes(INFO[k].tier)), "every tier in 1..4");
ok(infoIds.every(k => (INFO[k].what || INFO[k].why || "").length >= 20),
  "every info card has real copy");

/* 3. Guide: 2 questions x every combination resolves to exactly two
   suggestions, each documented AND playable. (The old bug: `brown` was
   recommended but had never existed as a preset.) */
console.log("[guide]");
const VOICE_PRESETS = evalExpr("VOICE_PRESETS");
const presetIds = new Set(PRESETS.map(p => p.id));
const playable = new Set([...presetIds, ...VOICE_PRESETS.map(p => p.id)]);
ok(VOICE_PRESETS.every(p => presetIds.has(p.bed)),
  "every voice preset's bed exists in PRESETS",
  VOICE_PRESETS.filter(p => !presetIds.has(p.bed)).map(p => p.id + "->" + p.bed).join(","));
const q1 = GUIDE_Q[0].opts.map(o => o.v), q2 = GUIDE_Q[1].opts.map(o => o.v);
ok(q1.every(v => GUIDE_MAP[v]), "every Q1 answer has a route");
for (const a of q1) for (const b of q2) {
  const pair = GUIDE_MAP[a] && GUIDE_MAP[a][b];
  ok(Array.isArray(pair) && pair.length === 2, "route " + a + "/" + b + " gives exactly two");
  if (Array.isArray(pair)) for (const id of pair) {
    ok(!!INFO[id], "route " + a + "/" + b + " -> " + id + " is documented");
    ok(playable.has(id), "route " + a + "/" + b + " -> " + id + " is playable",
      "not in PRESETS or VOICE_PRESETS");
  }
}

/* 4. Shortlist: exactly six, a spread of tiers, all documented+playable. */
console.log("[shortlist]");
ok(SHORTLIST.length === 6, "shortlist is exactly six");
ok(new Set(SHORTLIST.map(id => INFO[id] && INFO[id].tier)).size >= 3,
  "shortlist spans >=3 evidence tiers");
ok(SHORTLIST.every(id => INFO[id]), "every shortlist entry has an info card");
ok(SHORTLIST.every(id => playable.has(id)), "every shortlist entry is playable");

/* 5. Safety + honesty defaults. */
console.log("[defaults]");
ok(S.cap === true, "nursery volume cap defaults ON");
ok(S.mode === "simple", "simple mode is the default");
ok(S.blinded === true, "trial blinding defaults ON");

/* 6. The Schade 2020 citation constants, from the REAL code. */
console.log("[slow-wave citation]");
ok(/len\s*=\s*Math\.floor\(sr\s*\*\s*0\.05\)/.test(src), "bursts are 50 ms");
ok(/ramp\s*=\s*Math\.floor\(sr\s*\*\s*0\.005\)/.test(src), "ramps are 5 ms");
const rateFn = extract("swRateHz"), blockFn = extract("swBlockSec");
const rate = vm.runInNewContext("(" + rateFn + ")()", { S });
const block = vm.runInNewContext("(" + blockFn + ")()", { S, Math });
ok(Math.abs(rate - 0.8) < 1e-9, "default rate is 0.8 Hz (1.25 s period)", "got " + rate);
ok(block === 10, "default block is 10 s on/off", "got " + block);

/* 7. Night-music tempo clamp cited by the research copy. */
console.log("[tempo clamp]");
ok(/60\s*\+\s*\(S\.vbpm\s*\/\s*100\)\s*\*\s*20/.test(src),
  "vbpm maps 0-100 slider into 60-80 bpm");

/* 8. Time-of-day fallback: all 24 hours resolve to a documented sound. */
console.log("[tonight fallback]");
try {
  const fnText = extractFn(/function pickTonight\s*\(/);
  let allOk = true, bad = [];
  for (let h = 0; h < 24; h++) {
    const sandbox = {
      S: Object.assign({}, S, { lastUsed: null }),
      INFO, SHORTLIST, Math,
      Date: class { getHours() { return h; } static now() { return 0; } },
      nameOfSound: id => id, TIERS: evalExpr("TIERS"),
    };
    try {
      const r = vm.runInNewContext(fnText + "; pickTonight()", sandbox);
      if (!r || !r.id || !INFO[r.id] || !playable.has(r.id)) { allOk = false; bad.push(h + "->" + (r && r.id)); }
    } catch (e) { allOk = false; bad.push(h + ": " + e.message); }
  }
  ok(allOk, "all 24 hours resolve to a documented, playable sound", bad.slice(0, 4).join(" "));
} catch (e) { ok(false, "pickTonight extraction", e.message); }

/* 9. Session keys are never restored (load-path discipline, line ~675). */
console.log("[session reset]");
ok(/Object\.assign\(S,\s*saved,\s*\{\s*timer:\s*0,\s*micOn:\s*false,\s*adapt:\s*false,\s*program:\s*null\s*\}\)/.test(src),
  "load path resets timer/mic/adapt/program");

console.log("\n" + pass + " ok, " + fail + " red");
process.exit(fail ? 1 : 0);
