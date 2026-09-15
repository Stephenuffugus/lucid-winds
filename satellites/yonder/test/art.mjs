#!/usr/bin/env node
/* YONDER's sprites on the page (plans/yonder/HANDOFF-YONDER.md section 7): what draw.js puts where, read off the canvases'
 * own pixels and the elements' boxes, never off a class name.
 *
 *   node test/art.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the first screen: the loop's flag and traveler and the road door's flag are drawn sprites (pixels, not empty
 *      canvases)
 *   2. FLAG: the flag inside CORE's stone is the flag sprite, drawn, and the stone is still a 56 px target a thumb lands on
 *   3. the signpost is the signpost sprite, drawn, its foot on the road (within 2 px of the road's top)
 *   4. during a walk the traveler shows at least three of its four walking frames, stands on the road the whole way, and
 *      rests on its first frame when it arrives
 *   5. after the walk the truth's post rises above the traveler's head, so the true place is seen and not hidden
 *   6. THE RACE: the racer is a drawn sprite; a turned card shows square pips drawn for its own count (one pip block for
 *      1, two for 2), and a card lying face down shows none
 *   7. the map at 375 and 320: pieces at least 36 px across, the frame and go on the screen
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.YONDER && window.YONDER.ready';

/* a canvas's sprite name and how many of its pixels are drawn */
const drawn = (page, sel) => page.evaluate(sel => {
  const c = document.querySelector(sel);
  if (!c || c.tagName !== 'CANVAS' || !c.width || !c.height) return null;
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  const r = c.getBoundingClientRect();
  return { sprite: c.dataset.sprite, pixels: n, w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left };
}, sel);
const roadTop = page => page.evaluate(() => document.querySelector('#road .lw-line').getBoundingClientRect().top);

/* 1 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/yonder/index.html?seed=4242&', ready: READY }));
  const { page, errors } = opened;
  const bits = [];
  for (const [sel, want] of [['.loop q canvas', 'flag'], ['.loop kbd canvas', 'travelerWalk1'], ['.pick-road canvas', 'flag']]) {
    const d = await drawn(page, sel);
    if (!d || d.sprite !== want || d.pixels < 20) bits.push(sel + ' ' + JSON.stringify(d));
  }
  say(bits.length === 0, '375x667 the first screen\'s loop flag, loop traveler and the road door\'s flag are drawn sprites' + (bits.length ? ': ' + bits.join('; ') : ''));
  say(errors.length === 0, '375x667 first screen: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 2 to 5, at the three phones */
