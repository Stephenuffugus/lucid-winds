#!/usr/bin/env node
/* CREASE's layout at the catalog's four sizes (plans/crease/HANDOFF-CREASE.md P3; the handoff's test gate 8): 320x568,
 * 375x667 and 412x915 by thumb, 1366x768 with a keyboard and no touch. The shape of satellites/yonder/test/layout.mjs.
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child meets is reached by play, never set: the three doors, FREEHAND before the clip goes down and after
 * its reveal, CREASE mode folded, a chain's stacked reveal, HALFWAY with exactly half open after five right, and the shelf
 * after a run.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport
 *   2. the doors, the clip, next, the folds, the choices and the shelf's go are 56 px targets, the gear 48 px, a thumb
 *      landing on each
 *   3. no text on the page is under 0.7 rem
 *   4. the page does not scroll sideways
 *   5. every element that shows a digit shows tabular lining figures (CORE's assertTabularNumerals)
 *   6. nothing is fetched after load and nothing lands on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertTabularNumerals } from '../../math/core/test/shared.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.CREASE && window.CREASE.ready';
const GEAR = '.lw-settings-open';

const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 221, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(150));
const round = async (page, frac) => { await dragClip(page, frac); await revealed(page); };

const STATES = [
  { name: 'the three doors', path: '?seed=4242&', big: ['#start', '#start-crease', '#start-halfway'], small: [GEAR], reach: async () => {} },
  { name: 'FREEHAND before the clip goes down', path: '?seed=4242&', big: ['#strip .lw-stone'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); } },
  { name: 'FREEHAND after the reveal', path: '?seed=4242&', big: ['#next'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); await round(page, 0.8); } },
  { name: 'CREASE mode folded', path: '?seed=4242&', big: ['#fold-less', '#fold-more', '#strip .lw-stone'], small: [GEAR], reach: async page => {
    await tap(page, '#start-crease'); await sleep(250);
    for (let i = 0; i < 3; i++) { await tap(page, '#fold-more'); await sleep(80); }
  } },
  { name: 'a chain\'s stacked reveal', path: '?seed=7&mode=freehand&', big: ['#next'], small: [GEAR], reach: async page => {
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 3; i++) { if (i) { await tap(page, '#next'); await sleep(200); } await round(page, 0.4); }
    if (!(await page.evaluate(() => !!document.getElementById('stack')))) throw new Error('no stacked reveal on round 3');
  } },
  { name: 'HALFWAY with exactly half open', path: '?seed=4242&', big: ['#less', '#half', '#more'], small: [GEAR], reach: async page => {
    await tap(page, '#start-halfway'); await sleep(250);
    for (let i = 0; i < 5; i++) {
      if (i) { await tap(page, '#next'); await sleep(200); }
      const side = await page.evaluate(() => { const t = window.CREASE.task(); return 2 * t.numerator < t.denominator ? '#less' : '#more'; });
      await tap(page, side);
      await revealed(page);
    }
    await tap(page, '#next'); await sleep(250);
  } },
  { name: 'the shelf after a run', path: '?seed=4242&count=10&', big: ['#shelf-go'], small: [], reach: async page => {
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 10; i++) { await round(page, 0.5); await tap(page, '#next'); await sleep(200); }
    await sleep(200);
    if (!(await page.evaluate(() => window.CREASE.shelf.shown()))) throw new Error('the shelf did not open');
  } }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: '/crease/index.html' + st.path, ready: READY }));
    const { browser, page, errors } = opened;
    /* less motion is the device's wish, so a state is reached in a gate's time; nothing drawn depends on it */
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    let reached = true;
    try { await st.reach(page); } catch (e) { reached = false; say(false, at + ' the state is reached by play (' + e.message.split('\n')[0] + ')'); }
    if (reached) {
      const off = await page.evaluate(sels => {
        window.scrollTo(0, 0);
        const vv = window.visualViewport, vh = vv ? vv.height : innerHeight, vw = vv ? vv.width : innerWidth;
        return sels.filter(sel => {
          const e = document.querySelector(sel);
          if (!e) return true;
          const r = e.getBoundingClientRect();
          return r.width < 1 || r.bottom > vh + 0.5 || r.top < -0.5 || r.right > vw + 0.5 || r.left < -0.5;
        }).map(sel => sel + ' (' + (() => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) + ' to ' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' in ' + Math.round(vw) + 'x' + Math.round(vh); })() + ')');
      }, st.big.concat(st.small));
      say(off.length === 0, at + ' everything a thumb needs is on the screen without scrolling' + (off.length ? ': ' + off.join(', ') : ''));

      const small = [];
      for (const [list, min] of [[st.big, 56], [st.small, 48]]) {
        for (const sel of list) {
          const r = await centre(page, sel);
          if (!r || r.w < min || r.h < min || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing') + ' (needs ' + min + ')');
        }
      }
      say(small.length === 0, at + ' the young controls are 56 px targets and the gear 48 px' + (small.length ? ': ' + small.join(', ') : ''));

      const tiny = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => {
        if (!Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const r = e.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return false;
        return parseFloat(getComputedStyle(e).fontSize) < 11.2;
      }).map(e => (e.id || e.className || e.tagName) + ' ' + getComputedStyle(e).fontSize));
      say(tiny.length === 0, at + ' no text is under 0.7 rem' + (tiny.length ? ': ' + tiny.slice(0, 4).join(', ') : ''));

      const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
      say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');

      const tab = await assertTabularNumerals(page);
      say(tab.ok, at + ' every digit is set in tabular lining figures (' + tab.detail + ')');
    }
    const g2 = await assertNoNetworkAfterLoad(opened);
    say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
    say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
    await browser.close();
  }
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
