#!/usr/bin/env node
/* GAUGE's ZOOM, played by real taps and keys against the engine replayed in Node (plans/gauge/HANDOFF-GAUGE.md P2; GA4, the reveal
 * contract).
 *
 *   node test/zoom.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every round's target is dealZoom's for the seed, shown as dealt in tabular figures
 *   2. GA4: at every level the child opens, the rule has eleven ticks at equal spacing, its end labels are subdivide's for that
 *      level, and the marker sits on the division the child is at
 *   3. the rules are never rebuilt: the same tick elements and the same node counts from the first round to the last
 *   4. put it here is scored as scoreZoom scores the child's whole path, right and wrong; the true rule is hidden until after the
 *      answer and then marks the value's division, its two ticks labelled with subdivide's values
 *   5. with Sound on, one detent a move pitched by the level it lands on and one on put it here, and no other sound
 *   6. the five controls are 56 px targets a thumb lands on, at 375 and at 320
 *   7. 1366x768 by keys: arrows move and open, Enter puts it here, focus moves to go on, Enter deals the next round
 *   8. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, centre, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealZoom, zoomPath, scoreZoom, subdivide } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const SEED = 5151;
const values = dealZoom(rng(SEED >>> 0));
const revealed = page => page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });
const CONTROLS = ['#zoom-left', '#zoom-right', '#zoom-in', '#zoom-out', '#zoom-commit'];

/* the rule as drawn: tick centres, end labels, the marker's left edge */
const readRule = (page, id) => page.evaluate(id => {
  const host = document.getElementById(id);
  const ticks = Array.from(host.querySelectorAll('.tick')).map(t => { const b = t.getBoundingClientRect(); return b.left + b.width / 2; });
  const labels = Array.from(host.querySelectorAll('.label'));
  const m = host.querySelector('.marker').getBoundingClientRect();
  return { ticks, first: labels[0].textContent, last: labels[labels.length - 1].textContent, shown: labels.filter(l => getComputedStyle(l).visibility !== 'hidden').map(l => l.textContent), markerLeft: m.left, markerRight: m.right, hidden: host.hidden };
}, id);
const evenly = ticks => ticks.length === 11 && ticks.slice(1).every((x, i) => Math.abs((x - ticks[i]) - (ticks[1] - ticks[0])) < 1 && x > ticks[i]);

