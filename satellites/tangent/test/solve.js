// TANGENT solver: can this system be cleared, and does it need the deck to do it?
//
// Level authoring cannot be done safely by eye. Moving a gate off the ball's
// bare track is how the build layer is made to matter, and it is also how a
// system is made impossible, so every move needs re-proving.
//
// A player controls three things, and so does this: what is on the deck, how
// they work the throttle, and when they let go. Searching only release time
// (the first version of this file) missed real solutions and called a
// solvable system UNSOLVABLE, so the search is now two phases:
//
//   1. cross every gate:  parts x throttle program, run the spin out
//   2. then land:         from that state, keep going and sweep release times
//
//   node test/solve.js            every system
//   node test/solve.js 3          one system, zero based
//   node test/solve.js --bare     bare deck only
const { load } = require("./harness");

const T = load();
T.W = 390; T.H = 780;
const BARE_ONLY = process.argv.includes("--bare");

// throttle programs: hold, never, and a few duty cycles. The ball climbs while
// held and dives when not, so the program decides which part of the deck it
// spends its time in.
const PROGRAMS = [
  ["hold",  () => true],
  ["coast", () => false],
];
for(const d of [0.3, 0.6]) for(const p of [60, 180])
  PROGRAMS.push([`pulse ${d} / ${p}`, s => (s % p) < p * d]);

function partSets(){
  const out = [{ label: "bare deck", parts: [] }];
  if(BARE_ONLY) return out;
  for(const type of ["bumper", "brake", "booster", "vane"])
    for(const r of [30, 50, 70, 88])
      for(let d = -180; d < 180; d += 30){
        const a = d * Math.PI / 180;
        out.push({ label: `${type} r${r} ${d}deg`,
                   parts: [{ type: type, x: Math.cos(a) * r, y: Math.sin(a) * r }] });
      }
  // one part off centre fails the balance constraint on the tighter systems,
  // so also try the shape a real solution takes: a pair straight opposite
  for(const type of ["vane", "bumper"])
    for(const r of [30, 50, 70])
      for(let d = -180; d < 180; d += 45){
        const a = d * Math.PI / 180;
        out.push({ label: `two ${type}s r${r} ${d}deg`,
                   parts: [{ type: type, x: Math.cos(a) * r, y: Math.sin(a) * r },
                           { type: type, x: -Math.cos(a) * r, y: -Math.sin(a) * r }] });
      }
  return out;
}

// Phase 1: does this deck and this throttle program cross every gate, and how
// long does it take? Returns the step count, or null.
function crossesAt(i, set, prog){
  T.loadLevel(i);
  for(const p of set.parts) T.parts.push(Object.assign({}, p));
  T.startSpin();
  const need = (T.LEVELS[i].gates || []).length;
  if(!need) return 0;
  for(let s = 0; s < 30 * 120 && T.phase === "spin"; s++){
    T.holding = prog(s); T.step();
    if(T.gatesHit.every(Boolean)) return s;
  }
  return null;
}

// Phase 2: the gates are crossed, now set up the shot. A player does not keep
// working the throttle the same way once the gates are in hand: they hold to
// build radius and speed, then let go. Coasting on through was why this said
// UNSOLVABLE about a system whose gate it had just watched being crossed.
function landsAfter(i, set, prog, from){
  for(let extra = 0; extra <= 14 * 120; extra += 30){
    T.loadLevel(i);
    for(const p of set.parts) T.parts.push(Object.assign({}, p));
    T.startSpin();
    let s = 0;
    for(; s < from && T.phase === "spin"; s++){ T.holding = prog(s); T.step(); }
    for(let k = 0; k < extra && T.phase === "spin"; k++){ T.holding = true; T.step(); }
    if(T.phase !== "spin") continue;
    if(!T.gatesHit.every(Boolean)) continue;
    T.doRelease("solve");
    let g = 0;
    while((T.phase === "flight" || T.phase === "invert") && g++ < 30000) T.step();
    if(T.lastOutcome === "land") return (from + extra) / 120;
  }
  return null;
}

function solve(i){
  let bare = null, best = null, crossedBare = false;
  for(const set of partSets()){
    for(const [pn, prog] of PROGRAMS){
      const at = crossesAt(i, set, prog);
      if(at === null) continue;
      if(!set.parts.length) crossedBare = true;
      const t = landsAfter(i, set, prog, at);
      if(t === null) continue;
      if(!set.parts.length && !bare) bare = { t: t, prog: pn };
      if(!best) best = { label: set.label, prog: pn, t: t };
      if(bare && best) break;
    }
    if(bare && best) break;
  }
  return { bare, best, crossedBare };
}

const only = process.argv[2] && !process.argv[2].startsWith("--") ? +process.argv[2] : null;
console.log("system                 bare clear      cheapest clear found                       verdict");
let fail = 0;
for(let i = 0; i < T.LEVELS.length; i++){
  if(only !== null && i !== only) continue;
  const L = T.LEVELS[i], s = solve(i);
  const verdict = !s.best ? "UNSOLVABLE" : s.bare ? "clearable bare" : "needs the deck";
  console.log(`${(String(i + 1).padStart(2) + " " + L.name).padEnd(23)}` +
    `${(s.bare ? "yes @" + s.bare.t.toFixed(1) + "s " + s.bare.prog : (s.crossedBare ? "gates only" : "no")).padEnd(16)}` +
    `${(s.best ? s.best.label + " @" + s.best.t.toFixed(1) + "s " + s.best.prog : "none found").padEnd(43)}${verdict}`);
  if(!s.best) fail++;
  if(L.needsParts && s.bare) fail++;
}
console.log(fail ? `\n${fail} system(s) failed their contract` : "\nevery system is solvable, and every needsParts system requires the deck");
process.exit(fail ? 1 : 0);
