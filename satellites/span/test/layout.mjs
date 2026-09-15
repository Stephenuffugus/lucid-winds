#!/usr/bin/env node
/* SPAN's layout at the catalog's four sizes (plans/span/HANDOFF-SPAN.md P3 step 3): 320x568, 375x667 and 412x915 by
 * thumb, 1366x768 with a keyboard and no touch.
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child or a teacher meets is reached by play, never set: THE BLANK building and revealed, TRUE OR NOT,
 * RELATIONAL building, the viaduct after a run, the screener's item and its end.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport
 *   2. stones, piers, sources and choices are 56 px targets, and every other control 48 px, a thumb landing on each
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
const GAME = extra => '/span/index.html?seed=4242&count=5&' + (extra || '');
const SCREEN = '/span/screen/index.html?seed=4242&';
const READY_GAME = 'window.SPAN && window.SPAN.ready', READY_SCREEN = 'window.SCREEN && window.SCREEN.ready';
const SRC = v => '#supply .stone-source[data-value="' + v + '"]';
const GEAR = '.lw-settings-open';

/* a real drag from a source to the blank's pier */
const drop = (page, value) => page.evaluate(v => {
  const src = document.querySelector('#supply .stone-source[data-value="' + v + '"]');
  const side = document.querySelector('#equation .term[data-blank]').dataset.side, pier = document.getElementById('pier-' + side);
  const a = src.getBoundingClientRect(), b = pier.getBoundingClientRect();
  const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 99, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  fire('pointerdown', a.left + a.width / 2, a.top + a.height / 2);
  fire('pointermove', b.left + b.width / 2, b.top + 30);
  fire('pointerup', b.left + b.width / 2, b.top + 30);
}, value);
const start = async page => { await tap(page, '#start'); await sleep(250); };
const revealed = page => page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 }).then(() => sleep(150));

const STATES = [
  { name: 'THE BLANK building', path: GAME(), ready: READY_GAME, big: [SRC(1), '#pier-left', '#pier-right'], small: ['#lay', GEAR],
    reach: async page => { await start(page); await drop(page, 1); await sleep(700); } },
  { name: 'THE BLANK revealed', path: GAME(), ready: READY_GAME, big: [], small: ['#next', GEAR],
    reach: async page => { await start(page); await drop(page, 1); await sleep(300); await tap(page, '#lay'); await revealed(page); } },
  { name: 'TRUE OR NOT', path: GAME('mode=judge&'), ready: READY_GAME, big: ['#same', '#apart'], small: [GEAR],
    reach: start },
  { name: 'RELATIONAL building', path: GAME('mode=relational&'), ready: READY_GAME, big: [SRC(1), SRC(10), SRC(100), '#pier-left', '#pier-right'], small: ['#lay', GEAR],
    reach: async page => { await start(page); for (const v of [100, 10, 1]) { await drop(page, v); await sleep(150); } await sleep(700); } },
  { name: 'the viaduct', path: GAME(), ready: READY_GAME, big: ['#again'], small: [],
    reach: async page => {
      await start(page);
      for (let i = 0; i < 5; i++) { await drop(page, 1); await sleep(200); await tap(page, '#lay'); await revealed(page); await tap(page, '#next'); await sleep(250); }
      await sleep(400);
    } },
  { name: 'the screener', path: SCREEN, ready: READY_SCREEN, big: ['#same', '#apart'], small: [],
    reach: start },
  { name: 'the screener at its end', path: SCREEN, ready: READY_SCREEN, big: [], small: ['#teacher'],
    reach: async page => { await start(page); for (let i = 0; i < 10; i++) { await tap(page, i % 2 ? '#same' : '#apart'); await sleep(100); } await sleep(300); } }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: st.path, ready: st.ready }));
    const { browser, page, errors } = opened;
    let reached = true;
    try { await st.reach(page); } catch (e) { reached = false; say(false, at + ' the state is reached by play (' + e.message + ')'); }
    if (reached) {
      /* 1, before anything scrolls the page */
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

      /* 2 */
      const small = [];
      for (const [list, min] of [[st.big, 56], [st.small, 48]]) {
        for (const sel of list) {
          const r = await centre(page, sel);
          if (!r || r.w < min || r.h < min || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing') + ' (needs ' + min + ')');
        }
      }
      say(small.length === 0, at + ' stones, piers and choices are 56 px targets and every other control 48 px' + (small.length ? ': ' + small.join(', ') : ''));

      /* 3 */
      const tiny = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => {
        if (!Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const r = e.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return false;
        return parseFloat(getComputedStyle(e).fontSize) < 11.2;
      }).map(e => (e.id || e.className || e.tagName) + ' ' + getComputedStyle(e).fontSize));
      say(tiny.length === 0, at + ' no text is under 0.7 rem' + (tiny.length ? ': ' + tiny.slice(0, 4).join(', ') : ''));

      /* 4 */
      const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
      say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');

      /* 5 */
      const tab = await assertTabularNumerals(page);
      say(tab.ok, at + ' every digit is set in tabular lining figures (' + tab.detail + ')');
    }
    /* 6 */
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