/* 1 to 6 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.GAUGE.audio.clear());
  await tap(page, '#start-zoom');
  await sleep(150);
  await page.evaluate(() => { window.__firstTick = document.querySelector('#rule-mine .tick'); window.__firstTruthTick = document.querySelector('#rule-truth .tick'); });
  const nodes0 = (await page.evaluate(() => window.GAUGE.zoom().nodes));
  const seam = [], ga4 = [], scored = [], contract = [], targets = [], want = [];
  let pool = true;
  for (let i = 0; i < values.length; i++) {
    const v = values[i], path = zoomPath(v);
    const shown = await page.evaluate(() => ({ text: document.getElementById('target').textContent, figures: getComputedStyle(document.getElementById('target')).fontVariantNumeric }));
    if (shown.text !== v || !/tabular-nums/.test(shown.figures)) seam.push(i + ' shows ' + JSON.stringify(shown) + ' for ' + v);
    if (i < 2) for (const sel of CONTROLS) { const c = await centre(page, sel); if (!c || c.w < 56 || c.h < 56 || !c.onTop) targets.push(i + ' ' + sel); }
    /* even rounds walk the true path; odd rounds stop one division short at the last level */
    const wrong = i % 2 === 1;
    const chosen = [];
    for (let k = 0; k < path.length; k++) {
      const lvl = path[k];
      const goal = k === path.length - 1 && wrong ? lvl.index - 1 : lvl.index;
      for (let n = 0; n < goal; n++) { await tap(page, '#zoom-right'); want.push('detent' + Math.max(0, lvl.places)); }
      await sleep(40);
      const rule = await readRule(page, 'rule-mine');
      const ends = subdivide(lvl.from, lvl.places);
      if (!evenly(rule.ticks) || rule.first !== ends[0] || rule.last !== ends[10] || Math.abs(rule.markerLeft - rule.ticks[goal]) > 3 || Math.abs(rule.markerRight - rule.ticks[goal + 1]) > 3) {
        ga4.push(i + ' level ' + k + ' ' + JSON.stringify({ first: rule.first, last: rule.last, want: [ends[0], ends[10]], even: evenly(rule.ticks), marker: [Math.round(rule.markerLeft), Math.round(rule.markerRight)], ticks: [Math.round(rule.ticks[goal]), Math.round(rule.ticks[goal + 1])] }));
      }
      chosen.push(goal);
      if (k < path.length - 1) { await tap(page, '#zoom-in'); want.push('detent' + path[k + 1].places); }
    }
    await tap(page, '#zoom-commit');
    want.push('detent');
    const during = await page.evaluate(() => document.getElementById('rule-truth').hidden);
    await revealed(page);
    const truth = await readRule(page, 'rule-truth');
    const last = path[path.length - 1], ticks = subdivide(last.from, last.places);
    const marks = !truth.hidden && Math.abs(truth.markerLeft - truth.ticks[last.index]) <= 3 && Math.abs(truth.markerRight - truth.ticks[last.index + 1]) <= 3
      && truth.shown.includes(ticks[last.index]) && truth.shown.includes(ticks[last.index + 1]);
    if (!during || !marks) contract.push(i + ' ' + JSON.stringify({ hiddenDuring: during, hiddenAfter: truth.hidden, shown: truth.shown, want: [ticks[last.index], ticks[last.index + 1]] }));
    const res = (await page.evaluate(() => window.GAUGE.results))[i];
    const expect = scoreZoom(v, chosen).correct;
    if (!res || res.target !== v || JSON.stringify(res.path) !== JSON.stringify(chosen) || res.correct !== expect || expect === wrong) scored.push(i + ' ' + JSON.stringify({ res, chosen, expect }));
    const same = await page.evaluate(() => window.__firstTick === document.querySelector('#rule-mine .tick') && window.__firstTruthTick === document.querySelector('#rule-truth .tick') && window.__firstTick.isConnected);
    const nodes = await page.evaluate(() => window.GAUGE.zoom().nodes);
    if (!same || JSON.stringify(nodes) !== JSON.stringify(nodes0)) pool = false;
    await tap(page, '#next');
    await sleep(80);
  }
  const sounds = await page.evaluate(() => window.GAUGE.audio.sounded());
  say(seam.length === 0, '375x667 every round\'s target is Node\'s dealZoom for the seed, shown as dealt in tabular figures' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(ga4.length === 0, '375x667 GA4: at every level opened, eleven ticks evenly spaced, the ends subdivide\'s, the marker on the division the child is at' + (ga4.length ? ': ' + ga4.slice(0, 2).join('; ') : ''));
  say(pool && nodes0[0] === nodes0[1] && nodes0[0] === 24, '375x667 the rules are never rebuilt: the same tick elements and ' + JSON.stringify(nodes0) + ' nodes from the first round to the last');
  say(scored.length === 0, '375x667 put it here is scored as scoreZoom scores the whole path, five right and five wrong' + (scored.length ? ': ' + scored.slice(0, 2).join('; ') : ''));
  say(contract.length === 0, '375x667 the true rule is hidden until after the answer, then marks the value\'s division with its two ticks labelled' + (contract.length ? ': ' + contract.slice(0, 2).join('; ') : ''));
  say(JSON.stringify(sounds) === JSON.stringify(want), '375x667 one detent a move pitched by its level and one on put it here, no other sound (' + sounds.length + ' for ' + want.length + ')' + (JSON.stringify(sounds) !== JSON.stringify(want) ? ': first difference at ' + sounds.findIndex((x, k) => x !== want[k]) : ''));
  say(targets.length === 0, '375x667 the five controls are 56 px targets a thumb lands on' + (targets.length ? ': ' + targets.join(', ') : ''));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 at 320 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[0], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '#start-zoom');
  await sleep(150);
  const targets = [];
  for (const sel of CONTROLS) { const c = await centre(page, sel); if (!c || c.w < 56 || c.h < 56 || !c.onTop) targets.push(sel); }
  const wide = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  say(targets.length === 0 && wide, SIZES[0].width + ' the five controls are 56 px targets a thumb lands on and nothing runs off the side' + (targets.length ? ': ' + targets.join(', ') : '') + (wide ? '' : ': the page scrolls sideways'));
  say(errors.length === 0, SIZES[0].width + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 7 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start-zoom').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const path = zoomPath(values[0]);
  for (let k = 0; k < path.length; k++) {
    for (let n = 0; n < path[k].index; n++) await page.keyboard.press('ArrowRight');
    if (k < path.length - 1) await page.keyboard.press('ArrowUp');
  }
  const before = await page.evaluate(() => window.GAUGE.zoom());
  await page.keyboard.press('Enter');
  await revealed(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await sleep(150);
  const second = await page.evaluate(() => ({ target: window.GAUGE.zoom().target, results: window.GAUGE.results.slice() }));
  const ok = before.depth === path.length && second.results.length === 1 && second.results[0].correct === true && onNext === 'next' && second.target === values[1];
  say(ok, '1366x768 by keys: arrows move and open to the value, Enter puts it here and is right, focus to go on, Enter deals the next round (' + JSON.stringify({ depth: before.depth, onNext, results: second.results.length, target: second.target }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ZOOM FAILURE(S)'); process.exit(1); }
console.log('ZOOM OK');
