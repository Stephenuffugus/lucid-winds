/* YONDER's map (plans/yonder/HANDOFF-YONDER.md 3.10; CATALOG-PLAN D8): one piece a run through CORE's collectOnce, thirty at
 * most, assembling westward, drawn in code from sprites.js at a whole number scale.
 *
 * A run is a FLAG run of `count` rounds or a race to square 10. The piece is earned when the run ends, never before, so a
 * reload in the middle of a run earns nothing. The first piece sits at the east end of the top row and every later one
 * goes west of it, the next row starting again in the east. Cosmetic only: no count is shown and nothing is unlocked.
 */
import { collectOnce, sprite } from '../math/core/core.js?v=20260915a';
import { SPRITES, PALETTE, MAP_ORDER } from './sprites.js?v=20260915a';

export const MAP_PIECES = 30;
const COLS = 10, ROWS = 3, UNIT = 12;

export function mountMap({ host, copy, store, gameId, schema, onGo }) {
  const section = document.createElement('section');
  section.id = 'map';
  section.hidden = true;
  const frame = document.createElement('div');
  frame.className = 'map-frame';
  const canvas = document.createElement('canvas');
  canvas.id = 'map-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  frame.append(canvas);
  const go = document.createElement('button');
  go.id = 'map-go';
  go.type = 'button';
  go.className = 'lw-btn';
  go.setAttribute('aria-label', copy.again);
  go.innerHTML = '&#9654;';
  section.append(frame, go);
  host.append(section);
  let cells = [];

  function draw(count) {
    const avail = Math.min(720, Math.max(UNIT * COLS, (window.visualViewport ? visualViewport.width : innerWidth) - 48));
    const scale = Math.max(1, Math.floor(avail / (UNIT * COLS)));
    const cell = UNIT * scale;
    canvas.width = COLS * cell;
    canvas.height = ROWS * cell;
    canvas.dataset.cell = String(cell);
    canvas.dataset.cols = String(COLS);
    canvas.dataset.rows = String(ROWS);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cells = [];
    for (let i = 0; i < Math.min(count, MAP_PIECES); i++) {
      const col = COLS - 1 - (i % COLS), row = Math.floor(i / COLS);
      sprite.draw(ctx, SPRITES[MAP_ORDER[i % MAP_ORDER.length]], PALETTE, col * cell, row * cell, scale);
      cells.push({ row, col });
    }
  }

  /* a run has ended: one more piece, never past thirty, then the map */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const shelf = Array.isArray(r.collect) ? r.collect : [];
      r.collect = shelf.length < MAP_PIECES ? collectOnce(shelf, 'piece-' + (shelf.length + 1)) : shelf;
    });
    draw(rec.collect.length);
    section.hidden = false;
    /* focus follows a keyboard; a thumb gets no ring it did not ask for */
    if (byKey) go.focus();
  }

  go.addEventListener('click', () => { section.hidden = true; if (onGo) onGo(); });
  return { earn, cells: () => cells.map(c => Object.assign({}, c)), shown: () => !section.hidden };
}
