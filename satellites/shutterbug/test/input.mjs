/* The input gate (BUILD-PLAN.md T0.9, gate `input`): real touchscreen events on the control strip, every hold timed by
 * SB_DEV.step(n) with the loop held, every word read through SB_DEV.lastInput() on the step after the event.
 *   - each control alone: the left zone is L, the right zone R, A is A with its tap, B is B with its tap, lifted is 0;
 *   - a sub step tap (touchStart and touchEnd 4 ms apart, then one step) is exactly one A_TAP;
 *   - a slide from the left zone to the right zone without lifting switches the direction (and the gap is neutral);
 *   - two fingers (the rocker and A) both register;
 *   - B in the air reads as B_TAP.
 * SB_SHOTS=<dir> also writes t09-strip at 412x915 and 360x780 with the right zone and A held (then LOOK at them).
 * Watched red by LATCH_OFF (the sub step tap) and ZONE_FIXED_AT_DOWN (the slide). */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep } from './harness.mjs';

const R = reporter('INPUT');
const srv = await serve();
const browser = await launch();
const IN = { L: 1, R: 2, A: 4, B: 8, A_TAP: 16, B_TAP: 32 };

async function room(w, h) {
  const { page, errors } = await newPage(browser, { width: w, height: h });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));
  await tap(page, '#sample');
  const at = await page.evaluate(() => {
    const c = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    return { L: c(document.querySelector('#rocker .zl')), R: c(document.querySelector('#rocker .zr')), gap: c(document.querySelector('#rocker .gap')),
      A: c(document.querySelector('#btnA .glyph')), B: c(document.querySelector('#btnB .glyph')) };
  });
  const word = async () => { await page.evaluate(() => window.SB_DEV.step(1)); return page.evaluate(() => window.SB_DEV.lastInput()); };
  return { page, errors, at, word };
}

try {
  {
    const { page, errors, at, word } = await room(412, 915);
    for (let k = 0; k < 20; k++) await page.evaluate(() => window.SB_DEV.step(1));     /* settle onto the floor */

    /* each control alone, then lifted */
    for (const [name, want] of [['L', IN.L], ['R', IN.R], ['A', IN.A | IN.A_TAP], ['B', IN.B | IN.B_TAP]]) {
      const f = await page.touchscreen.touchStart(at[name].x, at[name].y);
      const w1 = await word();
      await f.end();
      const w2 = await word();
      R.say(w1 === want && w2 === 0, 'a real touch on ' + name + ' is word ' + want + ' on the next step, lifted 0 (got ' + w1 + ', then ' + w2 + ')');
      for (let k = 0; k < 40; k++) await page.evaluate(() => window.SB_DEV.step(1));
    }

    /* a sub step tap: down and up 4 ms apart, both before the step: exactly one A_TAP, and no held A */
    const tf = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await sleep(4);
    await tf.end();
    const t1 = await word(), t2 = await word();
    R.say((t1 & IN.A_TAP) !== 0 && (t1 & IN.A) === 0 && (t2 & IN.A_TAP) === 0, 'a sub step tap on A (4 ms) is exactly one A_TAP with A not held (words ' + t1 + ', ' + t2 + ')');
    for (let k = 0; k < 60; k++) await page.evaluate(() => window.SB_DEV.step(1));

    /* the slide: left, then right without lifting, then the gap, then lifted */
    const s = await page.touchscreen.touchStart(at.L.x, at.L.y);
    const sL = await word();
    await s.move(at.R.x, at.R.y);
    await page.waitForFunction(() => document.querySelector('#rocker .zr.on'), { timeout: 5000 }).catch(() => {});
    const sR = await word();
    await s.move(at.gap.x, at.gap.y);
    await page.waitForFunction(() => !document.querySelector('#rocker .zone.on'), { timeout: 5000 }).catch(() => {});
    const sG = await word();
    await s.end();
    const sU = await word();
    R.say(sL === IN.L && sR === IN.R, 'a slide from the left zone to the right zone without lifting switches the direction (words ' + sL + ', ' + sR + ')');
    R.say(sG === 0 && sU === 0, 'slid into the neutral gap it is nothing, and lifted nothing (words ' + sG + ', ' + sU + ')');

    /* two fingers: the rocker and A together */
    const r2 = await page.touchscreen.touchStart(at.R.x, at.R.y);
    const a2 = await page.touchscreen.touchStart(at.A.x, at.A.y);
    const both = await word();
    await a2.end(); await r2.end();
    R.say((both & IN.R) !== 0 && (both & IN.A) !== 0, 'two fingers, the rocker and A, both register (word ' + both + ')');
    for (let k = 0; k < 60; k++) await page.evaluate(() => window.SB_DEV.step(1));

    /* B in the air: jump, wait until rising, tap B */
    const j = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await word();
    for (let k = 0; k < 4; k++) await word();
    const air = await page.evaluate(() => { const h = window.SB_DEV.state().hero; return { ground: h.ground, vy: h.vy }; });
    const b = await page.touchscreen.touchStart(at.B.x, at.B.y);
    const wb = await word();
    await b.end(); await j.end();
    R.say(air.ground === 0 && (wb & IN.B_TAP) !== 0, 'B in the air reads as B_TAP (airborne ' + (air.ground === 0) + ', vy ' + air.vy + ', word ' + wb + ')');
    R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the shots: the right zone and A held by real touches while the page is shot */
  if (process.env.SB_SHOTS) {
    mkdirSync(process.env.SB_SHOTS, { recursive: true });
    for (const [w, h] of [[412, 915], [360, 780]]) {
      const { page, at } = await room(w, h);
      for (let k = 0; k < 120; k++) await page.evaluate(() => window.SB_DEV.step(1));
      const r = await page.touchscreen.touchStart(at.R.x, at.R.y);
      const a = await page.touchscreen.touchStart(at.A.x, at.A.y);
      await page.evaluate(() => window.SB_DEV.step(1));
      const file = join(process.env.SB_SHOTS, 't09-strip-' + w + 'x' + h + '.png');
      await page.screenshot({ path: file });
      console.log('  shot  ' + file);
      await a.end(); await r.end();
      await page.close();
    }
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
