// TANGENT: does the build layer actually bind?
//
// The deck is the thing no other game in this genre has, and it only matters
// if a level can require it. A gate sitting on the ball's natural unobstructed
// sweep is collected for free, which makes the parts decorative.
//
// For every level marked `needsParts`, this asserts that an empty deck CANNOT
// clear it: across a full release sweep, no release time both lands and has
// every gate. Levels not marked are expected to be clearable bare, which is
// what makes the opening systems teachable without the build phase.
//
//   node test/parts.js           check the contract
//   node test/parts.js --report  print the bare-deck table for every level
const { load } = require("./harness");

const T = load();
T.W = 390; T.H = 780;
const REPORT = process.argv.includes("--report");

function bareSweep(i){
  let lands = 0, clears = 0, firstClear = null;
  for(let k = 1; k <= 60; k++){
    const t = k * 0.2;
    T.loadLevel(i); T.startSpin(); T.holding = true;
    for(let s = 0; s < t * 120 && T.phase === "spin"; s++) T.step();
    const gatesAtRelease = T.gatesHit.filter(Boolean).length;
    if(T.phase === "spin") T.doRelease("bare");
    let g = 0;
    while((T.phase === "flight" || T.phase === "invert") && g++ < 30000) T.step();
    const need = (T.LEVELS[i].gates || []).length;
    if(T.lastOutcome === "land"){
      lands++;
      if(gatesAtRelease === need){ clears++; if(firstClear === null) firstClear = t; }
    }
  }
  return { lands, clears, firstClear };
}

let pass = 0, fail = 0;
const ok = (n, c, extra) => c ? (pass++, console.log("  ok   " + n))
  : (fail++, console.log("  FAIL " + n + (extra ? "  -> " + extra : "")));

console.log("bare deck, no parts placed, 60 release times per system:");
console.log("system                 lands  clears  needsParts");
for(let i = 0; i < T.LEVELS.length; i++){
  const L = T.LEVELS[i], r = bareSweep(i);
  console.log(`${(String(i + 1).padStart(2) + " " + L.name).padEnd(23)}` +
              `${String(r.lands).padStart(4)}  ${String(r.clears).padStart(6)}  ${L.needsParts ? "yes" : "no"}`);
  if(L.needsParts)
    ok(`${L.name}: an empty deck cannot clear it`, r.clears === 0,
       `${r.clears} bare clears, first at ${r.firstClear}s`);
  else if(!REPORT)
    ok(`${L.name}: is clearable bare, as an opening system should be`, r.clears > 0,
       "no bare clear exists, so the tutorial cannot teach it");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
