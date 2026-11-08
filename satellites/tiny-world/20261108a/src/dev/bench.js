// The named stress workload of design 14 §7 T2 (numbers in bench.json), built on a sim the way the fixtures build
// theirs: commands for what a player could do, direct goal writes for the scripted crowd. DOM-free: tools/bench.mjs
// runs it in Node, `?bench` in the page. Nothing here runs in normal play.
//   L world; a stone wall down the middle with two gates; 600 creatures sent back and forth through the gates (each
//   is given a new point on the other side when it arrives); 50 armed humans against 50 goblins in an arena, topped
//   up so the fight never ends; 1,300 others grazing (100 of them fish in a lake); Safe off; 1x.
import { makeRng } from '../sim/rng.js';
import { G_MOVE, G_ATTACK, ent } from '../sim/ents.js';

export function buildBench(sim, B) {
  const w = sim.w, T = w.T, r = makeRng(B.seed ^ 0xbe7c), R = () => r.float(), pick = (a) => a[Math.floor(R() * a.length)];
  const tileRect = (x0, y0, x1, y1) => { const t = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) t.push(x, y); return t; };
  const px = (t) => t * T + T / 2;
  sim.command({ t: 'setting', key: 'safe', value: B.safe });
  sim.command({ t: 'paint', terrain: 'water', tiles: tileRect(...B.lake) });
  const wallTiles = [];
  for (let ty = 0; ty < w.rows; ty++) if (!B.wall.gates.some(([a, b]) => ty >= a && ty <= b)) wallTiles.push(B.wall.x, ty);
  sim.command({ t: 'build', thing: 'wall', tiles: wallTiles });
  const placed = (kind, x, y) => { const n = w.count; sim.command({ t: 'place', kind, x, y }); return w.count > n ? w.slotH[w.order[w.count - 1]] : 0; };
  // Pathers: half on each side; each walks to a point on the other side, and on arrival is sent back.
  const P = B.pathers, wx = B.wall.x, pathers = [], sideOf = new Map(); // handle -> the side it was on
  let crossings = 0;
  const side = (left) => (left ? 2 + R() * (wx - 4) : wx + 2 + R() * (w.cols - wx - 4));
  const send = (i) => {
    const left = w.E.x[i] > wx * T; // the other side from where it stands
    w.E.goalKind[i] = G_MOVE; w.E.goalX[i] = px(Math.floor(side(left))); w.E.goalY[i] = px(Math.floor(P.rows[0] + R() * (P.rows[1] - P.rows[0])));
    w.E.goalRun[i] = 0; w.E.think[i] = 1e9; w.E.hunger[i] = 0;
  };
  for (let k = 0; k < P.count; k++) {
    const h = placed(pick(P.kinds), px(Math.floor(side(k % 2 === 0))), px(Math.floor(P.rows[0] + R() * (P.rows[1] - P.rows[0]))));
    if (h) { pathers.push(h); send(ent(w, h)); }
  }
  // The arena: armed humans against goblins, topped up to `each` a side.
  const Cb = B.combat, [ax0, ay0, ax1, ay1] = Cb.arena;
  const inArena = () => [px(Math.floor(ax0 + R() * (ax1 - ax0))), px(Math.floor(ay0 + R() * (ay1 - ay0)))];
  const fighters = { a: [], b: [] };
  const topUp = () => {
    for (const s of ['a', 'b']) {
      fighters[s] = fighters[s].filter((h) => ent(w, h) >= 0);
      while (fighters[s].length < Cb.each) {
        const h = placed(Cb[s], ...inArena());
        if (!h) break;
        if (s === 'a') w.E.gear[ent(w, h)].weapon = Cb.weapon;
        fighters[s].push(h);
      }
    }
  };
  topUp();
  // Everyone else: grazers across the map, fish in the lake.
  const O = B.others, [lx0, ly0, lx1, ly1] = B.lake;
  for (let k = 0; k < O.count; k++) {
    if (k < O.water) placed(pick(O.waterKinds), px(Math.floor(lx0 + 1 + R() * (lx1 - lx0 - 2))), px(Math.floor(ly0 + 1 + R() * (ly1 - ly0 - 2))));
    else { let tx; do tx = Math.floor(1 + R() * (w.cols - 2)); while (tx === wx); placed(pick(O.kinds), px(tx), px(Math.floor(1 + R() * (Math.min(ay0, ly0) - 4)))); }
  }
  return {
    pathers, fighters,
    // Before each step (not timed): arrivals are sent back across; the arena is topped up.
    update() {
      if (w.tick % P.retargetEvery === 0) for (const h of pathers) {
        const i = ent(w, h);
        if (i < 0) continue;
        const left = w.E.x[i] < wx * T, was = sideOf.get(h);
        if (was !== undefined && was !== left) crossings++; // it went through a gate
        sideOf.set(h, left);
        if (w.E.goalKind[i] !== G_MOVE) send(i);
      }
      if (w.tick % Cb.topUpEvery === 0) topUp();
    },
    // What the workload is right now: creatures, pathers on a path or waiting for one, fighters fighting, gate crossings so far.
    census() {
      let pathing = 0, fighting = 0, alive = 0;
      for (const h of pathers) { const i = ent(w, h); if (i >= 0) { alive++; if (w.E.pathN && (w.E.pathN[i] > 0 || w.E.pathQd[i])) pathing++; } } // (no paths before M1-6)
      for (let k = 0; k < w.count; k++) if (w.E.goalKind[w.order[k]] === G_ATTACK) fighting++;
      return { creatures: w.count, pathers: alive, pathing, fighting, crossings };
    },
  };
}
