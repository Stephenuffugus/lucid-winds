#!/usr/bin/env node
/* BRIM's shots, from where a child and a teacher stand (plans/brim/HANDOFF-BRIM.md; CLAUDE.md, LOOKING IS PART OF THE JOB). Every
 * shot is opened with the Read tool and three faults are named before the change it shows is called done. Shape from
 * satellites/crease/tools/shots.mjs; the states are test/layout.mjs's, reached by play.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-level   only names containing that
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const BRIM = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(BRIM, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.BRIM && window.BRIM.ready';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(150));

const SHOTS = [
  ['p3-doors', '?seed=4242&', async page => {
    await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 1800; }));
    await sleep(80);
  }],
  ['p3-matching', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); }],
  ['p3-matching-reveal', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); await tap(page, '#left'); await revealed(page); }],
  ['p3-half-reveal', '?seed=4242&', async page => { await tap(page, '#start-half'); await sleep(250); await tap(page, '#right'); await revealed(page); }],
  ['p3-brim-reveal', '?seed=4242&', async page => { await tap(page, '#start-brim'); await sleep(250); await tap(page, '#left'); await revealed(page); }],
  ['p3-level', '?seed=4242&', async page => { await tap(page, '#start-level'); await sleep(250); }],
  ['p3-shelf', '?seed=4242&count=12&', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 12; i++) { await tap(page, '#left'); await revealed(page); await tap(page, '#next'); await sleep(150); }
    await sleep(300);
  }]
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach] of SHOTS) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/brim/index.html' + query, ready: READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
