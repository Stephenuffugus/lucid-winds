#!/usr/bin/env node
/* GLIMPSE P1: the flash's timing (plans/glimpse/HANDOFF-GLIMPSE.md 3.7; the handoff's test gate "measured flash duration within
 * 30 ms of spec under 4x CPU throttle: a 400 ms flash rendering at 900 ms turns a subitizing game into a counting game").
 *
 *   node test/timing.mjs          (in the foreground, under the gate lock)
 *
 * Measured with Emulation.setCPUThrottlingRate 4 in headless Chrome on this box; a real school Chromebook is Stephen's.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. under 4x CPU throttle, the page's own flash path (the round's fireflies, then the mask) is shown for each of the
 *      handoff's lengths, 250, 350, 400, 600 and Long Look's 1500 ms, within CORE's bound (25 ms or 0.6 of the frame interval
 *      the page measured, whichever is more; under the handoff's 30 ms at 60 Hz)
 *   2. the same at no throttle
 *   3. every flash the page played in a round was the length engine.js's flashMs gives its count (the flash log)
 *   4. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertTimingPicksNearest } from '../../math/core/test/shared.mjs';
import { flashMs } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const DURATIONS = [250, 350, 400, 600, 1500];

const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/glimpse/index.html?seed=4242&mode=flash&', ready: READY }));
const { browser, page, errors } = opened;
await tap(page, '#start');
await page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 20000 });
const flash = ({ durationMs }) => window.GLIMPSE.flashOnce(durationMs);

const plain = await assertTimingPicksNearest(page, { flash, durations: DURATIONS });
say(plain.ok, 'at no throttle, each flash length is shown for its length (' + plain.detail + ')');

const cdp = await page.createCDPSession();
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const slow = await assertTimingPicksNearest(page, { flash, durations: DURATIONS });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
say(slow.ok, 'under 4x CPU throttle, each flash length is shown for its length (' + slow.detail + ')');

/* the round the page played: its logged length is flashMs for its count */
await page.evaluate(() => document.querySelector('.pad').click());
await page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 });
const played = await page.evaluate(() => window.GLIMPSE.flashLog());
const off = played.filter(x => x.durationMs !== flashMs(x.count));
say(played.length >= 1 && off.length === 0, 'every flash the page played was flashMs for its count (' + played.map(x => x.count + ' at ' + x.durationMs + ' ms, shown ' + Math.round(x.hiddenAt - x.shownAt)).join('; ') + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' TIMING FAILURE(S)'); process.exit(1); }
console.log('TIMING OK');
