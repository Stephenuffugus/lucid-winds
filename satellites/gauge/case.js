/* GAUGE's instrument case (plans/gauge/HANDOFF-GAUGE.md section 4; CATALOG-PLAN D8; BRIM's shelf.js): one instrument a run
 * through CORE's collectOnce, twenty four at most, drawn in code from sprites.js at a whole number scale.
 *
 * A run is a session: twenty comparisons, ten values to find, or twelve pairs. The instrument is earned when the run ends, never
 * before, so a reload in the middle of a run earns nothing. Eight instruments in three metals, the instrument by its place mod
 * eight and the metal by its place mod three, so no two of the twenty four are alike. Cosmetic only: no count is shown, nothing
 * is unlocked, and nothing in the case says what a child got right or which rule a child holds (GA7).
 */
import { collectOnce, sprite } from '../math/core/core.js?v=20260916h';
import { SPRITES, PALETTE, METALS, INSTRUMENTS } from './sprites.js?v=20260916h';

export const CASE_SIZE = 24;
const COLS = 6, ROWS = 4, UNIT = 12, GAP = 4;

/* the palette with an instrument's metal pair in place of indices 9 and a */
function paletteFor(metal) {
  const [a, b] = METALS[metal % METALS.length];
  const p = PALETTE.slice();
  p[9] = PALETTE[a];
  p[10] = PALETTE[b];
  return p;
}

export function mountCase({ host, copy, store, gameId, schema, onGo }) {
  const section = document.createElement('section');
  section.id = 'case';
  section.hidden = true;
  const frame = document.createElement('div');
  frame.className = 'case-frame';
  const canvas = document.createElement('canvas');
  canvas.id = 'case-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  frame.append(canvas);
  const go = document.createElement('button');
  go.id = 'case-go';
  go.type = 'button';
  go.className = 'lw-btn';
  go.setAttribute('aria-label', copy.again);
  go.innerHTML = '&#9654;';
  section.append(frame, go);
  host.append(section);
  let cells = [], held = 0;

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
    for (let i = 0; i < Math.min(count, CASE_SIZE); i++) {
      const col = i % COLS, row = Math.floor(i / COLS), shape = INSTRUMENTS[i % INSTRUMENTS.length];
      /* an instrument is ten pixels wide in a twelve pixel place: centred in its place */
      sprite.draw(ctx, SPRITES[shape], paletteFor(i % 3), col * cell + GAP / 2 + scale, row * cell + GAP / 2, scale);
      cells.push({ row, col, shape, metal: i % 3 });
    }
  }

  /* a run has ended: one more instrument, never past twenty four, then the case */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const kept = Array.isArray(r.collect) ? r.collect : [];
      r.collect = kept.length < CASE_SIZE ? collectOnce(kept, 'instrument-' + (kept.length + 1)) : kept;
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
