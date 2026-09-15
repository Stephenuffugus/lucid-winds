/* CREASE's sprites on the page (plans/crease/HANDOFF-CREASE.md section 7): each sprite from sprites.js drawn into its own
 * canvas through CORE's sprite.draw, at a whole number scale, pixelated, never smoothed.
 */
import { sprite } from '../math/core/core.js?v=20260916a';
import { SPRITES, PALETTE, PAPERS } from './sprites.js?v=20260916a';

/* the palette with a specimen's paper pair in place of indices 9 and a */
export function paletteFor(paper) {
  const [a, b] = PAPERS[((paper % PAPERS.length) + PAPERS.length) % PAPERS.length];
  const p = PALETTE.slice();
  p[9] = PALETTE[a];
  p[10] = PALETTE[b];
  return p;
}

/* a canvas holding one sprite at a whole number scale; its CSS size is its pixel size, so nothing resamples it */
export function spriteCanvas(name, scale, className, palette = PALETTE) {
  const grid = SPRITES[name];
  if (!grid) throw new Error('crease: no sprite ' + name);
  const canvas = document.createElement('canvas');
  canvas.width = grid[0].length * scale;
  canvas.height = grid.length * scale;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.style.imageRendering = 'pixelated';
  if (className) canvas.className = className;
  canvas.setAttribute('aria-hidden', 'true');
  drawInto(canvas, name, scale, palette);
  return canvas;
}

/* the same canvas with another sprite of the same size */
export function drawInto(canvas, name, scale, palette = PALETTE) {
  const grid = SPRITES[name];
  if (!grid) throw new Error('crease: no sprite ' + name);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprite.draw(ctx, grid, palette, 0, 0, scale);
  canvas.dataset.sprite = name;
}
