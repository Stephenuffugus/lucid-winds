#!/usr/bin/env node
/* Every button a thumb uses, on every screen, at the three widths.
 *
 *   node test/layout.mjs
 *
 * The studio law is 48 px RENDERED, and reachable: a button that measures 48 px
 * under something else is not a button. So every check here is three things,
 * the rectangle, document.elementFromPoint at its centre landing on it, and the
 * whole rectangle inside the viewport. Nothing tappable off the screen.
 * ⛔ el.click() proves nothing and is not used anywhere in this file.
 * ⛔ a missing or hidden element is a FAIL, never a skip: every screen is put
 * on first and its buttons counted before they are measured.
 *
 * It also holds the seat: the bottom left 120 by 120 of the lake belongs to the
 * fleet's music chip and its folded pill, and nothing of Gerplunk's may be in
 * it but the water itself.
 */
import { serve, open, reporter, tap, centre, flick, stroke, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const SIZES = [{ width: 375, height: 667 }, { width: 320, height: 568 }, { width: 412, height: 915 }];

for (const size of SIZES) {
  const tag = size.width + 'x' + size.height;
  const { browser, page } = await open(base, size);
  const dev = (fn, ...a) => page.evaluate(fn, ...a);

  async function check(sel, label, min) {
    const c = await centre(page, sel);
    const need = min || 48;
    const ok = !!c && c.w >= need && c.h >= need && c.onTop && c.inView;
    say(ok, tag + '  ' + label + '  ' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) + (c.onTop ? '' : ' NOT ON TOP') + (c.inView ? '' : ' OFF THE SCREEN') : 'MISSING'));
  }
  async function count(sel, n, label) {
    const got = await dev((sel) => document.querySelectorAll(sel).length, sel);
    say(got === n, tag + '  ' + label + ': ' + got + ' of ' + n);
  }

  /* the title */
  say((await dev(() => window.GERPLUNK_DEV.screen())) === 'title', tag + '  boots to the title');
  await check('#btnPlay', 'TO THE LAKE', 56);

  /* the lake */
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  await waitFrames(page, 3);
  await check('#btnMenu', 'MENU');
  await count('.stone', 3, 'stones on the bank');
  const ids = await dev(() => Array.from(document.querySelectorAll('.stone')).map(b => b.getAttribute('data-id')));
  for (const id of ids) await check('.stone[data-id="' + id + '"]', 'stone ' + id);
  const post = await centre(page, '#post');
  say(!!post && post.inView, tag + '  the tally post is on the screen');
  /* the music chip's seat */
  const seat = await dev(() => {
    const H = window.innerHeight, hits = [];
    for (const [x, y] of [[20, H - 20], [60, H - 60], [110, H - 110], [110, H - 20], [20, H - 110]]) {
      const el = document.elementFromPoint(x, y);
      hits.push(el ? (el.id || el.tagName) : 'none');
    }
    return hits;
  });
  say(seat.every(h => h === 'stage'), tag + '  the bottom left 120x120 is only water (' + seat.join(', ') + ')');
  /* every button on the lake is inside the viewport */
  const off = await dev(() => Array.from(document.querySelectorAll('#hud button')).filter(b => {
    const r = b.getBoundingClientRect();
    return r.width > 0 && (r.left < 0 || r.top < 0 || r.right > window.innerWidth || r.bottom > window.innerHeight);
  }).map(b => b.id || b.getAttribute('data-id')));
  say(off.length === 0, tag + '  nothing tappable is off the screen' + (off.length ? ': ' + off.join(', ') : ''));

  /* ⛔ THE LAND IS NOT A PIECE OF CARDBOARD, AND THE HAND IS NOT EMPTY. Both are
     on the thin list and both are read off the CANVAS, because a silhouette can
     be the right shape and still be a flat ruled edge, and a stone can be
     "picked" in the state and painted nowhere. */
  await dev(() => window.GERPLUNK_DEV.setYaw(-20));
  await waitFrames(page, 4);
  const edge = await dev(() => window.GERPLUNK_DEV.landEdge());
  say(edge.n >= 12, tag + '  the point is on the screen to be measured (' + edge.n + ' columns)');
  /* ⛔ TURNS, and the band is MEASURED. A steep diagonal steps by two pixels a
     column all on its own, so counting steps gave 29 with the trees and 20
     without, which is too narrow to hold anything; a diagonal never changes
     DIRECTION and a treeline changes it at every tree. With the point wooded it
     turns 8 to 10 times, and with `drawPointTrees` taken out, 4 at both sizes.
     Six is the line between them and the margin is real either way. */
  say(edge.turns >= 6, tag + '  and its skyline changes direction ' + edge.turns
    + ' times, so it is a wooded point and not a ruled edge (' + edge.steps + ' steps)');
  /* ⛔ THERE IS NO ASSERTION ON `steps` AND THERE WAS ONE. With the trees it
     counts 30, 28 and 23 at the three sizes and without them 20, 21 and 19: at
     320 the two bands are one apart, so a floor there would have been a line
     that goes red on a slow frame and never on a real regression. The number is
     printed because it is worth reading; only `turns` is asserted, because only
     `turns` separates. */
  /* ⛔ THE STONE IS MEASURED AS A SHAPE, not as a count of warm pixels. The sun's
     road lies across this water at the stance the gate looks from and it is
     warm: a count read 273 with the stone in hand and 258 without, which is a
     probe measuring the lake. The longest unbroken run of stone coloured pixels
     down the middle of the palm is 46 with it and 3 without. */
  const palm = await dev(() => window.GERPLUNK_DEV.palmInk());
  say(palm.run >= 24, tag + '  the stone you picked is IN YOUR HAND on the screen ('
    + palm.run + ' px of it down the middle of the palm)');
  /* and it goes when the stone goes. ⛔ a release that came out slow is a set
     down, not a throw, so the throw is watched and tried again rather than
     believed: at 375 the first attempt reads as a set down about one run in
     three under swiftshader. */
  const lay = await dev(() => window.GERPLUNK_DEV.layout());
  let flew = false;
  for (let go = 0; go < 4 && !flew; go++) {
    await flick(page, stroke({ x0: Math.round(lay.W * 0.32), y0: Math.round(lay.H * 0.72),
      arc: 340, ms: 160, rise: 0.55, hook: 0.7, n: 14 }));
    flew = await page.waitForFunction(() => window.GERPLUNK_DEV.state().inFlight, { timeout: 8000 })
      .then(() => true).catch(() => false);
  }
  await waitFrames(page, 3);
  say(flew, tag + '  a real flick put the stone in the air so the hand can be looked at');
  const inAir = await dev(() => ({ palm: window.GERPLUNK_DEV.palmInk(), flying: window.GERPLUNK_DEV.state().inFlight }));
  say(flew && inAir.palm.run < 10,
    tag + '  and the hand is empty while the stone is in the air (' + inAir.palm.run
    + ' px against ' + palm.run + ')');
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 30000 }).catch(() => {});
  await waitFrames(page, 3);

  /* the sheet */
  await tap(page, '#btnMenu');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 15000 });
  await check('#btnSound', 'SOUND', 56);
  await check('#btnMotion', 'MOTION', 56);
  await check('#btnBack', 'BACK TO THE LAKE', 56);
  await check('#btnExit', 'LEAVE THE LAKE', 56);
  await tap(page, '#btnBack');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 15000 });
  say(true, tag + '  BACK returns to the lake');

  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' LAYOUT FAILURE(S)'); process.exit(1); }
console.log('LAYOUT OK');
