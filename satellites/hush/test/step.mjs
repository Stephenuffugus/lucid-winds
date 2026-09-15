#!/usr/bin/env node
/* HUSH's STEP, played by real taps and keys, against the engine replayed in Node (plans/hush/HANDOFF-HUSH.md P1; H4, H9, 3.6).
 *
 *   node test/step.mjs          (in the foreground, under the gate lock)
 *
 * The gate decides when to press from Node's own replay of the run, never from the page's state, and never sets a state it
 * asserts. Asserted, each watched to fail on a planted fault:
 *   1. every tier and pose is drawn before the door can be pressed (24 canvases)
 *   2. the run the page plays is dealRun's for the seed, trial for trial (type and gap)
 *   3. every trial's outcome and reaction time is scoreTrial's on the times the page recorded, and the steps are Node's fold of
 *      stepsDelta and approach over those outcomes
 *   4. a press in the gap is ignored: that go trial is a miss, no step, no sound
 *   5. H4: a false alarm is one step back, one snap and nothing else, and every pixel of the clearing after it is a palette
 *      colour (no flash of any colour the game does not own)
 *   6. H9: a miss changes nothing: no sound, no step, and the clearing before its pose and after it is the same picture
 *   7. a hit plays one soft step; the sounds of the run are exactly one per trial that moved or snapped
 *   8. 1366x768 by keys: Space on a go pose is a hit, and the door and go on work by Enter
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, scoreTrial, stepsDelta, approach, adaptAxes } from '../engine.js';
import { PALETTE } from '../sprites.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const expected = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const goAt = expected.map((t, i) => (t.type === 'go' ? i : -1)).filter(i => i >= 0);
const nogoAt = expected.map((t, i) => (t.type === 'nogo' ? i : -1)).filter(i => i >= 0);
/* the plan of hands: a false alarm on the first no-go, a miss on the third go, a press in the gap before the fifth go (and
   nothing in its pose), right on every other trial */
const FALSE_ALARM = nogoAt[0], MISS = goAt[2], GAP_PRESS = goAt[4];
const LAST = Math.max(FALSE_ALARM, MISS, GAP_PRESS) + 2;

const poseUp = i => page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 15000, polling: 'raf' }, i);
const scored = i => page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 15000, polling: 'raf' }, i);
const gapOf = i => page.waitForFunction(k => window.HUSH.phase() === 'gap' && window.HUSH.trials().length === k, { timeout: 15000, polling: 'raf' }, i);
const picture = () => page.evaluate(() => document.getElementById('clearing').toDataURL());

let opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&', ready: READY }));
let { page, errors } = opened;

/* 1 */
const built = await page.evaluate(() => window.HUSH.creaturesBuilt());
say(built === 24, '375x667 every tier and pose is drawn before the door can be pressed (' + built + ' of 24)');

