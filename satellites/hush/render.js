/* HUSH's clearing, drawn (plans/hush/HANDOFF-HUSH.md 3.8, 3.9, 3.10 and section 6): the dawn, the creature at its tier and pose,
 * the grass it stands half hidden in between poses, and the stone a child presses. Canvas only; nothing here knows a rule, main.js
 * hands in the species, the tier and the pose.
 *
 * Every species, tier and pose is drawn once at boot into its own canvas (the handoff: a decode stall mid approach reads as a
 * signal and corrupts a reaction time), then copied at a whole number scale on whole pixels.
 */
import { sprite } from '../math/core/core.js?v=20260916d';
import { SPRITES, PALETTE, COATS, SPECIES, TIER_SIZES, POSES } from './sprites.js?v=20260916d';

/* how much of the clearing's height the creature fills at each tier: far to close */
const REACH = [0.14, 0.2, 0.28, 0.38, 0.52, 0.7];
const GROUND = 0.9;

/* the palette with a species' dark, coat and belly in place of indices 4, 5 and 6 */
export function paletteFor(species) {
  const coat = COATS[species] || COATS.deer, p = PALETTE.slice();
  p[4] = coat[0]; p[5] = coat[1]; p[6] = coat[2];
  return p;
}

const cache = new Map();
export function buildCreatures() {
  for (const species of SPECIES) {
    const pal = paletteFor(species);
    TIER_SIZES.forEach((N, tier) => {
      for (const pose of POSES) {
        const name = species + tier + pose, c = document.createElement('canvas');
        c.width = N; c.height = N;
        sprite.draw(c.getContext('2d'), SPRITES[name], pal, 0, 0, 1);
        c.dataset.sprite = name;
        cache.set(name, c);
      }
    });
  }
  return cache.size;
}
export const creaturesBuilt = () => cache.size;

/* the canvas at its CSS size in device pixels, four by three; returns the context and the clearing's size in CSS pixels */
export function fitClearing(canvas) {
  const W = canvas.clientWidth, H = Math.round(W * 3 / 4), dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
  if (canvas.width !== W * dpr || canvas.height !== H * dpr) { canvas.width = W * dpr; canvas.height = H * dpr; }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, W, H };
}

/* the dawn: sky, the low sun's band, far trees in mist, the grass */
export function drawClearing(ctx, W, H) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE[0]; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PALETTE[13]; ctx.fillRect(0, Math.round(H * 0.3), W, Math.round(H * 0.06));
  ctx.fillStyle = PALETTE[1]; ctx.fillRect(0, Math.round(H * 0.36), W, Math.round(H * 0.16));
  ctx.fillStyle = PALETTE[3]; ctx.fillRect(0, Math.round(H * 0.52), W, H);
  ctx.fillStyle = PALETTE[2]; ctx.fillRect(0, Math.round(H * GROUND), W, H);
}

/* where the creature stands and at what scale: its box's left, top and whole pixel scale */
export function creatureBox(W, H, tier) {
  const N = TIER_SIZES[tier], scale = Math.max(1, Math.floor(H * REACH[tier] / N)), size = N * scale;
  return { x: Math.round(W / 2 - size / 2), y: Math.round(H * GROUND - size), size, scale };
}

/* the creature at its tier and pose; `hidden` draws the grass over its lower part (the neutral pose between trials, and the
   mask on a pose's hide frame, S3) */
export function drawCreature(ctx, W, H, tier, pose, hidden = false, species = 'deer') {
  const b = creatureBox(W, H, tier), c = cache.get(species + tier + pose);
  if (c) ctx.drawImage(c, b.x, b.y, b.size, b.size);
  if (hidden) drawGrass(ctx, W, H, b);
}

function drawGrass(ctx, W, H, b) {
  const tuft = SPRITES.tuft, scale = Math.max(2, b.scale * 2), step = tuft[0].length * scale;
  const top = Math.round(b.y + b.size * 0.3);
  ctx.fillStyle = PALETTE[3];
  ctx.fillRect(b.x - step, top + tuft.length * scale, b.size + 2 * step, Math.round(H * GROUND) - top);
  for (let x = b.x - step; x < b.x + b.size + step; x += step) sprite.draw(ctx, tuft, PALETTE, Math.round(x), top, scale);
}

/* the living clearing (3.10): the dawn in a small field, and each creature earned grazing at its far tier in its own spot; frame
   one grazes, frame two lifts an ear, so the clearing breathes slowly */
export function drawLiving(ctx, W, H, spots, frame) {
  ctx.fillStyle = PALETTE[0]; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PALETTE[13]; ctx.fillRect(0, Math.round(H * 0.18), W, Math.round(H * 0.05));
  ctx.fillStyle = PALETTE[1]; ctx.fillRect(0, Math.round(H * 0.23), W, Math.round(H * 0.12));
  ctx.fillStyle = PALETTE[3]; ctx.fillRect(0, Math.round(H * 0.35), W, H);
  const N = TIER_SIZES[1], scale = Math.max(1, Math.floor(W / 150));
  for (const s of spots) {
    const pose = frame % 2 === 1 && s.twitch ? 'ear' : 'graze', c = cache.get(s.species + 1 + pose);
    if (c) ctx.drawImage(c, Math.round(s.x * (W - N * scale)), Math.round(H * 0.35 + s.y * (H * 0.65 - N * scale)), N * scale, N * scale);
  }
}

/* the stone a child presses, into its own small canvas */
export function stonePicture(px = 84) {
  const c = document.createElement('canvas'), grid = SPRITES.stone, scale = Math.max(1, Math.floor(px / grid[0].length));
  c.width = grid[0].length * scale; c.height = grid.length * scale;
  sprite.draw(c.getContext('2d'), grid, PALETTE, 0, 0, scale);
  c.setAttribute('aria-hidden', 'true');
  return c;
}

/* any sprite of the table as a picture for a button (the fork's hare and heron, SIMON's figure) */
export function spritePicture(name, px = 48) {
  const grid = SPRITES[name], c = document.createElement('canvas'), scale = Math.max(1, Math.floor(px / Math.max(grid[0].length, grid.length)));
  c.width = grid[0].length * scale; c.height = grid.length * scale;
  sprite.draw(c.getContext('2d'), grid, PALETTE, 0, 0, scale);
  c.setAttribute('aria-hidden', 'true');
  c.dataset.sprite = name;
  return c;
}

/* the STEP door: the deer grazing, far */
export function doorPicture(px = 48) {
  const c = document.createElement('canvas'), grid = SPRITES.deer1graze, scale = Math.max(1, Math.floor(px / grid[0].length));
  c.width = grid[0].length * scale; c.height = grid.length * scale;
  sprite.draw(c.getContext('2d'), grid, paletteFor('deer'), 0, 0, scale);
  c.setAttribute('aria-hidden', 'true');
  return c;
}
