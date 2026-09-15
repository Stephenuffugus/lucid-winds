#!/usr/bin/env node
/* NOTCH's shots, from where a child and a teacher stand (plans/notch/HANDOFF-NOTCH.md; CLAUDE.md, LOOKING IS PART OF THE JOB). Every
 * shot is opened with the Read tool and three faults are named before the change it shows is called done. Shape from GAUGE's and
 * BRIM's tools/shots.mjs; every state is reached by play, never set.
 *
 *   node tools/shots.mjs            every shot, in the foreground under the gate lock
 *   node tools/shots.mjs p3-find    only names containing that
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, open, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';

const NOTCH = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(NOTCH, 'docs', 'shots');
mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).find(a => !a.startsWith('-'));
const want = n => !only || n.indexOf(only) >= 0;
const LIMIT = 200 * 1024;
const READY = 'window.NOTCH && window.NOTCH.ready';
const s = await serve(join(MATH, '..'));
const save = (name, buf) => {
  writeFileSync(join(OUT, name + '.png'), buf);
  console.log('  ' + name + '.png  ' + Math.round(buf.length / 1024) + ' KB' + (buf.length > LIMIT ? '   OVER THE 200 KB LIMIT' : ''));
};
const revealed = page => page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' }).then(() => sleep(150));
/* one TURN round by keys: turn toward the notch until it seats, or let go if it was dealt already home */
async function seatByKeys(page) {
  await page.evaluate(() => document.getElementById('bench').focus());
  await page.keyboard.press('Enter');
  for (let n = 0; n < 16 && (await page.evaluate(() => window.NOTCH.phase())) === 'turn'; n++) {
    const a = await page.evaluate(() => window.NOTCH.angle());
    await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
  }
  await revealed(page);
}

const SHOTS = [
  ['p3-doors', '?seed=4242&', async () => { await sleep(120); }],
  ['p3-turn', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); }],
  ['p3-turn-reveal', '?seed=4242&', async page => { await tap(page, '#start'); await sleep(250); await seatByKeys(page); }],
  ['p3-find-reveal', '?seed=4242&mode=find&', async page => { await tap(page, '#start-find'); await sleep(250); await tap(page, '#panel .region'); await revealed(page); }],
  ['p3-village', '?seed=4242&mode=turn&stage=one&', async page => {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await tap(page, '#start'); await sleep(250);
    for (let i = 0; i < 12 && !(await page.evaluate(() => window.NOTCH.shelf.shown())); i++) {
      await seatByKeys(page);
      await page.evaluate(() => document.getElementById('next').focus());
      await page.keyboard.press('Enter');
      await sleep(120);
    }
    await page.waitForFunction(() => window.NOTCH.shelf.shown(), { timeout: 15000, polling: 'raf' }).catch(() => null);
    await sleep(300);
  }]
];
for (const size of [SIZES[1], SIZES[0], SIZES[2], SIZES[3]]) {
  const tag = size.name.split(' ')[0];
  for (const [name, query, reach] of SHOTS) {
    if (!want(name + '-' + tag)) continue;
    const { browser, page } = await open(s.base, Object.assign({}, size, { path: '/notch/index.html' + query, ready: READY }));
    await reach(page);
    save(name + '-' + tag, await page.screenshot({ type: 'png' }));
    await browser.close();
  }
}
s.close();
console.log('shots done');