/* Sound on the way a child turns it on (a first load is muted, G12, and a muted page logs nothing to compare) */
await tap(page, '.lw-settings-open'); await sleep(120);
await tap(page, '.lw-settings [data-key="muted"]');
await tap(page, '.lw-settings-close'); await sleep(120);
await page.evaluate(() => window.HUSH.audio.clear());
await tap(page, '#start');
const pictures = {};
for (let i = 0; i <= LAST; i++) {
  await gapOf(i);
  if (i === MISS || i === MISS + 1) pictures[i] = await picture();
  if (i === GAP_PRESS) await tap(page, '#stone');
  await poseUp(i);
  const press = i === FALSE_ALARM || (expected[i].type === 'go' && i !== MISS && i !== GAP_PRESS);
  if (press) await tap(page, '#stone');
  await scored(i);
  if (i === FALSE_ALARM) {
    const palette = new Set(PALETTE.map(c => c.toLowerCase()));
    const stray = await page.evaluate(() => {
      const c = document.getElementById('clearing'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, seen = new Set();
      for (let k = 0; k < d.length; k += 4) seen.add('#' + [d[k], d[k + 1], d[k + 2]].map(v => v.toString(16).padStart(2, '0')).join(''));
      return Array.from(seen);
    });
    const foreign = stray.filter(c => !palette.has(c));
    say(foreign.length === 0, '375x667 H4: after the false alarm every pixel of the clearing is a palette colour' + (foreign.length ? ' (' + foreign.slice(0, 6).join(', ') + ')' : ''));
  }
}
const trials = await page.evaluate(() => window.HUSH.trials());
const run = await page.evaluate(() => window.HUSH.run());
const sounded = await page.evaluate(() => window.HUSH.audio.sounded());

/* 2 */
{
  const bad = run.map((t, i) => (t.type !== expected[i].type || t.gapMs !== expected[i].gapMs ? i : -1)).filter(i => i >= 0);
  say(run.length === expected.length && bad.length === 0, '375x667 the run the page plays is dealRun\'s for the seed, trial for trial' + (bad.length ? ' (differs at ' + bad.slice(0, 5).join(', ') + ')' : ''));
}

/* 3 */
{
  const bad = [];
  let steps = 0;
  trials.forEach((t, i) => {
    const want = scoreTrial(t);
    if (want.outcome !== t.outcome || want.rtMs !== t.rtMs) bad.push(i + ' page ' + t.outcome + ' ' + t.rtMs + ', Node ' + want.outcome + ' ' + want.rtMs);
    steps = approach(steps, stepsDelta(t.outcome, 'careful'));
    if (steps !== t.stepsAfter) bad.push(i + ' steps ' + t.stepsAfter + ', Node ' + steps);
    if (t.paintedAt === null || t.hiddenAt === null || !(t.hiddenAt > t.paintedAt)) bad.push(i + ' has no paint or hide time');
  });
  say(trials.length > LAST && bad.length === 0, '375x667 every outcome and reaction time is scoreTrial\'s on the page\'s own times, and the steps are Node\'s fold (' + trials.length + ' trials)' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
}

/* 4, 5, 6, 7 */
{
  const g = trials[GAP_PRESS], f = trials[FALSE_ALARM], m = trials[MISS];
  const before = i => (i === 0 ? 0 : trials[i - 1].stepsAfter);
  /* the sounds, trial by trial, read from the log's order: one entry for each trial that moved or snapped */
  const wanted = trials.map((t, i) => (t.stepsAfter > before(i) ? 'step' : t.outcome === 'falseAlarm' ? 'snap' : null)).filter(Boolean);
  const names = sounded.map(x => (typeof x === 'string' ? x : x.name));
  say(g.outcome === 'miss' && g.stepAt === null && g.stepsAfter === before(GAP_PRESS), '375x667 a press in the gap is ignored: that go trial is a miss with no step (' + JSON.stringify({ outcome: g.outcome, stepAt: g.stepAt, steps: [before(GAP_PRESS), g.stepsAfter] }) + ')');
  say(f.outcome === 'falseAlarm' && f.stepsAfter === Math.max(0, before(FALSE_ALARM) - 1), '375x667 H4: a false alarm is one step back (' + JSON.stringify({ outcome: f.outcome, steps: [before(FALSE_ALARM), f.stepsAfter] }) + ')');
  say(m.outcome === 'miss' && m.stepsAfter === before(MISS) && pictures[MISS] === pictures[MISS + 1], '375x667 H9: a miss changes nothing, no step and the same picture before its pose and after it (' + JSON.stringify({ outcome: m.outcome, steps: [before(MISS), m.stepsAfter], same: pictures[MISS] === pictures[MISS + 1] }) + ')');
  say(wanted.length > 0 && JSON.stringify(names) === JSON.stringify(wanted), '375x667 one soft step for each trial that moved the creature, one snap for each false alarm, and no other sound (' + names.length + ' played, ' + wanted.length + ' wanted' + (JSON.stringify(names) === JSON.stringify(wanted) ? '' : ': ' + JSON.stringify(names.slice(0, 12)) + ' for ' + JSON.stringify(wanted.slice(0, 12))) + ')');
}
say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await opened.browser.close();

/* 8 */
opened = await open(s.base, Object.assign({}, SIZES[3], { path: '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&', ready: READY }));
({ page, errors } = opened);
await page.evaluate(() => document.getElementById('start').focus());
await page.keyboard.press('Enter');
const firstGo = goAt[0];
for (let i = 0; i <= firstGo; i++) {
  await gapOf(i);
  await poseUp(i);
  if (i === firstGo) await page.keyboard.press('Space');
  await scored(i);
}
const keyTrials = await page.evaluate(() => window.HUSH.trials());
const k = keyTrials[firstGo];
say(!!k && k.outcome === 'hit' && k.rtMs !== null, '1366x768 by keys: Enter opens the door and Space on a go pose is a hit (' + JSON.stringify(k && { outcome: k.outcome, rtMs: k.rtMs }) + ')');
say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
await opened.browser.close();

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' STEP FAILURE(S)'); process.exit(1); }
console.log('STEP OK');
