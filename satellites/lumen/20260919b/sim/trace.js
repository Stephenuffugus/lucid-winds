// Rebuild each beam's path from the event list. The renderer draws only these segments, so what is
// drawn is exactly what the sim resolved. Pure (no DOM); also used by harness board generators.
import { grid } from './hex.js';

// A segment is one straight run of one beam: it starts at `from` (a cell index) heading `dir` at tick
// t0 with the beam's state, and passes through `cells` (entered on ticks t0+1, t0+2, ...). `exit`
// marks a run that leaves the board after its last cell. `end` names what stopped it, if anything.
export function segments(events, radius = 3) {
  const g = grid(radius);
  const byBeam = new Map();
  for (const e of events) {
    if (e.beamId < 0) continue;
    let list = byBeam.get(e.beamId);
    if (!list) byBeam.set(e.beamId, (list = []));
    list.push(e);
  }
  const out = [];
  for (const [beamId, evs] of byBeam) {
    for (let i = 0; i < evs.length; i++) {
      const e = evs[i];
      if (isTerminal(e)) break;
      const next = evs[i + 1];
      const seg = {
        beamId, from: e.cell, dir: e.dir, t0: e.t, color: e.color, intensity: e.intensity, focus10: e.focus10,
        cells: [], exit: false, end: null, wrapTo: null,
      };
      let cell = e.cell;
      const tEnd = next ? next.t : e.t;
      if (next && next.type === 'travel' && next.reason === 'wrap') {
        // walk to the edge cell it left from, then it re-enters at next.cell
        while (cell !== next.from) {
          cell = g.neighbor[cell * 6 + e.dir];
          if (cell < 0) break;
          seg.cells.push(cell);
        }
        seg.exit = true;
        seg.wrapTo = next.cell;
      } else if (next) {
        for (let t = e.t; t < tEnd; t++) {
          const n = g.neighbor[cell * 6 + e.dir];
          if (n < 0) { seg.exit = true; break; }
          cell = n;
          seg.cells.push(cell);
        }
        if (next.type === 'end' && next.reason === 'edge') seg.exit = true;
        if (isTerminal(next)) seg.end = next.type === 'end' ? next.reason : next.type;
      }
      seg.t1 = seg.t0 + seg.cells.length;
      if (seg.cells.length || seg.exit) out.push(seg);
    }
  }
  out.sort((a, b) => a.t0 - b.t0 || a.beamId - b.beamId);
  return out;
}

function isTerminal(e) {
  return e.type === 'end' || e.type === 'aperture' || e.type === 'absorb' || e.type === 'split' || (e.type === 'charge');
}

// Every cell a beam entered, for board generators and the Bench.
export function litCells(events, radius = 3) {
  const s = new Set();
  for (const seg of segments(events, radius)) for (const c of seg.cells) s.add(c);
  return s;
}

// Edge cells where some beam left the board (candidate Aperture spots).
export function exitCells(events) {
  const s = new Set();
  for (const e of events) if (e.type === 'end' && e.reason === 'edge') s.add(e.cell);
  return s;
}
