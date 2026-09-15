#!/usr/bin/env node
/* SPAN's equals sign screener (plans/span/HANDOFF-SPAN.md P3 step 1 and section 3.5): TRUE OR NOT, ten items, three
 * minutes, the whole class, no login, a result for the teacher on the device and nowhere else.
 *
 *   node test/screener.mjs          (in the foreground, under the gate lock)
 *
 * The items and what the teacher must be told are computed here in Node from engine.js for the same seed, from the
 * terms (isStandardLayout) and the choices this gate makes, never read from the page.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 375: start is a 56 px target; the first item is the engine's first judged item of ten, term for term; the
 *      two choices are 56 px targets
 *   2. ten choices by thumb, seven with the engine's truth and three against it: after each, the next item is on the
 *      page at once and nothing is revealed (no caption, no span, no pier moving, no mark left on a choice)
 *   3. after ten, the end screen holds no score anywhere in its text; a short tap on the teacher's control shows
 *      nothing; a two second hold shows "Correct: 7 of 10", the nonstandard line and "Reached: 10 of 10", each the
 *      number Node computed
 *   4. nothing is fetched after load and nothing is written to storage from start to result
 *   5. ?minutes=1: three items chosen, the screener ends itself a minute after start (not before 59 s), and the
 *      teacher's result says "Reached: 3 of 10" with the counts over those three
 *   6. the whole screener by keys at 1366x768, the hold by holding Enter
 *   7. nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { generateSet, evaluate, isStandardLayout } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.SCREEN && window.SCREEN.ready';
const ITEMS = generateSet(rng(SEED), { mode: 'judge', size: 10, first: true });
const pathFor = extra => '/span/screen/index.html?seed=' + SEED + '&' + (extra || '');

const pageTerms = page => page.evaluate(() => Array.from(document.querySelectorAll('#equation .term')).map(el =>
  el.dataset.blank !== undefined ? { blank: true, side: el.dataset.side } : el.dataset.op ? { op: el.dataset.op } : { n: Number(el.dataset.n), side: el.dataset.side }));
const sameTerms = (terms, eq) => {
  const want = eq.left.map(t => t.op ? t : Object.assign({}, t, { side: 'left' })).concat([{ op: '=' }], eq.right.map(t => t.op ? t : Object.assign({}, t, { side: 'right' })));
  return terms.length === want.length && terms.every((t, i) => want[i].op ? t.op === want[i].op : !t.blank && t.n === want[i].n && t.side === want[i].side);
};
const storage = page => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return JSON.stringify(o); });
const shown = (page, sel) => page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return !e.hidden && r.width > 0 && r.height > 0; }, sel);
/* anything that would tell a child how an item went: a caption with words, a span, a pressed choice */
const revealed = page => page.evaluate(() => {
  const out = [];
  const cap = document.getElementById('caption');
  if (cap && cap.textContent.trim()) out.push('a caption: ' + cap.textContent.trim());
  const span = document.getElementById('span');
  if (span && !span.hidden && getComputedStyle(span).display !== 'none') out.push('a span');
  document.querySelectorAll('[aria-pressed="true"]').forEach(b => out.push('a pressed ' + b.id));
  return out;
});
/* the teacher's lines in Node: correct over ten, nonstandard correct over the nonstandard items of the ten, reached */
function teacher(choices) {
  let correct = 0, nonCorrect = 0;
  const non = ITEMS.filter(eq => !isStandardLayout(eq)).length;
  choices.forEach((c, i) => {
    const eq = ITEMS[i], right = (c === 'same') === evaluate(eq, null);
    if (right) { correct++; if (!isStandardLayout(eq)) nonCorrect++; }
  });
  return ['Correct: ' + correct + ' of 10', 'Nonstandard correct: ' + nonCorrect + ' of ' + non, 'Reached: ' + choices.length + ' of 10'];
}
const resultLines = page => page.evaluate(() => { const r = document.getElementById('result'); return r && !r.hidden ? r.innerText.split('\n').map(l => l.trim()).filter(Boolean) : []; });
async function hold(page, sel, ms) {
  const at = await centre(page, sel);
  if (!at) return false;
  const fire = type => page.evaluate((type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 97, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), type, at.x, at.y);
  await fire('pointerdown');
  await sleep(ms);
  await fire('pointerup');
  await sleep(150);
  return true;
}
const choose = async (page, c) => { await tap(page, '#' + c); await sleep(120); };

