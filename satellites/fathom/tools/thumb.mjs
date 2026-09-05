#!/usr/bin/env node
/* The arcade tile, shot from the REAL running game, square, under the 150 KB
 * the portal grid needs when it loads a hundred of them at once.
 *
 *   node tools/thumb.mjs
 *
 * It walks into a cave with real taps, throws three stones so the tile shows a
 * cave rather than one wall, hides the HUD so the tile reads as art rather than
 * as a screenshot of a UI, and shoots. If it lands over the limit it recaptures
 * smaller rather than shipping a heavy tile.
 *
 * IT SHOOTS THE DEEP, not cave one. Cave one opens in a hand drawn rectangle,
 * and a rectangle photographed square is a rectangle: the first tile read as a
 * technical diagram with a hoop in it. A generated cave has irregular walls and
 * looks like the game. The save is seeded so the deep is open, which is the one
 * liberty a camera may take and a gate may not.
 *
 * Fable moves the result to portal-assets/thumbs/fathom.png in the morning.
 */
import { writeFileSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, tap, tapAt, ROOT , waitFrames} from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'thumb.png');
const LIMIT = 150 * 1024;
if (!existsSync(join(ROOT, 'docs'))) mkdirSync(join(ROOT, 'docs'), { recursive: true });
const { base, close } = await serve();

async function shoot(size) {
  const { browser, page } = await open(base, { width: size, height: size });
  await page.evaluate(() => localStorage.setItem('lw_fathom_v1',
    JSON.stringify({ v: 1, stars: [3, 3, 3, 0, 0], bestDepth: 4, sound: 1, motion: 1, seen: { how: 1 } })));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.FATHOM_DEV && window.FATHOM_DEV.frames() > 2, { timeout: 30000 });
  await tap(page, '#btnDeep');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
  await waitFrames(page, 6);
  /* TWO stones, and the second thrown while the first ring is still ALIVE.
     ⛔ The version before this waited for the first ring to reach 250 and then
     for a second ring to exist; by then the first had expired at its maximum
     radius, the wait timed out after forty seconds, every wall had faded, and
     the tool wrote a completely black tile and printed THUMB OK. Nothing
     checked the picture. That is why shotLit exists below. */
  async function throwAt(dx, dy) {
    const at = await page.evaluate((dx, dy) => {
      const p = window.FATHOM_DEV.player(), s = window.FATHOM_DEV.screenOf(p.x, p.y);
      let y = s.y + dy; if (y < 30) y = s.y + Math.abs(dy);
      return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x + dx)), y: Math.max(30, Math.min(window.innerHeight - 60, y)) };
    }, dx, dy);
    await tapAt(page, at.x, at.y);
  }
  const ringAt = (n, r) => page.waitForFunction((n, r) => {
    const s = window.FATHOM_DEV.state();
    return s.ripples.length >= n && s.ripples[n - 1][2] > r;
  }, { timeout: 25000 }, n, r).then(() => true).catch(() => false);

  await throwAt(-40, -110);
  await ringAt(1, 150);
  await throwAt(90, 70);
  await ringAt(2, 60);

  /* hide the chrome: a shelf tile is art, not a picture of a HUD */
  await page.evaluate(() => { document.getElementById('hud').style.visibility = 'hidden'; });
  /* HOW MUCH OF THIS TILE IS ACTUALLY LIT. A camera with no check on its own
     picture is the same mistake as a gate that cannot fail. */
  const lit = await page.evaluate(() => {
    const cv = document.getElementById('board');
    const g = cv.getContext('2d');
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    let on = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) { n++; if (d[i] + d[i + 1] + d[i + 2] > 30) on++; }
    return on / n;
  });
  const buf = await page.screenshot({ type: 'png' });
  await browser.close();
  return { buf, lit };
}

const MIN_LIT = 0.006;   // six pixels in a thousand, which a blank tile cannot reach
let size = 512, got = null;
for (let attempt = 1; attempt <= 4 && !got; attempt++) {
  const r = await shoot(size);
  console.log('  attempt ' + attempt + ': ' + (r.lit * 100).toFixed(2) + ' percent of the tile is lit, ' + (r.buf.length / 1024).toFixed(0) + ' KB');
  if (r.lit >= MIN_LIT) got = r;
}
if (!got) {
  close();
  console.log('\nTHE TILE CAME OUT DARK four times. Something in the throw sequence is not landing.');
  console.log('THUMB TOO DARK');
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
