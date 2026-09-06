#!/usr/bin/env node
/* The arcade tile from the RUNNING game, square, under 150 KB.
 *
 *   node tools/thumb.mjs
 *
 * Walks to the field with a real tap, places the kite high (a camera liberty,
 * see tools/shots.mjs), hides the HUD so the tile reads as a field and not a
 * screenshot of a UI, and checks its own picture for a red kite before it
 * writes it. Fable moves the result to portal-assets/thumbs/updraft.png.
 */
import { writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, untilSim, waitFrames } from '../test/harness.mjs';
const OUT = join(ROOT, 'docs', 'thumb.png'), LIMIT = 150 * 1024;
const { base, close } = await serve();
async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size });
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
  await page.evaluate(() => window.UPDRAFT_DEV.place({ L: 14, el: 0.75, az: -0.25, launched: true }));
  await untilSim(page, 1.2);
  await page.evaluate(() => { document.getElementById('hud').style.visibility = 'hidden'; });
  await waitFrames(page, 2);
  const red = await page.evaluate(() => {
    const cv = document.getElementById('board'), g = cv.getContext('2d'), d = g.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4 * 13) if (d[i] > 180 && d[i + 1] < 120 && d[i + 2] < 100) n++;
    return n;
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, red };
}
let size = 512, r = await shoot(size);
console.log('  ' + r.red + ' red samples in the tile, ' + (r.buf.length / 1024).toFixed(0) + ' KB');
if (r.red < 20) { close(); console.log('NO KITE IN THE TILE'); console.log('THUMB DARK'); process.exit(1); }
while (r.buf.length > LIMIT && size > 256) { size = Math.round(size * 0.8); r = await shoot(size); console.log('  recaptured at ' + size); }
writeFileSync(OUT, r.buf);
close();
const kb = statSync(OUT).size / 1024;
console.log('  docs/thumb.png  ' + size + ' px  ' + kb.toFixed(1) + ' KB');
console.log(kb <= 150 ? 'THUMB OK' : 'THUMB OVER LIMIT');
process.exit(kb <= 150 ? 0 : 1);
