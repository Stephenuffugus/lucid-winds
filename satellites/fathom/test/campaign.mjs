#!/usr/bin/env node
/* Three caves, one thumb, and the thing in the dark.
 *
 *   node test/campaign.mjs
 *
 * The deepest proof in the set. It clears cave one, takes NEXT CAVE, clears
 * cave two, takes NEXT CAVE, and then in cave three it walks the thumb straight
 * AT the lurker on purpose, which is the only honest way to test being caught.
 * Then it asserts the restart puts you back at the start with the stones you
 * came in with, and finishes cave three anyway.
 *
 * ⛔ Nothing here seeds the save to skip a cave. The caves are unlocked by
 * finishing them, which is also the proof that the progression works.
 * ⛔ Everything is a real pointer event on the canvas or on a button.
 *
 * It writes docs/shots/p2-caught.png and docs/shots/p2-lurker.png, because a
 * picture of a ghost mid fade can only come from a run that saw one.
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, ROOT, stickDown, stickUp, walkRoute, steerStep, nextFrame , waitFrames} from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);
const SHOTS = join(ROOT, 'docs', 'shots');
if (!existsSync(SHOTS)) mkdirSync(SHOTS, { recursive: true });

await tap(page, '#btnPlay');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
await tap(page, '.card[data-lv="0"]');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });

const home = await dev(() => ({ x: window.innerWidth / 2, y: window.innerHeight - 150 }));

async function clearCurrent(which) {
  await waitFrames(page, 6);
  const route = await dev(() => window.FATHOM_DEV.route());
  await stickDown(page, home);
  const walk = await walkRoute(page, home, route, { throwEvery: 110 });
  await stickUp(page, home);
  const cleared = await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'clear', { timeout: 60000 })
    .then(() => true).catch(() => false);
  say(cleared, 'cave ' + which + ' cleared by the thumb (' + walk.iters + ' steers, ' + walk.threw + ' stones, node ' + walk.node + ' of ' + route.length + ')');
  return cleared;
}

if (await clearCurrent(1)) { await tap(page, '#btnNext'); await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 }); }
if (await clearCurrent(2)) { await tap(page, '#btnNext'); await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 }); }

/* cave three: the first one with something in it */
await waitFrames(page, 6);
const three = await dev(() => ({ lurkers: window.FATHOM_DEV.state().lurkers.length, stones: window.FATHOM_DEV.state().stones }));
say(three.lurkers === 1, 'cave three has exactly one thing in the dark');
const startStones = three.stones;
const startAt = await dev(() => window.FATHOM_DEV.player());

/* Walk AT it, on purpose. First to its room, because aiming a stick straight at
   something through forty tiles of rock just presses you into a wall: the first
   version of this slid along one for two thousand six hundred steers and never
   met anything, which is a fair description of a blind creature in a cave and a
   useless test. */
const lurkTile = (await dev(() => window.FATHOM_DEV.lurkerTiles()))[0];
const approach = await dev((t) => {
  /* the open tile nearest to it that the player can actually walk to */
  for (const [dx, dy] of [[2, -2], [3, 0], [0, -3], [-2, 2], [2, 2], [-3, 0], [0, 3], [0, 0]]) {
    const p = window.FATHOM_DEV.pathTo(t[0] + dx, t[1] + dy);
    if (p && p.length > 2) return { tx: t[0] + dx, ty: t[1] + dy, path: p };
  }
  return null;
}, lurkTile);
say(!!approach, 'there is a way to the room it lives in, ' + (approach ? approach.path.length + ' tiles' : 'none'));

await stickDown(page, home);
const toRoom = await walkRoute(page, home, approach.path, { throwEvery: 260 });
say(!toRoom.stuckAt, 'the thumb walked to its room' + (toRoom.stuckAt ? ' and got stuck at ' + toRoom.stuckAt : ' (' + toRoom.iters + ' steers)'));

/* STAND STILL AND LOOK BEFORE YOU WALK AT IT. A stone takes 350 ms to land and
   a lurker 70 units away closes that in a third of a second, so the first
   version threw on the way in and was eaten before the stone hit the water:
   throws went 1, 2, 3 and the ripple list was empty at every sample. That is a
   true thing about this game and not a bug, and it is what the hum is for. */
