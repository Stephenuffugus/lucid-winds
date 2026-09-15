/* BRIM's sprites on the page (plans/brim/HANDOFF-BRIM.md section 7; CREASE's draw.js): each sprite from sprites.js drawn
 * into its own canvas through CORE's sprite.draw, at a whole number scale, pixelated, never smoothed.
 */
import { sprite } from '../math/core/core.js?v=20260916b';
import { SPRITES, PALETTE, GLASSES } from './sprites.js?v=20260916b';

/* the palette with a bottle's glass pair in place of indices 9 and a */
export function paletteFor(glass) {
  const [a, b] = GLASSES[((glass % GLASSES.length) + GLASSES.length) % GLASSES.length];
  const p = PALETTE.slice();
  p[9] = PALETTE[a];
  p[10] = PALETTE[b];
  return p;
}

/* a canvas holding one sprite at a whole number scale; its CSS size is its pixel size, so nothing resamples it */
export function spriteCanvas(name, scale, className, palette = PALETTE) {
  const grid = SPRITES[name];
  if (!grid) throw new Error('brim: no sprite ' + name);
  const canvas = document.createElement('canvas');
  canvas.width = grid[0].length * scale;
  canvas.height = grid.length * scale;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.style.imageRendering = 'pixelated';
  if (className) canvas.className = className;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  sprite.draw(ctx, grid, palette, 0, 0, scale);
  canvas.dataset.sprite = name;
  return canvas;
}
