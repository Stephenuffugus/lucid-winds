#!/usr/bin/env node
/* YONDER's shots, from where a child and a teacher stand (plans/yonder/HANDOFF-YONDER.md; CLAUDE.md, LOOKING IS PART OF
 * THE JOB). Every shot is opened with the Read tool and three faults are named before the change it shows is called done.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-map     only names containing that
 *
 * The same seed as the gates, so a shot shows the rounds the gates proved. Less motion is the device's wish for the
 * states reached by play, so a shot is taken where the page stands, not mid flourish.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const YONDER = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(YONDER, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.YONDER && window.YONDER.ready';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const dragFlag = (page, frac) => page.evaluate(frac => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(road.dataset.offset) + frac * Number(road.dataset.width));
  const o = x => ({ pointerId: 151, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const walked = page => page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 }).then(() => sleep(150));

for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  if (want('p3-first-' + tag)) {
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&', ready: READY }));
    await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 2600; }));
    await sleep(80);
    save('p3-first-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
  if (want('p3-flag-' + tag)) {
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&road=100&', ready: READY }));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await tap(page, '#start'); await sleep(250);
    save('p3-flag-build-' + tag, await page.screenshot({ type: 'png' }));
    await dragFlag(page, 0.7); await walked(page);
    save('p3-flag-walked-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
  if (want('p3-race-' + tag)) {
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&mode=race&', ready: READY }));
    await tap(page, '#start'); await sleep(250);
    for (let k = 0; k < 6; k++) {
      const st = await page.evaluate(() => window.YONDER.race.state());
      if (st.remaining === 0) await tap(page, '#card');
      else await tap(page, '#track .square[data-n="' + (st.pos + 1) + '"]');
      await sleep(150);
    }
    await tap(page, '#card').catch(() => {}); await sleep(200);
    save('p3-race-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
  if (want('p3-map-' + tag)) {
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&count=10&', ready: READY }));
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.evaluate(() => {
      const rec = { v: 1, adapt: {}, collect: Array.from({ length: 13 }, (_, i) => 'piece-' + (i + 1)), settings: { muted: true, reducedMotion: false, allModes: false, highContrast: false } };
      localStorage.setItem('lw:yonder:save', JSON.stringify(rec));
    });
    await page.reload({ waitUntil: 'load' }); await page.waitForFunction(READY, { timeout: 30000 });
    await tap(page, '#start'); await sleep(250);
    const n = await page.evaluate(() => window.YONDER.runLength());
    for (let i = 0; i < n; i++) { await dragFlag(page, 0.5); await walked(page); await tap(page, '#next'); await sleep(200); }
    await sleep(300);
    save('p3-map-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
