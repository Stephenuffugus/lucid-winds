/* The shots, from where the player stands.
   ⛔ the SHUTTER is gated by the filter, never the walk to the moment. */
import { serve, open, waitFrames, ROOT } from '../test/harness.mjs';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const OUT = join(ROOT, 'docs', 'shots');
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const s = await serve();

async function withPage(w, h, fn) {
  const b = await open(s.base, { width: w, height: h, deviceScaleFactor: 1 });
  const save = async (name, buf) => {
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
  };
  const shot = async (name) => { await save(name, await b.page.screenshot({ type: 'png' })); };
  await fn(b.page, shot, save);
  await b.browser.close();
}

/* the box, mid crank, with the paper halfway through a tune */
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    WINDUP_TEST.state().advanceMm = 22 * WINDUP_TEST.config().MM_PER_STEP;
    WINDUP_TEST.state().crankAngle = 0.9;
    WINDUP_TEST.state().flick[11] = 1;
    WINDUP_TEST.state().flick[7] = 0.5;
  });
  await waitFrames(page, 3);
  if (want('p1-box')) await shot('p1-box');
});
await withPage(375, 667, async (page, shot) => {
  await page.evaluate(() => {
    document.getElementById('btnPunch').click();
    WINDUP_TEST.punch().play = 6;
    WINDUP_TEST.state().flick[11] = 1;
  });
  await waitFrames(page, 3);
  if (want('p1-punch')) await shot('p1-punch');
});

s.close();
console.log('shots done');
