// TANGENT solver: can this system be cleared, and does it need the deck to do it?
//
// Level authoring cannot be done safely by eye. Moving a gate off the ball's
// bare track is how the build layer is made to matter, and it is also how a
// system is made impossible, so every move needs re-proving.
//
// A player controls three things, and so does this: what is on the deck, how
// they work the throttle, and when they let go. Searching only release time
// (the first version of this file) missed real solutions and called a solvable
// system UNSOLVABLE. Searching hold, coast and four duty cycles (the second)
// missed "hold, then coast, then hold again" — the shape a bare deck uses to
// clear Around the heavy — and `parts.js` was blind in the same place, so the
// two files were never two proofs. The program space now lives in
// `test/search.js` and both files use it.
//
// CHEAPEST. That column used to be whatever the loop found first, which on a
// system the bare deck clears was still reported as a part set. The bare deck
// is zero parts, so where it clears it IS the cheapest by construction and is
// reported as such. Where it does not, every part set is enumerated and the
// fewest-part clearing set wins; the census is bounded and the bounds print.
//
//   node test/solve.js            every system
//   node test/solve.js 3          one system, zero based
//   node test/solve.js --bare     bare deck only
//   node test/solve.js --census   enumerate part sets even where bare clears
const { load } = require("./harness");
const S = require("./search");

const T = load();
T.W = 390; T.H = 780;
const BARE_ONLY = process.argv.includes("--bare");
const CENSUS = process.argv.includes("--census");

const R = S.makeRunner(T);
const PROGS = S.programs();
const COARSE = S.programsCoarse();
const SETS = S.partSets();
const MAXT = 20;              // release times sampled out to here; RUN_LIMIT is 34

function bareClear(i){
  let crossed = false;
  for(const [pn, prog] of PROGS){
    const r = R.clearsUnder(i, [], prog, MAXT, true);
    if(r.crossed) crossed = true;
    if(r.hits.length) return { t: r.hits[0], prog: pn, crossed: true };
  }
  return { t: null, prog: null, crossed: crossed };
}

// Every part set, cheapest first. `stop` returns as soon as one clears, which
// is all that is needed when the census is not being printed.
function census(i, stop){
  const clearing = [];
  for(const set of SETS){
    if(!set.n) continue;
    for(const [pn, prog] of COARSE){
      const r = R.clearsUnder(i, set.parts, prog, MAXT, true);
      if(r.hits.length){
        clearing.push({ set: set, prog: pn, t: r.hits[0] });
        break;
      }
    }
    if(stop && clearing.length) break;
  }
  clearing.sort((a, b) => a.set.n - b.set.n);
  return clearing;
}

const only = process.argv[2] && !process.argv[2].startsWith("--") ? +process.argv[2] : null;
console.log(`search space: ${PROGS.length} throttle programs (${COARSE.length} coarse for the part census), ` +
            `${SETS.length - 1} part sets, release grid ${S.GRID}s out to ${MAXT}s of a 34s clock`);
console.log("system                 bare clear                            cheapest clear found                      verdict");
let fail = 0;
for(let i = 0; i < T.LEVELS.length; i++){
  if(only !== null && i !== only) continue;
  const L = T.LEVELS[i];
  const b = bareClear(i);

  let cheap = null, counted = null;
  if(!BARE_ONLY){
    if(b.t !== null && !CENSUS){
      // zero parts is the floor, so nothing the census could find is cheaper
      cheap = { label: "bare deck (0 parts, minimal)", prog: b.prog, t: b.t };
    } else {
      const c = census(i, false);
      counted = c.length;
      if(b.t !== null) cheap = { label: "bare deck (0 parts, minimal)", prog: b.prog, t: b.t };
      else if(c.length) cheap = { label: `${c[0].set.label} (${c[0].set.n})`, prog: c[0].prog, t: c[0].t };
    }
  }

  const solvable = b.t !== null || (cheap && cheap.label !== null);
  const verdict = !solvable ? "UNSOLVABLE" : b.t !== null ? "clearable bare" : "needs the deck";
  console.log(`${(String(i + 1).padStart(2) + " " + L.name).padEnd(23)}` +
    `${(b.t !== null ? "yes @" + b.t.toFixed(2) + "s " + b.prog : (b.crossed ? "gates only" : "no")).padEnd(38)}` +
    `${(BARE_ONLY ? "(not searched)" : cheap ? cheap.label + " @" + cheap.t.toFixed(2) + "s " + cheap.prog : "none found").padEnd(42)}  ${verdict}`);
  if(counted !== null) console.log(`      part sets that clear: ${counted} of ${SETS.length - 1}`);
  if(b.t === null && !BARE_ONLY && counted === null) console.log("      (no bare clear: the census above is the search that found the cheapest)");

  if(!solvable && !BARE_ONLY) fail++;
  if(L.needsParts && b.t !== null){
    console.log(`      CONTRACT: ${L.name} is marked needsParts but a bare deck clears it @${b.t.toFixed(2)}s "${b.prog}"`);
    fail++;
  }
}
console.log(fail ? `\n${fail} system(s) failed their contract` : "\nevery system is solvable, and every needsParts system requires the deck");
process.exit(fail ? 1 : 0);
