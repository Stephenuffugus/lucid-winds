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

/* the editor with a part selected and its handles up, and a red ghost */
for (const [w, h, tag] of [[667, 375, 'wide'], [375, 667, 'tall']]) {
  await withPage(w, h, async (page, shot) => {
    await page.evaluate(() => { DOOHICKEY_TEST.start(5); DOOHICKEY_TEST.solution(); });
    await waitFrames(page, 2);
    await page.evaluate(() => {
      const p = DOOHICKEY_TEST.parts()[1];
      const pt = DOOHICKEY_TEST.toScreen(p.x, p.y);
      const cv = document.getElementById('board');
      const o = { pointerId: 31, pointerType: 'touch', isPrimary: true, bubbles: true,
        cancelable: true, clientX: pt.x, clientY: pt.y };
      cv.dispatchEvent(new PointerEvent('pointerdown', o));
      cv.dispatchEvent(new PointerEvent('pointerup', o));
    });
    await waitFrames(page, 2);
    if (want('p1-editor')) await shot('p1-editor-' + tag);
    /* and a ghost that does not fit */
    await page.evaluate(() => {
      const tile = document.querySelector('#tray .tile[data-part="domino"]');
      const r = tile.getBoundingClientRect();
      const p = DOOHICKEY_TEST.parts()[6];
      const to = DOOHICKEY_TEST.toScreen(p.x, p.y);
      const id = 32;
      const mk = (t, x, y) => new PointerEvent(t, { pointerId: id, pointerType: 'touch',
        isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
      tile.dispatchEvent(mk('pointerdown', r.left + r.width / 2, r.top + r.height / 2));
      window.dispatchEvent(mk('pointermove', to.x, to.y));
    });
    await waitFrames(page, 2);
    if (want('p1-ghost')) await shot('p1-ghost-' + tag);
  });
}

s.close();
console.log('shots done');
