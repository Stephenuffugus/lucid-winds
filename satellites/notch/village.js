/* NOTCH's village (plans/notch/HANDOFF-NOTCH.md 3.13; CATALOG-PLAN D8; GLIMPSE's journal.js): one carved building a clean TURN
 * session (ten or more of twelve right) through CORE's collectOnce, twenty four at most, drawn in code from sprites.js at a whole
 * number scale. Cosmetic only, and no count anywhere (N7): not in the drawing, not in a label.
 *
 * Eight buildings in three roof inks, building by the place mod eight and ink by the place mod three, so no two of the twenty four
 * are alike. A reload in the middle of a session earns nothing, because the session is kept in memory until it ends.
 */
import { collectOnce, sprite } from '../math/core/core.js?v=20260916e';
import { SPRITES, PALETTE, ROOFS, BUILDINGS } from './sprites.js?v=20260916e';

export const VILLAGE_SIZE = 24;
const COLS = 6, ROWS = 4, UNIT = 12, GAP = 4;

/* the palette with a place's roof ink in index 8 */
export function paletteFor(ink) {
  const p = PALETTE.slice();
  p[8] = PALETTE[ROOFS[((ink % ROOFS.length) + ROOFS.length) % ROOFS.length]];
  return p;
}

export function mountVillage({ host, copy, store, gameId, schema, onGo }) {
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
    for (let i = 0; i < Math.min(count, VILLAGE_SIZE); i++) {
      const col = i % COLS, row = Math.floor(i / COLS), building = BUILDINGS[i % BUILDINGS.length];
      sprite.draw(ctx, SPRITES[building], paletteFor(i % 3), col * cell + GAP / 2, row * cell + GAP / 2, scale);
      cells.push({ row, col, building, ink: i % 3 });
    }
  }

  /* a clean session has ended: one more building, never past twenty four, then the village */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const places = Array.isArray(r.collect) ? r.collect : [];
      r.collect = places.length < VILLAGE_SIZE ? collectOnce(places, 'place-' + (places.length + 1)) : places;
    });
    held = rec.collect.length;
    draw(held);
    section.hidden = false;
    if (byKey) go.focus();
  }

  go.addEventListener('click', () => { section.hidden = true; if (onGo) onGo(); });
  /* held: what the store keeps, which the drawing caps at twenty four and so cannot report past it (CREASE's plant sp3) */
  return { earn, cells: () => cells.map(c => Object.assign({}, c)), held: () => held, shown: () => !section.hidden };
}
