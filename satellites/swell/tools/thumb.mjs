#!/usr/bin/env node
/* The arcade tile, from the REAL running app, square, under the 150 KB the
 * portal grid needs when it loads a hundred at once.
 *
 *   node tools/thumb.mjs
 *
 * Two real fingers, held until the whole orchestra is in the room, the chrome
 * hidden, and then it MEASURES its own picture: a tile with no light in it is
 * refused. A camera with no check on its own output is the same mistake as a
 * gate that cannot fail.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, sleep, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024, MIN_LIT = 0.05, MIN_WARM = 0.012;
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size, deviceScaleFactor: 1 });
  await page.evaluate(() => localStorage.setItem('lw_swell_v1',
    JSON.stringify({ v: 1, mood: 'dawn', tilt: 0, motion: 1, seen: { how: 1 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.SWELL_DEV && window.SWELL_DEV.frames() > 2, { timeout: 30000 });
  const put = (type, id, x, y) => page.evaluate((type, id, x, y) => {
    document.getElementById('stage').dispatchEvent(new PointerEvent(type, { pointerId: id,
      pointerType: 'touch', isPrimary: id === 1, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, type, id, x, y);
  await put('pointerdown', 1, Math.round(size * 0.34), Math.round(size * 0.62));
  await page.waitForFunction(() => window.SWELL_DEV.state() === 'held', { timeout: 15000 });
  await put('pointerdown', 2, Math.round(size * 0.68), Math.round(size * 0.44));
  await page.waitForFunction(() => window.SWELL_DEV.sectionLive('choir'), { timeout: 25000 }).catch(() => {});
  await page.waitForFunction(() => window.SWELL_DEV.held() > 9, { timeout: 25000 }).catch(() => {});
  await waitFrames(page, 4);
  await page.evaluate(() => { document.getElementById('chrome').style.visibility = 'hidden'; });
  await sleep(150);
  const lit = await page.evaluate(() => {
    const cv = document.getElementById('stage'), g = cv.getContext('2d');
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let on = 0, warm = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 7) {
      n++;
      const r = d[i], gg = d[i + 1], b = d[i + 2];
      if (r + gg + b > 110) on++;
      if (r > 120 && r > b + 25) warm++;
    }
    return { lit: on / n, warm: warm / n };
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, lit };
}

let size = 512, got = null;
for (let attempt = 1; attempt <= 3 && !got; attempt++) {
  const r = await shoot(size);
  console.log('  attempt ' + attempt + ': ' + (r.lit.lit * 100).toFixed(1) + ' percent lit, ' +
    (r.lit.warm * 100).toFixed(1) + ' percent warm, ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  if (r.lit.lit >= MIN_LIT && r.lit.warm >= MIN_WARM) got = r;
}
if (!got) {
  close();
  console.log('\nTHREE TILES WITH NO LIGHT IN THEM. The aurora is not rendering into it.');
  console.log('THUMB TOO DARK');
  process.exit(1);
}
let buf = got.buf;
while (buf.length > LIMIT && size > 256) {
  size = Math.round(size * 0.8);
  console.log('  ' + (buf.length / 1024).toFixed(0) + ' KB is over the 150 KB grid limit, recapturing at ' + size + ' px');
  buf = (await shoot(size)).buf;
}
writeFileSync(OUT, buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + size + ' px  ' + kb.toFixed(1) + ' KB  ' + (kb <= 150 ? 'under the limit' : 'STILL OVER'));
console.log('\nOPEN IT. A thumb nobody looked at is how a black square ends up on the shelf.');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
