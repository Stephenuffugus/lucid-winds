#!/usr/bin/env node
/* GAUGE's art as the child sees it (plans/gauge/HANDOFF-GAUGE.md section 7: a brass and wood bench, the rule and its ticks crisp,
 * the instruments in code drawn pixels). Every read is the page's computed colours, boxes and the case canvas's own pixels.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every decimal a child reads (the two measures, the target, the pair) and every answer's words stand 4.5 to 1 or more in
 *      contrast against what is behind them (WCAG)
 *   2. the child's marker and the true marker differ in CIE lightness by 20 or more, so which is which is not colour alone
 *   3. the case after a SAME VALUE run at 375 and 320: one instrument drawn (its cell holds painted pixels), at least 36 px across,
 *      the frame and go on the screen
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GAUGE && window.GAUGE.ready';

/* sRGB to relative luminance and to CIE L*, from computed colour strings */
const rgb = c => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = c => { const [r, g, b] = rgb(c).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const lstar = c => { const y = lum(c); return y > 216 / 24389 ? 116 * Math.cbrt(y) - 16 : (24389 / 27) * y; };

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/gauge/index.html?seed=4242&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  /* the background an element's text stands on: the nearest ancestor (or itself) with a painted background */
  const pairOf = sel => page.evaluate(sel => {
    const e = document.querySelector(sel);
    if (!e) return null;
    let b = e, bg = 'rgba(0, 0, 0, 0)';
    while (b) { const c = getComputedStyle(b).backgroundColor; if (!/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)|transparent/.test(c)) { bg = c; break; } b = b.parentElement; }
    if (!b) bg = getComputedStyle(document.body).backgroundColor;
    return { fg: getComputedStyle(e).color, bg };
  }, sel);
  const low = [];
  const check = async sels => { for (const sel of sels) { const p = await pairOf(sel); if (!p) { low.push(sel + ' missing'); continue; } const r = contrast(p.fg, p.bg); if (!(r >= 4.5)) low.push(sel + ' ' + r.toFixed(2) + ' (' + p.fg + ' on ' + p.bg + ')'); } };
  await tap(page, '#start'); await sleep(200);
  await check(['#left', '#right', '#same']);
  await page.goto(s.base + '/gauge/index.html?seed=4242&', { waitUntil: 'load' }); await page.waitForFunction(READY);
  await tap(page, '#start-zoom'); await sleep(200);
  await check(['#target', '#zoom-commit', '#rule-mine .label']);
  await tap(page, '#zoom-commit');
  await page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });
  const markers = await page.evaluate(() => ['#rule-mine .marker', '#rule-truth .marker'].map(sel => { const cs = getComputedStyle(document.querySelector(sel)); return cs.borderTopColor; }));
  await page.goto(s.base + '/gauge/index.html?seed=4242&', { waitUntil: 'load' }); await page.waitForFunction(READY);
  await tap(page, '#start-same'); await sleep(200);
  await check(['#same-left', '#same-right', '#same-yes', '#same-no']);
  say(low.length === 0, '375x667 every decimal and every answer stands 4.5 to 1 or more against what is behind it' + (low.length ? ': ' + low.join('; ') : ''));
  const gap = Math.abs(lstar(markers[0]) - lstar(markers[1]));
  say(gap >= 20, '375x667 the child\'s marker and the true marker differ by ' + gap.toFixed(1) + ' in CIE lightness (at least 20; ' + markers.join(' and ') + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
for (const size of [SIZES[1], SIZES[0]]) {
  const { browser, page, errors } = await open(s.base, Object.assign({}, size, { path: '/gauge/index.html?seed=4242&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start-same'); await sleep(200);
  for (let i = 0; i < 12; i++) {
    if (await page.evaluate(() => window.GAUGE.instruments.shown())) break;
    await page.evaluate(() => document.getElementById('same-yes').click());
    await page.waitForFunction(() => window.GAUGE.revealDone(), { timeout: 20000, polling: 'raf' });
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(40);
  }
  await sleep(150);
  const r = await page.evaluate(() => {
    const c = document.getElementById('case-canvas'), cell = Number(c.dataset.cell), k = c.width / c.getBoundingClientRect().width;
    const d = c.getContext('2d').getImageData(0, 0, Math.min(c.width, cell + 4), Math.min(c.height, cell + 4)).data;
    let painted = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) painted++;
    const vv = window.visualViewport, vh = vv ? vv.height : innerHeight, vw = vv ? vv.width : innerWidth;
    const on = sel => { const b = document.querySelector(sel).getBoundingClientRect(); return b.width > 0 && b.top >= -0.5 && b.left >= -0.5 && b.bottom <= vh + 0.5 && b.right <= vw + 0.5; };
    return { shown: window.GAUGE.instruments.shown(), painted, across: cell / k, frame: on('.case-frame'), go: on('#case-go') };
  });
  say(r.shown && r.painted > 20 && r.across >= 36 && r.frame && r.go, size.name + ' the case after a run: one instrument drawn (' + r.painted + ' painted pixels in its place), ' + (r.across || 0).toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify({ frame: r.frame, go: r.go }) + ')');
  say(errors.length === 0, size.name + ' case: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
