/* The shots. Every one is taken from where the PLAYER stands, at the player's
   own pixels, in both orientations.
   ⛔ the SHUTTER is gated by the filter, never the walk to the moment. */
import { serve, open, waitFrames, sleep, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;

const s = await serve();

async function withPage(w, h, fn) {
  const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  async function save(name, buf) {
    let out = buf;
    if (out.length > LIMIT) {
      const b64 = await b.page.evaluate(async (bb) => {
        const im = new Image();
        await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
        const cv = document.createElement('canvas');
        cv.width = im.width; cv.height = im.height;
        const c = cv.getContext('2d');
        c.drawImage(im, 0, 0);
        const d = c.getImageData(0, 0, cv.width, cv.height);
        for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & 0xF8; }
        c.putImageData(d, 0, 0);
        return cv.toDataURL('image/png').split(',')[1];
      }, out.toString('base64'));
      out = Buffer.from(b64, 'base64');
    }
    writeFileSync(join(OUT, name + '.png'), out);
    console.log('  ' + name + '.png  ' + (out.length / 1024).toFixed(0) + ' KB'
      + (out.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
  }
  const shot = async (name) => { await save(name, await b.page.screenshot({ type: 'png' })); };
  await fn(b.page, shot);
  await b.browser.close();
}

/* the cascade, mid fall, in both orientations */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => { DOOHICKEY_TEST.start(1); DOOHICKEY_TEST.solution(); });
    await waitFrames(page, 2);
    if (want('p1-board')) await shot('p1-board-' + tag);
    await page.evaluate(() => { DOOHICKEY_TEST.go(); });
    await page.evaluate(() => { DOOHICKEY_TEST.advance(2.35); });
    await waitFrames(page, 2);
    if (want('p1-cascade')) await shot('p1-cascade-' + tag);
    await page.evaluate(() => { DOOHICKEY_TEST.advance(1.4); });
    await waitFrames(page, 2);
    if (want('p1-win')) await shot('p1-win-' + tag);
  });
}

s.close();
console.log('shots done');
