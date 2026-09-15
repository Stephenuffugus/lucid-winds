#!/usr/bin/env node
/* SPAN's shots, from where a child and a teacher stand (plans/span/HANDOFF-SPAN.md P1; CLAUDE.md, LOOKING IS
 * PART OF THE JOB). Every shot is opened with the Read tool and three faults are named before the change it
 * shows is called done.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p1-reveal  only names containing that
 *
 * The same seed as the play gate, so a shot shows the rounds the gate proved.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const SPAN = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(SPAN, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const PAGE = { path: '/span/index.html?seed=4242&', ready: 'window.SPAN && window.SPAN.ready' };
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const drop = (page, pierId) => page.evaluate((pierId) => {
  const src = document.querySelector('#supply .stone-source'), pier = document.getElementById(pierId);
  const a = src.getBoundingClientRect(), b = pier.getBoundingClientRect();
  const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 71, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
  fire('pointermove', b.left + b.width / 2, b.top + 30);
  fire('pointerup', b.left + b.width / 2, b.top + 30);
}, pierId);
const blankPier = page => page.evaluate(() => 'pier-' + document.querySelector('#equation .term[data-blank]').dataset.side);
const revealed = page => page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 }).then(() => sleep(150));
async function longPress(page) {
  const at = await page.evaluate(() => { const r = document.querySelector('#supply .stone-source').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const fire = type => page.evaluate((type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 72, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), type, at[0], at[1]);
  await fire('pointerdown'); await sleep(800); await fire('pointerup'); await sleep(150);
}

for (const size of [SIZES[1], SIZES[0]]) {
  const tag = size.width;
  const { browser, page } = await open(s.base, Object.assign({}, size, PAGE));
  /* the five second loop at three moments, read off the loop's own clock: the span sliding off, the stone falling, flat */
  if (tag === 375 && want('p1-first-375')) {
    for (const [name, at] of [['slide', 1.2], ['stone', 2.0], ['flat', 3.6]]) {
      await page.evaluate(at => document.getAnimations().forEach(a => { a.pause(); a.currentTime = at * 1000; }), at);
      await sleep(80);
      save('p1-first-375-' + name, await page.screenshot({ type: 'png' }));
    }
    await page.evaluate(() => document.getAnimations().forEach(a => a.play()));
  }
  await tap(page, '#start');
  await sleep(250);
  const pier = await blankPier(page);
  /* still frames only: every seat and its dust are over before a shot */
  await drop(page, pier); await sleep(100); await drop(page, pier); await sleep(900);
  if (tag === 375 && want('p1-build-375')) save('p1-build-375', await page.screenshot({ type: 'png' }));
  await tap(page, '#lay');
  await revealed(page);
  if (want('p1-reveal-same-' + tag)) save('p1-reveal-same-' + tag, await page.screenshot({ type: 'png' }));
  await tap(page, '#next');
  await sleep(200);
  await longPress(page);
  await tap(page, '#lay');
  await revealed(page);
  if (want('p1-reveal-apart-' + tag)) save('p1-reveal-apart-' + tag, await page.screenshot({ type: 'png' }));
  await browser.close();
}

/* TRUE OR NOT on the same seed as the play gate: before a choice, a true item chosen the same, and the set's false item
   chosen the same too, so the mark sits on a choice the piers do not bear out */
for (const size of [SIZES[1], SIZES[0]]) {
  const tag = size.width;
  if (!want('p2-judge')) continue;
  const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/span/index.html?seed=4242&count=5&mode=judge&', ready: PAGE.ready }));
  await tap(page, '#start');
  await sleep(300);
  if (tag === 375) save('p2-judge-choose-375', await page.screenshot({ type: 'png' }));
  for (let k = 0; k < 5; k++) {
    await tap(page, '#same');
    await revealed(page);
    const r = await page.evaluate(k => window.SPAN.results[k], k);
    if (k === 0 && tag === 375) save('p2-judge-true-375', await page.screenshot({ type: 'png' }));
    if (r && !r.same) { save('p2-judge-false-' + tag, await page.screenshot({ type: 'png' })); break; }
    await tap(page, '#next');
    await sleep(250);
  }
  await browser.close();
}

