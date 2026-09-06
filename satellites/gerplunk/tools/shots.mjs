#!/usr/bin/env node
/* The shots, taken from where the PLAYER stands, at the three widths.
 *
 *   node tools/shots.mjs                 all of them into docs/shots/
 *   node tools/shots.mjs p1-flight       just one
 *
 * Every shot is driven by real taps and a real flick on the real canvas, the
 * same way the gates do it. The one liberty a camera takes that a gate may
 * not: GERPLUNK_DEV.hold(t) freezes the playback clock at a moment worth
 * photographing, because under swiftshader the page draws a few frames a
 * second and "mid skip" would otherwise be luck.
 *
 * Shape copied from satellites/fathom/tools/shots.mjs.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, flick, stroke, waitFrames } from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } };
const LIMIT = 200 * 1024;
const { base, close } = await serve();
const wrote = [];
const want = n => !only || only.split(',').indexOf(n) >= 0;

async function shoot(page, name) {
  const buf = await page.screenshot({ type: 'png' });
  const p = join(OUT, name + '.png');
  writeFileSync(p, buf);
  const kb = statSync(p).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
}
async function toLake(page) {
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
  await tap(page, '.stone[data-id="skimmer"]');
  await waitFrames(page, 3);
}
/* a good throw from the middle of the water, then the clock held */
async function throwAndHold(page, size, at) {
  const y0 = Math.round(size.height * 0.72), x0 = Math.round(size.width * 0.32);
  await flick(page, stroke({ x0, y0, arc: 300, ms: 150, rise: 0.55, hook: 0.7 }));
  await page.waitForFunction(() => window.GERPLUNK_DEV.lastResult() !== null, { timeout: 10000 });
  const res = await page.evaluate(() => window.GERPLUNK_DEV.lastResult());
  const t = at(res);
  await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), t);
  await waitFrames(page, 4);
  return res;
}

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const { browser, page, errors } = await open(base, size);
  if (want('title-' + key)) { await waitFrames(page, 4); await shoot(page, 'title-' + key); }
  if (key === 'mid') {
    await toLake(page);
    if (want('p1-shore')) { await waitFrames(page, 3); await shoot(page, 'p1-shore'); }
    if (want('p1-flight') || want('p1-gerplunk')) {
      const res = await throwAndHold(page, size, r => Math.max(0.3, r.time * 0.42));
      console.log('  (the throw: ' + res.skips + ' skips, ' + res.distance.toFixed(1) + ' m, ' + res.ended + ')');
      if (want('p1-flight')) await shoot(page, 'p1-flight');
      if (want('p1-gerplunk')) {
        await page.evaluate((t) => window.GERPLUNK_DEV.hold(t), res.time + 0.7);
        await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 10000 });
        await waitFrames(page, 3);
        await shoot(page, 'p1-gerplunk');
      }
    }
    /* P2: the bank with a hand's records on it, and the same date's bank at
       career 1000, where the bed has stopped gifting the skimmer and a rare can
       sit on the pebbles. Both are the real bank after a reload of a seeded save. */
    if (want('p2-bank') || want('p2-bank-late')) {
      for (const [name, career] of [['p2-bank', 12], ['p2-bank-late', 1000]]) {
        if (!want(name)) continue;
        await page.evaluate((career) => {
          const s = JSON.parse(localStorage.getItem('lw_gerplunk_v1') || '{}');
          s.career = career; s.best = career >= 1000 ? 17 : 7; s.seen = { how: 1 };
          s.bestByStone = career >= 1000 ? { skimmer: 17, seaglass: 15, shale: 9, sandstone: 6, heavyflat: 8, fossil: 12, quartz: 14, granite: 1 } : { skimmer: 7, sandstone: 3 };
          localStorage.setItem('lw_gerplunk_v1', JSON.stringify(s));
        }, career);
        await page.reload({ waitUntil: 'load' });
        await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 20000 });
        await tap(page, '#btnPlay');
        await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
        await waitFrames(page, 4);
        const offer = await page.evaluate(() => window.GERPLUNK_DEV.offer());
        console.log('  (' + name + ' offers ' + offer.join(', ') + ')');
        await shoot(page, name);
      }
    }
  } else if (want('p1-lake-' + key)) {
    await toLake(page);
    await waitFrames(page, 3);
    await shoot(page, 'p1-lake-' + key);
  }
  if (errors.length) console.log('  ERRORS at ' + key + ': ' + errors.join(' | '));
  await browser.close();
  console.log('  (' + size.width + 'x' + size.height + ' done)');
}

close();
const over = wrote.filter(w => w.kb > LIMIT / 1024);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
