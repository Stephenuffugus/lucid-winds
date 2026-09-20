// Turns taps and drags on the field into sim commands (the prototype's act()).
// DOM-free so the parity tool can drive it exactly like a finger does.
// spareFor(x, y): the handles an erase at the point must leave (ui/gesture.js, the named-creature guard); gid(): the touch's
// id, given to every command Undo can take back (sim/undo.js: one Undo = one touch). Both absent in tools.
export function createActor({ getSim, getTool, onSelect, spareFor = null, gid = null }) {
  let lastSpawn = null, stroke = new Set(), last = null;
  function act(x, y, drag) {
    const sim = getSim(), w = sim.w, T = w.T, R = w.R.tools, g = gid ? gid() : undefined;
    const send = (c) => sim.command(g === undefined ? c : { ...c, g }); // powers carry no g: Undo leaves them
    const tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) return;
    const tool = getTool(), c = tool.cat;
    // Painting a tile that already has that terrain, or building on an occupied tile, is something the
    // sim ignores; skip sending it so drags do not fill the command journal with no-ops.
    const tile = ty * w.cols + tx;
    if (c === 'land') { if (w.terr[tile] !== w.C.tid[tool.id]) send({ t: 'paint', terrain: tool.id, tiles: [tx, ty] }); }
    else if (c === 'creature' || c === 'enemy' || c === 'water') {
      if (drag && lastSpawn) { const dx = lastSpawn.x - x, dy = lastSpawn.y - y; if (Math.sqrt(dx * dx + dy * dy) < R.sprayGap) return; }
      lastSpawn = { x, y };
      send({ t: 'place', kind: tool.id, x, y });
    } else if (c === 'weapon' || c === 'gear') { if (!drag) send({ t: 'give', item: tool.id, x, y }); }
    else if (c === 'build') { if (!w.grid[tile]) send({ t: 'build', thing: tool.id, tiles: [tx, ty] }); }
    else if (tool.id === 'inspect') { if (!drag) onSelect(sim.pick(x, y, w.C.P.inspect.radius)); }
    else if (tool.id === 'erase') {
      const k = tx + ',' + ty, tile = !stroke.has(k);
      stroke.add(k);
      const spare = spareFor ? spareFor(x, y) : null;
      send(spare && spare.length ? { t: 'erase', x, y, tile, spare } : { t: 'erase', x, y, tile });
    } else if (!drag) sim.command({ t: 'power', id: tool.id, x, y });
  }
  // Tile tools (paint, build, erase) walk the segment from the previous pointer event in half-tile steps: a
  // fast finger at far zoom crosses many tiles between two events, and must not leave a dotted line.
  const TILE_TOOLS = new Set(['land', 'build']);
  return {
    down(x, y) { lastSpawn = null; stroke = new Set(); last = [x, y]; act(x, y, false); },
    move(x, y) {
      const tool = getTool();
      if (last && (TILE_TOOLS.has(tool.cat) || tool.id === 'erase')) {
        const dx = x - last[0], dy = y - last[1], n = Math.ceil(Math.sqrt(dx * dx + dy * dy) / (getSim().w.T / 2));
        for (let i = 1; i < n; i++) act(last[0] + (dx * i) / n, last[1] + (dy * i) / n, true);
      }
      last = [x, y];
      act(x, y, true);
    },
  };
}
