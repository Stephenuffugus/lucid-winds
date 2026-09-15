#!/usr/bin/env node
/* BRIM P2: Mode 3 BRIM (plans/brim/HANDOFF-BRIM.md P2; the handoff's build step 6, B10).
 *
 *   node test/brim.mjs          (in the foreground, under the gate lock)
 *
 * Both glasses near the brim; after they fill, the empty band above each water lights and the water dims, because what is
 * missing is the comparison. Played by real taps on ?mode=brim. Read off the boxes and computed styles (the band's height,
 * its opacity, the water's), which is what draws those pixels.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every pair is dealSession's for BRIM, and both its fractions are over a half
 *   2. before a choice nothing is lit and nothing dimmed, and there is no water (B1, B10)
 *   3. after the reveal each band is fully lit, exactly the part missing tall, from the glass's top down to its water, and
 *      each water dimmed
 *   4. the band lights only once both glasses have filled
 *   5. the caption names what is missing from each, the fuller first
 *   6. with less motion the bands are lit on the reveal's first frame
 *   7. nothing fetched after load; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, scoreChoice } from '../engine.js';
import { brimCaption, COPY } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.BRIM && window.BRIM.ready';
const PAGE = { path: '/brim/index.html?seed=' + SEED + '&grade=4&mode=brim&', ready: READY };
const text = f => f.n + '/' + f.d;
const val = f => f.n / f.d;
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const bands = page => page.evaluate(() => ['left', 'right'].map(id => {
  const g = document.querySelector('#' + id + ' .glass'), b = document.querySelector('#' + id + ' .empty-band'), w = document.querySelector('#' + id + ' .water');
  const gr = g.getBoundingClientRect(), br = b.getBoundingClientRect(), wr = w.getBoundingClientRect();
  return { h: br.height, top: br.top - (gr.top + g.clientTop), bottomToWater: w.getBoundingClientRect().height > 0 ? wr.top - br.bottom : null, lit: Number(getComputedStyle(b).opacity),
    waterOpacity: Number(getComputedStyle(w).opacity), wet: wr.height >= 0.5 && getComputedStyle(w).visibility !== 'hidden', inner: g.clientHeight };
}));
/* every frame of the reveal: both levels and both bands' light, queued after the page's own frame */
const arm = page => page.evaluate(() => {
  window.__frames = [];
  const onClick = e => {
    if (!e.target.closest || !e.target.closest('.vessel')) return;
    window.removeEventListener('click', onClick, true);
    setTimeout(() => {
      const t0 = performance.now();
      const grab = t => {
        window.__frames.push({ t, left: window.BRIM.level('left'), right: window.BRIM.level('right'), litL: window.BRIM.band('left').lit, litR: window.BRIM.band('right').lit });
        if (!window.BRIM.revealDone() && performance.now() - t0 < 10000) requestAnimationFrame(grab);
      };
      requestAnimationFrame(grab);
    }, 0);
  };
  window.addEventListener('click', onClick, true);
});

{
  const opened = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const r = rng(SEED >>> 0), want = dealSession(r, { mode: 'brim', grade: 4, session: 0 });
  const rows = [];
  for (let i = 0; i < 6; i++) {
    if (i) { await tap(page, '#next'); await sleep(200); }
    const got = await page.evaluate(() => window.BRIM.pair());
    const before = await bands(page);
    const side = i % 2 ? 'left' : 'right';
    await arm(page);
    await tap(page, '#' + side);
    await revealed(page);
    const after = await bands(page), frames = await page.evaluate(() => window.__frames);
    const cap = await page.evaluate(() => document.getElementById('caption').textContent);
    const w = want[i], big = val(w.left) >= val(w.right) ? w.left : w.right, little = big === w.left ? w.right : w.left;
    const early = frames.filter(f => (f.litL > 0 || f.litR > 0) && (f.left < val(w.left) - 1e-9 || f.right < val(w.right) - 1e-9)).length;
    rows.push({
      seam: text(got.left) === text(w.left) && text(got.right) === text(w.right) && val(got.left) > 0.5 && val(got.right) > 0.5,
      before: before.every(b => b.h < 0.5 && b.lit === 0 && b.waterOpacity === 1 && !b.wet),
      after: after.map((b, k) => ({ lit: b.lit, h: b.h, want: (1 - val([w.left, w.right][k])) * b.inner, top: b.top, gap: b.bottomToWater, dim: b.waterOpacity })),
      early, lit: frames.some(f => f.litL > 0), cap: cap === brimCaption(big) + ' ' + COPY.and + ' ' + brimCaption(little), got: text(got.left) + ' ' + text(got.right), capText: cap
    });
  }
  say(rows.every(x => x.seam), '375x667 every pair is dealSession\'s for BRIM, both fractions over a half (' + rows.map(x => x.seam ? 'ok' : 'OFF ' + x.got).join(',') + ')');
  say(rows.every(x => x.before), '375x667 before a choice nothing is lit, nothing dimmed and no water (B1, B10)');
  const off = rows.flatMap((x, i) => x.after.filter(a => !(a.lit === 1 && Math.abs(a.h - a.want) <= 1 && Math.abs(a.top) <= 0.5 && a.gap !== null && Math.abs(a.gap) <= 1.5 && a.dim < 0.6)).map(a => 'round ' + (i + 1) + ' ' + JSON.stringify(a)));
  say(off.length === 0, '375x667 after the reveal each band is fully lit, exactly the part missing tall, from the top down to its water, and each water dimmed (B10)' + (off.length ? ': ' + off.slice(0, 2).join('; ') : ''));
  say(rows.every(x => x.lit && x.early === 0), '375x667 the bands light only once both glasses have filled (' + rows.map(x => x.early).join(',') + ' early frames)');
  say(rows.every(x => x.cap), '375x667 the caption names what is missing from each, the fuller first (' + JSON.stringify(rows[0].capText) + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, '375x667 nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

{
  const opened = await open(s.base, Object.assign({}, SIZES[1], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  await arm(page);
  await tap(page, '#left');
  await revealed(page);
  const first = (await page.evaluate(() => window.__frames))[0];
  say(!!first && first.litL === 1 && first.litR === 1, '375x667 with less motion the bands are lit on the reveal\'s first frame (' + JSON.stringify(first) + ')');
  say(errors.length === 0, '375x667 less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' BRIM FAILURE(S)'); process.exit(1); }
console.log('BRIM OK');
