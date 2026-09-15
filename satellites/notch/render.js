/* NOTCH's bench, drawn (plans/notch/HANDOFF-NOTCH.md 3.9 and section 6): the board with its notch, and the carved piece over it.
 * SVG only; nothing here knows a rule, main.js hands in the piece, its angle and whether it is mirrored.
 *
 * The piece is its cells' outline, and its wood grain is a set of lines in the piece's own coordinates; both are carried to the
 * screen through project.js with one matrix, so the grain turns with the piece and never with the screen (the handoff: a
 * featureless shape gives a child nothing to track). The piece stands over its notch, turned; where it does not cover the notch
 * the dark of the notch shows, which is how a child sees it is not seated. One wood for every piece (N4).
 */
import { rotationZ, projectPoint } from './project.js?v=20260916e';
import { PIECES } from './pieces.js?v=20260916e';

export const WOOD = '#c89a63', GRAIN = '#8c6239', BOARD = '#5a4330', HOLE = '#1b140e', EDGE = '#3a2a1c';
const NS = 'http://www.w3.org/2000/svg';
const FOCAL = 1000;

/* the outline of a set of unit cells, one loop of corners in order (pieces of six cells or fewer have no holes) */
export function outline(cells) {
  const has = new Set(cells.map(c => c.join(',')));
  const edges = new Map();
  for (const [x, y] of cells) {
    if (!has.has(x + ',' + (y - 1))) edges.set(x + ',' + y, [x + 1, y]);
    if (!has.has((x + 1) + ',' + y)) edges.set((x + 1) + ',' + y, [x + 1, y + 1]);
    if (!has.has(x + ',' + (y + 1))) edges.set((x + 1) + ',' + (y + 1), [x, y + 1]);
    if (!has.has((x - 1) + ',' + y)) edges.set(x + ',' + (y + 1), [x, y]);
  }
  const start = edges.keys().next().value, loop = [];
  let at = start;
  do { const [px, py] = at.split(',').map(Number); loop.push([px, py]); const to = edges.get(at); at = to[0] + ',' + to[1]; } while (at !== start && loop.length <= edges.size);
  /* corners only: drop points on a straight run */
  return loop.filter((p, i) => { const a = loop[(i + loop.length - 1) % loop.length], b = loop[(i + 1) % loop.length]; return (a[0] - p[0]) * (b[1] - p[1]) - (a[1] - p[1]) * (b[0] - p[0]) !== 0; });
}

/* the area centroid of the cells, the point a piece turns about */
export function centroid(cells) {
  return [cells.reduce((a, c) => a + c[0] + 0.5, 0) / cells.length, cells.reduce((a, c) => a + c[1] + 0.5, 0) / cells.length];
}

/* piece coordinates (x right, y down, about the centroid; mirrored in x when asked) to screen points through one matrix */
function toScreen(points, { angle, mirror, unit, cx, cy, about }) {
  const m = rotationZ(angle);
  return points.map(([x, y]) => {
    const px = (x - about[0]) * (mirror ? -1 : 1), py = -(y - about[1]);
    const s = projectPoint(m, [px, py, 0], { focal: FOCAL, scale: unit * FOCAL, cx, cy });
    return s;
  });
}

const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const pts = list => list.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');

/* the bench: board, notch and piece, built once into an svg; update() moves the piece and returns what it drew */
export function mountBench(svg, size) {
  svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  svg.textContent = '';
  const defs = el('defs', {}), clip = el('clipPath', { id: 'piece-clip' }), clipShape = el('polygon', {});
  clip.append(clipShape); defs.append(clip);
  const board = el('rect', { x: 0, y: 0, width: size, height: size, rx: size * 0.04, fill: BOARD });
  const hole = el('polygon', { fill: HOLE, 'data-part': 'notch' });
  const piece = el('polygon', { fill: WOOD, stroke: EDGE, 'stroke-width': 2, 'stroke-linejoin': 'round', 'data-part': 'piece' });
  const grain = el('g', { 'clip-path': 'url(#piece-clip)', stroke: GRAIN, 'stroke-width': 2, 'stroke-linecap': 'round', 'data-part': 'grain' });
  svg.append(defs, board, hole, piece, grain);
  const state = { drawn: null };

  function update({ pieceId, angle, mirror }) {
    const p = PIECES[pieceId], shape = outline(p.cells), about = centroid(p.cells);
    const span = Math.max(...p.cells.map(c => c[0])) + 1, tall = Math.max(...p.cells.map(c => c[1])) + 1;
    const unit = size * 0.62 / Math.max(span, tall, 3), cx = size / 2, cy = size / 2;
    const holePts = toScreen(shape, { angle: 0, mirror: false, unit, cx, cy, about });
    hole.setAttribute('points', pts(holePts));
    const piecePts = toScreen(shape, { angle, mirror, unit, cx, cy, about });
    piece.setAttribute('points', pts(piecePts));
    clipShape.setAttribute('points', pts(piecePts));
    /* the grain: parallel lines across the piece at its own angle, projected with the piece */
    const g = p.grain * Math.PI / 180, dir = [Math.cos(g), Math.sin(g)], nrm = [-dir[1], dir[0]], reach = Math.max(span, tall) * 1.5;
    const lines = [];
    for (let k = -8; k <= 8; k++) {
      const o = k * 0.3, mid = [about[0] + nrm[0] * o, about[1] + nrm[1] * o];
      lines.push([[mid[0] - dir[0] * reach, mid[1] - dir[1] * reach], [mid[0] + dir[0] * reach, mid[1] + dir[1] * reach]]);
    }
    const lineScreen = lines.map(l => toScreen(l, { angle, mirror, unit, cx, cy, about }));
    while (grain.childNodes.length < lineScreen.length) grain.append(el('line', {}));
    lineScreen.forEach((l, i) => { const e = grain.childNodes[i]; e.setAttribute('x1', l[0][0].toFixed(2)); e.setAttribute('y1', l[0][1].toFixed(2)); e.setAttribute('x2', l[1][0].toFixed(2)); e.setAttribute('y2', l[1][1].toFixed(2)); });
    state.drawn = { pieceId, angle, mirror, piece: piecePts, hole: holePts, grain: lineScreen[8], centre: [cx, cy] };
    return state.drawn;
  }
  return { update, drawn: () => state.drawn, centre: () => [size / 2, size / 2] };
}

/* the TURN door's picture: a small carved piece over its notch, turned */
export function doorPicture(px = 56) {
  const svg = el('svg', { width: px, height: px, 'aria-hidden': 'true' });
  mountBench(svg, px).update({ pieceId: 'hook', angle: 30, mirror: false });
  return svg;
}
