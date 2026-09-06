#!/usr/bin/env node
/* The arcade tile, shot from the REAL running game, square, under the 150 KB
 * the portal grid needs when it loads a hundred of them at once.
 *
 *   node tools/thumb.mjs
 *
 * It goes to the lake with a real tap, picks the skimmer with a real tap,
 * throws with a real flick, holds the clock at a moment with the stone in the
 * air and three rings behind it, hides the HUD so the tile reads as art rather
 * than as a screenshot of a UI, and shoots. If it lands over the limit it
 * recaptures smaller rather than shipping a heavy tile.
 *
 * ⛔ It checks its own picture: the water region has to carry real variance,
 * because a camera with no check on its own output is the same mistake as a
 * gate that cannot fail.
 *
 * Fable moves the result to portal-assets/thumbs/gerplunk.png in the morning.
 * Shape copied from satellites/fathom/tools/thumb.mjs.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, tap, flick, stroke, ROOT, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024;
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size, dpr: 1 });
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
  await tap(page, '.stone[data-id="skimmer"]');
  await waitFrames(page, 2);
  await flick(page, stroke({ x0: Math.round(size * 0.3), y0: Math.round(size * 0.7), arc: 300, ms: 150, rise: 0.55, hook: 0.7 }));
  await page.waitForFunction(() => window.GERPLUNK_DEV.lastResult() !== null, { timeout: 10000 });
  const res = await page.evaluate(() => window.GERPLUNK_DEV.lastResult());
  /* hold with three rings on the water and the stone up */
  const hold = Math.min(res.time * 0.5, 1.4);
  await page.evaluate((t) => { window.GERPLUNK_DEV.hold(t); document.getElementById('hud').style.visibility = 'hidden'; }, hold);
  await waitFrames(page, 4);
  const varc = await page.evaluate(() => {
    const cv = document.getElementById('stage'), g = cv.getContext('2d');
    const y0 = Math.round(cv.height * 0.45), d = g.getImageData(0, y0, cv.width, Math.round(cv.height * 0.35)).data;
    let n = 0, sum = 0, sq = 0;
    for (let i = 0; i < d.length; i += 4 * 23) { const l = d[i] + d[i + 1] + d[i + 2]; n++; sum += l; sq += l * l; }
    const mean = sum / n;
    return Math.sqrt(sq / n - mean * mean);
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, varc, res };
}

const MIN_VAR = 12;
let size = 512, got = null;
for (let attempt = 1; attempt <= 3 && !got; attempt++) {
  const r = await shoot(size);
  console.log('  attempt ' + attempt + ': ' + r.res.skips + ' skips, water variance ' + r.varc.toFixed(1) + ', ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  if (r.varc >= MIN_VAR && r.res.skips >= 4) got = r;
}
if (!got) {
  close();
  console.log('\nTHE TILE HAS NO LAKE IN IT three times over.');
  console.log('THUMB FLAT');
  process.exit(1);
}
let buf = got.buf;
while (buf.length > LIMIT && size > 256) {
  size = Math.round(size * 0.8);
  console.log('  ' + (buf.length / 1024).toFixed(0) + ' KB is over the 150 KB grid limit, recapturing at ' + size + ' px');
  const r = await shoot(size);
  buf = r.buf;
}
writeFileSync(OUT, buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + size + ' px  ' + kb.toFixed(1) + ' KB  ' + (kb <= 150 ? 'under the limit' : 'STILL OVER'));
console.log('\nOPEN IT. A thumb nobody looked at is how a menu screenshot ends up on the shelf.');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
