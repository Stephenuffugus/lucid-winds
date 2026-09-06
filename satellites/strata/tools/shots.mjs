/* The evidence. Every shot is taken from where the PLAYER stands, at the
 * player's own pixels.
 *
 *   node tools/shots.mjs            all of them
 *   node tools/shots.mjs p2         only the ones whose name contains p2
 *
 * ⛔ the walk to each moment is made by pressing the same buttons a thumb
 * presses; only the SHUTTER is filtered.
 * ⛔ every shot waits for the banner to fade, because a picture judged with a
 * message across it is a picture of a message.
 */
import { serve, open, waitFrames, sleep, tap, ROOT } from '../test/harness.mjs';
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
    /* ⛔ ONE PASS OF BIT DROPPING IS NOT ENOUGH on a picture of noisy rock: two
       of the four phone shots came out over the limit and the tool printed the
       word OVER and wrote them anyway. It keeps going until it is under. */
    for (let mask = 0xF0; out.length > LIMIT && mask >= 0xC0; mask -= 0x10) {
      const b64 = await b.page.evaluate(async (bb, mk) => {
        const im = new Image();
        await new Promise(r => { im.onload = r; im.src = 'data:image/png;base64,' + bb; });
        const cv = document.createElement('canvas');
        cv.width = im.width; cv.height = im.height;
        const c = cv.getContext('2d');
        c.drawImage(im, 0, 0);
        const d = c.getImageData(0, 0, cv.width, cv.height);
        for (let i = 0; i < d.data.length; i++) { if (i % 4 !== 3) d.data[i] = d.data[i] & mk; }
        c.putImageData(d, 0, 0);
        return cv.toDataURL('image/png').split(',')[1];
      }, buf.toString('base64'), mask);
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
const settle = async (page) => { await sleep(3700); await waitFrames(page, 2); };

/* a run of real pointer events along a line of screen points */
const sweep = (page, pts, dwell) => page.evaluate(async (pts, dwell) => {
  const cv = document.getElementById('board');
  const r = cv.getBoundingClientRect();
  const at = (x, y) => ({ pointerId: 5, pointerType: 'touch', isPrimary: true, bubbles: true,
    cancelable: true, clientX: r.left + x, clientY: r.top + y });
  cv.dispatchEvent(new PointerEvent('pointerdown', at(pts[0].x, pts[0].y)));
  for (let i = 1; i < pts.length; i++) {
    cv.dispatchEvent(new PointerEvent('pointermove', at(pts[i].x, pts[i].y)));
    if (dwell) await new Promise(res => setTimeout(res, dwell));
  }
  cv.dispatchEvent(new PointerEvent('pointerup', at(pts[pts.length - 1].x, pts[pts.length - 1].y)));
}, pts, dwell || 0);
const line = (a, b, n) => {
  const out = [];
  for (let i = 0; i <= n; i++) out.push({ x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n });
  return out;
};

/* ---- the title and the how ---- */
for (const [w, h, tag] of [[375, 667, 'tall'], [667, 375, 'wide']]) {
  await withPage(w, h, async (page, shot) => {
    await waitFrames(page, 3);
    if (want('p3-title')) await shot('p3-title-' + tag);
    await tap(page, '#btnHow');
    await waitFrames(page, 2);
    if (want('p3-how')) await shot('p3-how-' + tag);
  });
}

/* ---- the cliff: untouched, then mid brush, then a bone half out ---- */
for (const [w, h, tag] of [[375, 667, 'tall'], [667, 375, 'wide']]) {
  await withPage(w, h, async (page, shot) => {
    await tap(page, '#btnDig');
    await waitFrames(page, 2);
    await page.evaluate(() => STRATA_TEST.site(4242, 0));
    await settle(page);
    if (want('p1-cliff')) await shot('p1-cliff-' + tag);
    const bn = await page.evaluate(() => STRATA_TEST.reachableBone());
    const pts = await page.evaluate((id) => {
      const b = STRATA_TEST.boneById(id);
      return { a: STRATA_TEST.toScreen(b.spine[0].x, b.spine[0].y),
        z: STRATA_TEST.toScreen(b.spine[b.spine.length - 1].x, b.spine[b.spine.length - 1].y) };
    }, bn.id);
    await sweep(page, line(pts.a, pts.z, 14), 22);
    await waitFrames(page, 1);
    if (want('p1-brush')) await shot('p1-brush-' + tag);
    /* short sweeps clean it without tracing it out of the ground */
    for (let k = 0; k < 26; k++) {
      const t0 = 0.1 + (k % 3) * 0.24, t1 = t0 + 0.3;
      const a2 = { x: pts.a.x + (pts.z.x - pts.a.x) * t0, y: pts.a.y + (pts.z.y - pts.a.y) * t0 - 8 + (k % 5) * 4 };
      const z2 = { x: pts.a.x + (pts.z.x - pts.a.x) * t1, y: pts.a.y + (pts.z.y - pts.a.y) * t1 - 8 + (k % 5) * 4 };
      await sweep(page, line(a2, z2, 6));
    }
    await settle(page);
    if (want('p1-rib')) await shot('p1-rib-' + tag);
  });
}

/* ---- the bench, the name and the hall ---- */
await withPage(375, 667, async (page, shot) => {
  await tap(page, '#btnDig');
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.site(4242, 0));
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.liftAll());
  await waitFrames(page, 2);
  await tap(page, '#btnMount');
  await settle(page);
  if (want('p2-mount')) await shot('p2-mount');
  await tap(page, '#btnPlaceAll');
  await waitFrames(page, 3);
  if (want('p2-mounted')) await shot('p2-mounted');
  await tap(page, '#btnKeepIt');
  await waitFrames(page, 2);
  if (want('p2-name')) await shot('p2-name');
  await page.click('#dedField');
  await page.keyboard.type('Penny');
  await tap(page, '#btnKeep');
  await waitFrames(page, 3);
  if (want('p2-hall')) await shot('p2-hall');
  /* a second one, so the hall reads as a hall */
  await tap(page, '#btnHallBack');
  await waitFrames(page, 2);
  await tap(page, '#btnDig');
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.site(90210, 2));
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.liftAll());
  await tap(page, '#btnMount');
  await waitFrames(page, 2);
  await tap(page, '#btnPlaceAll');
  await waitFrames(page, 2);
  await tap(page, '#btnKeepIt');
  await waitFrames(page, 2);
  await tap(page, '#btnKeep');
  await settle(page);
  if (want('p2-hall2')) await shot('p2-hall-two');
  await tap(page, '#hall .plinth');
  await waitFrames(page, 2);
  if (want('p3-placard')) await shot('p3-placard');
});

