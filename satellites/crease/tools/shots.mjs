#!/usr/bin/env node
/* CREASE's shots, from where a child and a teacher stand (plans/crease/HANDOFF-CREASE.md; CLAUDE.md, LOOKING IS PART OF
 * THE JOB). Every shot is opened with the Read tool and three faults are named before the change it shows is called done.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p1-reveal  only names containing that
 *
 * The same seed as the gates, so a shot shows the rounds the gates proved.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const CREASE = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(CREASE, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.CREASE && window.CREASE.ready';
const PATH = '/crease/index.html?seed=4242&mode=freehand&';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
/* a drag of the clip toward a fraction of the strip, held (no lift) so the loupe shows, or let go */
const dragClip = (page, frac, lift) => page.evaluate((frac, lift) => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 181, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  if (lift) st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac, lift);

for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  const { browser, page } = await open(s.base, Object.assign({}, size, { path: PATH, ready: READY }));
  if (want('p1-first-' + tag)) {
    await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 1800; }));
    await sleep(80);
    save('p1-first-' + tag, await page.screenshot({ type: 'png' }));
    await page.evaluate(() => document.getAnimations().forEach(a => a.play()));
  }
  await tap(page, '#start');
  await sleep(250);
  if (want('p1-build-' + tag)) save('p1-build-' + tag, await page.screenshot({ type: 'png' }));
  const t = await page.evaluate(() => window.CREASE.task());
  const value = t.numerator / t.denominator / t.whole;
  if (want('p1-drag-' + tag) && size.touch) {
    await dragClip(page, Math.min(1, value + 0.2), false);
    await sleep(80);
    save('p1-drag-' + tag, await page.screenshot({ type: 'png' }));
    await page.evaluate(() => { const st = document.querySelector('#strip .lw-stone'), r = st.getBoundingClientRect();
      st.dispatchEvent(new PointerEvent('pointerup', { pointerId: 181, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + 10 })); });
  } else {
    await dragClip(page, Math.min(1, value + 0.2), true);
  }
  await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
  await sleep(150);
  if (want('p1-reveal-' + tag)) save('p1-reveal-' + tag, await page.screenshot({ type: 'png' }));
  await browser.close();
}

/* P3: the doors, CREASE mode folded, a chain's stacked reveal, HALFWAY with exactly half open, the shelf after a run */
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
const P3 = [
  ['p3-doors', '?seed=4242&', async page => {
    await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 4500; }));
    await sleep(80);
  }],
  ['p3-crease', '?seed=4242&', async page => {
    await tap(page, '#start-crease'); await sleep(250);
    for (let i = 0; i < 3; i++) { await tap(page, '#fold-more'); await sleep(100); }
  }],
  ['p3-stack', '?seed=7&mode=freehand&', async page => {
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 3; i++) { if (i) { await tap(page, '#next'); await sleep(200); } await dragClip(page, 0.4, true); await revealed(page); }
    await sleep(150);
  }],
  ['p3-halfway', '?seed=4242&', async page => {
    await tap(page, '#start-halfway'); await sleep(250);
    for (let i = 0; i < 5; i++) {
      if (i) { await tap(page, '#next'); await sleep(200); }
      const side = await page.evaluate(() => { const t = window.CREASE.task(); return 2 * t.numerator < t.denominator ? '#less' : '#more'; });
      await tap(page, side);
      await revealed(page);
    }
    await tap(page, '#next'); await sleep(300);
  }],
  ['p3-shelf', '?seed=4242&count=10&', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 10; i++) { await dragClip(page, 0.5, true); await revealed(page); await tap(page, '#next'); await sleep(200); }
    await sleep(300);
  }]
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach] of P3) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/crease/index.html' + query, ready: READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
