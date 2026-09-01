// TANGENT: does the build layer actually bind?
//
// The deck is the thing no other game in this genre has, and it only matters if
// a level can require it. This file used to sweep release times with the
// throttle HELD for the whole run, and `solve.js` searched hold, coast and four
// duty cycles. Neither ever tried "hold, then coast, then hold again", so the
// two provers shared one blind spot and were never two proofs. Both now call
// the same search in `test/search.js`.
//
// THE CONTRACT, and it is not "cannot be cleared bare". Any gate can be reached
// bare given enough of the 34 second clock, so the honest question is how much
// room the player has. For a system marked `needsParts`:
//
//   bare  total clear window  <  0.30 s     (bare is a needle, not a route)
//   best parts total window   >  1.00 s     (the deck opens a real window)
//
// Both numbers are printed for every marked system. Systems not marked are
// expected to be clearable bare, which is what makes the opening teachable
// without the build phase.
//
//   node test/parts.js            check the contract
//   node test/parts.js --report   also print how each system clears bare
//   node test/parts.js --window   measure the bare window on EVERY system (slow)
const { load } = require("./harness");
const S = require("./search");

const T = load();
T.W = 390; T.H = 780;
const REPORT = process.argv.includes("--report");
const ALLWIN = process.argv.includes("--window");

const R = S.makeRunner(T);
const PROGS = S.programs();
const COARSE = S.programsCoarse();
const SETS = S.partSets();
const MAXT = 20;              // release times sampled out to here; RUN_LIMIT is 34
const CANDIDATES = 6;         // parts sets whose full window gets measured

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

// The cheap question: is there any bare clear at all. Stops at the first one.
function bareClears(i){
  for(const [pn, prog] of PROGS){
    const r = R.clearsUnder(i, [], prog, MAXT, true);
    if(r.hits.length) return { t: r.hits[0], prog: pn };
  }
  return null;
}
// The expensive one: every clearing release time under every program, summed.
function bareWindow(i){ return R.clearWindow(i, [], PROGS, MAXT, {}); }

// The best the deck can do. Bounded, and the bounds are printed: all part sets
// are scanned with the coarse program subset to find which ones clear at all,
// then the fewest-part candidates get the full program space measured.
function partsWindow(i){
  const clearing = [];
  for(const set of SETS){
    if(!set.n) continue;
    for(const [pn, prog] of COARSE){
      const r = R.clearsUnder(i, set.parts, prog, MAXT, true);
      if(r.hits.length){ clearing.push(set); break; }
    }
  }
  clearing.sort((a, b) => a.n - b.n);
  let best = null;
  for(const set of clearing.slice(0, CANDIDATES)){
    const w = R.clearWindow(i, set.parts, PROGS, MAXT, {});
    if(!best || w.total > best.total) best = { set: set, w: w };
  }
  return { best: best, clearing: clearing.length, scanned: SETS.length - 1 };
}

console.log(`search space: ${PROGS.length} throttle programs (${COARSE.length} coarse), ` +
            `${SETS.length - 1} part sets, release grid ${S.GRID}s out to ${MAXT}s of a ${34}s clock`);
console.log("\nsystem                 bare clear                                needsParts");
for(let i = 0; i < T.LEVELS.length; i++){
  const L = T.LEVELS[i];
  const b = bareClears(i);
  console.log(`${(String(i + 1).padStart(2) + " " + L.name).padEnd(23)}` +
              `${(b ? `@${b.t.toFixed(2)}s  ${b.prog}` : "none found").padEnd(42)}${L.needsParts ? "yes" : "no"}`);

  if(L.needsParts){
    const bw = bareWindow(i);
    const pw = partsWindow(i);
    const pt = pw.best ? pw.best.w.total : 0;
    console.log(`     bare total clear window ${bw.total.toFixed(2)}s over ${bw.windows} window(s)` +
                (bw.best ? `, widest ${bw.best.width.toFixed(2)}s at ${bw.best.from.toFixed(2)}s "${bw.best.prog}"` : ""));
    console.log(`     best parts total window ${pt.toFixed(2)}s` +
                (pw.best ? ` with ${pw.best.set.label}` : " (no clearing set found)") +
                `  [${pw.clearing}/${pw.scanned} sets clear]`);
    ok(`${L.name}: a bare deck is a needle, not a route (window < 0.30s)`,
       bw.total < 0.30, `bare window ${bw.total.toFixed(2)}s, first clear @${bw.best ? bw.best.from.toFixed(2) : "?"}s "${bw.best ? bw.best.prog : ""}"`);
    ok(`${L.name}: the deck opens a real window (> 1.00s)`,
       pt > 1.00, `best parts window ${pt.toFixed(2)}s`);
  } else {
    ok(`${L.name}: is clearable bare, as an opening system should be`, !!b,
       "no bare clear exists, so the tutorial cannot teach it");
    if(ALLWIN){
      const bw = bareWindow(i);
      console.log(`     bare total clear window ${bw.total.toFixed(2)}s over ${bw.windows} window(s)`);
    }
  }
  if(REPORT && b) console.log(`     clears bare by: ${b.prog}, release at ${b.t.toFixed(2)}s`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
