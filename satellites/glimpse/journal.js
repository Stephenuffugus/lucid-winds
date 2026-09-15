/* GLIMPSE's field journal (plans/glimpse/HANDOFF-GLIMPSE.md 3.10; CATALOG-PLAN D8; BRIM's shelf.js): one sketched page a run
 * through CORE's collectOnce, twenty four at most, drawn in code from sprites.js at a whole number scale.
 *
 * A run is `count` rounds. The page is earned when the run ends, never before, so a reload in the middle of a run earns
 * nothing. Eight sketches in three inks, sketch by the page's place mod eight and ink by its place mod three, so no two of the
 * twenty four are alike. Cosmetic only: no count is shown and nothing is unlocked.
 */
import { collectOnce, sprite } from '../math/core/core.js?v=20260916c';
import { SPRITES, PAGES } from './sprites.js?v=20260916c';
import { paletteFor } from './render.js?v=20260916c';

export const JOURNAL_SIZE = 24;
const COLS = 6, ROWS = 4, UNIT = 12, GAP = 4;

export function mountJournal({ host, copy, store, gameId, schema, onGo }) {
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
  let cells = [], held = 0;

  function draw(count) {
    const vw = window.visualViewport ? visualViewport.width : innerWidth, vh = window.visualViewport ? visualViewport.height : innerHeight;
    const scale = Math.max(1, Math.min(Math.floor((Math.min(720, vw) - 64 - GAP * COLS) / (UNIT * COLS)), Math.floor((vh - 180 - GAP * ROWS) / (UNIT * ROWS))));
    const cell = UNIT * scale + GAP;
    canvas.width = COLS * cell;
    canvas.height = ROWS * cell;
    canvas.dataset.cell = String(UNIT * scale);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cells = [];
    for (let i = 0; i < Math.min(count, JOURNAL_SIZE); i++) {
      const col = i % COLS, row = Math.floor(i / COLS), shape = PAGES[i % PAGES.length];
      /* a page is ten pixels wide in a twelve pixel place: centred in its place */
      sprite.draw(ctx, SPRITES[shape], paletteFor(i % 3), col * cell + GAP / 2 + scale, row * cell + GAP / 2, scale);
      cells.push({ row, col, shape, ink: i % 3 });
    }
  }

  /* a run has ended: one more page, never past twenty four, then the journal */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const pages = Array.isArray(r.collect) ? r.collect : [];
      r.collect = pages.length < JOURNAL_SIZE ? collectOnce(pages, 'page-' + (pages.length + 1)) : pages;
    });
    held = rec.collect.length;
    draw(held);
    section.hidden = false;
    /* focus follows a keyboard; a thumb gets no ring it did not ask for */
    if (byKey) go.focus();
  }

  go.addEventListener('click', () => { section.hidden = true; if (onGo) onGo(); });
  /* held: what the store keeps, which the drawing caps at twenty four and so cannot report past it (CREASE's plant sp3) */
  return { earn, cells: () => cells.map(c => Object.assign({}, c)), held: () => held, shown: () => !section.hidden };
}
