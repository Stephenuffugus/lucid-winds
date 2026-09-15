/* YONDER's sprites on the page (plans/yonder/HANDOFF-YONDER.md section 7): each sprite from sprites.js drawn into its own
 * canvas through CORE's sprite.draw, at a whole number scale, pixelated, never smoothed. The page asks for a canvas by the
 * sprite's name and a scale, and redraws a canvas in place for a walk's frames or a card's faces.
 *
 * Nothing here is round (Y1): every sprite in the table is drawn on square pixels, and lint law 11 holds the table.
 */
import { sprite } from '../math/core/core.js?v=20260915c';
import { SPRITES, PALETTE } from './sprites.js?v=20260915c';

/* a canvas holding one sprite at a whole number scale; its CSS size is its pixel size, so nothing resamples it */
export function spriteCanvas(name, scale, className) {
  const grid = SPRITES[name];
  if (!grid) throw new Error('yonder: no sprite ' + name);
  const canvas = document.createElement('canvas');
  canvas.width = grid[0].length * scale;
  canvas.height = grid.length * scale;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  canvas.style.imageRendering = 'pixelated';
  canvas.dataset.sprite = name;
  if (className) canvas.className = className;
  canvas.setAttribute('aria-hidden', 'true');
  drawInto(canvas, name, scale);
  return canvas;
}

/* the same canvas with another sprite of the same size: a walk's next frame, a card turned */
export function drawInto(canvas, name, scale) {
  const grid = SPRITES[name];
  if (!grid) throw new Error('yonder: no sprite ' + name);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sprite.draw(ctx, grid, PALETTE, 0, 0, scale);
  canvas.dataset.sprite = name;
}

/* the traveler's four walking frames, in order */
export const WALK_FRAMES = Object.freeze(['travelerWalk1', 'travelerWalk2', 'travelerWalk3', 'travelerWalk4']);
