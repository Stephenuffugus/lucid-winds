// The first world opens alive (design 14 §7 T7), built from starter.json with the same commands a player gives, so it is
// deterministic, saved like anything else, and nothing about it is special to the sim. Places are tiles from the world's
// centre. A thing that cannot stand where the layout says (a small world, water) is simply not placed.
export function buildStarter(sim, S) {
  const w = sim.w, T = w.T, cx = Math.floor(w.cols / 2), cy = Math.floor(w.rows / 2);
  const tile = (dx, dy) => [Math.max(0, Math.min(w.cols - 1, cx + dx)), Math.max(0, Math.min(w.rows - 1, cy + dy))];
  for (const p of S.paint) {
    const [x0, y0] = tile(p.rect[0], p.rect[1]), [x1, y1] = tile(p.rect[2], p.rect[3]), tiles = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles.push(x, y);
    sim.command({ t: 'paint', terrain: p.terrain, tiles, world: true }); // (design 19: the starter is not her brush, so it holds nothing: the land may change it from the start)
  }
  for (const [thing, dx, dy] of S.build) sim.command({ t: 'build', thing, tiles: tile(dx, dy) });
  for (const p of S.claim || []) { // ground painted for a village (design 17: the two people found it themselves)
    const [x0, y0] = tile(p.rect[0], p.rect[1]), [x1, y1] = tile(p.rect[2], p.rect[3]), tiles = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles.push(x, y);
    sim.command({ t: 'claim', tiles });
  }
  for (const [item, dx, dy] of S.items) { const [x, y] = tile(dx, dy); sim.command({ t: 'dropItem', item, x: x * T + 4, y: y * T + 4 }); }
  for (const [kind, dx, dy] of S.place) { const [x, y] = tile(dx, dy); sim.command({ t: 'place', kind, x: x * T + 4, y: y * T + 3 }); }
}

// The UFO of the first world (14 §7 T7: at 20 s, once per device): the step it comes at, and where, or null.
export function starterUfo(w, S) {
  try { if (localStorage.getItem(S.ufo.seenKey)) return null; } catch (e) { /* private mode: it comes each first world */ }
  return { tick: w.tick + Math.round(S.ufo.atSec / w.R.tickSec), x: w.cols * w.T / 2, y: Math.max(8, (Math.floor(w.rows / 2) + S.ufo.dy) * w.T) };
}
export function ufoSeen(S) { try { localStorage.setItem(S.ufo.seenKey, '1'); } catch (e) { /* private mode */ } }
