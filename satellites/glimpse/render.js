/* GLIMPSE's meadow, drawn (plans/glimpse/HANDOFF-GLIMPSE.md sections 3.8, 4 and 6): the night field, the fireflies, the grass
 * mask and the pads' dot patterns. DOM and canvas only; nothing here knows a rule, main.js hands in every number.
 *
 * A firefly is the glow sprite blitted at a whole pixel position, never a CSS blur (the handoff: 20 blurred elements will not
 * hold 60 fps on a Celeron). The field is a unit square scaled to the canvas's CSS width.
 */
import { sprite } from '../math/core/core.js?v=20260916c';
import { SPRITES, PALETTE } from './sprites.js?v=20260916c';

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

/* the canvas at its CSS width in device pixels; returns the context and the field's width in CSS pixels */
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

/* fireflies at their places (x, y and r in the unit field), each the glow blitted at a whole pixel, at an opacity */
export function drawFireflies(ctx, W, dots, glow, alpha = 1) {
  ctx.globalAlpha = alpha;
  for (const d of dots) {
    const size = Math.max(6, Math.round(2 * d.r * W));
    ctx.drawImage(glow, Math.round(d.x * W - size / 2), Math.round(d.y * W - size / 2), size, size);
  }
  ctx.globalAlpha = 1;
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

/* a pad's dot pattern: n dots as a dice face (six or fewer) or a ten frame, drawn small, so a pre reader can answer (GL7) */
export function padPattern(n, px = 28) {
  const c = document.createElement('canvas'), dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  c.width = px * dpr; c.height = px * dpr;
  c.style.width = px + 'px'; c.style.height = px + 'px';
  c.setAttribute('aria-hidden', 'true');
  const ctx = c.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const DICE = [[], [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
  const cells = n <= 6 ? DICE[n].map(([a, b]) => [px / 2 + a * px * 0.3, px / 2 + b * px * 0.3])
    : Array.from({ length: n }, (_, i) => [px * (0.1 + 0.2 * (i % 5)), px * (0.35 + 0.3 * Math.floor(i / 5))]);
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
