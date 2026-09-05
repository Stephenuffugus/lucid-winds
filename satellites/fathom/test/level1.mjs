#!/usr/bin/env node
/* A whole cave, cleared by a thumb.
 *
 *   node test/level1.mjs
 *
 * From the title screen: two real taps reach cave one, then ONE finger stays
 * down on the canvas and is steered, frame by frame, along the shortest walk
 * through the cave, throwing a stone on the way. The cave is cleared, the clear
 * card comes up, and the save holds a star for it afterwards.
 *
 * ⛔ THE POINT OF THIS GATE. Every other gate proves a piece. This one proves
 * the piece fit together well enough that a person could finish. The stick is a
 * real pointer being dragged around by a hand that watches the screen; nothing
 * here feeds the sim an input log, and nothing calls a handler.
 * ⛔ It runs at the rig's frame rate, which under swiftshader on two cores is a
 * few frames a second, so it takes a minute or two and every wait is on the
 * frame counter, never on a clock.
 *
 * It also writes docs/shots/p1-clear.png, because the only honest way to get a
 * picture of the clear card is to earn one.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, reporter, tap, tapAt, sleep, ROOT } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

/* two real taps from the title */
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
await tap(page, '.card[data-lv="0"]');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
await page.waitForFunction(() => window.FATHOM_DEV.frames() > 8, { timeout: 20000 });
say(true, 'two real taps from the title reach cave one');

const route = await dev(() => window.FATHOM_DEV.route());
const TILE = await dev(() => window.FATHOM_DEV.tile());
say(!!route && route.length > 20, 'the cave has a way through, ' + (route ? route.length : 0) + ' tiles of it');

/* the finger goes down in the lower middle and STAYS down; from here on it is
   steered, which is what a thumb on a floating stick actually is */
const home = await dev(() => ({ x: window.innerWidth / 2, y: window.innerHeight - 150 }));
await dev((x, y) => {
  const el = document.elementFromPoint(x, y);
  el.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
}, home.x, home.y);
/* one move past the slop so the stick is born where the finger landed */
await dev((x, y) => {
  const el = document.getElementById('board');
  el.dispatchEvent(new PointerEvent('pointermove', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x + 20, clientY: y }));
}, home.x, home.y);
const stickBorn = await dev(() => !!window.FATHOM_DEV.stick());
say(stickBorn, 'the finger past the slop makes a stick, not a throw');

let node = 1, iters = 0, stuck = 0, lastD = 1e9, threw = 0;
const MAX_ITERS = 2200;
while (node < route.length && iters < MAX_ITERS) {
  iters++;
  const st = await dev((tile, tx, ty, hx, hy) => {
    const p = window.FATHOM_DEV.player();
    const gx = tx * tile + tile / 2, gy = ty * tile + tile / 2;
    let dx = gx - p.x, dy = gy - p.y;
    const d = Math.hypot(dx, dy) || 1;
    const el = document.getElementById('board');
    el.dispatchEvent(new PointerEvent('pointermove', {
      pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true,
      clientX: hx + dx / d * 70, clientY: hy + dy / d * 70
    }));
    const s = window.FATHOM_DEV.state();
    return { d, over: s.over, frames: window.FATHOM_DEV.frames(), stones: s.stones, screen: window.FATHOM_DEV.screen() };
  }, TILE, route[node][0], route[node][1], home.x, home.y);

  if (st.over || st.screen !== 'play') break;
  if (st.d < 7) { node++; stuck = 0; lastD = 1e9; continue; }
  if (st.d > lastD - 0.05) stuck++; else stuck = 0;
  lastD = st.d;
  /* a stone every so often, so the run spends its budget the way a person does */
  if (iters % 90 === 0 && st.stones > 1) {
    const at = await dev(() => { const p = window.FATHOM_DEV.player(); const s = window.FATHOM_DEV.screenOf(p.x, p.y); return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x)), y: Math.max(30, Math.min(window.innerHeight - 200, s.y - 90)) }; });
    await tapAt(page, at.x, at.y);
    threw++;
  }
  if (stuck > 60) { say(false, 'the thumb got stuck at tile ' + route[node] + ' after ' + iters + ' steers'); break; }
  await page.waitForFunction((f) => window.FATHOM_DEV.frames() > f, { timeout: 30000 }, st.frames).catch(() => {});
}
await dev((x, y) => {
  document.getElementById('board').dispatchEvent(new PointerEvent('pointerup', { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
}, home.x, home.y);

const cleared = await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'clear', { timeout: 60000 })
  .then(() => true).catch(() => false);
say(cleared, 'the thumb walked the cave and the clear card came up (' + iters + ' steers, ' + threw + ' stones thrown, node ' + node + ' of ' + route.length + ')');

if (cleared) {
  const dir = join(ROOT, 'docs', 'shots');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'p1-clear.png'), await page.screenshot({ type: 'png' }));
  const card = await dev(() => ({
    name: document.getElementById('clearName').textContent,
    stars: document.getElementById('clearStars').textContent,
    stones: document.getElementById('clearStones').textContent
  }));
  say(card.name === 'FIRST WATER', 'the card names the cave: ' + JSON.stringify(card.name));
  say(/[✦]/.test(card.stars), 'and shows at least one star: ' + JSON.stringify(card.stars));
  say(/stones left \d+ of \d+/.test(card.stones), 'and what the run cost: ' + JSON.stringify(card.stones));
  /* the clear card's own buttons are only measurable from a cave you finished,
     so the 48 px law for NEXT and MENU is checked here rather than in layout */
  for (const [sel, label] of [['#btnNext', 'NEXT CAVE'], ['#btnClearMenu', 'MENU']]) {
    const c = await page.evaluate((sel) => {
      const el = document.querySelector(sel), r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { w: r.width, h: r.height, onTop: !!top && (top === el || el.contains(top)) };
    }, sel);
    say(c.w >= 48 && c.h >= 48 && c.onTop, 'on the clear card ' + label + ' is ' + c.w.toFixed(0) + 'x' + c.h.toFixed(0) + ' px and reachable');
  }
  const save = await dev(() => window.FATHOM_DEV.save());
  say(save.stars[0] >= 1, 'and the save remembers it, stars[0] is ' + save.stars[0]);
  /* the second cave is now open, which is the whole progression in one line */
  await tap(page, '#btnClearMenu');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
  const open2 = await dev(() => !document.querySelector('.card[data-lv="1"]').disabled);
  say(open2, 'and the second cave is open');
}

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' LEVEL1 FAILURE(S)'); process.exit(1); }
console.log('LEVEL1 OK');
