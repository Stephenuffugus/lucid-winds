#!/usr/bin/env node
/* BRIM's layout at the catalog's four sizes (plans/brim/HANDOFF-BRIM.md P3): 320x568, 375x667 and 412x915 by thumb,
 * 1366x768 with a keyboard and no touch. The shape of satellites/crease/test/layout.mjs.
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child meets is reached by play, never set: the four doors, MATCHING before a choice and after its reveal,
 * HALF after its reveal, BRIM after its reveal, LEVEL before a split, and the shelf after a run.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport
 *   2. the doors, the glasses, next, the splits and the shelf's go are 56 px targets, the gear 48 px, a thumb landing on each
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
const READY = 'window.BRIM && window.BRIM.ready';
const GEAR = '.lw-settings-open';
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(150));
const SPLITS = [2, 3, 4, 5, 6].map(k => '#splits .split[data-k="' + k + '"]');

const STATES = [
  { name: 'the four doors', path: '?seed=4242&', big: ['#start', '#start-half', '#start-brim', '#start-level'], small: [GEAR], reach: async () => {} },
  { name: 'MATCHING before a choice', path: '?seed=4242&', big: ['#left', '#right'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); } },
  { name: 'MATCHING after its reveal', path: '?seed=4242&', big: ['#next'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); await tap(page, '#left'); await revealed(page); } },
  { name: 'HALF after its reveal', path: '?seed=4242&', big: ['#next'], small: [GEAR], reach: async page => { await tap(page, '#start-half'); await sleep(250); await tap(page, '#right'); await revealed(page); } },
  { name: 'BRIM after its reveal', path: '?seed=4242&', big: ['#next'], small: [GEAR], reach: async page => { await tap(page, '#start-brim'); await sleep(250); await tap(page, '#left'); await revealed(page); } },
  { name: 'LEVEL before a split', path: '?seed=4242&', big: SPLITS, small: [GEAR], reach: async page => { await tap(page, '#start-level'); await sleep(250); } },
  { name: 'the shelf after a run', path: '?seed=4242&count=12&', big: ['#shelf-go'], small: [], reach: async page => {
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 12; i++) { await tap(page, '#left'); await revealed(page); await tap(page, '#next'); await sleep(150); }
    await sleep(200);
    if (!(await page.evaluate(() => window.BRIM.shelf.shown()))) throw new Error('the shelf did not open');
  } }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: '/brim/index.html' + st.path, ready: READY }));
    const { browser, page, errors } = opened;
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
