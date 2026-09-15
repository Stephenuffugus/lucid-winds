/* CREASE's shelf of folded paper specimens (plans/crease/HANDOFF-CREASE.md 3.9; CATALOG-PLAN D8): one specimen a run through
 * CORE's collectOnce, twenty four at most, drawn in code from sprites.js at a whole number scale.
 *
 * A run is `count` rounds. The specimen is earned when the run ends, never before, so a reload in the middle of a run earns
 * nothing. Eight shapes on three papers, shape by the specimen's place mod eight and paper by its place mod three, so no
 * two of the twenty four are alike. Cosmetic only: no count is shown and nothing is unlocked.
 */
import { collectOnce, sprite } from '../math/core/core.js?v=20260916a';
import { SPRITES, SPECIMENS } from './sprites.js?v=20260916a';
import { paletteFor } from './draw.js?v=20260916a';

export const SHELF_SIZE = 24;
const COLS = 6, ROWS = 4, UNIT = 12, GAP = 4;

export function mountShelf({ host, copy, store, gameId, schema, onGo }) {
  const section = document.createElement('section');
  section.id = 'shelf';
  section.hidden = true;
  const frame = document.createElement('div');
  frame.className = 'shelf-frame';
  const canvas = document.createElement('canvas');
  canvas.id = 'shelf-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  frame.append(canvas);
  const go = document.createElement('button');
  go.id = 'shelf-go';
  go.type = 'button';
  go.className = 'lw-btn';
  go.setAttribute('aria-label', copy.again);
  go.innerHTML = '&#9654;';
  section.append(frame, go);
  host.append(section);
  let cells = [];

  function draw(count) {
    const vw = window.visualViewport ? visualViewport.width : innerWidth, vh = window.visualViewport ? visualViewport.height : innerHeight;
    /* room for the frame's padding and border across, and for go and the gaps under it down */
    const scale = Math.max(1, Math.min(Math.floor((Math.min(720, vw) - 64 - GAP * COLS) / (UNIT * COLS)), Math.floor((vh - 180 - GAP * ROWS) / (UNIT * ROWS))));
    const cell = UNIT * scale + GAP;
    canvas.width = COLS * cell;
    canvas.height = ROWS * cell;
    canvas.dataset.cell = String(UNIT * scale);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cells = [];
    for (let i = 0; i < Math.min(count, SHELF_SIZE); i++) {
      const col = i % COLS, row = Math.floor(i / COLS), shape = SPECIMENS[i % SPECIMENS.length];
      sprite.draw(ctx, SPRITES[shape], paletteFor(i % 3), col * cell + GAP / 2, row * cell + GAP / 2, scale);
      cells.push({ row, col, shape, paper: i % 3 });
    }
  }

  /* a run has ended: one more specimen, never past twenty four, then the shelf */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const shelf = Array.isArray(r.collect) ? r.collect : [];
      r.collect = shelf.length < SHELF_SIZE ? collectOnce(shelf, 'specimen-' + (shelf.length + 1)) : shelf;
    });
    draw(rec.collect.length);
    section.hidden = false;
    /* focus follows a keyboard; a thumb gets no ring it did not ask for */
    if (byKey) go.focus();
  }

  go.addEventListener('click', () => { section.hidden = true; if (onGo) onGo(); });
  return { earn, cells: () => cells.map(c => Object.assign({}, c)), shown: () => !section.hidden };
}
