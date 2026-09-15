/* GLIMPSE's meadow, drawn (plans/glimpse/HANDOFF-GLIMPSE.md sections 3.8, 4 and 6): the night field, the fireflies, the ten
 * frame, the grass mask, the pads' patterns and symbols, and the doors' pictures. DOM and canvas only; nothing here knows a
 * rule, main.js hands in every number.
 *
 * A firefly is the glow sprite blitted at a whole pixel position, never a CSS blur (the handoff: 20 blurred elements will not
 * hold 60 fps on a Celeron). A field is a unit square drawn at a scale S from an offset (ox, oy), so SPREAD's two fields sit
 * side by side in one meadow.
 */
import { sprite } from '../math/core/core.js?v=20260916c';
import { SPRITES, PALETTE, INKS } from './sprites.js?v=20260916c';

/* the palette with a journal page's ink pair in place of indices 9 and a */
export function paletteFor(ink) {
  const [a, b] = INKS[((ink % INKS.length) + INKS.length) % INKS.length];
  const p = PALETTE.slice();
  p[9] = PALETTE[a];
  p[10] = PALETTE[b];
  return p;
}

/* a glow sprite drawn once into its own canvas; every firefly is a copy of it */
export function glowCanvas(name) {
  const grid = SPRITES[name], scale = 4;
  const c = document.createElement('canvas');
  c.width = grid[0].length * scale;
  c.height = grid.length * scale;
  sprite.draw(c.getContext('2d'), grid, PALETTE, 0, 0, scale);
  c.dataset.sprite = name;
  return c;
}

/* the canvas at its CSS width in device pixels; returns the context and the meadow's width in CSS pixels */
export function fitMeadow(canvas) {
  const W = canvas.clientWidth, dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  if (canvas.width !== W * dpr) { canvas.width = W * dpr; canvas.height = W * dpr; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, W };
}

export function drawNight(ctx, W) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 0, W, W);
}

/* fireflies at their places (x, y and r in a unit field drawn at scale S from ox, oy), each the glow at a whole pixel */
export function drawFireflies(ctx, S, dots, glow, alpha = 1, ox = 0, oy = 0) {
  ctx.globalAlpha = alpha;
  for (const d of dots) {
    const size = Math.max(6, Math.round(2 * d.r * S));
    ctx.drawImage(glow, Math.round(ox + d.x * S - size / 2), Math.round(oy + d.y * S - size / 2), size, size);
  }
  ctx.globalAlpha = 1;
}

/* the ten frame the dots stand in: arrange put dot i at cell i, so cell 0's centre is the first dot's and the others step
   from it; with `lightEmpty` the cells no firefly holds glow (FRAME's complement at the reveal) */
export function drawFrame(ctx, S, dots, step, lightEmpty = false, ox = 0, oy = 0) {
  if (!dots.length) return;
  const cell = step * S, x0 = ox + dots[0].x * S, y0 = oy + dots[0].y * S;
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const cx = x0 + (i % 5) * cell, cy = y0 + Math.floor(i / 5) * cell, half = Math.round(cell * 0.46);
    if (lightEmpty && i >= dots.length) { ctx.fillStyle = PALETTE[8]; ctx.fillRect(Math.round(cx - half), Math.round(cy - half), 2 * half, 2 * half); }
    ctx.strokeStyle = PALETTE[12];
    ctx.strokeRect(Math.round(cx - half) + 0.5, Math.round(cy - half) + 0.5, 2 * half, 2 * half);
  }
}

/* the grass stir that follows every flash (GL1): the field covered in tufts, offset by `shift` so it moves between frames */
export function drawMask(ctx, W, shift = 0) {
  const tuft = SPRITES.tuft, scale = Math.max(2, Math.round(W / 64)), step = tuft[0].length * scale;
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE[1];
  ctx.fillRect(0, 0, W, W);
  for (let y = -step; y < W + step; y += step) {
    for (let x = -step; x < W + step; x += step) {
      const odd = ((x / step) + (y / step)) % 2 === 0 ? 0 : Math.floor(step / 2);
      sprite.draw(ctx, tuft, PALETTE, Math.round(x + odd + (shift % step)), Math.round(y), scale);
    }
  }
}