/* ---- ten items by thumb ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor(), ready: READY }));
  const { browser, page, errors } = opened;
  const before = await storage(page);
  const start = await centre(page, '#start');
  say(!!start && start.w >= 56 && start.h >= 56 && start.onTop, 'start is a 56 px target a thumb lands on' + (start ? ' (' + Math.round(start.w) + 'x' + Math.round(start.h) + ')' : ' (missing)'));
  if (start) await tap(page, '#start');
  await sleep(200);
  const first = await pageTerms(page);
  say(sameTerms(first, ITEMS[0]), 'the first item is the engine\'s first judged item of ten, term for term (' + JSON.stringify(first) + ')');
  const small = [];
  for (const sel of ['#same', '#apart']) { const r = await centre(page, sel); if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) : ' missing')); }
  say(small.length === 0, 'the two choices are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));

  const choices = [], leaks = [], misses = [];
  if (small.length === 0) {
    for (let i = 0; i < 10; i++) {
      const truth = evaluate(ITEMS[i], null), c = (i < 7) === truth ? 'same' : 'apart';
      await choose(page, c);
      choices.push(c);
      const r = await revealed(page);
      if (r.length) leaks.push('item ' + (i + 1) + ': ' + r.join(', '));
      if (i < 9) { const t = await pageTerms(page); if (!sameTerms(t, ITEMS[i + 1])) misses.push('item ' + (i + 2) + ' ' + JSON.stringify(t)); }
    }
  }
  say(choices.length === 10 && misses.length === 0, 'after each choice the next item is on the page at once, term for term' + (misses.length ? ' (' + misses.slice(0, 2).join('; ') + ')' : ''));
  say(choices.length === 10 && leaks.length === 0, 'and nothing between items tells a child how the last one went' + (leaks.length ? ' (' + leaks.slice(0, 3).join('; ') + ')' : ''));

  const done = await shown(page, '#done');
  const text = await page.evaluate(() => document.body.innerText);
  say(done && !/\d+\s+of\s+10|Correct|Reached/.test(text), 'after ten the end screen shows, and no score is anywhere in the page\'s text' + (done ? '' : ' (no end screen)'));
  if (done) {
    await tap(page, '#teacher');
    await sleep(300);
    say((await resultLines(page)).length === 0, 'a short tap on the teacher\'s control shows nothing (' + JSON.stringify(await resultLines(page)) + ')');
    await hold(page, '#teacher', 2200);
    const lines = await resultLines(page), want = teacher(choices);
    say(want.every(w => lines.indexOf(w) >= 0), 'a two second hold shows the teacher the result Node computed (' + JSON.stringify(lines) + ' for ' + JSON.stringify(want) + ')');
  }
  const after = await storage(page);
  say(before === after, 'nothing was written to storage from start to result' + (before === after ? '' : ' (' + before + ' then ' + after + ')'));
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, 'nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the cap: a one minute link, three items chosen ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: pathFor('minutes=1&'), ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  const t0 = Date.now();
  await sleep(200);
  const choices = [];
  for (let i = 0; i < 3; i++) { const c = evaluate(ITEMS[i], null) ? 'same' : 'apart'; await choose(page, c); choices.push(c); }
  const early = await shown(page, '#done');
  let ended = 0;
  try { await page.waitForFunction(() => { const d = document.getElementById('done'); return d && !d.hidden; }, { timeout: 80000, polling: 250 }); ended = Date.now() - t0; } catch (e) { ended = 0; }
  say(!early && ended >= 59000 && ended <= 70000, 'a one minute link ends itself a minute after start and not before (' + (early ? 'ended at once' : ended ? (ended / 1000).toFixed(1) + ' s' : 'never ended') + ')');
  if (ended) {
    await hold(page, '#teacher', 2200);
    const lines = await resultLines(page), want = teacher(choices);
    say(want.every(w => lines.indexOf(w) >= 0), 'and the teacher\'s result counts only what was reached (' + JSON.stringify(lines) + ' for ' + JSON.stringify(want) + ')');
  }
  say(errors.length === 0, 'the cap: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keys ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], { path: pathFor(), ready: READY }));
  const { browser, page, errors } = opened;
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await sleep(200);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#same' }, { key: 'Enter', times: 10 }],
    () => { const d = document.getElementById('done'); return !!d && !d.hidden; });
  say(kb.ok, '1366x768 all ten items are chosen by keys (' + kb.detail + ')');
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => !!document.activeElement && document.activeElement.id === 'teacher')) break;
    await page.keyboard.press('Tab');
  }
  await page.keyboard.down('Enter');
  await sleep(2200);
  await page.keyboard.up('Enter');
  await sleep(150);
  const lines = await resultLines(page), want = teacher(Array(10).fill('same'));
  say(want.every(w => lines.indexOf(w) >= 0), '1366x768 holding Enter on the teacher\'s control shows the result (' + JSON.stringify(lines) + ' for ' + JSON.stringify(want) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SCREENER FAILURE(S)'); process.exit(1); }
console.log('SCREENER OK');
