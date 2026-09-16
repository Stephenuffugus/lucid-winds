#!/usr/bin/env node
/* HUSH's shots, from where a child and a teacher stand (plans/hush/HANDOFF-HUSH.md; CLAUDE.md, LOOKING IS PART OF THE JOB). Every
 * shot is opened with the Read tool and three faults are named before the change it shows is called done. Shape from GAUGE's and
 * BRIM's tools/shots.mjs; the states are test/layout.mjs's, reached by play.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-living  only names containing that
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealRun, adaptAxes, SETTLE } from '../engine.js';

const HUSH = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(HUSH, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.HUSH && window.HUSH.ready';
const SEED = 4242;
const LINK = '?seed=' + SEED + '&count=40&fork=careful&';
const run = dealRun(rng(SEED >>> 0), { n: 40, level: adaptAxes([], 'careful').ratio >= 0.8 ? 'hard' : 'easy', mode: 'step' });
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
/* the page writes its own record on the fork; a shot only moves where the approach stands and which species comes */
async function standAt(page, steps, settles) {
  await page.evaluate(() => document.getElementById('fork-careful').click());
  await sleep(150);
  await page.evaluate((n, k) => { const rec = JSON.parse(localStorage.getItem('lw:hush:save')); rec.adapt.steps = n; rec.adapt.settles = k; localStorage.setItem('lw:hush:save', JSON.stringify(rec)); }, steps, settles);
  await page.goto(s.base + '/hush/index.html' + LINK, { waitUntil: 'load' });
  await page.waitForFunction(READY, { timeout: 30000 });
}
const poseOf = (page, i) => page.waitForFunction(k => { const l = window.HUSH.live(); return !!l && l.i === k && l.paintedAt !== null; }, { timeout: 30000, polling: 'raf' }, i);
const firstNoGo = run.findIndex(t => t.type === 'nogo');

const SHOTS = [
  ['p3-fork', '?seed=' + SEED + '&', async page => { await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 1500; })); await sleep(80); }],
  ['p3-doors', LINK, async () => { await sleep(80); }],
  ['p3-step-deer-near', '?seed=' + SEED + '&', async page => { await standAt(page, 15, 0); await tap(page, '#start'); await poseOf(page, 0); }],
  ['p3-alert-hare', '?seed=' + SEED + '&', async page => {
    /* the hare at a middle tier with its head up: the first no-go pose of the run */
    await standAt(page, 9, 1); await tap(page, '#start');
    for (let i = 0; i <= firstNoGo; i++) { await poseOf(page, i); if (i < firstNoGo && run[i].type === 'go') await tap(page, '#stone'); if (i < firstNoGo) await page.waitForFunction(k => window.HUSH.trials().length > k, { timeout: 30000, polling: 'raf' }, i); }
  }],
  ['p3-step-fox-far', '?seed=' + SEED + '&', async page => { await standAt(page, 0, 2); await tap(page, '#start'); await poseOf(page, 0); }],
  ['p3-living', '?seed=' + SEED + '&', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await standAt(page, SETTLE - 1, 0); await tap(page, '#start'); await poseOf(page, 0);
    if (run[0].type === 'go') await tap(page, '#stone');
    await page.waitForFunction(() => window.HUSH.living.shown(), { timeout: 30000, polling: 'raf' }); await sleep(300);
  }],
  ['p3-simon', '', async () => { await sleep(120); }, '/hush/simon/index.html?seed=' + SEED + '&']
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach, path] of SHOTS) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: path || '/hush/index.html' + query, ready: path ? 'window.SIMON' : READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
