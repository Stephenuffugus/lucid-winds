#!/usr/bin/env node
/* The thumb's path through a cave, in a real browser.
 *
 *   node test/play.mjs
 *
 * What it asserts, each watched to fail (the fail column is in the ledger):
 *   1. a real 80 px drag to the right moves the player right, in world units
 *   2. a drag NEVER throws: the slop rule is what lets one surface carry both
 *   3. a real tap spends exactly one stone and lights walls that were dark
 *   4. the light ARRIVES: more walls are lit later than a moment after the ping
 *   5. a second finger while the stick is live throws AT ONCE, no slop wait
 *   6. the stone count on the screen is the number the sim is holding
 *   7. the hum button spends no stone and refuses a second hum on its cooldown
 *
 * ⛔ Nothing here calls a handler. Every press is a real pointer event on the
 * element a thumb would land on, and every wait is on what the sim believes,
 * never on a clock: this rig runs at a few frames a second.
 */
import { serve, open, reporter, tap, centre, tapAt, drag, dragEnd, sleep } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await tap(page, '#btnPlay');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
await tap(page, '.card[data-lv="0"]');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
await page.waitForFunction(() => window.FATHOM_DEV.frames() > 8, { timeout: 20000 });

const at = await dev(() => {
  const p = window.FATHOM_DEV.player();
  return window.FATHOM_DEV.screenOf(p.x, p.y);
});

/* 1 and 2. the drag moves you, and NEVER throws.
   Counted with the sim's own throw counter at three moments, because the first
   version of this inferred it from the stone count after the second finger had
   already thrown, and it stayed green with the slop rule broken. */
const before = await dev(() => ({ p: window.FATHOM_DEV.player(), s: window.FATHOM_DEV.state() }));
await drag(page, at.x - 60, at.y + 120, at.x + 20, at.y + 120, 8);
const moved = await page.waitForFunction((x0) => window.FATHOM_DEV.player().x > x0 + 8, { timeout: 25000 }, before.p.x)
  .then(() => true).catch(() => false);
const mid = await dev(() => ({ p: window.FATHOM_DEV.player(), s: window.FATHOM_DEV.state() }));
say(moved && mid.p.x > before.p.x + 8,
  'a real 80 px drag to the right moved the player right, world x ' + before.p.x.toFixed(1) + ' to ' + mid.p.x.toFixed(1));
say(mid.s.throws === before.s.throws,
  'and the drag threw nothing while it was held (' + before.s.throws + ' throws, still ' + mid.s.throws + ')');

/* 5. a second finger while the stick is live throws at once, no slop wait */
await tapAt(page, at.x + 40, at.y - 40);
const threwFast = await page.waitForFunction((n) => window.FATHOM_DEV.state().throws === n + 1, { timeout: 20000 }, mid.s.throws)
  .then(() => true).catch(() => false);
const afterSecond = await dev(() => window.FATHOM_DEV.state());
say(threwFast && afterSecond.throws === mid.s.throws + 1,
  'a second finger while the stick is live throws at once (' + mid.s.throws + ' throws to ' + afterSecond.throws + ')');
say(afterSecond.stones === mid.s.stones - 1, 'and that throw is the one stone that was spent');

await dragEnd(page, at.x + 20, at.y + 120);
await sleep(200);
const afterRelease = await dev(() => window.FATHOM_DEV.state());
say(afterRelease.throws === afterSecond.throws,
  'letting the stick go throws nothing either (' + afterSecond.throws + ' throws, still ' + afterRelease.throws + ')');

/* 3 and 4. a real tap lights the cave */
await page.waitForFunction(() => window.FATHOM_DEV.state().ripples.length === 0, { timeout: 40000 }).catch(() => {});
const litBefore = await dev(() => window.FATHOM_DEV.litWalls());
const stones0 = await dev(() => window.FATHOM_DEV.state().stones);
const throws0 = await dev(() => window.FATHOM_DEV.state().throws);
const here = await dev(() => { const p = window.FATHOM_DEV.player(); return window.FATHOM_DEV.screenOf(p.x, p.y); });
await tapAt(page, here.x + 30, here.y + 70);
const spent = await page.waitForFunction((n) => window.FATHOM_DEV.state().stones === n - 1, { timeout: 20000 }, stones0)
  .then(() => true).catch(() => false);
say(spent, 'a real tap on the cave spends exactly one stone (' + stones0 + ' to ' + (await dev(() => window.FATHOM_DEV.state().stones)) + ')');
say((await dev(() => window.FATHOM_DEV.state().throws)) === throws0 + 1, 'a tap with no drag in it IS a throw, which is the other half of the slop rule');

const gotLight = await page.waitForFunction((n) => window.FATHOM_DEV.litWalls() > n, { timeout: 30000 }, litBefore)
  .then(() => true).catch(() => false);
const litEarly = await dev(() => window.FATHOM_DEV.litWalls());
say(gotLight && litEarly > litBefore, 'and the stone lights the cave: ' + litBefore + ' walls lit before it, ' + litEarly + ' after');

const litLate = await page.waitForFunction((n) => window.FATHOM_DEV.litWalls() > n + 3, { timeout: 30000 }, litEarly)
  .then(() => page.evaluate(() => window.FATHOM_DEV.litWalls())).catch(() => litEarly);
say(litLate > litEarly, 'and it ARRIVES rather than switching on: ' + litEarly + ' walls, then ' + litLate);

/* 6. what the screen says is what the sim holds */
const hud = await dev(() => window.FATHOM_DEV.hud());
const sim = await dev(() => window.FATHOM_DEV.state().stones);
say(String(sim) === String(hud.stones), 'the stone count on the screen is the sim count (screen ' + hud.stones + ', sim ' + sim + ')');

/* 7. the hum */
const bHum = await centre(page, '#btnHum');
say(!!bHum && bHum.w >= 48 && bHum.h >= 48 && bHum.onTop,
  'the hum button is ' + (bHum ? bHum.w.toFixed(0) + 'x' + bHum.h.toFixed(0) : 'missing') + ' px and a tap at its centre lands on it');
const stonesPreHum = await dev(() => window.FATHOM_DEV.state().stones);
const ripplesPre = await dev(() => window.FATHOM_DEV.state().ripples.length);
await tap(page, '#btnHum');
const hummed = await page.waitForFunction((n) => window.FATHOM_DEV.state().ripples.length > n, { timeout: 20000 }, ripplesPre)
  .then(() => true).catch(() => false);
say(hummed, 'the hum makes a ring');
say((await dev(() => window.FATHOM_DEV.state().stones)) === stonesPreHum, 'and it costs no stone');
/* counted, not inferred from the ripple list: a ripple that simply expired
   would have satisfied a `ripples.length did not grow` check on its own */
const humsAfter = await dev(() => window.FATHOM_DEV.state().hums);
await tap(page, '#btnHum');
await sleep(200);
const humsLater = await dev(() => window.FATHOM_DEV.state().hums);
say(humsLater === humsAfter, 'a second hum inside the cooldown is refused (' + humsAfter + ' hums, still ' + humsLater + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLAY FAILURE(S)'); process.exit(1); }
console.log('PLAY OK');
