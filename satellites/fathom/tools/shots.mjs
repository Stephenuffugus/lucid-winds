#!/usr/bin/env node
/* The shots, taken from where the PLAYER stands, at the three widths.
 *
 *   node tools/shots.mjs                 all of them into docs/shots/
 *   node tools/shots.mjs p1-ping         just one
 *
 * Every shot is driven by real taps on real elements, the same way the gates
 * do it, because a screenshot of a state no thumb can reach is a lie about the
 * game. The one thing this tool does that a gate may not is SEED THE SAVE, so
 * the deep is open without playing three caves first; it is a camera, not a
 * gate, and it says so here.
 *
 * ⛔ Under swiftshader on two cores the page runs at a few frames a second and
 * the fixed step loop runs with it, so nothing here waits on a clock. Every
 * wait is waitForFunction on what the sim actually believes.
 */
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, ROOT, tap, tapAt, sleep , waitFrames} from '../test/harness.mjs';

const OUT = join(ROOT, 'docs', 'shots');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const SIZES = { tall: { width: 412, height: 915 }, mid: { width: 375, height: 667 }, small: { width: 320, height: 568 } };
const LIMIT = 200 * 1024;
const { base, close } = await serve();
const wrote = [];

async function shoot(page, name) {
  const buf = await page.screenshot({ type: 'png' });
  const p = join(OUT, name + '.png');
  writeFileSync(p, buf);
  const kb = statSync(p).size / 1024;
  wrote.push({ name, kb });
  console.log('  ' + name.padEnd(20) + kb.toFixed(0).padStart(4) + ' KB' + (kb > LIMIT / 1024 ? '   OVER THE 200 KB EVIDENCE LIMIT' : ''));
}
async function toPlay(page, lv) {
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
  await tap(page, '.card[data-lv="' + lv + '"]');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
  await waitFrames(page, 6);
}
/* a throw at a screen point, then wait for the ring to be worth photographing */
async function throwAndWait(page, dx, dy, r) {
  /* the camera CLAMPS to the cave, so the player is not at the centre of the
     screen and a fixed offset can land off the page entirely. Clamp the throw
     point into the viewport, and if there is no room above, throw below. */
  const at = await page.evaluate((dx, dy) => {
    const p = window.FATHOM_DEV.player();
    const s = window.FATHOM_DEV.screenOf(p.x, p.y);
    const W = window.innerWidth, H = window.innerHeight;
    let y = s.y + dy;
    if (y < 30) y = s.y + Math.abs(dy);
    return { x: Math.max(24, Math.min(W - 24, s.x + dx)), y: Math.max(30, Math.min(H - 90, y)) };
  }, dx, dy);
  await tapAt(page, at.x, at.y);
  await page.waitForFunction((r) => {
    const s = window.FATHOM_DEV.state();
    return s && s.ripples.length && s.ripples[0][2] > r;
  }, { timeout: 40000 }, r);
}
function want(n) { return !only || only === n; }

for (const key of Object.keys(SIZES)) {
  const size = SIZES[key];
  const tag = size.width + 'x' + size.height;
  const { browser, page } = await open(base, size);
  if (want('title-' + key)) { await waitFrames(page, 10); await shoot(page, 'title-' + key); }
  await toPlay(page, 0);
  if (key === 'mid' && want('p0-glow')) await shoot(page, 'p0-glow');
  if (want('p1-ping-' + key)) {
    await throwAndWait(page, 0, -110, 175);
    await shoot(page, 'p1-ping-' + key);
  }
  await browser.close();
  console.log('  (' + tag + ' done)');
}

/* the cache glint, in the deep, where a cache can sit inside one ping of the
   start. The save is seeded so the deep is open; see the header. */
if (want('p1-cache')) {
  let done = false;
  for (let attempt = 0; attempt < 6 && !done; attempt++) {
    const { browser, page } = await open(base, SIZES.mid);
    await page.evaluate((n) => {
      localStorage.setItem('lw_fathom_v1', JSON.stringify({ v: 1, stars: [3, 3, 3, 0, 0], bestDepth: n, sound: 1, motion: 1, seen: { how: 1 } }));
    }, attempt + 1);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => window.FATHOM_DEV && window.FATHOM_DEV.frames() > 2, { timeout: 30000 });
    await tap(page, '#btnDeep');
    await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
    await waitFrames(page, 6);
    await throwAndWait(page, 0, -110, 150);
    const lit = await page.waitForFunction(() => {
      const raw = window.FATHOM_DEV;
      return raw.litCache && raw.litCache() > 0;
    }, { timeout: 25000 }).then(() => true).catch(() => false);
    if (lit) { await shoot(page, 'p1-cache'); done = true; }
    await browser.close();
  }
  if (!done) console.log('  p1-cache          NO CACHE CAME INTO A RING IN SIX TRIES, not shot');
}

close();
const over = wrote.filter(w => w.kb > LIMIT / 1024);
console.log('\n' + wrote.length + ' shots' + (over.length ? ', ' + over.length + ' OVER the limit' : ', all under 200 KB'));
console.log('OPEN THEM. A shot nobody looked at is how a blank screen ships as atmosphere.');
console.log(over.length ? 'SHOTS OVER LIMIT' : 'SHOTS OK');
