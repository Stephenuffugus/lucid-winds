#!/usr/bin/env node
/* WHICH GAMES COULD ACTUALLY GO TO LISTDLE?
   node scripts/listdle_candidates.mjs

   Conor at Listdle, verbatim, refusing Jimothy on 2026-07-24:
     "I played it, and I think it's a fun game, but I don't think it fits the
      puzzle game theme of Listdle. Even though it has a daily mode, it is more of
      an action game. Please continue to keep me updated with any new games you
      create."

   So the bar is: a PUZZLE, with a real daily. Three hard filters on top of that,
   each of which has already caught something:

   1. ⛔ IT MUST BE OPENABLE. A dev-gated game cannot be submitted, because the
      person reviewing it cannot open it. Parallel is the obvious trap here: 100
      solver-verified levels and the best pitch in the catalog, and it is gated.
   2. ⛔ READ MORE THAN index.html. Tally is ALREADY LIVE on Listdle and its daily
      does not appear in index.html at all, because it is a Vite build and the game
      is in assets/index-<hash>.js. A survey that greps index.html scores the one
      confirmed success at zero.
   3. ⛔ ALREADY SENT IS NOT ALREADY LISTED. Five were submitted; two are live.
      The other three were never added AND never refused.

   Output is a CANDIDATE list. The daily still has to be proven deterministic
   before anything is sent: Nectar Drop promised "the same board for everyone" and
   was wrong until 2026-08-18. See scripts/daily_determinism_check.mjs. */
import { readFileSync, existsSync, readdirSync } from "fs";
import { catalog } from "./catalog.mjs";

/* Checked against listdle.com with a browser UA on 2026-08-18. 403 is their
   generic not-found; a made-up slug returns it too. */
const LIVE_ON_LISTDLE = ["tally", "hues"];
const SUBMITTED_NOT_LISTED = ["sixfold", "seed-flutter", "nectar-drop"];   // seed-flutter ships as Cosmic Cadets
const REFUSED = { "stream-hop": "refused 2026-07-24: a daily, but an action game" };

/* Categories the portal uses that a puzzle directory would recognise. */
const PUZZLEISH = new Set(["puzzle", "word", "math", "card", "dice", "brain", "logic"]);

function allText(dir) {
  let out = "";
  const base = "satellites/" + dir;
  const walk = (d, depth) => {
    if (depth > 2 || !existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      const p = d + "/" + e.name;
      if (e.isDirectory()) walk(p, depth + 1);
      else if (/\.(html|js|mjs)$/i.test(e.name) && e.name !== "sw.js") {
        try { out += readFileSync(p, "utf8"); } catch (e2) {}
      }
    }
  };
  walk(base, 0);
  return out;
}

const rows = [];
for (const g of catalog().sats) {
  if (!g.dir) continue;                                  /* off-site or a root app */
  const src = allText(g.dir);
  if (!src) continue;
  const daily = (src.match(/daily/gi) || []).length;
  const sameForAll = /same .{0,24}(everyone|every player)|same board|same road|same puzzle/i.test(src);
  const dayIdx = /dayIndex|daySeed|dayNumber|todaySeed|dayNo/i.test(src);
  if (daily < 3 || !(sameForAll || dayIdx)) continue;
  rows.push({ name: g.name, dir: g.dir, cat: g.cat, gated: g.gated, daily, sameForAll, dayIdx });
}

const label = r =>
  REFUSED[r.dir]                     ? "REFUSED  " :
  LIVE_ON_LISTDLE.includes(r.dir)    ? "LIVE     " :
  SUBMITTED_NOT_LISTED.includes(r.dir) ? "SENT     " :
  r.gated                            ? "GATED    " :
  PUZZLEISH.has(r.cat)               ? "CANDIDATE" : "not puzzle";

rows.sort((a, b) => label(a).localeCompare(label(b)) || b.daily - a.daily);
console.log("\nstate      game                     cat        daily  same-for-all  day-seed");
for (const r of rows)
  console.log(`${label(r)}  ${r.name.padEnd(24)} ${String(r.cat).padEnd(10)} ${String(r.daily).padStart(5)}  ${r.sameForAll ? "     yes    " : "     no     "}  ${r.dayIdx ? "yes" : "no"}`);

const cands = rows.filter(r => label(r) === "CANDIDATE");
console.log(`\n${cands.length} CANDIDATE(s) to send, once each daily is proven deterministic:`);
cands.forEach(r => console.log(`  ${r.name}  ->  https://lucidwinds.com/satellites/${r.dir}/`));
console.log("\nGATED games cannot be sent at all: the reviewer cannot open them.");
for (const [dir, why] of Object.entries(REFUSED)) console.log(`Refused already: ${dir} (${why})`);