/* RELATIONAL on the play gate's seed: the labelled supply at 375 and 320 mid build, and the wrong round revealed */
for (const size of [SIZES[1], SIZES[0]]) {
  const tag = size.width;
  if (!want('p2-relational')) continue;
  const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/span/index.html?seed=4242&count=5&mode=relational&', ready: PAGE.ready }));
  await tap(page, '#start');
  await sleep(300);
  const pier = await page.evaluate(() => 'pier-' + document.querySelector('#equation .term[data-blank]').dataset.side);
  const SRC = v => '#supply .stone-source[data-value="' + v + '"]';
  const from = (sel, pierId) => page.evaluate((sel, pierId) => {
    const src = document.querySelector(sel), p = document.getElementById(pierId), a = src.getBoundingClientRect(), b = p.getBoundingClientRect();
    const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
      { pointerId: 73, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
    fire('pointermove', b.left + b.width / 2, b.top + 30);
    fire('pointerup', b.left + b.width / 2, b.top + 30);
  }, sel, pierId);
  await from(SRC(100), pier); await sleep(120); await from(SRC(10), pier); await sleep(120); await from(SRC(1), pier); await sleep(900);
  save('p2-relational-build-' + tag, await page.screenshot({ type: 'png' }));
  if (tag === 375) {
    await tap(page, '#lay');
    await revealed(page);
    save('p2-relational-apart-375', await page.screenshot({ type: 'png' }));
  }
  await browser.close();
}

/* the viaduct after a run of five: the first arch at 375, and twelve arches (a store of eleven and a run) at 375 and
   320, far enough into the haze to see it. The store is set here because this is a shot, not a gate. */
for (const [name, size, before] of [['p2-viaduct-first-375', SIZES[1], 0], ['p2-viaduct-twelve-375', SIZES[1], 11], ['p2-viaduct-twelve-320', SIZES[0], 11]]) {
  if (!want(name)) continue;
  const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/span/index.html?seed=4242&count=5&', ready: PAGE.ready }));
  if (before) {
    await page.evaluate(n => {
      const rec = JSON.parse(localStorage.getItem('lw:span:save') || 'null') || { v: 1, adapt: {}, settings: { muted: true, reducedMotion: false, allModes: false, highContrast: false } };
      rec.collect = Array.from({ length: n }, (_, i) => 'arch-' + (i + 1));
      localStorage.setItem('lw:span:save', JSON.stringify(rec));
    }, before);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(PAGE.ready, { timeout: 30000 });
  }
  await tap(page, '#start');
  await sleep(250);
  for (let i = 0; i < 5; i++) {
    const p = await blankPier(page);
    await drop(page, p);
    await sleep(150);
    await tap(page, '#lay');
    await revealed(page);
    await tap(page, '#next');
    await sleep(250);
  }
  await sleep(700);
  save(name, await page.screenshot({ type: 'png' }));
  await browser.close();
}

/* the screener: an item at 375 and 320, the end screen a child is left holding, and the teacher's result after the hold */
for (const size of [SIZES[1], SIZES[0]]) {
  const tag = size.width;
  if (!want('p3-screen')) continue;
  const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/span/screen/index.html?seed=4242&', ready: 'window.SCREEN && window.SCREEN.ready' }));
  await tap(page, '#start');
  await sleep(300);
  save('p3-screen-item-' + tag, await page.screenshot({ type: 'png' }));
  if (tag === 375) {
    for (let i = 0; i < 10; i++) { await tap(page, i % 3 ? '#same' : '#apart'); await sleep(120); }
    await sleep(300);
    save('p3-screen-done-375', await page.screenshot({ type: 'png' }));
    const at = await page.evaluate(() => { const r = document.getElementById('teacher').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const fire = type => page.evaluate((type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
      { pointerId: 74, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), type, at[0], at[1]);
    await fire('pointerdown'); await sleep(2200); await fire('pointerup'); await sleep(200);
    save('p3-screen-result-375', await page.screenshot({ type: 'png' }));
  }
  await browser.close();
}

if (want('p1-keyboard-1366')) {
  const { browser, page } = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  await page.keyboard.press('Tab'); await page.keyboard.press('Enter'); await sleep(200);
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => document.activeElement && document.activeElement.id === 'canyon')) break;
    await page.keyboard.press('Tab');
  }
  await page.keyboard.press('ArrowUp'); await page.keyboard.press('ArrowUp'); await sleep(900);
  save('p1-keyboard-1366', await page.screenshot({ type: 'png' }));
  await browser.close();
}

s.close();
console.log('shots done');
