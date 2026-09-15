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