const small = px => {
  const c = document.createElement('canvas'), dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  c.width = px * dpr; c.height = px * dpr;
  c.style.width = px + 'px'; c.style.height = px + 'px';
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { c, ctx };
};

/* a pad's dot pattern: n dots as a dice face (six or fewer) or a ten frame, drawn small, so a pre reader can answer (GL7) */
export function padPattern(n, px = 28) {
  const { c, ctx } = small(px);
  const DICE = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
  const cells = n <= 6 ? DICE[n].map(([a, b]) => [px / 2 + a * px * 0.3, px / 2 + b * px * 0.3])
    : Array.from({ length: n }, (_, i) => [px * (0.11 + 0.196 * (i % 5)), px * (0.34 + 0.3 * Math.floor(i / 5))]);
  const s = n <= 6 ? Math.max(3, Math.round(px * 0.18)) : Math.max(3, Math.round(px * 0.14));
  if (n === 0 || n > 6) {
    ctx.strokeStyle = PALETTE[12];
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) ctx.strokeRect(Math.round(px * (0.02 + 0.196 * (i % 5))) + 0.5, Math.round(px * (0.2 + 0.3 * Math.floor(i / 5))) + 0.5, Math.round(px * 0.18), Math.round(px * 0.28));
  }
  ctx.fillStyle = PALETTE[9];
  for (const [x, y] of cells) ctx.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
  c.dataset.dots = String(n);
  return c;
}

/* SPREAD's pads: a heavier left, the same, a heavier right, as pictures of two dot groups */
export function padSymbol(value, px = 28) {
  const { c, ctx } = small(px);
  const dot = (x, y) => ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
  ctx.fillStyle = PALETTE[9];
  const left = value === 'left' ? 4 : value === 'same' ? 3 : 2, right = value === 'right' ? 4 : value === 'same' ? 3 : 2;
  for (let i = 0; i < left; i++) dot(2 + (i % 2) * 6, 4 + Math.floor(i / 2) * 8);
  for (let i = 0; i < right; i++) dot(16 + (i % 2) * 6, 4 + Math.floor(i / 2) * 8);
  ctx.fillStyle = PALETTE[12];
  ctx.fillRect(Math.round(px / 2) - 1, 2, 2, px - 4);
  c.dataset.symbol = value;
  return c;
}

/* a door's picture, one per mode: fireflies; two groups; a ten frame; two swarms, one spread out */
export function doorPicture(mode, px = 44) {
  const { c, ctx } = small(px);
  ctx.fillStyle = PALETTE[0];
  ctx.fillRect(0, 0, px, px);
  const glowAt = (x, y, colour) => { ctx.fillStyle = colour; ctx.fillRect(x, y, 5, 5); };
  if (mode === 'flash') for (const [x, y] of [[10, 12], [26, 8], [18, 26]]) glowAt(x, y, PALETTE[4]);
  else if (mode === 'groups') {
    for (const [x, y] of [[4, 8], [12, 8], [8, 16], [4, 24], [12, 24]]) glowAt(x, y, PALETTE[4]);
    for (const [x, y] of [[28, 12], [36, 20], [28, 28]]) glowAt(x, y, PALETTE[4]);
  } else if (mode === 'frame') {
    ctx.strokeStyle = PALETTE[12];
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const x = 3 + (i % 5) * 8, y = 12 + Math.floor(i / 5) * 9;
      ctx.strokeRect(x + 0.5, y + 0.5, 7, 8);
      if (i < 6) glowAt(x + 2, y + 2, PALETTE[4]);
    }
  } else {
    for (const [x, y] of [[4, 18], [9, 12], [9, 24], [14, 18]]) glowAt(x, y, PALETTE[4]);
    for (const [x, y] of [[24, 4], [38, 8], [26, 34], [36, 30]]) glowAt(x, y, PALETTE[7]);
  }
  c.dataset.door = mode;
  return c;
}
