// TANGENT: the one search both provers use.
//
// WHY THIS FILE EXISTS. `parts.js` swept release times with the throttle HELD
// for the whole run. `solve.js` searched hold, coast and four duty cycles.
// Neither ever tried "hold, then let go of the throttle, then hold again", so
// both were blind in exactly the same place and were never two proofs of
// anything. A bare deck clears "Around the heavy" that way: hold about ten
// seconds, coast while the ball spirals inward across the moved gate, hold
// again, release. The program space below is the fix, and it lives in one file
// so the two suites cannot drift apart again.
//
// PERFORMANCE. A release sweep at 0.05 s used to mean re-running the whole spin
// once per release time. Instead the spin runs ONCE per (parts, program) and
// the state is snapshotted at every sampled step; a release is then replayed
// from a snapshot. `startSpin()` is what resets the system, the inversion
// count, the flight clock and the closest-approach record, so a replayed
// release is the same arithmetic as a re-run — which smoke [18] asserts
// against a full re-run rather than assuming.
const HZ = 120;
const STRIDE = 6;                       // release grid: 6 steps = 0.05 s
const GRID = STRIDE / HZ;

// Throttle programs. `s` is the spin step index.
//   6 inherited (hold, coast, four duty cycles)
//  47 hold t then coast          t = 0.50 .. 12.00 s, 0.25 s steps
// 120 hold t, coast u, hold      t = 1 .. 10 s;  u = 0.5 .. 6.0 s, 0.5 s steps
function programs(){
  const P = [
    ["hold",  () => true],
    ["coast", () => false],
  ];
  for(const d of [0.3, 0.6]) for(const p of [60, 180])
    P.push([`pulse ${d} / ${p}`, s => (s % p) < p * d]);
  for(let k = 2; k <= 48; k++){
    const t = k * 0.25, n = Math.round(t * HZ);
    P.push([`hold ${t.toFixed(2)}s then coast`, s => s < n]);
  }
  for(let t = 1; t <= 10; t++) for(let j = 1; j <= 12; j++){
    const u = j * 0.5, a = Math.round(t * HZ), b = Math.round((t + u) * HZ);
    P.push([`hold ${t}s, coast ${u.toFixed(1)}s, hold`, s => s < a || s >= b]);
  }
  return P;
}
// The subset used when sweeping five hundred part sets, where the full space is
// hours of work. Printed by every caller that uses it — a bounded search that
// does not say it is bounded reads as an exhaustive one.
function programsCoarse(){
  const all = programs();
  const keep = p => p[0] === "hold" || p[0] === "coast" || p[0].startsWith("pulse")
    || /^hold \d+\.00s then coast$/.test(p[0])
    || /^hold (2|4|6|8|10)s, coast (1\.0|2\.0|3\.0)s, hold$/.test(p[0]);
  return all.filter(keep);
}

// Part sets, cheapest first, so "fewest parts" falls out of the ordering.
function partSets(){
  const out = [{ label: "bare deck", n: 0, parts: [] }];
  for(const type of ["bumper", "brake", "booster", "vane"])
    for(const r of [30, 50, 70, 88])
      for(let d = -180; d < 180; d += 30){
        const a = d * Math.PI / 180;
        out.push({ label: `${type} r${r} ${d}deg`, n: 1,
                   parts: [{ type: type, x: Math.cos(a) * r, y: Math.sin(a) * r }] });
      }
  // One part off centre fails the balance constraint on the tighter systems, so
  // also try the shape a real solution takes: a pair straight opposite.
  for(const type of ["vane", "bumper"])
    for(const r of [30, 50, 70])
      for(let d = -180; d < 180; d += 45){
        const a = d * Math.PI / 180;
        out.push({ label: `two ${type}s r${r} ${d}deg`, n: 2,
                   parts: [{ type: type, x: Math.cos(a) * r, y: Math.sin(a) * r },
                           { type: type, x: -Math.cos(a) * r, y: -Math.sin(a) * r }] });
      }
  return out;
}

