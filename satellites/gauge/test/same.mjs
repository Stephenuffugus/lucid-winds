#!/usr/bin/env node
/* GAUGE's SAME VALUE, played by real taps and keys against the engine replayed in Node (plans/gauge/HANDOFF-GAUGE.md P2; the reveal
 * contract).
 *
 *   node test/same.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every item of two sessions is dealSame's for the seed, shown as dealt in tabular figures
 *   2. both answers are 56 px targets a thumb lands on
 *   3. the reveal contract: the choice stays marked; the true answer is lit only after the answer, on right and wrong rounds alike
 *   4. every result is scoreSame's: answering as the zero rule does, right on every moved zero pair and wrong on every trailing one
 *   5. with Sound on, one detent a round and no other sound
 *   6. 1366x768 by keys: focus comes to the same value, Enter answers, focus moves to go on, Enter deals the next item
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, centre, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSame, scoreSame } from '../engine.js';
import { parse } from '../decimal.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';
const SEED = 6262;
const r = rng(SEED >>> 0);
const items = dealSame(r).concat(dealSame(r));
const revealed = page => page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });
/* the zero rule: a zero anywhere among the places makes it another number */
const zeroRule = it => (parse(it.left).places.includes('0') || parse(it.right).places.includes('0') ? 'different' : 'same');

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.GAUGE.audio.clear());
  await tap(page, '#start-same');
  await sleep(150);
  const seam = [], targets = [], contract = [], scored = [];
  let right = 0, wrongs = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const shown = await page.evaluate(() => ({ left: document.getElementById('same-left').textContent, right: document.getElementById('same-right').textContent, figures: getComputedStyle(document.getElementById('same-left')).fontVariantNumeric }));
    if (shown.left !== it.left || shown.right !== it.right || !/tabular-nums/.test(shown.figures)) seam.push(i + ' shows ' + JSON.stringify(shown) + ' for ' + it.left + ' vs ' + it.right);
    if (i < 2) for (const sel of ['#same-yes', '#same-no']) { const c = await centre(page, sel); if (!c || c.w < 56 || c.h < 56 || !c.onTop) targets.push(i + ' ' + sel); }
    const choice = zeroRule(it), sel = choice === 'same' ? '#same-yes' : '#same-no';
    await tap(page, sel);
    const during = await page.evaluate(() => document.querySelectorAll('#same-view .is-more').length);
    await revealed(page);
    const after = await page.evaluate(sl => ({ pressed: document.querySelector(sl).getAttribute('aria-pressed'), lit: Array.from(document.querySelectorAll('#same-view .is-more')).map(e => e.id) }), sel);
    const wantLit = [it.answer === 'same' ? 'same-yes' : 'same-no'];
    if (during !== 0 || after.pressed !== 'true' || JSON.stringify(after.lit) !== JSON.stringify(wantLit)) contract.push(i + ' ' + JSON.stringify({ during, after, wantLit }));
    const res = (await page.evaluate(() => window.GAUGE.results))[i];
    const expect = scoreSame(it, choice).correct;
    if (!res || res.left !== it.left || res.right !== it.right || res.choice !== choice || res.correct !== expect || expect !== (it.kind === 'inner')) scored.push(i + ' ' + JSON.stringify({ res, choice, expect, kind: it.kind }));
    if (expect) right++; else wrongs++;
    await tap(page, '#next');
    await sleep(80);
    /* ⛔ since P3 a finished session earns an instrument and the case opens over the next item with the round inert; this gate
       plays two sessions and its thirteenth tap landed on the case and waited 20 s for a reveal (same.mjs:51). Go closes the
       case, as a child would, and the round beneath must be live again. */
    if (await page.evaluate(() => window.GAUGE.instruments.shown())) {
      await tap(page, '#case-go');
      await sleep(120);
      const live = await page.evaluate(() => ({ shown: window.GAUGE.instruments.shown(), inert: document.getElementById('play').inert, phase: window.GAUGE.phase() }));
      if (live.shown || live.inert || live.phase !== 'answer') contract.push(i + ' the case did not close onto a live item ' + JSON.stringify(live));
    }
  }
  const sounds = await page.evaluate(() => window.GAUGE.audio.sounded());
  say(seam.length === 0, '375x667 every item of two sessions is Node\'s dealSame for the seed, shown as dealt in tabular figures' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(targets.length === 0, '375x667 both answers are 56 px targets a thumb lands on' + (targets.length ? ': ' + targets.join(', ') : ''));
  say(contract.length === 0, '375x667 the choice stays marked and the true answer is lit only after, right or wrong' + (contract.length ? ': ' + contract.slice(0, 2).join('; ') : ''));
  say(scored.length === 0 && right === 12 && wrongs === 12, '375x667 every result is scoreSame\'s, the zero rule right on the moved zeros and wrong on the trailing ones (' + right + ' right, ' + wrongs + ' wrong)' + (scored.length ? ': ' + scored.slice(0, 2).join('; ') : ''));
  say(sounds.length === items.length && sounds.every(x => x === 'detent'), '375x667 one detent a round and no other sound (' + sounds.length + ' for ' + items.length + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/gauge/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start-same').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const f0 = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await revealed(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.keyboard.press('Enter');
  await sleep(150);
  const second = await page.evaluate(() => ({ focus: document.activeElement && document.activeElement.id, item: window.GAUGE.sameItem(), results: window.GAUGE.results.slice() }));
  const ok = f0 === 'same-yes' && onNext === 'next' && second.focus === 'same-yes' && second.results.length === 1 && second.results[0].choice === 'same' && second.item.left === items[1].left;
  say(ok, '1366x768 by keys: focus on the same value, Enter answers, focus to go on, Enter deals the next item (' + JSON.stringify({ f0, onNext, focus: second.focus }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SAME FAILURE(S)'); process.exit(1); }
console.log('SAME OK');
