// TANGENT solver: can this system be cleared, and does it need the deck to do it?
//
// Level authoring cannot be done safely by eye. Moving a gate off the ball's
// bare track is how the build layer is made to matter, and it is also how a
// system is made impossible. This searches a small candidate set of single
// part placements against a release sweep and reports the cheapest clear it
// can find, so a gate can be moved and immediately re-proven.
//
//   node test/solve.js            every system
//   node test/solve.js 3          one system, zero based
//   node test/solve.js 3 --bare   bare deck only, no parts
const { load } = require("./harness");

const T = load();
T.W = 390; T.H = 780;

// candidate placements: bumpers throw the ball inward, brakes let the dish
// pull it in, boosters push it out. One part, on a coarse polar grid.
function candidates(){
  const out = [{ label: "bare deck", parts: [] }];
  for(const type of ["bumper", "brake", "booster"])
    for(const r of [30, 50, 70, 88])
      for(let d = -150; d < 180; d += 30){
        const a = d * Math.PI / 180;
        out.push({ label: `${type} r${r} ${d}deg`,
                   parts: [{ type: type, x: Math.cos(a) * r, y: Math.sin(a) * r }] });
      }
  return out;
}

function tryRun(i, cand, tRelease){
  T.loadLevel(i);
  for(const p of cand.parts) T.parts.push(Object.assign({}, p));
  T.startSpin(); T.holding = true;
  for(let s = 0; s < tRelease * 120 && T.phase === "spin"; s++) T.step();
  if(T.phase !== "spin") return null;                    // tore itself apart
  const gatesAtRelease = T.gatesHit.filter(Boolean).length;
  T.doRelease("solve");
  let g = 0;
  while((T.phase === "flight" || T.phase === "invert") && g++ < 30000) T.step();
  const need = (T.LEVELS[i].gates || []).length;
  return { cleared: T.lastOutcome === "land" && gatesAtRelease === need,
           landed: T.lastOutcome === "land", gates: gatesAtRelease, need: need };
}

function solve(i, bareOnly){
  const cands = bareOnly ? [{ label: "bare deck", parts: [] }] : candidates();
  let bare = null, best = null, bareGatesBest = 0;
  for(const c of cands){
    for(let k = 1; k <= 40; k++){
      const r = tryRun(i, c, k * 0.3);
      if(!r) continue;
      if(c.parts.length === 0){
        bareGatesBest = Math.max(bareGatesBest, r.gates);
        if(r.cleared && !bare) bare = { t: k * 0.3 };
      }
      if(r.cleared && !best){ best = { label: c.label, t: k * 0.3 }; }
      if(bare && best) break;
    }
    if(bare && best && c.parts.length === 0) continue;
    if(best && bare) break;
  }
  return { bare, best, bareGatesBest };
}

const only = process.argv[2] && !process.argv[2].startsWith("--") ? +process.argv[2] : null;
const bareOnly = process.argv.includes("--bare");
console.log("system                 bare clear   cheapest clear found            verdict");
let fail = 0;
for(let i = 0; i < T.LEVELS.length; i++){
  if(only !== null && i !== only) continue;
  const L = T.LEVELS[i], s = solve(i, bareOnly);
  const verdict = !s.best ? "UNSOLVABLE"
                : s.bare ? "clearable bare" : "needs the deck";
  console.log(`${(String(i + 1).padStart(2) + " " + L.name).padEnd(23)}` +
              `${(s.bare ? "yes @" + s.bare.t.toFixed(1) + "s" : "no (best " + s.bareGatesBest + "/" + (L.gates || []).length + " gates)").padEnd(13)}` +
              `${(s.best ? s.best.label + " @" + s.best.t.toFixed(1) + "s" : "none found").padEnd(32)}${verdict}`);
  if(!s.best){ fail++; }
  if(L.needsParts && s.bare) fail++;
}
console.log(fail ? `\n${fail} system(s) failed their contract` : "\nevery system is solvable, and every needsParts system requires the deck");
process.exit(fail ? 1 : 0);
