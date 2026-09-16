/* HUSH's living clearing (plans/hush/HANDOFF-HUSH.md 3.10; CATALOG-PLAN D8; the shape of BRIM's shelf.js): one creature earned
 * per settle through CORE's collectOnce, twenty four places at most, each grazing at its far tier in a seeded spot, and the
 * clearing breathing slowly in two frames (an ear lifts and falls). With less motion it holds still.
 *
 * The creature is earned when a settle ends, never before, so a reload in the middle of an approach earns nothing. The species
 * go deer, hare, fox in turn, the spot is drawn from the creature's place, so the same place always stands in the same spot.
 * Cosmetic only: no count is shown and nothing is unlocked.
 */
import { collectOnce, rng } from '../math/core/core.js?v=20260916d';
import { SPECIES } from './sprites.js?v=20260916d';
import { drawLiving } from './render.js?v=20260916d';

export const CLEARING_SIZE = 24;
const IDLE_MS = 1400;

/* the place's species and spot, the same for a place every time */
export function spotOf(i) {
  const r = rng((20260916 + i * 7919) >>> 0);
  return { species: SPECIES[i % SPECIES.length], x: r(), y: r(), twitch: r() < 0.5 };
}

export function mountLiving({ host, copy, store, gameId, schema, onGo, reduced }) {
  const section = document.createElement('section');
  section.id = 'living';
  section.hidden = true;
  const frame = document.createElement('div');
  frame.className = 'living-frame';
  const canvas = document.createElement('canvas');
  canvas.id = 'living-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  frame.append(canvas);
  const go = document.createElement('button');
  go.id = 'living-go';
  go.type = 'button';
  go.className = 'lw-btn';
  go.setAttribute('aria-label', copy.again);
  go.innerHTML = '&#9654;';
  section.append(frame, go);
  host.append(section);
  let spots = [], held = 0, idle = 0, tick = 0;

  function draw() {
    const vw = window.visualViewport ? visualViewport.width : innerWidth, vh = window.visualViewport ? visualViewport.height : innerHeight;
    const W = Math.max(160, Math.min(480, Math.floor(vw - 56), Math.floor((vh - 180) * 4 / 3))), H = Math.round(W * 3 / 4);
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawLiving(ctx, W, H, spots, idle);
  }
  function breathe(now) {
    if (section.hidden) { tick = 0; return; }
    if (!reduced() && now - tick >= IDLE_MS) { tick = now; idle = (idle + 1) % 2; draw(); }
    requestAnimationFrame(breathe);
  }

  /* a settle has ended: one more creature, never past twenty four, then the clearing */
  function earn(byKey) {
    const rec = store.update(gameId, schema, r => {
      const kept = Array.isArray(r.collect) ? r.collect : [];
      r.collect = kept.length < CLEARING_SIZE ? collectOnce(kept, 'creature-' + (kept.length + 1)) : kept;
    });
    held = rec.collect.length;
    spots = Array.from({ length: Math.min(held, CLEARING_SIZE) }, (_, i) => spotOf(i));
    idle = 0;
    section.hidden = false;
    draw();
    requestAnimationFrame(now => { tick = now; requestAnimationFrame(breathe); });
    /* focus follows a keyboard; a thumb gets no ring it did not ask for */
    if (byKey) go.focus();
  }

  go.addEventListener('click', () => { section.hidden = true; if (onGo) onGo(); });
  /* held: what the store keeps, which the drawing caps at twenty four and so cannot report past it (CREASE's plant sp3) */
  return { earn, spots: () => spots.map(s => Object.assign({}, s)), held: () => held, shown: () => !section.hidden, frame: () => idle };
}
