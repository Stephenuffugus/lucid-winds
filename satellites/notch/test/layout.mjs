#!/usr/bin/env node
/* NOTCH's layout at the catalog's four sizes (CATALOG-PLAN D4; plans/notch/HANDOFF-NOTCH.md P3; the shape of GLIMPSE's
 * test/layout.mjs).
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child meets is reached by play, never set: the two doors, TURN turning, TURN after its reveal, FIND choosing, FIND
 * after its reveal.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport (the
 *      whole bench too while a piece turns)
 *   2. the doors, set aside, go on and the regions are 56 px targets, the gear 48 px, a thumb landing on each
 *   3. no text on the page is under 0.7 rem
 *   4. the page does not scroll sideways
 *   5. nothing is fetched after load and nothing lands on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const GEAR = '.lw-settings-open';
const revealed = page => page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000 }).then(() => sleep(150));
const regionsNow = page => page.evaluate(() => Array.from(document.querySelectorAll('#panel .region')).map(b => '#panel .region[data-slot="' + b.dataset.slot + '"]'));

const STATES = [
  { name: 'the two doors', big: () => ['#start', '#start-find'], small: [GEAR], reach: async () => {} },
  { name: 'TURN turning', big: () => ['#aside'], small: [GEAR], bench: true, reach: async page => { await tap(page, '#start'); await sleep(200); } },
  { name: 'TURN after its reveal', big: () => ['#next'], small: [GEAR], bench: true, reach: async page => { await tap(page, '#start'); await sleep(200); await tap(page, '#aside'); await revealed(page); } },
  { name: 'FIND choosing', big: regionsNow, small: [GEAR], target: true, reach: async page => { await tap(page, '#start-find'); await sleep(200); } },
  { name: 'FIND after its reveal', big: async page => ['#next'].concat(await regionsNow(page)), small: [GEAR], target: true, reach: async page => { await tap(page, '#start-find'); await sleep(200); await tap(page, '#panel .region'); await revealed(page); } }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: '/notch/index.html?seed=4242&', ready: READY }));
    const { browser, page, errors } = opened;
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    let reached = true;
    try { await st.reach(page); } catch (e) { reached = false; say(false, at + ' the state is reached by play (' + e.message.split('\n')[0] + ')'); }
    if (reached) {
      const big = await st.big(page);
      const need = big.concat(st.small, st.bench ? ['#bench'] : [], st.target ? ['#target'] : []);
      const off = await page.evaluate(sels => {
        window.scrollTo(0, 0);
        const vv = window.visualViewport, vh = vv ? vv.height : innerHeight, vw = vv ? vv.width : innerWidth;
        return sels.filter(sel => {
          const e = document.querySelector(sel);
          if (!e) return true;
          const r = e.getBoundingClientRect();
          return r.width < 1 || r.bottom > vh + 0.5 || r.top < -0.5 || r.right > vw + 0.5 || r.left < -0.5;
        }).map(sel => sel + ' (' + (() => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) + ' to ' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' in ' + Math.round(vw) + 'x' + Math.round(vh); })() + ')');
      }, need);
      say(off.length === 0, at + ' everything a thumb needs is on the screen without scrolling' + (off.length ? ': ' + off.join(', ') : ''));
      const small = [];
      for (const [list, min] of [[big, 56], [st.small, 48]]) {
        for (const sel of list) {
          const r = await centre(page, sel);
          if (!r || r.w < min || r.h < min || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing') + ' (needs ' + min + ')');
        }
      }
      say(small.length === 0, at + ' the controls are 56 px targets and the gear 48 px' + (small.length ? ': ' + small.join(', ') : ''));
      const tiny = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => {
        if (!Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const r = e.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return false;
        return parseFloat(getComputedStyle(e).fontSize) < 11.2;
      }).map(e => (e.id || e.className || e.tagName) + ' ' + getComputedStyle(e).fontSize));
      say(tiny.length === 0, at + ' no text is under 0.7 rem' + (tiny.length ? ': ' + tiny.slice(0, 4).join(', ') : ''));
      const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
      say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
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
