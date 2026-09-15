#!/usr/bin/env node
/* GLIMPSE's shots, from where a child and a teacher stand (plans/glimpse/HANDOFF-GLIMPSE.md; CLAUDE.md, LOOKING IS PART OF THE
 * JOB). Every shot is opened with the Read tool and three faults are named before the change it shows is called done. Shape from
 * satellites/crease/tools/shots.mjs; the states are test/layout.mjs's, reached by play.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-frame   only names containing that
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const GLIMPSE = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(GLIMPSE, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.GLIMPSE && window.GLIMPSE.ready';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const answerable = page => page.waitForFunction(() => window.GLIMPSE.phase() === 'answer', { timeout: 30000 }).then(() => sleep(100));
const revealed = page => page.waitForFunction(() => window.GLIMPSE.revealDone(), { timeout: 30000 }).then(() => sleep(150));
/* the flash itself, caught on the frame the fireflies are up (the shot a child sees for a moment) */
const inFlash = page => page.waitForFunction(() => window.GLIMPSE.phase() === 'flash', { timeout: 30000, polling: 'raf' });

const SHOTS = [
  ['p3-doors', '?seed=4242&', async page => {
    await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 600; }));
    await sleep(80);
  }],
  ['p3-flash-shown', '?seed=4242&flash=long&', async page => { await tap(page, '#start'); await inFlash(page); await sleep(200); }],
  ['p3-flash-answer', '?seed=4242&', async page => { await tap(page, '#start'); await answerable(page); }],
  ['p3-flash-reveal', '?seed=4242&', async page => { await tap(page, '#start'); await answerable(page); await tap(page, '.pad'); await revealed(page); }],
  ['p3-frame-reveal', '?seed=4242&', async page => { await tap(page, '#start-frame'); await answerable(page); await tap(page, '.pad'); await revealed(page); }],
  ['p3-spread-answer', '?seed=4242&', async page => { await tap(page, '#start-spread'); await answerable(page); }],
  ['p3-journal', '?seed=4242&mode=flash&count=12&', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await tap(page, '#start');
    for (let i = 0; i < 12; i++) { await answerable(page); await tap(page, '.pad'); await revealed(page); await tap(page, '#next'); await sleep(100); }
    await sleep(300);
  }]
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach] of SHOTS) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/glimpse/index.html' + query, ready: READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
