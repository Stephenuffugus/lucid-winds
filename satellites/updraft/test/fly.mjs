#!/usr/bin/env node
/* The thumb on the string, in a real browser at 375x667.
 *
 *   node test/fly.mjs
 *
 * What it asserts, each watched to fail (the fail column is in the ledger):
 *   1. a real hold on the canvas raises the sim's reel flag, and the HUD is on
 *   2. held in pulses (down 600 ms, up 600 ms, five times) the kite's altitude
 *      passes 12 m, read from the sim AND from the altitude label on screen
 *   3. a real slide of 90 px to the right while holding sets lean near +1 and
 *      the heading rate goes positive
 *   4. release sets pay out: the reel flag drops, lean resets, and L grows
 *   5. pointercancel releases
 *   6. the pause glyph is on top at its centre, and nothing else is tappable
 *      on the play screen
 *
 * ⛔ Nothing here calls a handler or writes to the sim. Every press is a real
 * pointer event on the element a thumb would land on, and every wait is on
 * what the sim believes, never on a clock. UPDRAFT_DEV.place is a camera
 * liberty and is NOT used here: the kite is launched by the thumb.
 */
import { serve, open, reporter, tap, centre, thumbDown, thumbMove, thumbUp, thumbCancel, sleep, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base, { width: 375, height: 667 });
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await tap(page, '#btnPlay');
await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
await waitFrames(page, 3);
const home = { x: 187, y: 470 };
const landing = await dev((x, y) => { const el = document.elementFromPoint(x, y); return el ? el.id : null; }, home.x, home.y);
say(landing === 'board', 'a thumb at the middle of the field lands on the canvas (' + landing + ')');

/* 1. a real hold raises the reel flag */
const s0 = await dev(() => window.UPDRAFT_DEV.state());
say(s0 && s0.ground && !s0.hold, 'the kite starts on the grass, not held');
await thumbDown(page, home.x, home.y);
const held = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.hold && s.reel; }, { timeout: 15000 }).then(() => true).catch(() => false);
say(held, 'a real hold on the canvas raises the sim\'s hold and reel flags');
const hudOn = await dev(() => getComputedStyle(document.getElementById('hud')).display !== 'none');
say(hudOn, 'and the HUD is showing during the flight');
await sleep(600);
await thumbUp(page, home.x, home.y);
const released0 = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && !s.hold; }, { timeout: 15000 }).then(() => true).catch(() => false);
say(released0, 'and a real release drops them');

/* 2. pulses launch it */
for (let i = 0; i < 5; i++) {
  await sleep(600);
  await thumbDown(page, home.x, home.y);
  await sleep(600);
  await thumbUp(page, home.x, home.y);
}
const up = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.alt > 12; }, { timeout: 30000 }).then(() => true).catch(() => false);
const s2 = await dev(() => window.UPDRAFT_DEV.state());
say(up && s2.alt > 12, 'five real pulses take the kite past 12 m (altitude ' + (s2 ? s2.alt.toFixed(1) : '?') + ' m, max ' + (s2 ? s2.maxAlt.toFixed(1) : '?') + ')');
const label = await dev(() => { const el = document.getElementById('altTag'); const r = el.getBoundingClientRect(); return { text: el.textContent, visible: r.width > 0 && getComputedStyle(el).display !== 'none' && r.top >= 0 }; });
say(label.visible && /^\d+ M$/.test(label.text) && parseInt(label.text, 10) > 10, 'and the altitude label on screen says so (' + label.text + ')');

/* 3. a slide while holding leans it */
await thumbDown(page, home.x, home.y);
await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.hold; }, { timeout: 15000 });
for (let i = 1; i <= 6; i++) { await thumbMove(page, home.x + 15 * i, home.y); await sleep(40); }
const leaned = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.lean > 0.9 && s.hRate > 0.3; }, { timeout: 15000 }).then(() => true).catch(() => false);
const s3 = await dev(() => window.UPDRAFT_DEV.state());
say(leaned, 'a real 90 px slide to the right while holding sets lean near +1 and the heading rate goes positive (lean ' + s3.lean.toFixed(2) + ', rate ' + s3.hRate.toFixed(2) + ' rad/s)');

/* 4. release pays out */
await sleep(300);
const Lheld = (await dev(() => window.UPDRAFT_DEV.state())).L;
await thumbUp(page, home.x + 90, home.y);
const released = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && !s.hold && !s.reel && s.lean === 0; }, { timeout: 15000 }).then(() => true).catch(() => false);
say(released, 'release drops the reel flag and resets the lean to 0');
const paidOut = await page.waitForFunction((L) => { const s = window.UPDRAFT_DEV.state(); return s && s.L > L + 0.5; }, { timeout: 30000 }, Lheld).then(() => true).catch(() => false);
const s4 = await dev(() => window.UPDRAFT_DEV.state());
say(paidOut, 'and the line pays out (L ' + Lheld.toFixed(1) + ' to ' + s4.L.toFixed(1) + ' m)');

/* 5. pointercancel releases */
await thumbDown(page, home.x, home.y);
await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && s.hold; }, { timeout: 15000 });
await thumbCancel(page, home.x, home.y);
const cancelled = await page.waitForFunction(() => { const s = window.UPDRAFT_DEV.state(); return s && !s.hold; }, { timeout: 15000 }).then(() => true).catch(() => false);
say(cancelled, 'pointercancel releases the string');

/* 6. the pause glyph is on top; nothing else is a button on the play screen */
const pz = await centre(page, '#btnPause');
say(!!pz && pz.onTop && pz.w >= 48 && pz.h >= 48, 'the pause glyph is on top at its centre, ' + (pz ? pz.w.toFixed(0) + 'x' + pz.h.toFixed(0) : 'MISSING'));
const buttons = await dev(() => Array.from(document.querySelectorAll('#hud button')).filter(b => b.getBoundingClientRect().width > 0).map(b => b.id));
say(buttons.length === 2 && buttons.indexOf('btnPause') >= 0 && buttons.indexOf('btnMood') >= 0, 'the only buttons during a flight are the mood chip and the pause glyph (' + buttons.join(', ') + ')');

say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' FLY FAILURE(S)'); process.exit(1); }
console.log('FLY OK');