for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&road=100&', ready: READY }));
  const { page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const flag = await drawn(page, '#road .lw-stone canvas');
  const stone = await centre(page, '#road .lw-stone');
  say(!!flag && flag.sprite === 'flag' && flag.pixels > 40 && !!stone && stone.w >= 56 && stone.h >= 56 && stone.onTop,
    at + ' the flag in the stone is the flag sprite, drawn, and the stone a 56 px target (' + JSON.stringify(flag) + ', ' + (stone ? Math.round(stone.w) + 'x' + Math.round(stone.h) + (stone.onTop ? '' : ' COVERED') : 'no stone') + ')');
  const top = await roadTop(page);
  const sign = await drawn(page, '#signpost canvas');
  say(!!sign && sign.sprite === 'signpost' && sign.pixels > 40 && Math.abs(sign.bottom - top) <= 2,
    at + ' the signpost is the signpost sprite, drawn, its foot on the road (foot ' + (sign ? sign.bottom.toFixed(1) : 'none') + ', road ' + top.toFixed(1) + ')');

  /* a walk, frame by frame */
  await page.evaluate(() => {
    const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
    const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
    const x1 = r.left + r.width * (Number(road.dataset.offset) + 0.8 * Number(road.dataset.width));
    const o = x => ({ pointerId: 161, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
    window.__art = [];
    const grab = () => {
      const c = document.querySelector('#traveler canvas'), t = document.getElementById('traveler');
      if (c && !t.hidden) window.__art.push({ frame: c.dataset.sprite, bottom: c.getBoundingClientRect().bottom });
      if (!window.YONDER.walkDone() || window.__art.length < 3) requestAnimationFrame(grab);
    };
    st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
    st.dispatchEvent(new PointerEvent('pointermove', o(x1)));
    st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
    requestAnimationFrame(grab);
  });
  await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
  await sleep(120);
  const frames = await page.evaluate(() => window.__art);
  const kinds = Array.from(new Set(frames.map(f => f.frame)));
  const off = frames.filter(f => Math.abs(f.bottom - top) > 2).length;
  const rest = await drawn(page, '#traveler canvas');
  say(kinds.filter(k => /^travelerWalk[1-4]$/.test(k)).length >= 3 && off === 0 && !!rest && rest.sprite === 'travelerWalk1' && rest.pixels > 40,
    at + ' the traveler walks on its frames (' + kinds.join(', ') + '), feet on the road every frame (' + off + ' off), and rests on its first (' + (rest ? rest.sprite : 'none') + ')');
  const heads = await page.evaluate(() => ({ mark: document.getElementById('truth-mark').getBoundingClientRect().top, traveler: document.querySelector('#traveler canvas').getBoundingClientRect().top }));
  say(heads.mark < heads.traveler - 4, at + ' the truth\'s post rises above the traveler\'s head (post top ' + heads.mark.toFixed(1) + ', head ' + heads.traveler.toFixed(1) + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 6 */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/yonder/index.html?seed=4242&mode=race&', ready: READY }));
  const { page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const racer = await drawn(page, '#racer canvas');
  say(!!racer && /^travelerWalk/.test(racer.sprite) && racer.pixels > 40, '375x667 the racer is a drawn traveler sprite (' + JSON.stringify(racer) + ')');
  const downPips = await page.evaluate(() => { const c = document.querySelector('#card canvas'); return c ? getComputedStyle(c).display : 'none'; });
  say(downPips === 'none', '375x667 a card lying face down shows no pips (' + downPips + ')');
  const seen = [];
  for (let k = 0; k < 4; k++) {
    const st = await page.evaluate(() => window.YONDER.race.state());
    if (st.remaining === 0) {
      await tap(page, '#card');
      await sleep(120);
      const now = await page.evaluate(() => window.YONDER.race.state());
      const pips = await drawn(page, '#card canvas');
      seen.push({ face: now.face, sprite: pips && pips.sprite, pixels: pips && pips.pixels });
      for (let i = 0; i < now.remaining; i++) { const p = (await page.evaluate(() => window.YONDER.race.state())).pos; await tap(page, '#track .square[data-n="' + (p + 1) + '"]'); await sleep(80); }
    }
  }
  const wrong = seen.filter(x => x.sprite !== (x.face === '2' ? 'pipsTwo' : 'pipsOne') || !(x.pixels >= (x.face === '2' ? 288 : 144)));
  say(seen.length >= 2 && wrong.length === 0, '375x667 a turned card shows the pips drawn for its own count (' + JSON.stringify(seen) + ')');
  say(errors.length === 0, '375x667 race: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 7 */
for (const size of [SIZES[1], SIZES[0]]) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, { path: '/yonder/index.html?seed=4242&count=10&', ready: READY }));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await tap(page, '#start');
  await sleep(200);
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      const st = document.querySelector('#road .lw-stone'), a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
      const o = x => ({ pointerId: 162, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
      st.dispatchEvent(new PointerEvent('pointerdown', o(x0))); st.dispatchEvent(new PointerEvent('pointermove', o(x0 + 60))); st.dispatchEvent(new PointerEvent('pointerup', o(x0 + 60)));
    });
    await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
    await sleep(60);
    await tap(page, '#next');
    await sleep(120);
  }
  await sleep(300);
  const m = await page.evaluate(() => {
    const c = document.getElementById('map-canvas'), r = c.getBoundingClientRect(), f = document.querySelector('.map-frame').getBoundingClientRect(), g = document.getElementById('map-go').getBoundingClientRect();
    const vh = window.visualViewport ? visualViewport.height : innerHeight, vw = window.visualViewport ? visualViewport.width : innerWidth;
    const cell = Number(c.dataset.cell) * (r.width / c.width);
    return { cell, onScreen: f.left >= 0 && f.right <= vw && f.top >= 0 && g.bottom <= vh, shown: !document.getElementById('map').hidden };
  });
  say(m.shown && m.cell >= 36 && m.onScreen, at + ' the map\'s pieces are ' + m.cell.toFixed(0) + ' px across (at least 36), the frame and go on the screen (' + JSON.stringify(m) + ')');
  say(errors.length === 0, at + ' map: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' ART FAILURE(S)'); process.exit(1); }
console.log('ART OK');
