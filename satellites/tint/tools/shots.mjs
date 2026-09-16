#!/usr/bin/env node
/* TINT's shots, from where a child and a teacher stand (plans/tint/HANDOFF-TINT.md; CLAUDE.md, LOOKING IS PART OF THE JOB). Every
 * shot is opened with the Read tool and three faults are named before the change it shows is called done. Shape from GAUGE's and
 * BRIM's tools/shots.mjs; the states are test/layout.mjs's, reached by play.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-fill    only names containing that
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const TINT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(TINT, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.TINT && window.TINT.ready';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const done = (page, fn) => page.waitForFunction(fn, { timeout: 30000, polling: 'raf' }).then(() => sleep(150));

const SHOTS = [
  ['p3-doors', '?seed=4242&', async page => { await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 4200; })); await sleep(80); }],
  ['p3-compare', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); }],
  ['p3-compare-pour', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); await tap(page, '#different'); await done(page, () => window.TINT.pourDone()); }],
  ['p3-fill', '?seed=4242&', async page => { await tap(page, '#start-fill'); await sleep(250); await tap(page, '#white-more'); await tap(page, '#add-row'); await sleep(120); }],
  ['p3-fill-pour', '?seed=4242&', async page => { await tap(page, '#start-fill'); await sleep(250); await tap(page, '#white-more'); await tap(page, '#fill-pour'); await done(page, () => window.TINT.fillDone()); }],
  ['p3-scales-demo', '?seed=4242&', async page => { await tap(page, '#start-scales'); await sleep(250); await tap(page, '#scales-yes'); await done(page, () => window.TINT.demoDone()); }]
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach] of SHOTS) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/tint/index.html' + query, ready: READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
