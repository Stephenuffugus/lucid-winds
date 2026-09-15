#!/usr/bin/env node
/* CREASE's sprites on the page (plans/crease/HANDOFF-CREASE.md section 7): what draw.js puts where, read off the canvases'
 * own pixels and the elements' boxes, never off a class name.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the first screen with no mode named: three doors, each its own door sprite drawn and a 56 px target; a link naming
 *      CREASE mode shows one door, drawn as CREASE's
 *   2. at the three phones: the clip inside CORE's stone is the clip sprite, drawn, its foot on the strip's top edge, and the
 *      stone still a 56 px target a thumb lands on; both pins drawn, each standing on its end of the strip
 *   3. after the reveal the truth's clip is the truthClip sprite, drawn, centred on the true place, its foot on the strip
 *   4. CREASE mode's two fold controls show their own pictures, drawn
 *   5. the shelf at 375 and 320 after a run: one specimen drawn, at least 36 px across, the frame and go on the screen
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { fromNormalized } from '../../math/core/pure.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.CREASE && window.CREASE.ready';

/* a canvas's sprite name, how many of its pixels are drawn, and its box */
const drawn = (page, sel) => page.evaluate(sel => {
  const c = document.querySelector(sel);
  if (!c || c.tagName !== 'CANVAS' || !c.width || !c.height) return null;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  const r = c.getBoundingClientRect(), cs = getComputedStyle(c);
  return { sprite: c.dataset.sprite, pixels: n, w: r.width, h: r.height, top: r.top, bottom: r.bottom, mid: (r.left + r.right) / 2, shown: cs.display !== 'none' && r.width > 0 };
}, sel);
const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 261, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
}, frac);
const stripBox = page => page.evaluate(() => {
  const el = document.getElementById('strip'), line = el.querySelector('.lw-line').getBoundingClientRect();
  return { left: el.getBoundingClientRect().left, W: el.getBoundingClientRect().width, offset: Number(el.dataset.offset), width: Number(el.dataset.width), top: line.top, bottom: line.bottom };
});

