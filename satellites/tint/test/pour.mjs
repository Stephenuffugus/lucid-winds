#!/usr/bin/env node
/* TINT's pour, read off the screen frame by frame (plans/tint/HANDOFF-TINT.md P1; the handoff's step 2: two streams meeting,
 * the colour resolving over about 400 ms from streaky to uniform, the cloth taking it from the bottom edge).
 *
 *   node test/pour.mjs          (in the foreground, under the gate lock)
 *
 * Every read is the pixels the page drew, sampled by an animation frame watcher in the page; the gate never draws. Asserted, each
 * watched to fail on a planted fault:
 *   1. before the pour, a continuous recipe is two bands in the vat, dye below and white above, the dye band's share of the vat
 *      within a row of pixels of the recipe's dye share
 *   2. while it pours the vat is streaked at some frame (more than one colour down its middle), and from 700 ms on it is one
 *      colour, exactly the mixed colour
 *   3. the cloth's centre is undyed before 300 ms and exactly the mixed colour by the pour's end
 *   4. with less motion both cloths are exactly the mixed colour within 150 ms of the tap
 *   5. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { mixLinear, DYES, WHITE } from '../colour.js';
import { layout } from '../render.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.TINT && window.TINT.ready';
const PATH = '/tint/index.html?seed=4242&';

/* 1 to 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  await tap(page, '#start');
  await sleep(200);
  const task = await page.evaluate(() => window.TINT.task());
  const mixed = mixLinear(DYES[task.dye], task.left[0], task.left[1]).hex;
  /* the left vat's middle column, top to bottom, before the pour */
  const column = await page.evaluate(() => {
    const c = document.getElementById('vat-left'), d = c.getContext('2d').getImageData(Math.floor(c.width / 2), 0, 1, c.height).data, out = [];
    for (let y = 0; y < c.height; y++) out.push('#' + [d[y * 4], d[y * 4 + 1], d[y * 4 + 2]].map(v => v.toString(16).padStart(2, '0')).join(''));
    return { rows: out, dpr: c.width / c.getBoundingClientRect().width };
  });
  const dyeRows = column.rows.filter(h => h === DYES[task.dye]).length, whiteRows = column.rows.filter(h => h === WHITE).length;
  const share = task.left[0] / (task.left[0] + task.left[1]);
  const firstDye = column.rows.indexOf(DYES[task.dye]), lastWhite = column.rows.lastIndexOf(WHITE);
  say(task.representation === 'continuous' && dyeRows > 0 && whiteRows > 0 && Math.abs(dyeRows / (dyeRows + whiteRows) - share) <= 2 / (dyeRows + whiteRows) + 1e-9 && lastWhite < firstDye,
    '375x667 before the pour the vat holds dye below white, the dye band ' + dyeRows + ' of ' + (dyeRows + whiteRows) + ' rows for a share of ' + share.toFixed(3));
  /* watch the pour: each frame, the vat's middle column's distinct colours and the cloth's centre */
  /* ⛔ the first runs sampled the column from 20 to 56 percent of the canvas height, which starts a few pixels above the vat's
     liquid (render.js layout: the liquid runs from round(H * 0.18) + 8 to round(H * 0.18) + round(H * 0.42)), so the bench colour
     was always in the column: the late law could never pass and the streak law could never fail. The column is now the liquid
     band from render.js's own layout, two pixels in from each edge, in canvas pixels. */
  const size = await page.evaluate(() => { const c = document.getElementById('vat-left'); return { W: c.clientWidth, H: c.clientHeight, k: c.width / c.clientWidth }; });
  const { vat } = layout(size.W, size.H);
  const band = { top: Math.ceil((vat.y + 8 + 2) * size.k), rows: Math.floor((vat.h - 8 - 4) * size.k) };
  await page.evaluate(band => {
    window.__pour = [];
    const c = document.getElementById('vat-left'), hex = (d, i) => '#' + [d[i], d[i + 1], d[i + 2]].map(v => v.toString(16).padStart(2, '0')).join('');
    /* ⛔ the first run read each frame's pixels before the page drew them (this callback was asked for before the page's) and timed
       from the tap, while the pour runs from its first frame: a loaded box starts that frame late, so the gate saw a streak at 760
       ms that the page drew at under 700. Time zero is now the timestamp of the first frame after the tap, which the page's clock
       shares, and the pixels are read after every callback of the frame has run. */
    const read = now => {
      const ctx = c.getContext('2d'), W = c.width, H = c.height;
      /* ⛔ this read took ONE column down the middle of the vat, and the streaks are alternating ROWS whose share thins as the
         pour resolves, so a single column goes uniform long before the vat does. That is why a resolve slowed from 400 to 600 ms
         (plant w1) left every vat law green twice over: the reader, not the claim, was the weak part. Five columns now, and the
         vat counts as one colour only when all of them agree. */
      const set = new Set();
      for (const fx of [0.2, 0.35, 0.5, 0.65, 0.8]) {
        const col = ctx.getImageData(Math.floor(W * fx), band.top, 1, band.rows).data;
        for (let i = 0; i < col.length; i += 4) set.add(hex(col, i));
      }
      const b = c.getBoundingClientRect(), [px, py] = window.TINT.clothPoint('left'), k = W / b.width;
      const cl = ctx.getImageData(Math.round((px - b.left) * k), Math.round((py - b.top) * k), 1, 1).data;
      window.__pour.push({ t: now - window.__t0, vat: Array.from(set), cloth: hex(cl, 0) });
    };
    const tick = now => {
      if (window.__tapped && window.__t0 === undefined) window.__t0 = now;
      if (window.__t0 === undefined) { requestAnimationFrame(tick); return; }
      setTimeout(() => { read(now); if (!window.TINT.pourDone()) requestAnimationFrame(tick); }, 0);
    };
    requestAnimationFrame(tick);
    document.getElementById('same').addEventListener('click', () => { window.__tapped = true; }, { capture: true, once: true });
  }, band);
  await tap(page, '#same');
  await page.waitForFunction(() => window.TINT.pourDone(), { timeout: 20000, polling: 'raf' });
  await sleep(80);
  const frames = await page.evaluate(() => window.__pour);
  const streaked = frames.some(f => f.t > 0 && f.t < 700 && f.vat.length > 1);
  const lateVat = frames.filter(f => f.t >= 760);
  const early = frames.filter(f => f.t < 280), last = frames[frames.length - 1];
  say(streaked && lateVat.length > 0 && lateVat.every(f => f.vat.length === 1 && f.vat[0] === mixed), '375x667 the vat is streaked while it pours and one colour, exactly ' + mixed + ', from 700 ms on (' + frames.length + ' frames; late ' + JSON.stringify(Array.from(new Set(lateVat.map(f => f.vat.join('/'))))) + ')');
  say(early.length > 0 && early.every(f => f.cloth !== mixed) && !!last && last.cloth === mixed, '375x667 the cloth is undyed before 300 ms and exactly the mixed colour by the end (' + (last ? last.cloth : 'no frames') + ' for ' + mixed + ')');
  /* ⛔ the w1 plant (RESOLVE_MS 400 to 600) left this gate GREEN and so planted nothing. The two claims above say "streaked
     somewhere before 700" and "one colour from 760 on", and by 760 a slower resolve's streaks are already thin enough that the
     sampled column reads uniform, so the pour's LENGTH was never asserted at all. It is asserted now, and in milliseconds rather
     than in the page's own STREAM_MS + RESOLVE_MS: a law written in the constant moves when the constant moves and can never
     catch a change to it. */
  const solidFrom = (() => {
    for (let i = 0; i < frames.length; i++) if (frames.slice(i).every(fr => fr.vat.length === 1 && fr.vat[0] === mixed)) return frames[i].t;
    return null;
  })();
  say(solidFrom !== null && solidFrom >= 520 && solidFrom <= 700, '375x667 the vat settles to one colour between 520 and 700 ms after the pour starts, so the pour keeps its length (' + (solidFrom === null ? 'never settles' : Math.round(solidFrom) + ' ms') + ')');

  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  const task = await page.evaluate(() => window.TINT.task());
  const t0 = Date.now();
  await tap(page, '#different');
  const done = await page.waitForFunction(() => window.TINT.pourDone(), { timeout: 2000, polling: 'raf' }).then(() => Date.now() - t0, () => null);
  const cloths = {};
  for (const side of ['left', 'right']) {
    cloths[side] = await page.evaluate(sd => {
      const c = document.getElementById('vat-' + sd), b = c.getBoundingClientRect(), [x, y] = window.TINT.clothPoint(sd), k = c.width / b.width;
      const d = c.getContext('2d').getImageData(Math.round((x - b.left) * k), Math.round((y - b.top) * k), 1, 1).data;
      return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join('');
    }, side);
  }
  const want = { left: mixLinear(DYES[task.dye], ...task.left).hex, right: mixLinear(DYES[task.dye], ...task.right).hex };
  say(done !== null && done <= 150 && cloths.left === want.left && cloths.right === want.right, '375x667 with less motion both cloths are exactly the mixed colour within 150 ms (' + done + ' ms; ' + JSON.stringify(cloths) + ' for ' + JSON.stringify(want) + ')');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' POUR FAILURE(S)'); process.exit(1); }
console.log('POUR OK');
