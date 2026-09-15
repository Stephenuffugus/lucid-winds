#!/usr/bin/env node
/* YONDER's layout at the catalog's four sizes (plans/yonder/HANDOFF-YONDER.md P3; the handoff's test gate 7): 320x568,
 * 375x667 and 412x915 by thumb, 1366x768 with a keyboard and no touch. The shape of satellites/span/test/layout.mjs.
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child meets is reached by play, never set: the first screen, FLAG with the flag not yet down, FLAG after
 * its walk, THE RACE with a card turned, THE RACE at the finish, the map after a run.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport
 *   2. the start doors, the flag, next, the card, the squares, again and the map's go are 56 px targets, the gear 48 px,
 *      a thumb landing on each
 *   3. no text on the page is under 0.7 rem
 *   4. the page does not scroll sideways
 *   5. every element that shows a digit shows tabular lining figures (CORE's assertTabularNumerals)
 *   6. Y1 as drawn: no element on the page is round (a corner radius of 45 percent of its short side) or turned
 *   7. nothing is fetched after load and nothing lands on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertTabularNumerals } from '../../math/core/test/shared.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.YONDER && window.YONDER.ready';
const PATH = '/yonder/index.html?seed=4242&count=10&';
const GEAR = '.lw-settings-open';
const SQ = n => '#track .square[data-n="' + n + '"]';

const dragFlag = (page, frac) => page.evaluate(frac => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(road.dataset.offset) + frac * Number(road.dataset.width));
  const o = x => ({ pointerId: 121, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const walked = page => page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 }).then(() => sleep(150));
const raceTo = async (page, until) => {
  for (let guard = 0; guard < 30; guard++) {
    const st = await page.evaluate(() => window.YONDER.race.state());
    if (until(st)) return;
    if (st.remaining === 0) await tap(page, '#card');
    else { await page.evaluate(sel => document.querySelector(sel).scrollIntoView({ inline: 'nearest' }), SQ(st.pos + 1)); await tap(page, SQ(st.pos + 1)); }
    await sleep(120);
  }
};

const STATES = [
  { name: 'the first screen', big: ['#start', '#start-race'], small: [GEAR], reach: async () => {} },
  { name: 'FLAG before the flag goes down', big: ['#road .lw-stone'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); } },
  { name: 'FLAG after the walk', big: ['#next'], small: [GEAR], reach: async page => { await tap(page, '#start'); await sleep(250); await dragFlag(page, 0.8); await walked(page); } },
  { name: 'THE RACE with a card turned', big: ['#card'], small: [GEAR], reach: async page => { await tap(page, '#start-race'); await sleep(250); await tap(page, '#card'); await sleep(150); },
    extra: async page => { const st = await page.evaluate(() => window.YONDER.race.state()); return [SQ(st.pos + 1)]; } },
  { name: 'THE RACE at the finish', big: ['#race-again'], small: [GEAR], reach: async page => { await tap(page, '#start-race'); await sleep(250); await raceTo(page, st => st.pos >= 10); await sleep(300); await tap(page, '#map-go').catch(() => {}); await sleep(250); } },
  { name: 'the map after a run', big: ['#map-go'], small: [], reach: async page => {
    await tap(page, '#start'); await sleep(250);
    const count = await page.evaluate(() => window.YONDER.runLength());
    for (let i = 0; i < count; i++) { await dragFlag(page, 0.5); await walked(page); await tap(page, '#next'); await sleep(250); }
    await sleep(300);
  } }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: PATH, ready: READY }));
    const { browser, page, errors } = opened;
    /* less motion is the device's wish, so a state is reached in a gate's time; nothing drawn depends on it */
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    let reached = true;
    try { await st.reach(page); } catch (e) { reached = false; say(false, at + ' the state is reached by play (' + e.message.split('\n')[0] + ')'); }
    if (reached) {
      const big = st.big.concat(st.extra ? await st.extra(page) : []);
      const off = await page.evaluate(sels => {
        window.scrollTo(0, 0);
        const vv = window.visualViewport, vh = vv ? vv.height : innerHeight, vw = vv ? vv.width : innerWidth;
        return sels.filter(sel => {
          const e = document.querySelector(sel);
          if (!e) return true;
          const r = e.getBoundingClientRect();
          /* a square lives in a strip that scrolls sideways (Y10): it is on the screen when its strip is */
          const box = e.closest('#strip') ? document.getElementById('strip').getBoundingClientRect() : r;
          return r.width < 1 || box.bottom > vh + 0.5 || box.top < -0.5 || box.right > vw + 0.5 || box.left < -0.5;
        }).map(sel => sel + ' (' + (() => { const e = document.querySelector(sel); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return Math.round(r.left) + ',' + Math.round(r.top) + ' to ' + Math.round(r.right) + ',' + Math.round(r.bottom) + ' in ' + Math.round(vw) + 'x' + Math.round(vh); })() + ')');
      }, big.concat(st.small));
      say(off.length === 0, at + ' everything a thumb needs is on the screen without scrolling' + (off.length ? ': ' + off.join(', ') : ''));

      const small = [];
      for (const [list, min] of [[big, 56], [st.small, 48]]) {
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

      const round = await page.evaluate(() => Array.from(document.querySelectorAll('body, body *')).filter(e => {
        const cs = getComputedStyle(e), r = e.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || cs.display === 'none' || cs.visibility === 'hidden') return false;
        const radius = Math.max(...['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'].map(k => parseFloat(cs[k]) || 0));
        const turned = cs.transform !== 'none' && (() => { const m = new DOMMatrix(cs.transform); return Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6; })();
        return radius >= 0.45 * Math.min(r.width, r.height) || turned;
      }).map(e => (e.id || e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
      say(round.length === 0, at + ' nothing on the page is round or turned (Y1)' + (round.length ? ': ' + round.slice(0, 4).join(', ') : ''));
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
