#!/usr/bin/env node
/* NOTCH's pieces and village as drawn (plans/notch/HANDOFF-NOTCH.md 3.8, 3.9 and 3.13): read off the SVG the page draws and the
 * village's canvas pixels, never off a class name.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. N4: every piece the page draws, on the bench, in FIND's target and in every region, is one wood with one grain colour
 *   2. 3.9: in FIND, every region's grain runs at its piece's own grain angle turned with the region (a quarter turn is 90 degrees,
 *      a mirror reflects it), within a degree: the grain belongs to the piece, never to the screen
 *   3. the village after a clean session at 375 and 320: one building drawn, at least 36 px across, the frame and go on the screen
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { PIECES } from '../pieces.js';
import { WOOD, GRAIN } from '../render.js';
import { SESSION_LENGTH } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const mod180 = a => ((a % 180) + 180) % 180;
const apart = (a, b) => { const d = mod180(a - b); return Math.min(d, 180 - d); };

/* 1 and 2 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/notch/index.html?seed=4242&', ready: READY }));
  await tap(page, '#start');
  await sleep(150);
  const bench = await page.evaluate(() => { const b = document.getElementById('bench'); return { fill: b.querySelector('[data-part="piece"]').getAttribute('fill'), grain: b.querySelector('[data-part="grain"]').getAttribute('stroke') }; });
  await page.goto(s.base + '/notch/index.html?seed=4242&', { waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '#start-find');
  await sleep(150);
  const panel = await page.evaluate(() => window.NOTCH.panel());
  const drawn = await page.evaluate(() => {
    const read = svg => {
      const poly = svg.querySelector('polygon[data-part="piece"]'), g = svg.querySelector('g[clip-path]'), line = g && g.querySelector('line');
      const angle = line ? Math.atan2(Number(line.getAttribute('y2')) - Number(line.getAttribute('y1')), Number(line.getAttribute('x2')) - Number(line.getAttribute('x1'))) * 180 / Math.PI : null;
      return { fill: poly && poly.getAttribute('fill'), grain: g && g.getAttribute('stroke'), angle };
    };
    return { target: read(document.querySelector('#target svg')), regions: Array.from(document.querySelectorAll('#panel .region')).map(b => Object.assign({ slot: Number(b.dataset.slot) }, read(b.querySelector('svg')))) };
  });
  const all = [bench, drawn.target].concat(drawn.regions);
  const colours = all.filter(x => x.fill !== WOOD || x.grain !== GRAIN);
  say(colours.length === 0 && all.length >= 8, '375x667 N4: every piece drawn, on the bench, the target and ' + drawn.regions.length + ' regions, is one wood and one grain (' + WOOD + ', ' + GRAIN + ')' + (colours.length ? ': ' + JSON.stringify(colours.slice(0, 3)) : ''));
  /* on the screen y runs down: a grain at angle g in the piece's own cells (y down too) is drawn at g, mirrored at 180 - g,
     then a quarter turn counterclockwise on the screen subtracts 90 */
  const bad = [];
  for (const g of panel.regions) {
    const d = drawn.regions.find(x => x.slot === g.slot);
    const base = PIECES[g.pieceId].grain, want = mod180((g.mirror ? 180 - base : base) - 90 * (g.turn || 0));
    if (!d || d.angle === null || apart(d.angle, want) > 1) bad.push(g.pieceId + (g.mirror ? ' mirrored' : '') + ' turn ' + (g.turn || 0) + ': drawn ' + (d && d.angle !== null ? mod180(d.angle).toFixed(1) : 'none') + ', want ' + want.toFixed(1));
  }
  say(bad.length === 0, '375x667 3.9: every region\'s grain runs at its piece\'s grain angle turned and mirrored with it' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ' (' + panel.regions.length + ' regions)'));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 3 */
for (const size of [SIZES[1], SIZES[0]]) {
  const at = size.name;
  const { browser, page, errors } = await open(s.base, Object.assign({}, size, { path: '/notch/index.html?seed=4242&stage=one&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(150);
  for (let i = 0; i < SESSION_LENGTH; i++) {
    await page.evaluate(() => document.getElementById('bench').focus());
    let presses = 0;
    while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
      const a = await page.evaluate(() => window.NOTCH.angle());
      await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
      presses++;
    }
    await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(60);
  }
  await sleep(300);
  const m = await page.evaluate(() => {
    const c = document.getElementById('shelf-canvas'), r = c.getBoundingClientRect(), f = document.querySelector('.shelf-frame').getBoundingClientRect(), g = document.getElementById('shelf-go').getBoundingClientRect();
    const vh = window.visualViewport ? visualViewport.height : innerHeight, vw = window.visualViewport ? visualViewport.width : innerWidth;
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 3; k < d.length; k += 4) if (d[k] > 0) n++;
    return { cell: Number(c.dataset.cell) * (r.width / c.width), pixels: n, onScreen: f.left >= 0 && f.right <= vw && f.top >= 0 && g.bottom <= vh, shown: !document.getElementById('shelf').hidden, cells: window.NOTCH.shelf.cells().length };
  });
  say(m.shown && m.cells === 1 && m.pixels > 100 && m.cell >= 36 && m.onScreen, at + ' the village shows one building drawn, ' + m.cell.toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify(m) + ')');
  say(errors.length === 0, at + ' village: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
