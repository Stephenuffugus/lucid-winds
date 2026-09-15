#!/usr/bin/env node
/* THE FLASH, against the demo (00-CORE-handoff 2.5; plans/math/HANDOFF-CORE.md 3.5, P2).
 *
 *   node test/schedule.mjs
 *
 * A timed presentation IS the difficulty in GLIMPSE, HUSH and anything like them:
 * a 400 ms flash that shows for 900 ms turns subitizing into counting. What this box
 * can prove (3.5, headless Chrome draws in software at a few frames a second):
 *   1. a flash shows for its duration to within 25 ms or 0.6 of the frame interval
 *      the page measured while it ran, whichever is larger, at 100, 400 and 750 ms
 *   2. S1: nothing in `schedule` uses a timer; the frame is the only clock
 *   3. S2: reaction time is stamped from the frame the stimulus PAINTED, so a 100 ms
 *      render delay injected into the show does not move it, while time measured
 *      from the request does move
 *   4. S3: a flash without `onMasked` warns, and one with it does not
 *   5. the mask goes down on the same frame the stimulus goes away
 *   6. nothing lands on the console as an error
 * Each watched to fail on a planted fault.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, reporter, SIZES, CORE } from './harness.mjs';

const { fails, say } = reporter();

/* 2. S1, read off the shipped file */
{
  const src = readFileSync(join(CORE, 'core.js'), 'utf8');
  const at = src.indexOf('export const schedule');
  const end = at < 0 ? -1 : src.indexOf('\nexport ', at + 10);
  const block = at < 0 ? '' : src.slice(at, end < 0 ? src.length : end);
  say(at >= 0, 'core.js exports schedule');
  say(at >= 0 && !/\bset(Timeout|Interval)\s*\(/.test(block), 'and nothing in it uses a timer (S1)');
}

const s = await serve();
const { browser, page, errors } = await open(s.base, SIZES[1]);
const warnings = [];
page.on('console', m => { if (m.type() === 'warning' || m.type() === 'warn') warnings.push(m.text()); });

const hook = await page.evaluate(() => !!(window.CORE_DEMO && CORE_DEMO.flash && CORE_DEMO.flashRT));
say(hook, 'the demo exposes a flash to drive (CORE_DEMO.flash, CORE_DEMO.flashRT)');
if (hook) {
  /* 1 and 5 */
  for (const ms of [100, 400, 750]) {
    const f = await page.evaluate(d => CORE_DEMO.flash({ durationMs: d }), ms);
    const shown = f.hiddenAt - f.shownAt, bound = Math.max(25, 0.6 * f.interval);
    say(Math.abs(shown - ms) <= bound, 'a ' + ms + ' ms flash shows for ' + shown.toFixed(0) + ' ms (within '
      + bound.toFixed(0) + ' ms, frames ' + f.interval.toFixed(0) + ' ms apart)');
    say(f.maskedAt === f.hiddenAt, 'and its mask goes down on the frame it goes away (' + f.maskedAt.toFixed(1) + ' and ' + f.hiddenAt.toFixed(1) + ')');
  }

  /* 3, S2: the same response 300 ms after the paint, once plain and once with a slow render */
  const plain = await page.evaluate(() => CORE_DEMO.flashRT({ durationMs: 400, respondAfterMs: 300, injectDelayMs: 0 }));
  const slow = await page.evaluate(() => CORE_DEMO.flashRT({ durationMs: 400, respondAfterMs: 300, injectDelayMs: 100 }));
  const dPaint = Math.abs(slow.rtPaint - plain.rtPaint), dRequest = slow.rtRequest - plain.rtRequest;
  say(dPaint < 40, 'reaction time from the paint does not move with a 100 ms render delay ('
    + plain.rtPaint.toFixed(0) + ' against ' + slow.rtPaint.toFixed(0) + ' ms)');
  /* ⛔ the premise, not the law: this only proves the injected delay reached the timeline. Its first bound (80 ms of a
     100 ms delay) passed at 84 on the first green run, too close to trust: the busy frame starts up to one frame after
     the request and the paint lands on the next vsync, so frame alignment can absorb up to about two frames (34 ms at
     60 Hz) of the delay. A run with no delay reads near 0, so 60 still tells them apart. The law is dPaint above. */
  say(dRequest >= 60, 'while time from the request does, so the delay was real (' + plain.rtRequest.toFixed(0)
    + ' against ' + slow.rtRequest.toFixed(0) + ' ms)');

  /* 4, S3 */
  const before = warnings.length;
  await page.evaluate(() => CORE_DEMO.flash({ durationMs: 100 }));
  const withMask = warnings.slice(before).filter(w => /onMasked/.test(w)).length;
  await page.evaluate(() => CORE_DEMO.flash({ durationMs: 100, masked: false }));
  const without = warnings.slice(before).filter(w => /onMasked/.test(w)).length - withMask;
  say(withMask === 0, 'a flash with a mask does not warn');
  say(without === 1, 'and one without onMasked warns, once (S3) (' + without + ')');
}
say(errors.length === 0, 'nothing landed on the console as an error' + (errors.length ? ': ' + errors[0] : ''));

await browser.close();
s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SCHEDULE FAILURE(S)'); process.exit(1); }
console.log('SCHEDULE OK');