/* 1 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/crease/index.html?seed=4242&', ready: READY }));
  const { page, errors } = opened;
  const bits = [];
  for (const [sel, want] of [['#start', 'doorFreehand'], ['#start-crease', 'doorCrease'], ['#start-halfway', 'doorHalfway']]) {
    const d = await drawn(page, sel + ' canvas'), c = await centre(page, sel);
    if (!d || d.sprite !== want || d.pixels < 40 || !c || c.w < 56 || c.h < 56 || !c.onTop) bits.push(sel + ' ' + JSON.stringify(d) + ' ' + (c ? Math.round(c.w) + 'x' + Math.round(c.h) + (c.onTop ? '' : ' COVERED') : 'no target'));
  }
  say(bits.length === 0, '375x667 with no mode named, three doors, each its own picture drawn and a 56 px target' + (bits.length ? ': ' + bits.join('; ') : ''));
  say(errors.length === 0, '375x667 doors: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
  const named = await open(s.base, Object.assign({}, SIZES[1], { path: '/crease/index.html?seed=4242&mode=crease&', ready: READY }));
  const one = await drawn(named.page, '#start canvas');
  const others = await named.page.evaluate(() => ['start-crease', 'start-halfway'].filter(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 0 && r.height > 0; }));
  say(!!one && one.sprite === 'doorCrease' && one.pixels > 40 && others.length === 0, '375x667 a link naming CREASE mode shows one door, drawn as CREASE\'s (' + (one ? one.sprite : 'none') + ', others shown: ' + others.join(',') + ')');
  await named.browser.close();
}

/* 2 and 3, at the three phones */
for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/crease/index.html?seed=4242&mode=freehand&', ready: READY }));
  const { page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const box = await stripBox(page);
  const clip = await drawn(page, '#strip .lw-stone canvas'), stone = await centre(page, '#strip .lw-stone');
  say(!!clip && clip.sprite === 'clip' && clip.pixels > 60 && Math.abs(clip.bottom - box.top) <= 2 && !!stone && stone.w >= 56 && stone.h >= 56 && stone.onTop,
    at + ' the clip in the stone is the clip sprite, drawn, its foot on the strip (foot ' + (clip ? clip.bottom.toFixed(1) : 'none') + ', strip ' + box.top.toFixed(1) + '), the stone a 56 px target (' + (stone ? Math.round(stone.w) + 'x' + Math.round(stone.h) + (stone.onTop ? '' : ' COVERED') : 'no stone') + ')');
  const pins = await page.evaluate(() => Array.from(document.querySelectorAll('#strip .pin canvas')).map((c, i) => {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 0) n++;
    const r = c.getBoundingClientRect();
    return { sprite: c.dataset.sprite, pixels: n, mid: (r.left + r.right) / 2, top: r.top, bottom: r.bottom };
  }));
  const g = { offsetPct: box.offset, widthPct: box.width };
  const pinOff = pins.map((p, i) => Math.abs(p.mid - (box.left + fromNormalized(i, g, box.W))));
  say(pins.length === 2 && pins.every(p => p.sprite === 'pin' && p.pixels > 60 && p.top < box.top && p.bottom > box.bottom) && pinOff.every(o => o <= 1),
    at + ' both pins drawn, each standing across its end of the strip (' + pinOff.map(o => o.toFixed(2)).join(', ') + ' px off)');

  await dragClip(page, 0.3);
  await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
  await sleep(120);
  const t = await page.evaluate(() => window.CREASE.task());
  const truth = await drawn(page, '#truth-clip canvas');
  const want = box.left + fromNormalized(t.numerator / t.denominator / t.whole, g, box.W);
  say(!!truth && truth.sprite === 'truthClip' && truth.pixels > 60 && Math.abs(truth.mid - want) <= 1 && truth.bottom > box.top && truth.bottom <= box.bottom,
    at + ' the truth\'s clip is the truthClip sprite, drawn, centred on the true place (' + (truth ? (truth.mid - want).toFixed(2) : 'none') + ' px off), its foot on the strip');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 4 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/crease/index.html?seed=4242&mode=crease&', ready: READY }));
  await tap(opened.page, '#start');
  await sleep(200);
  const less = await drawn(opened.page, '#fold-less canvas'), more = await drawn(opened.page, '#fold-more canvas');
  say(!!less && less.sprite === 'foldLess' && less.pixels > 60 && !!more && more.sprite === 'foldMore' && more.pixels > 60, '375x667 the fold controls show their own pictures, drawn (' + [less && less.sprite, more && more.sprite].join(', ') + ')');
  await opened.browser.close();
}

/* 5 */
for (const size of [SIZES[1], SIZES[0]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/crease/index.html?seed=4242&mode=freehand&count=10&', ready: READY }));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  for (let i = 0; i < 10; i++) {
    await dragClip(page, 0.5);
    await page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 });
    await sleep(60);
    await tap(page, '#next');
    await sleep(120);
  }
  await sleep(300);
  const m = await page.evaluate(() => {
    const c = document.getElementById('shelf-canvas'), r = c.getBoundingClientRect(), f = document.querySelector('.shelf-frame').getBoundingClientRect(), g = document.getElementById('shelf-go').getBoundingClientRect();
    const vh = window.visualViewport ? visualViewport.height : innerHeight, vw = window.visualViewport ? visualViewport.width : innerWidth;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 0) n++;
    return { cell: Number(c.dataset.cell) * (r.width / c.width), pixels: n, onScreen: f.left >= 0 && f.right <= vw && f.top >= 0 && g.bottom <= vh, shown: !document.getElementById('shelf').hidden, cells: window.CREASE.shelf.cells().length };
  });
  say(m.shown && m.cells === 1 && m.pixels > 100 && m.cell >= 36 && m.onScreen, at + ' the shelf shows one specimen drawn, ' + m.cell.toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify(m) + ')');
  say(errors.length === 0, at + ' shelf: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
