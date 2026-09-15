#!/usr/bin/env node
/* HUSH's layout at the catalog's four sizes (CATALOG-PLAN D4; plans/hush/HANDOFF-HUSH.md P3; the shape of GAUGE's and TINT's
 * test/layout.mjs).
 *
 *   node test/layout.mjs          (in the foreground, under the gate lock)
 *
 * Every state a child meets is reached by play: the picture fork on a first visit; the doors; STEP in play; the living clearing
 * after a settle; the round after the clearing closes; SIMON's own page. A settle takes eighteen right trials, so for the two
 * settle states the gate moves where the approach stands (the kept steps, a precondition, docs/DECISIONS.md) to one trial short,
 * reloads, and earns the settle by play; it never writes the collection. The record it changes is the one the page wrote itself.
 *
 * Asserted at every size in every state, each watched to fail on a planted fault:
 *   1. everything a thumb needs in that state is on the screen as it first stands, unscrolled, inside the visual viewport
 *   2. the fork's pictures, the doors, the stone, go on, the clearing's go and SIMON's controls are 56 px targets, the gear 48 px,
 *      a thumb landing on each
 *   3. no text on the page is under 0.7 rem
 *   4. the page does not scroll sideways
 *   5. every element that shows a digit shows tabular lining figures (CORE's assertTabularNumerals)
 *   6. nothing is fetched after load and nothing lands on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertTabularNumerals } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes, SETTLE } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const GEAR = '.lw-settings-open';
const SEED = 4242;
const LINK = '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&';
const first = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' })[0];

/* the page writes its own record when a child chooses on the fork; the gate then moves only where the approach stands */
async function oneTrialShort(page) {
  await page.evaluate(() => document.getElementById('fork-careful').click());
  await sleep(150);
  await page.evaluate(settle => {
    const rec = JSON.parse(localStorage.getItem('lw:hush:save'));
    rec.adapt.steps = settle - 1;
    localStorage.setItem('lw:hush:save', JSON.stringify(rec));
  }, SETTLE);
  await page.goto(page.url().replace(/\?.*$/, '') + '?seed=' + SEED + '&count=40&fork=careful&', { waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
}
async function settleByPlay(page) {
  await page.evaluate(() => document.getElementById('start').click());
  await page.waitForFunction(() => { const l = window.HUSH.live(); return !!l && l.i === 0 && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' });
  if (first.type === 'go') await tap(page, '#stone');
  await page.waitForFunction(() => window.HUSH.living.shown(), { timeout: 30000, polling: 'raf' });
  await sleep(150);
}

const STATES = [
  { name: 'the picture fork', path: '/hush/index.html?seed=' + SEED + '&', big: ['#fork-quick', '#fork-careful'], small: [GEAR], reach: async () => {} },
  { name: 'the doors', path: LINK, big: ['#start', '#start-simon'], small: [GEAR], reach: async () => {} },
  { name: 'STEP in play', path: LINK, big: ['#stone'], small: [GEAR], also: ['#clearing'], reach: async page => {
    await page.evaluate(() => document.getElementById('start').click());
    await page.waitForFunction(() => window.HUSH.phase() === 'gap', { timeout: 15000, polling: 'raf' });
    await sleep(120);
  } },
  { name: 'the living clearing after a settle', path: '/hush/index.html?seed=' + SEED + '&', big: ['#living-go'], small: [], also: ['#living-canvas'], reach: async page => { await oneTrialShort(page); await settleByPlay(page); } },
  { name: 'the round after the clearing closes', path: '/hush/index.html?seed=' + SEED + '&', big: ['#next', '#stone'], small: [GEAR], also: ['#clearing'], reach: async page => {
    await oneTrialShort(page); await settleByPlay(page);
    await tap(page, '#living-go'); await sleep(150);
  } },
  { name: 'SIMON', path: '/hush/simon/index.html?seed=' + SEED + '&', big: ['#simon-go', '#home'], small: [], also: ['#how'], ready: 'window.SIMON', reach: async () => {} }
];

for (const size of SIZES) {
  for (const st of STATES) {
    const at = size.name + ' ' + st.name + ':';
    const opened = await open(s.base, Object.assign({}, size, { path: st.path, ready: st.ready || READY }));
    const { browser, page, errors } = opened;
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    let reached = true;
    try { await st.reach(page); } catch (e) { reached = false; say(false, at + ' the state is reached by play (' + e.message.split('\n')[0] + ')'); }
    if (reached) {
      const need = st.big.concat(st.small, st.also || []);
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
      for (const [list, min] of [[st.big, 56], [st.small, 48]]) {
        for (const sel of list) {
          const r = await centre(page, sel);
          if (!r || r.w < min || r.h < min || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing') + ' (needs ' + min + ')');
        }
      }
      say(small.length === 0, at + ' the controls are 56 px targets and the gear 48 px' + (small.length ? ': ' + small.join(', ') : ''));
      const tiny = await page.evaluate(() => Array.from(document.querySelectorAll('body *')).filter(e => {
        if (!Array.from(e.childNodes).some(n => n.nodeType === 3 && n.textContent.trim())) return false;
        const r = e.getBoundingClientRect();
        if (r.width < 1 || r.height < 1 || getComputedStyle(e).visibility === 'hidden') return false;
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
