#!/usr/bin/env node
/* NOTCH P0: every piece in the bank is a fair piece (plans/notch/HANDOFF-NOTCH.md 3.3).
 *
 *   node test/shapes.mjs
 *
 * Each piece is rasterised here, in the test, from its cells alone (7 px a cell, every integer angle, centred on its area
 * centroid), never through the game's own drawing. Overlap is intersection over union. Asserted, each watched to fail on a
 * planted fault:
 *   1. the bank holds at least eight pieces, every one a connected set of distinct cells with a name and a grain angle
 *   2. no rotational symmetry: a piece's best overlap with itself at any angle from 30 to 330 is under 0.9
 *   3. no reflection symmetry: its mirror's best overlap with it at any angle is under 0.9
 *   4. a foil looks like a foil: its mirror's best overlap is at least 0.05 below its own overlap turned 12 degrees
 *   5. no two pieces in the bank are the same shape under any turn or mirror
 */
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let P = null;
try { P = await import('../pieces.js'); say(true, 'pieces.js loads as an ES module'); }
catch (e) { say(false, 'pieces.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const R = 64, S = 7;
const raster = (cells, deg, mirror) => {
  const cx = cells.reduce((a, c) => a + c[0] + 0.5, 0) / cells.length, cy = cells.reduce((a, c) => a + c[1] + 0.5, 0) / cells.length;
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), set = new Uint8Array(R * R), grid = new Set(cells.map(q => q.join(',')));
  for (let py = 0; py < R; py++) for (let px = 0; px < R; px++) {
    const x = (px + 0.5 - R / 2) / S, y = (py + 0.5 - R / 2) / S;
    let u = c * x + s * y, v = -s * x + c * y;
    if (mirror) u = -u;
    if (grid.has(Math.floor(u + cx) + ',' + Math.floor(v + cy))) set[py * R + px] = 1;
  }
  return set;
};
const iou = (A, B) => { let i = 0, u = 0; for (let k = 0; k < A.length; k++) { i += A[k] & B[k]; u += A[k] | B[k]; } return i / u; };
const norm = cells => { const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); };
const freeKey = cells => { const ks = []; let c = cells; for (let m = 0; m < 2; m++) { for (let k = 0; k < 4; k++) { ks.push(norm(c).map(q => q.join(',')).join(';')); c = c.map(([x, y]) => [y, -x]); } c = c.map(([x, y]) => [-x, y]); } return ks.sort()[0]; };

if (P) {
  const bank = Object.entries(P.PIECES || {});
  /* 1 */
  {
    const bad = [];
    for (const [id, p] of bank) {
      const cells = p.cells || [];
      const set = new Set(cells.map(c => c.join(',')));
      if (!p.name || typeof p.grain !== 'number') bad.push(id + ' has no name or grain');
      if (set.size !== cells.length || cells.length < 4) bad.push(id + ' has ' + cells.length + ' cells, ' + set.size + ' distinct');
      const seen = new Set([cells[0] && cells[0].join(',')]), stack = cells.length ? [cells[0]] : [];
      while (stack.length) { const [x, y] = stack.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push([x + dx, y + dy]); } } }
      if (seen.size !== set.size) bad.push(id + ' is not connected');
    }
    say(bank.length >= 8 && bad.length === 0, 'the bank holds at least eight pieces, each connected, named, with a grain angle (' + bank.length + ')' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 2, 3, 4 */
  {
    const rows = [], sym = [], refl = [], near = [];
    for (const [id, p] of bank) {
      const base = raster(p.cells, 0, false);
      let self = 0; for (let d = 30; d <= 330; d++) self = Math.max(self, iou(base, raster(p.cells, d, false)));
      let mirror = 0; for (let d = 0; d < 360; d++) mirror = Math.max(mirror, iou(base, raster(p.cells, d, true)));
      const at12 = iou(base, raster(p.cells, 12, false));
      rows.push(id + ' ' + self.toFixed(2) + '/' + mirror.toFixed(2) + '/' + at12.toFixed(2));
      if (!(self < 0.9)) sym.push(id + ' ' + self.toFixed(3));
      if (!(mirror < 0.9)) refl.push(id + ' ' + mirror.toFixed(3));
      if (!(mirror <= at12 - 0.05)) near.push(id + ' mirror ' + mirror.toFixed(3) + ' against ' + at12.toFixed(3));
    }
    say(bank.length > 0 && sym.length === 0, 'no piece is itself after a turn from 30 to 330 degrees (best overlap under 0.9)' + (sym.length ? ': ' + sym.join('; ') : ''));
    say(bank.length > 0 && refl.length === 0, 'no piece is its own mirror at any angle (best overlap under 0.9)' + (refl.length ? ': ' + refl.join('; ') : ''));
    say(bank.length > 0 && near.length === 0, 'every mirror looks like a foil: its best overlap is 0.05 or more below the piece turned 12 degrees (self/mirror/at12: ' + rows.join(', ') + ')' + (near.length ? ': ' + near.join('; ') : ''));
  }
  /* 5 */
  {
    const keys = new Map(), dup = [];
    for (const [id, p] of bank) { const k = freeKey(p.cells); if (keys.has(k)) dup.push(id + ' is ' + keys.get(k)); else keys.set(k, id); }
    say(dup.length === 0, 'no two pieces are the same shape under any turn or mirror' + (dup.length ? ': ' + dup.join('; ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' SHAPES FAILURE(S)'); process.exit(1); }
console.log('SHAPES OK');
