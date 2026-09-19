// A small flat SVG of a board (section 11: the next Night's thumbnail at the top of the Lapidary, and the
// Lantern select cards). Drawn from board data only: walls, Lanterns with their beam direction, Apertures in
// their colour, set gems, dark, bright and fog cells.
import { grid, DIRS } from '../sim/hex.js';

const COLOR = { 1: '#ff5a4e', 2: '#58e07a', 3: '#ffd84a', 4: '#5a8cff', 5: '#e070ff', 6: '#56e6ff', 7: '#fff6dc' };

function hexPath(cx, cy, r) {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k;
    d += `${k ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  }
  return d + 'Z';
}

export function boardThumb(board, apertures = board.apertures, opts = {}) {
  const g = grid(board.radius);
  const R = 10;
  const pts = Array.from({ length: g.n }, (_, i) => { const p = g.pixel(i); return { x: p.x * R, y: p.y * R }; });
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const pad = R * 1.25;
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + 2 * pad, h = Math.max(...ys) - Math.min(...ys) + 2 * pad;
  const walls = new Set(board.walls), dark = new Set(board.dark), bright = new Set(board.bright), fog = new Set(board.fog);
  const parts = [];
  for (let i = 0; i < g.n; i++) {
    const { x, y } = pts[i];
    const fill = walls.has(i) ? '#4a3f33' : dark.has(i) ? '#050407' : bright.has(i) ? '#3b3320' : fog.has(i) ? '#2a2733' : '#15121b';
    parts.push(`<path d="${hexPath(x, y, R * 0.92)}" fill="${fill}" stroke="#6f5d3c" stroke-width="0.7"/>`);
  }
  for (const f of board.fixed || []) {
    const { x, y } = pts[f.cell];
    parts.push(`<path d="${hexPath(x, y, R * 0.5)}" fill="#cfd8e0" opacity="0.8"/>`);
  }
  for (const a of apertures || []) {
    const { x, y } = pts[a.cell];
    parts.push(`<circle cx="${x}" cy="${y}" r="${R * 0.55}" fill="none" stroke="${COLOR[a.color] || '#fff'}" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="${R * 0.18}" fill="${COLOR[a.color] || '#fff'}"/>`);
  }
  for (const l of board.lanterns || []) {
    const { x, y } = pts[l.cell];
    const [dq, dr] = DIRS[l.dir];
    const vx = 1.5 * dq, vy = Math.sqrt(3) * (dr + dq / 2);
    const len = Math.hypot(vx, vy);
    const ex = x + (vx / len) * R * 1.4, ey = y + (vy / len) * R * 1.4;
    parts.push(`<line x1="${x}" y1="${y}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}" stroke="${opts.beam || '#ffe9b0'}" stroke-width="2" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="${R * 0.45}" fill="#ffcf6a"/>`);
  }
  return `<svg class="boardthumb" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}" aria-hidden="true">${parts.join('')}</svg>`;
}
