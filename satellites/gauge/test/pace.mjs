#!/usr/bin/env node
/* GAUGE's pace and its constant node count (plans/gauge/HANDOFF-GAUGE.md 3.6 and P3: "the pace gate holding the node count").
 * Measured with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is Stephen's.
 *
 *   node test/pace.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. GA4: over a walk of ZOOM moves (right, open, left, back out, across every depth) the document holds the same number of
 *      elements before and after every move, and the rule's first tick is the same node from the first move to the last
 *   2. under 4x CPU throttle every move is painted within 100 ms of its tap, a median of at most 1000/30 ms
 *   3. with less motion the reveal is instant: the true rule is shown on the first frame after put it here, and go on comes
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const median = xs => { const a = xs.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : Infinity; };

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=4242&', ready: READY }));
  await page.evaluate(() => document.getElementById('start-zoom').click());
  await sleep(300);
  const cdp = await page.target().createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.evaluate(() => { window.__tick0 = document.querySelector('#rule-mine .tick'); });
  const walk = ['zoom-right', 'zoom-right', 'zoom-in', 'zoom-right', 'zoom-in', 'zoom-right', 'zoom-right', 'zoom-in', 'zoom-left',
    'zoom-out', 'zoom-out', 'zoom-left', 'zoom-in', 'zoom-right', 'zoom-in', 'zoom-in', 'zoom-out', 'zoom-out', 'zoom-out', 'zoom-right'];
  const counts = [], times = [];
  let same = true;
  for (const id of walk) {
    const r = await page.evaluate(id => new Promise(resolve => {
      const before = document.getElementsByTagName('*').length;
      const t0 = performance.now();
      document.getElementById(id).click();
      requestAnimationFrame(() => requestAnimationFrame(now => resolve({ before, after: document.getElementsByTagName('*').length, ms: now - t0, same: window.__tick0 === document.querySelector('#rule-mine .tick') && window.__tick0.isConnected })));
    }), id);
    counts.push([r.before, r.after]);
    times.push(r.ms);
    if (!r.same) same = false;
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const drift = counts.filter(([b, a]) => b !== a);
  const depths = await page.evaluate(() => window.GAUGE.zoom().depth);
  say(drift.length === 0 && same, '375x667 GA4: over ' + walk.length + ' moves across the depths the document holds ' + (counts[0] ? counts[0][0] : '?') + ' elements before and after every move, and the rule\'s first tick is the same node throughout' + (drift.length ? ': ' + JSON.stringify(drift.slice(0, 3)) : '') + (same ? '' : ' (the tick was replaced)') + ' (ended at depth ' + depths + ')');
  const worst = Math.max(...times), mid = median(times);
  say(worst <= 100 && mid <= 1000 / 30, '375x667 under 4x CPU throttle every move is painted within 100 ms of its tap, median ' + mid.toFixed(1) + ' ms (at most ' + (1000 / 30).toFixed(1) + '), longest ' + worst.toFixed(1) + ' ms');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=4242&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluate(() => document.getElementById('start-zoom').click());
  await sleep(200);
  const r = await page.evaluate(() => new Promise(resolve => {
    document.getElementById('zoom-commit').click();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve({ truth: !document.getElementById('rule-truth').hidden, next: getComputedStyle(document.getElementById('next')).visibility, done: window.GAUGE.revealDone() })));
  }));
  say(r.truth && r.next !== 'hidden' && r.done, '375x667 with less motion the true rule shows on the first frames after put it here and go on comes (' + JSON.stringify(r) + ')');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PACE FAILURE(S)'); process.exit(1); }
console.log('PACE OK');
