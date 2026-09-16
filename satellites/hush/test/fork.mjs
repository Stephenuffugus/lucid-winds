#!/usr/bin/env node
/* HUSH's picture fork and what the device keeps (plans/hush/HANDOFF-HUSH.md 3.3, 3.4, 3.5).
 *
 *   node test/fork.mjs          (in the foreground, under the gate lock)
 *
 * Every state reached by taps; the store is the page's own, never written by the gate. Asserted, each watched to fail on a
 * planted fault:
 *   1. a first visit with no fork in its link shows the two pictures and not the doors, 56 px targets with no words on them
 *   2. the hare makes Quick: the doors come, a reload does not ask again, and the first pose lasts Quick's 800 ms
 *   3. the Quick switch in settings turned off makes Careful: the next page's first pose lasts 1200 ms
 *   4. a teacher's link that names a fork wins over the kept choice and does not ask
 *   5. on another first visit the heron makes Careful
 *   6. a run that ends is kept: after a reload the device holds that run's outcomes and its steps
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const PATH = '/hush/index.html?seed=4242&count=40&';
const firstPose = page => page.waitForFunction(() => { const l = window.HUSH.live(); return !!l && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' }).then(() => page.evaluate(() => window.HUSH.live()));
const shown = (page, id) => page.evaluate(id => { const e = document.getElementById(id); return !!e && !e.hidden && e.getBoundingClientRect().height > 0; }, id);

/* 1 to 4, one device */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const m = await page.evaluate(() => ['fork-quick', 'fork-careful'].map(id => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { id, w: r.width, h: r.height, text: e.innerText.trim() }; }));
  say(await shown(page, 'fork') && !(await shown(page, 'doors')) && m.every(x => x.w >= 56 && x.h >= 56 && x.text === ''), '375x667 a first visit shows the two pictures and not the doors, 56 px targets with no words (' + JSON.stringify(m) + ')');
  await tap(page, '#fork-quick');
  await sleep(150);
  const doorsAfter = await shown(page, 'doors');
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  const askedAgain = await shown(page, 'fork');
  await tap(page, '#start');
  const q = await firstPose(page);
  say(doorsAfter && !askedAgain && q.fork === 'quick' && q.durationMs === 800, '375x667 the hare makes Quick: the doors come, a reload does not ask again, the first pose lasts 800 ms (' + JSON.stringify({ doorsAfter, askedAgain, fork: q.fork, ms: q.durationMs }) + ')');
  /* the switch, on a fresh page of the same device */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '.lw-settings-open'); await sleep(120);
  const was = await page.evaluate(() => document.querySelector('.lw-settings [data-key="quick"]').getAttribute('aria-checked'));
  await tap(page, '.lw-settings [data-key="quick"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await tap(page, '#start');
  const c = await firstPose(page);
  say(was === 'true' && c.fork === 'careful' && c.durationMs === 1200, '375x667 the Quick switch turned off makes Careful: the first pose lasts 1200 ms (' + JSON.stringify({ switchWas: was, fork: c.fork, ms: c.durationMs }) + ')');
  /* the teacher's link: turn Quick back on, then open a link naming Careful */
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="quick"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.goto(s.base + PATH + 'fork=careful&', { waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  const linkAsked = await shown(page, 'fork');
  await tap(page, '#start');
  const l = await firstPose(page);
  say(!linkAsked && l.fork === 'careful' && l.durationMs === 1200, '375x667 a link naming Careful wins over the kept Quick and does not ask (' + JSON.stringify({ asked: linkAsked, fork: l.fork, ms: l.durationMs }) + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 5 and 6, another device */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[0], { path: PATH, ready: READY }));
  await tap(page, '#fork-careful');
  await sleep(150);
  const fork = await page.evaluate(() => window.HUSH.fork());
  say(fork === 'careful', '320x568 on another first visit the heron makes Careful (' + fork + ')');
  /* a whole run with no presses: Careful earns a step on every freeze, so it may settle; whichever way it ends, it is kept */
  await tap(page, '#start');
  await page.waitForFunction(() => (window.HUSH.phase() === 'rest' || window.HUSH.phase() === 'settled') && !document.getElementById('next').hidden, { timeout: 200000, polling: 'raf' });
  const ended = await page.evaluate(() => ({ phase: window.HUSH.phase(), steps: window.HUSH.steps(), outcomes: window.HUSH.runs()[0] }));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
  const kept = await page.evaluate(() => window.HUSH.kept());
  const wantSteps = ended.phase === 'settled' ? 0 : ended.steps;
  say(kept.runs.length === 1 && JSON.stringify(kept.runs[0]) === JSON.stringify(ended.outcomes) && kept.steps === wantSteps && kept.forked === true,
    '320x568 a run that ends is kept: after a reload the device holds its ' + (kept.runs[0] ? kept.runs[0].length : 0) + ' outcomes and its steps (' + JSON.stringify({ ended: ended.phase, steps: ended.steps, keptSteps: kept.steps }) + ')');
  say(errors.length === 0, '320x568 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' FORK FAILURE(S)'); process.exit(1); }
console.log('FORK OK');
