#!/usr/bin/env node
/* THE SPRITE SHEET (plans/math/CATALOG-PLAN.md section 5; plans/math/HANDOFF-CORE.md 3.9).
 *
 *   node tools/sheet.mjs <sprites module> <out.png>      a game's table, e.g. ../span/sprites.js
 *   node tools/sheet.mjs                                  CORE's own sample, to docs/shots/sheet-sample.png
 *
 * A sprites module exports `PALETTE` (16 hex colours) and `SPRITES` ({ name: [rows] }). Every
 * sprite is drawn through the real sprite.draw at a whole number scale, on the paper colour and
 * on dark, with its name under it, into one PNG. The sheet is then OPENED with the Read tool and
 * three faults are named before any of it is called art (the LOOKING law applied to sprites).
 */
import { writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { serve, open, SIZES, CORE, MATH } from '../test/harness.mjs';

const SAMPLE = {
  PALETTE: ['#25221c', '#5d574b', '#8a8373', '#c9c1ad', '#f3eee2', '#2f5f86', '#6f9cc0', '#b0482e',
    '#d98c4a', '#e8c35a', '#5f8a3a', '#9cc06a', '#7a4f8c', '#b88ac8', '#ffffff', '#000000'],
  SPRITES: {
    stone: ['..2222..', '.233332.', '23344332', '23333332', '23333332', '12333321', '.112211.', '..1111..'],
    flag: ['05......', '0556....', '05566...', '055666..', '0555....', '0.......', '0.......', '0.......'],
    pier: ['22222222', '21111112', '.211112.', '.211112.', '.211112.', '.211112.', '.211112.', '22222222'],
    leaf: ['....bb..', '...bab..', '..baab..', '.baab...', '.bab....', 'ba.b....', 'a.......', '........']
  }
};

const [modArg, outArg] = process.argv.slice(2);
let table = SAMPLE, out = join(CORE, 'docs', 'shots', 'sheet-sample.png');
if (modArg) {
  table = await import(resolve(modArg));
  out = resolve(outArg || modArg.replace(/\.js$/, '-sheet.png'));
}
const names = Object.keys(table.SPRITES);
const SCALE = 6, PAD = 12, LABEL = 18;
const cell = Math.max(...names.map(n => Math.max(table.SPRITES[n].length, ...table.SPRITES[n].map(r => r.length)))) * SCALE;

const s = await serve();
const { browser, page } = await open(s.base, SIZES[3]);
const b64 = await page.evaluate(async (names, sprites, palette, SCALE, PAD, LABEL, cell) => {
  const { sprite } = await import('../core.js?v=20260915c');
  const cols = names.length, W = PAD + cols * (cell + PAD), H = PAD + 2 * (cell + PAD) + LABEL;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#f3eee2'; ctx.fillRect(0, 0, W, PAD + cell + PAD / 2);
  ctx.fillStyle = '#25221c'; ctx.fillRect(0, PAD + cell + PAD / 2, W, H);
  names.forEach((n, i) => {
    const x = PAD + i * (cell + PAD);
    sprite.draw(ctx, sprites[n], palette, x, PAD, SCALE);
    sprite.draw(ctx, sprites[n], palette, x, PAD + cell + PAD, SCALE);
    ctx.fillStyle = '#f3eee2'; ctx.font = '12px system-ui';
    ctx.fillText(n, x, H - 6);
  });
  return cv.toDataURL('image/png').split(',')[1];
}, names, table.SPRITES, table.PALETTE, SCALE, PAD, LABEL, cell);
await browser.close();
s.close();

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('  ' + relative(MATH, out) + '  ' + Math.round(statSync(out).size / 1024) + ' KB, ' + names.length + ' sprites at scale ' + SCALE);
console.log('sheet done');
