#!/usr/bin/env node
/* THE SPRITE HELPER (plans/math/CATALOG-PLAN.md section 5; plans/math/HANDOFF-CORE.md 3.9, P3 step 4).
 *
 *   node test/sprite.mjs
 *
 * Every game in the catalog draws code pixel sprites: a sprite is an array of strings, one
 * character per pixel, a hex digit naming a colour in the game's 16 colour palette or `.` for
 * clear, drawn to a canvas at a WHOLE number scale. A fractional scale or position shimmers and
 * blurs, which is the one way pixel art stops being pixel art.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. a known grid at scale 3 reads back from the canvas pixel for pixel: every cell a 3 by 3
 *      block of exactly its palette colour, every `.` transparent, nothing outside the sprite
 *   2. a draw at a fractional position lands on the same pixels as the whole number one
 *   3. a scale of 2.5 throws, a ragged grid throws, and a colour index past the palette throws
 *   4. smoothing is off on the context after a draw
 */
import { serve, open, reporter, SIZES } from './harness.mjs';

const s = await serve();
const { fails, say } = reporter();
const { browser, page, errors } = await open(s.base, SIZES[1]);

const r = await page.evaluate(async () => {
  const mod = await import('../core.js?v=20260915a');
  if (!mod.sprite || typeof mod.sprite.draw !== 'function') return { missing: true };
  const { sprite } = mod;
  const grid = ['01.', '.1a', '2.f'];
  const palette = ['#e04030', '#30b050', '#2050d0', '#000000', '#111111', '#222222', '#333333', '#444444',
    '#555555', '#666666', '#c0a030', '#777777', '#888888', '#999999', '#aaaaaa', '#f0e0c0'];
  const rgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
  const W = 14;
  const read = (x0, y0) => {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = W;
    const ctx = cv.getContext('2d');
    sprite.draw(ctx, grid, palette, x0, y0, 3);
    return { data: Array.from(ctx.getImageData(0, 0, W, W).data), smoothing: ctx.imageSmoothingEnabled };
  };
  const whole = read(1, 1);
  let wrong = 0, clear = 0, filled = 0;
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const cx = Math.floor((x - 1) / 3), cy = Math.floor((y - 1) / 3);
    let want = [0, 0, 0, 0];
    if (x >= 1 && y >= 1 && cx < 3 && cy < 3 && grid[cy][cx] !== '.') want = rgb(palette[parseInt(grid[cy][cx], 16)]);
    if (want[3] === 0) clear++; else filled++;
    const i = (y * W + x) * 4;
    if (want.some((v, k) => whole.data[i + k] !== v)) wrong++;
  }
  const shifted = read(1.4, 1.4);
  const moved = shifted.data.some((v, i) => v !== whole.data[i]);
  const throws = fn => { try { fn(); return false; } catch (e) { return true; } };
  const ctx = document.createElement('canvas').getContext('2d');
  return {
    wrong, clear, filled, moved, smoothing: whole.smoothing,
    fractionalScale: throws(() => sprite.draw(ctx, grid, palette, 0, 0, 2.5)),
    ragged: throws(() => sprite.draw(ctx, ['012', '01'], palette, 0, 0, 2)),
    pastPalette: throws(() => sprite.draw(ctx, ['0f'], palette.slice(0, 4), 0, 0, 2))
  };
});

say(!r.missing, 'core.js exports sprite.draw');
if (!r.missing) {
  say(r.wrong === 0, 'a known grid at scale 3 reads back pixel for pixel (' + r.wrong + ' wrong of ' + (r.clear + r.filled)
    + ', ' + r.filled + ' filled and ' + r.clear + ' clear)');
  say(!r.moved, 'a draw at a fractional position lands on the same pixels as the whole number one');
  say(r.fractionalScale, 'a scale of 2.5 throws');
  say(r.ragged, 'a ragged grid throws');
  say(r.pastPalette, 'a colour index past the palette throws');
  say(r.smoothing === false, 'smoothing is off after a draw (' + r.smoothing + ')');
}
say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));

await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SPRITE FAILURE(S)'); process.exit(1); }
console.log('SPRITE OK');
