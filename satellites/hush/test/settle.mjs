#!/usr/bin/env node
/* HUSH P1: the settle, and a run that ends before it (plans/hush/HANDOFF-HUSH.md 3.5 and section 6; the handoff's section 6: "the
 * final settle is the whole game").
 *
 *   node test/settle.mjs          (in the foreground, under the gate lock)
 *
 * Played by keys at 1366x768, the gate pressing from Node's replay of the run and never from the page's state. Asserted, each
 * watched to fail on a planted fault:
 *   1. Careful, right on every trial: the settle comes on the trial whose steps reach eighteen, and no trial follows it in the run
 *   2. the settle shows the raised head (sunlit fur on the clearing) and holds it two seconds or more before it settles, and the
 *      settled creature grazes (no sunlit fur)
 *   3. with Sound on, the settle plays one breath
 *   4. go on after the settle starts a new run at zero steps
 *   5. Quick, pressing only the first six go poses: the run ends at rest with six steps, go on is offered, and the next run's
 *      first trial stands at those six steps' tier
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes, tierOf, SETTLE } from '../engine.js';
import { PALETTE } from '../sprites.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const SUN = PALETTE[7].toLowerCase();

const deal = fork => dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], fork).ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const helpers = page => ({
  poseUp: i => page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 20000, polling: 'raf' }, i),
  scored: i => page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 20000, polling: 'raf' }, i),
  sunlit: () => page.evaluate(sun => {
    const c = document.getElementById('clearing'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let k = 0; k < d.length; k += 4) if ('#' + [d[k], d[k + 1], d[k + 2]].map(v => v.toString(16).padStart(2, '0')).join('') === sun) n++;
    return n;
  }, SUN)
});
/* the page's phases as it changes them, read every frame (read only) */
const watchPhases = page => page.evaluate(() => {
  window.__phases = [];
  let last = null;
  const tick = t => { const p = window.HUSH.phase(); if (p !== last) { window.__phases.push({ p, t }); last = p; } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});

/* 1 to 4: Careful */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], { path: '/hush/index.html?seed=' + SEED + '&count=40&fork=careful&', ready: READY }));
  const { page, errors } = opened;
  const h = helpers(page), run = deal('careful');
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await page.evaluate(() => window.HUSH.audio.clear());
  await watchPhases(page);
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  let i = 0;
  for (; i < run.length; i++) {
    await h.poseUp(i);
    if (run[i].type === 'go') await page.keyboard.press('Space');
    await h.scored(i);
    if ((await page.evaluate(() => window.HUSH.steps())) >= SETTLE) break;
  }
  await page.waitForFunction(() => window.HUSH.phase() === 'settle', { timeout: 10000, polling: 'raf' });
  await sleep(700);
  const midSun = await h.sunlit();
  await page.waitForFunction(() => window.HUSH.phase() === 'settled', { timeout: 10000, polling: 'raf' });
  const afterSun = await h.sunlit();
  const trials = await page.evaluate(() => window.HUSH.trials());
  const phases = await page.evaluate(() => window.__phases.slice());
  const settleAt = phases.find(x => x.p === 'settle'), settledAt = phases.find(x => x.p === 'settled');
  const held = settleAt && settledAt ? settledAt.t - settleAt.t : 0;
  const reached = trials.findIndex(t => t.stepsAfter >= SETTLE);
  say(reached >= 0 && trials.length === reached + 1 && reached === i, '1366x768 Careful: the settle comes on the trial whose steps reach eighteen, and no trial follows it (reached on trial ' + reached + ', ' + trials.length + ' played)');
  say(midSun > 0 && afterSun === 0 && held >= 2000, '1366x768 the settle shows the raised head (' + midSun + ' sunlit pixels), holds ' + held.toFixed(0) + ' ms (two seconds or more), and the settled creature grazes (' + afterSun + ' sunlit)');
  const breaths = (await page.evaluate(() => window.HUSH.audio.sounded())).filter(x => x === 'breath').length;
  say(breaths === 1, '1366x768 with Sound on, the settle plays one breath (' + breaths + ')');
  await page.waitForFunction(() => !document.getElementById('next').hidden, { timeout: 10000, polling: 'raf' });
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await page.waitForFunction(k => window.HUSH.phase() === 'gap' && window.HUSH.trials().length === k, { timeout: 10000, polling: 'raf' }, trials.length);
  const again = await page.evaluate(() => ({ steps: window.HUSH.steps(), tier: window.HUSH.tier(), runs: window.HUSH.runs().length }));
  say(again.steps === 0 && again.tier === 0 && again.runs === 1, '1366x768 go on after the settle starts a new run at zero steps (' + JSON.stringify(again) + ')');
  say(errors.length === 0, '1366x768 Careful: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

/* 5: Quick, six presses and then none */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], { path: '/hush/index.html?seed=' + SEED + '&count=40&fork=quick&', ready: READY }));
  const { page, errors } = opened;
  const h = helpers(page), run = deal('quick');
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  let pressed = 0;
  for (let i = 0; i < run.length; i++) {
    await h.poseUp(i);
    if (run[i].type === 'go' && pressed < 6) { await page.keyboard.press('Space'); pressed++; }
    await h.scored(i);
  }
  await page.waitForFunction(() => window.HUSH.phase() === 'rest' && !document.getElementById('next').hidden, { timeout: 15000, polling: 'raf' });
  const rest = await page.evaluate(() => ({ steps: window.HUSH.steps(), trials: window.HUSH.trials().length }));
  await page.evaluate(() => document.getElementById('next').focus());
  await page.keyboard.press('Enter');
  await h.poseUp(0).catch(() => null);
  await page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.run === 1; }, { timeout: 15000, polling: 'raf' });
  const first = await page.evaluate(() => window.HUSH.live());
  say(rest.steps === 6 && rest.trials === 40 && first.tier === tierOf(6), '1366x768 Quick: a run with six right steps ends at rest with six, and the next run\'s first trial stands at their tier (' + JSON.stringify({ rest, nextTier: first.tier, want: tierOf(6) }) + ')');
  say(errors.length === 0, '1366x768 Quick: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SETTLE FAILURE(S)'); process.exit(1); }
console.log('SETTLE OK');
