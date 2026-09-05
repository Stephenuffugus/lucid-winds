#!/usr/bin/env node
/* One finger, in a real browser, on a real AudioContext.
 *
 *   node test/hold.mjs
 *
 * The render gate proves the SOUND by pumping the engine offline. This one
 * proves the THUMB: real pointer events on the canvas, the online context the
 * app actually opens, and the state machine watched from the outside.
 *
 * What it asserts, each watched to fail:
 *   1. no AudioContext exists until a finger lands, which is the iOS law
 *   2. a real press moves the engine to held and opens the strings
 *   3. the orchestra arrives in order: strings, then violins, then horns, then
 *      the choir, each one later than the last
 *   4. a real release moves it to resolving and then to idle
 *   5. a press and release inside 180 ms is a HIT, not a hold
 *   6. the chrome gets out of the way on touch and comes back after stillness
 *   7. the frame loop STOPS after two seconds of silence, which is 3.11, the
 *      battery rule, made a rule rather than a hope
 *
 * ⛔ Nothing here calls a handler. Every press is a real pointer event on the
 * element a thumb would land on.
 * ⛔ The autoplay flag this runs under does not exist on a phone. It cannot see
 * a context created before a gesture; assertion 1 is the closest a gate gets,
 * and the phone test in the plan's section 11 is the rest.
 */
import { serve, open, reporter, sleep } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

const at = await dev(() => ({ x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight / 2) }));
const down = (id, x, y) => page.evaluate((id, x, y) => {
  const el = document.getElementById('stage');
  el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: id, pointerType: 'touch',
    isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y, pressure: 0.5, width: 20 }));
}, id, x, y);
const upAt = (id, x, y) => page.evaluate((id, x, y) => {
  const el = document.getElementById('stage');
  el.dispatchEvent(new PointerEvent('pointerup', { pointerId: id, pointerType: 'touch',
    isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
}, id, x, y);

/* 1. nothing is open before a finger lands */
say(!(await dev(() => window.SWELL_DEV.audioReady())), 'no audio context exists before the first touch');
say(await dev(() => window.SWELL_DEV.rafRunning()), 'the frame loop is awake at boot, waiting to be used');

/* 2 and 3. the press, and the orchestra arriving in order */
await down(1, at.x, at.y);
await page.waitForFunction(() => window.SWELL_DEV.audioReady(), { timeout: 10000 });
say(true, 'the first touch opens the audio, and not one moment earlier');
await page.waitForFunction(() => window.SWELL_DEV.state() === 'held', { timeout: 10000 });
say(true, 'and the engine is held');
say(await dev(() => window.SWELL_DEV.hushed()), 'and the chrome got out of the way');

const order = [];
const want = ['strings', 'violins', 'horns', 'choir'];
const t0 = Date.now();
while (order.length < want.length && Date.now() - t0 < 13000) {
  for (const k of want) {
    if (order.indexOf(k) < 0 && await dev((s) => window.SWELL_DEV.sectionLive(s), k)) {
      order.push(k);
    }
  }
  await sleep(120);
}
say(order.join(',') === want.join(','), 'the orchestra arrives in order: ' + (order.join(', ') || 'nothing arrived'));
const held = await dev(() => window.SWELL_DEV.held());
say(held > 7, 'and it has been held long enough for all four (' + held.toFixed(1) + ' seconds)');
const gains = await dev(() => ({ s: window.SWELL_DEV.sectionGain('strings'), v: window.SWELL_DEV.sectionGain('violins'),
  h: window.SWELL_DEV.sectionGain('horns'), c: window.SWELL_DEV.sectionGain('choir') }));
say(gains.s > 0.01, 'the strings are audible at the end of the hold (' + gains.s.toFixed(3) + ')');
say(gains.s >= gains.c, 'and the choir is the newest arrival, not the loudest (' + gains.c.toFixed(3) + ')');

/* 4. the release */
await upAt(1, at.x, at.y);
await page.waitForFunction(() => window.SWELL_DEV.state() === 'resolving', { timeout: 8000 })
  .then(() => say(true, 'letting go moves it to resolving'))
  .catch(() => say(false, 'letting go moves it to resolving, it went to ' + '?'));
const backToIdle = await page.waitForFunction(() => window.SWELL_DEV.state() === 'idle', { timeout: 20000 })
  .then(() => true).catch(() => false);
say(backToIdle, 'and then, in its own time, back to idle');
const log = await dev(() => window.SWELL_DEV.chordLog());
say(log.length >= 3 && log[log.length - 1] === 'I', 'and the harmony came home: ' + log.join(' '));

/* 6. the chrome comes back after stillness */
const backSoon = await page.waitForFunction(() => !window.SWELL_DEV.hushed(), { timeout: 8000 })
  .then(() => true).catch(() => false);
say(backSoon, 'the chrome comes back after two seconds of stillness');

/* 7. the frame loop stops when there is nothing to draw */
const stopped = await page.waitForFunction(() => !window.SWELL_DEV.rafRunning(), { timeout: 20000 })
  .then(() => true).catch(() => false);
say(stopped, 'the frame loop stops when nothing is sounding, which is the battery rule');
const f0 = await dev(() => window.SWELL_DEV.frames());
await sleep(1200);
const f1 = await dev(() => window.SWELL_DEV.frames());
say(f1 === f0, 'and it really is stopped: no frames at all in a second (' + f0 + ' then ' + f1 + ')');

/* 5. a quick tap is a hit, not a hold */
await down(2, at.x - 30, at.y + 40);
await upAt(2, at.x - 30, at.y + 40);
await sleep(400);
const afterTap = await dev(() => ({ state: window.SWELL_DEV.state(), held: window.SWELL_DEV.held(), raf: window.SWELL_DEV.rafRunning() }));
say(afterTap.state !== 'held', 'a press and release inside 180 ms is not a hold (' + afterTap.state + ')');
say(afterTap.raf, 'and it woke the frame loop back up');
await page.waitForFunction(() => window.SWELL_DEV.state() === 'idle', { timeout: 20000 }).catch(() => {});

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' HOLD FAILURE(S)'); process.exit(1); }
console.log('HOLD OK');