await stickUp(page, home);
const seen = await dev(() => {
  const p = window.FATHOM_DEV.player(), s = window.FATHOM_DEV.screenOf(p.x, p.y);
  const x = Math.max(24, Math.min(window.innerWidth - 24, s.x));
  const y = Math.max(30, Math.min(window.innerHeight - 200, s.y - 60));
  const el = document.elementFromPoint(x, y);
  const o = { pointerId: 33, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
  el.dispatchEvent(new PointerEvent('pointerdown', o));
  el.dispatchEvent(new PointerEvent('pointerup', o));
  return el.id;
});
say(seen === 'board', 'the stone is thrown onto the cave, not onto a button (' + seen + ')');
const ghosted = await page.waitForFunction(() => window.FATHOM_DEV.state().ghosts > 0, { timeout: 40000 })
  .then(() => true).catch(() => false);
if (ghosted) writeFileSync(join(SHOTS, 'p2-lurker.png'), await page.screenshot({ type: 'png' }));

/* now walk at it */
await stickDown(page, home);
let iters = 0, caught = false;
while (iters < 900 && !caught) {
  iters++;
  const st = await steerStep(page, home, { lurker: true });
  if (st.noAim) break;
  if (st.over === 'caught') { caught = true; break; }
  if (st.screen !== 'play') break;
  await nextFrame(page, st.frames);
}
say(ghosted, 'the ring crossed it and left a ghost of where it was' + (ghosted ? ', shot' : ''));
say(caught, 'walking straight at it gets you caught (' + iters + ' steers after reaching its room)');
if (caught) {
  /* photograph the BEAT, not its first frame. Shot the instant `caught` shows
     up, the fade has not run and the line has not arrived, and what lands on
     disk is a lit cave with a smear of half opacity type across it. */
  const lineUp = await page.waitForFunction(() => {
    const el = document.getElementById('fadeLine');
    return Number(getComputedStyle(el).opacity) > 0.9 && getComputedStyle(document.getElementById('fade')).opacity === '1';
  }, { timeout: 15000 }).then(() => true).catch(() => false);
  say(lineUp, 'the screen goes black and the line arrives after it');
  writeFileSync(join(SHOTS, 'p2-caught.png'), await page.screenshot({ type: 'png' }));
}
await stickUp(page, home);

/* the restart: back at the start, with the stones you came in with */
/* the restart hands back the CAVE's starting stones, not whatever you were
   holding when it got you: that is the whole point of 3.9, you keep the map in
   your head and nothing else */
const back = await page.waitForFunction((n) => {
  const s = window.FATHOM_DEV.state();
  return !s.over && s.stones === n;
}, { timeout: 40000 }, startStones).then(() => true).catch(() => false);
const after = await dev(() => ({ p: window.FATHOM_DEV.player(), s: window.FATHOM_DEV.state() }));
say(back, 'and the cave restarts with the stones you came in with (' + startStones + ', now ' + after.s.stones + ')');
say(Math.hypot(after.p.x - startAt.x, after.p.y - startAt.y) < 2,
  'and puts you back where you started, ' + Math.hypot(after.p.x - startAt.x, after.p.y - startAt.y).toFixed(1) + ' units off');
say(after.s.over === null, 'the run is live again, not stuck on the caught state');

/* and it can still be finished */
await waitFrames(page, 6);
const route3 = await dev(() => window.FATHOM_DEV.route());
await stickDown(page, home);
const walk3 = await walkRoute(page, home, route3, { throwEvery: 110 });
await stickUp(page, home);
const cleared3 = await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'clear', { timeout: 90000 })
  .then(() => true).catch(() => false);
say(cleared3, 'cave three is finished after the fright (' + walk3.iters + ' steers, node ' + walk3.node + ' of ' + route3.length + ')');

const save = await dev(() => window.FATHOM_DEV.save());
say(save.stars[0] >= 1 && save.stars[1] >= 1 && save.stars[2] >= 1,
  'three caves are in the save: ' + JSON.stringify(save.stars));
await tap(page, '#btnClearMenu');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
await tap(page, '#btnSelBack');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'title', { timeout: 20000 });
const deepOpen = await dev(() => !document.getElementById('btnDeep').classList.contains('ghost'));
say(deepOpen, 'and clearing the third cave opens the deep');

/* the deep, opened by play and entered by a thumb */
await tap(page, '#btnDeep');
const inDeep = await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 25000 })
  .then(() => true).catch(() => false);
say(inDeep, 'THE DEEP opens into a cave');
if (inDeep) {
  await waitFrames(page, 6);
  const d = await dev(() => ({
    tag: document.getElementById('depthTag').textContent,
    route: (window.FATHOM_DEV.route() || []).length,
    lurkers: window.FATHOM_DEV.state().lurkers.length,
    stones: window.FATHOM_DEV.state().stones
  }));
  say(/^DEPTH \d+$/.test(d.tag), 'the depth is on the screen: ' + JSON.stringify(d.tag));
  say(d.route >= 30, 'the generated cave has a real way through, ' + d.route + ' tiles');
  say(d.lurkers >= 1, 'and something in it, ' + d.lurkers + ' of them');
  say(d.stones === 8, 'and the deep loadout, ' + d.stones + ' stones');
  /* a real throw lights a generated cave, which is the only part of the deep a
     unit test cannot reach: the caves are made in the browser at load */
  const litBefore = await dev(() => window.FATHOM_DEV.litWalls());
  const at = await dev(() => { const p = window.FATHOM_DEV.player(), s = window.FATHOM_DEV.screenOf(p.x, p.y);
    return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x)), y: Math.max(30, Math.min(window.innerHeight - 200, s.y + 70)) }; });
  await page.evaluate((x, y) => { const el = document.elementFromPoint(x, y);
    const o = { pointerId: 44, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
    el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointerup', o)); }, at.x, at.y);
  const litDeep = await page.waitForFunction((n) => window.FATHOM_DEV.litWalls() > n, { timeout: 30000 }, litBefore)
    .then(() => page.evaluate(() => window.FATHOM_DEV.litWalls())).catch(() => 0);
  say(litDeep > litBefore, 'and a real throw lights it: ' + litBefore + ' walls to ' + litDeep);
  writeFileSync(join(SHOTS, 'p3-deep.png'), await page.screenshot({ type: 'png' }));
}

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' CAMPAIGN FAILURE(S)'); process.exit(1); }
console.log('CAMPAIGN OK');