function makeRunner(T){
  // One spin, snapshotting the state at every sampled step. Stops early if the
  // deck tears itself apart, which is a real outcome of a badly balanced set.
  function spin(i, parts, prog, maxT){
    T.loadLevel(i);
    for(const p of parts) T.parts.push(Object.assign({}, p));
    T.startSpin();
    const snaps = [];
    const N = Math.round(maxT * HZ);
    for(let s = 0; s < N && T.phase === "spin"; s++){
      T.holding = prog(s);
      T.step();
      if(T.phase !== "spin") break;
      if((s + 1) % STRIDE === 0){
        const g = T.gatesHit;
        let all = true;
        for(let k = 0; k < g.length; k++) if(!g[k]){ all = false; break; }
        snaps.push({ t: (s + 1) / HZ, x: T.ball.x, y: T.ball.y, vx: T.ball.vx, vy: T.ball.vy,
                     th: T.deck.theta, om: T.deck.omega, thr: T.throttle,
                     g: g.slice(), all: all });
      }
    }
    return snaps;
  }
  // Replay a release from a snapshot. Parts are already on the deck from spin().
  function fly(snap){
    T.startSpin();
    const b = T.ball;
    b.x = snap.x; b.y = snap.y; b.vx = snap.vx; b.vy = snap.vy;
    T.deck.theta = snap.th; T.deck.omega = snap.om; T.throttle = snap.thr;
    const g = T.gatesHit;
    for(let k = 0; k < snap.g.length; k++) g[k] = snap.g[k];
    T.doRelease("search");
    let n = 0;
    while((T.phase === "flight" || T.phase === "invert") && n++ < 30000) T.step();
    return T.lastOutcome;
  }
  // The honest re-run, for proving the replay above is the same thing.
  function fullRun(i, parts, prog, tRelease){
    T.loadLevel(i);
    for(const p of parts) T.parts.push(Object.assign({}, p));
    T.startSpin();
    const N = Math.round(tRelease * HZ);
    for(let s = 0; s < N && T.phase === "spin"; s++){ T.holding = prog(s); T.step(); }
    if(T.phase !== "spin") return { outcome: T.lastOutcome, cleared: false };
    const cleared0 = T.gatesHit.every(Boolean);
    T.doRelease("full");
    let n = 0;
    while((T.phase === "flight" || T.phase === "invert") && n++ < 30000) T.step();
    return { outcome: T.lastOutcome, cleared: cleared0 && T.lastOutcome === "land" };
  }

  // Every release time under one program that both crosses every gate and
  // lands. `stopEarly` returns after the first, for the cheap "is there one at
  // all" question. Returns { hits:[t], scanned }.
  function clearsUnder(i, parts, prog, maxT, stopEarly){
    const snaps = spin(i, parts, prog, maxT);
    const hits = [];
    let scanned = 0;
    for(const s of snaps){
      if(!s.all) continue;              // a release before every gate cannot clear
      scanned++;
      if(fly(s) === "land"){
        hits.push(s.t);
        if(stopEarly) break;
      }
    }
    return { hits: hits, scanned: scanned, crossed: snaps.some(s => s.all) };
  }

  // Contiguous release windows at the 0.05 s grid, summed across a program set.
  // This is the number the `needsParts` contract is written against: not "can
  // it be done" but "how much room does the player have to do it".
  function clearWindow(i, parts, progs, maxT, opts){
    opts = opts || {};
    let total = 0, best = null, crossed = false, count = 0;
    const per = [];
    for(const [pn, prog] of progs){
      const r = clearsUnder(i, parts, prog, maxT, false);
      if(r.crossed) crossed = true;
      if(!r.hits.length) continue;
      // group the hit times into runs of adjacent grid points
      let runs = [], cur = null;
      for(const t of r.hits){
        if(cur && Math.abs(t - cur.to - GRID) < 1e-6) cur.to = t;
        else { cur = { from: t, to: t }; runs.push(cur); }
      }
      for(const w of runs){
        const width = (w.to - w.from) + GRID;
        total += width; count++;
        if(!best || width > best.width) best = { prog: pn, from: w.from, to: w.to, width: width };
      }
      if(opts.perProgram) per.push({ prog: pn, runs: runs, hits: r.hits.length });
    }
    return { total: total, best: best, windows: count, crossed: crossed, per: per };
  }

  return { spin, fly, fullRun, clearsUnder, clearWindow };
}

module.exports = { HZ, STRIDE, GRID, programs, programsCoarse, partSets, makeRunner };