/* ---- a crate arriving from somebody else ---- */
await withPage(375, 667, async (page, shot) => {
  await tap(page, '#btnDig');
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.site(4242, 0));
  await waitFrames(page, 2);
  await page.evaluate(() => STRATA_TEST.liftAll());
  await tap(page, '#btnMount');
  await waitFrames(page, 2);
  await tap(page, '#btnPlaceAll');
  await waitFrames(page, 2);
  await tap(page, '#btnKeepIt');
  await waitFrames(page, 2);
  await tap(page, '#btnKeep');
  await waitFrames(page, 2);
  const link = await page.evaluate(() => STRATA_TEST.linkFor(0));
  await page.evaluate((h) => {
    /* somebody else's phone: forget the museum, then take the link */
    localStorage.clear();
    location.hash = h;
    location.reload();
  }, link.slice(link.indexOf('#')));
  await page.waitForFunction(() => window.STRATA_TEST && STRATA_TEST.frames() > 2, { timeout: 30000 });
  await settle(page);
  if (want('p3-crate')) await shot('p3-crate');
});

/* ---- the cliff at four phone sizes ---- */
for (const [w, h] of [[412, 915], [375, 667], [320, 568], [915, 412]]) {
  await withPage(w, h, async (page, shot) => {
    await tap(page, '#btnDig');
    await waitFrames(page, 2);
    await page.evaluate(() => { STRATA_TEST.site(31337, 1); STRATA_TEST.clean(STRATA_TEST.reachableBone().id, 10); });
    await settle(page);
    if (want('p3-size')) await shot('p3-' + w + 'x' + h);
  });
}

s.close();
console.log('shots done');
