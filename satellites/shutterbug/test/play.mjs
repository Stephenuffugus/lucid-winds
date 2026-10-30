/* Browser gate `play` (BUILD-PLAN.md T0.8a, section 5.6).
 *
 * The sample room climbed to the clear card by REAL key events: the loop held (SB_DEV.hold(true)), and between key
 * downs and ups the sim advanced an exact number of steps with SB_DEV.step(n), each step sampling the real input
 * latch (the one way a real event maps to an exact step count under swiftshader's few frames a second). Then a real
 * touch on Again leaves nothing painted over the play area. Then one UNHELD check proves the real loop: with a key
 * held and the loop running, every step sampled the key, at most four steps ran in any frame, and the accumulator's
 * books balance (steps x 16.67 ms + what is owed + what stalls dropped = the frame time it was given).
 *
 * Watched red by CLEAR_NO_RESTART (Again leaves the card painted) and ACCUMULATOR_DT_FLOAT (the loop steps by the raw
 * frame delta), and by SECOND_FINGER_RELEASES_FIRST (T0.8b: the same climb by real touches on the strip, and one real
 * event per control: the rocker moves the hero, A rises, a second finger on A leaves the rocker held). */
import { readFileSync } from 'node:fs';
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, centre } from './harness.mjs';

const R = reporter('PLAY');
const climb = JSON.parse(readFileSync(new URL('./climb-sample-room.json', import.meta.url), 'utf8'));
const KEYS = { 1: 'ArrowLeft', 2: 'ArrowRight', 4: 'KeyZ' };
const srv = await serve();
const browser = await launch();

/* replay the runs by real key events, stepping at most `limit` steps; keys stay as they are at the end */
async function replayKeys(page, runs, limit = Infinity, down = 0) {
  let done = 0;
  for (const [n, mask] of runs) {
    if (done >= limit) break;
    for (const bit of [1, 2, 4]) if ((down & bit) && !(mask & bit)) await page.keyboard.up(KEYS[bit]);
    for (const bit of [1, 2, 4]) if (!(down & bit) && (mask & bit)) await page.keyboard.down(KEYS[bit]);
    down = mask;
    const k = Math.min(n, limit - done);
    await page.evaluate(k => window.SB_DEV.step(k), k);
    done += k;
  }
  return down;
}
const releaseKeys = async (page, down) => { for (const bit of [1, 2, 4]) if (down & bit) await page.keyboard.up(KEYS[bit]); };

try {
  const { page, errors } = await newPage(browser, { width: 412, height: 915 });
  await gotoGame(page, srv.base);
  await ready(page);
  await page.evaluate(() => window.SB_DEV.hold(true));      /* held before the room starts: no live step can slip in */
  await tap(page, '#sample');
  R.say(await page.evaluate(() => window.SB_DEV.screen()) === 'play', 'a real touch on "Try the sample room" opens the play screen');
  const f0 = await page.evaluate(() => window.SB_DEV.frames());
  const total = climb.runs.reduce((a, r) => a + r[0], 0);
  /* the exit by the step: one step short the room is not clear; the last step clears it with the box on the exit cell,
     the overlap computed here from the level's exit and the hero's box */
  let keys = await replayKeys(page, climb.runs, total - 1);
  const pre = await page.evaluate(() => ({ s: window.SB_DEV.state(), screen: window.SB_DEV.screen() }));
  R.say(pre.s.room.cleared === 0 && pre.screen === 'play', 'one step before the lamp the room is not yet clear (screen ' + pre.screen + ')');
  await page.evaluate(() => window.SB_DEV.step(1));
  await releaseKeys(page, keys);
  const lvx = await page.evaluate(() => window.SB_DEV.level());
  const hs = await page.evaluate(() => window.SB_DEV.state().hero);
  const CSUB = 16 * 256, ex = lvx.exit % lvx.w, ey = Math.floor(lvx.exit / lvx.w);
  const onExit = hs.x < (ex + 1) * CSUB && hs.x + 12 * 256 > ex * CSUB && hs.y < (ey + 1) * CSUB && hs.y + 16 * 256 > ey * CSUB;
  R.say(onExit, 'on the clearing step the hero\'s box overlaps the exit cell (' + ex + ', ' + ey + ')');
  const st = await page.evaluate(() => ({ screen: window.SB_DEV.screen(), s: window.SB_DEV.state(), frames: window.SB_DEV.frames(), rec: window.SB_DEV.recording() }));
  R.say(st.frames - f0 === total, 'the held loop ran exactly the script\'s ' + total + ' steps (' + (st.frames - f0) + ')');
  R.say(st.s && st.s.room.cleared === 1, 'the climb by real key events reaches the lamp: the room is clear');
  R.say(st.screen === 'clear', 'the clear card is up (screen ' + st.screen + ')');
  const words = st.rec.reduce((a, r) => a + r[0], 0);
  R.say(words === total, 'the recorder kept one word per step (' + words + ')');
  const clearBox = await centre(page, '#clear');
  R.say(!!clearBox && clearBox.onTop, 'the clear card is painted and on top');
  await tap(page, '#again');
  const after = await page.evaluate(() => {
    const view = document.getElementById('view').getBoundingClientRect();
    /* the canvas takes no pointer events, so a thumb on the play area lands on its stage; nothing of the card may be there */
    const top = document.elementFromPoint(view.left + view.width / 2, view.top + view.height * 0.35);
    const card = getComputedStyle(document.getElementById('clear'));
    return { screen: window.SB_DEV.screen(), frame: window.SB_DEV.state().frame, onCanvas: !!top && (top.id === 'stage' || top.id === 'view'), cardShown: card.display !== 'none' };
  });
  R.say(after.screen === 'play' && after.frame === 0, 'a real touch on Again restarts the room (screen ' + after.screen + ', frame ' + after.frame + ')');
  R.say(!after.cardShown && after.onCanvas, 'Again leaves nothing painted over the play area');

  /* the unheld check: the real loop, a real key held */
  await page.evaluate(() => window.SB_DEV.hold(false));
  const a0 = await page.evaluate(() => { const p = window.SB_DEV.perf(); return { f: window.SB_DEV.frames(), loop: p.loop, now: p.now }; });
  await page.keyboard.down('ArrowLeft');
  await page.waitForFunction(f => window.SB_DEV.frames() >= f + 40, { timeout: 60000, polling: 20 }, a0.f);
  await page.keyboard.up('ArrowLeft');
  await page.evaluate(() => window.SB_DEV.hold(true));
  const a1 = await page.evaluate(() => { const p = window.SB_DEV.perf(); return { f: window.SB_DEV.frames(), loop: p.loop, now: p.now, rec: window.SB_DEV.recording() }; });
  /* the books cover only the steps the accumulator ran (SB_DEV.step's steps are the held gate's, outside the clock) */
  const L = a1.loop, books = L.accSteps * L.stepMs + L.acc + L.dropped - L.consumed;
  R.say(L.accSteps >= 40 && Math.abs(books) < 0.01, 'the accumulator\'s books balance: ' + L.accSteps + ' steps x ' + L.stepMs.toFixed(3) + ' ms + owed + dropped = consumed (off by ' + books.toFixed(4) + ' ms over ' + L.raf + ' frames, ' + L.stalls + ' stalls)');
  R.say(L.maxSteps <= 4, 'never more than four steps in one frame (max ' + L.maxSteps + ')');
  /* the rate, against the test's own clock (performance.now read at both ends) and its own step length */
  const STEP = 1000 / 60, dSteps = a1.loop.accSteps - a0.loop.accSteps, dt = a1.now - a0.now;
  const dClamp = a1.loop.clamped - a0.loop.clamped, dStalls = a1.loop.stalls - a0.loop.stalls;
  R.say(Math.abs(a1.loop.stepMs - STEP) < 1e-9, 'the step is 16.667 ms (1000 / 60, computed here): the page says ' + a1.loop.stepMs);
  R.say(dSteps <= dt / STEP + 2, 'never faster than real time: ' + dSteps + ' steps in ' + dt.toFixed(0) + ' ms (at most ' + (dt / STEP + 2).toFixed(1) + ')');
  R.say(dSteps >= (dt - dClamp - dStalls * 100) / STEP - 2, 'never slower than real time but for clamped frames and stalls: ' + dSteps + ' steps (at least ' + ((dt - dClamp - dStalls * 100) / STEP - 2).toFixed(1) + ')');
  const flat = a1.rec.flatMap(([n, w]) => Array(n).fill(w));
  const firstL = flat.findIndex(w => w & 1), lastL = flat.length - 1 - [...flat].reverse().findIndex(w => w & 1);
  const gaps = flat.slice(firstL, lastL + 1).filter(w => !(w & 1)).length;
  R.say(firstL >= 0 && lastL - firstL + 1 >= 39 && gaps === 0, 'with the key held every step sampled it (' + (lastL - firstL + 1) + ' steps, ' + gaps + ' missed)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
  /* a short laptop window keeps 1x (2x only when the minimum view fits at 2x); a tall one gets 2x; nothing overflows */
  for (const [w, h, want] of [[1366, 650, 384], [1366, 1100, 768]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h, dpr: 1, touch: false });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    const m = await page.evaluate(() => {
      const v = document.getElementById('view').getBoundingClientRect(), st = document.getElementById('strip').getBoundingClientRect();
      return { cssW: v.width, canvasBottom: v.bottom, stripH: st.height, stripBottom: st.bottom, inner: innerHeight, scroll: document.documentElement.scrollHeight };
    });
    R.say(m.cssW === want, w + 'x' + h + ': the canvas is ' + m.cssW + ' CSS px wide (' + (want === 384 ? '1x: 2x would not fit the height' : '2x') + ')');
    R.say(m.stripBottom <= m.inner + 0.5 && m.stripH >= 168 && m.scroll <= m.inner + 1, w + 'x' + h + ': the top strip, the play area and a ' + Math.round(m.stripH) + ' px control strip fit the window (scroll height ' + m.scroll + ' of ' + m.inner + ')');
    R.say(errors.length === 0, w + 'x' + h + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
  /* T0.8b: the same climb by real touches on the strip, timed by SB_DEV.step: one finger on the rocker (lifted and
     pressed again when the direction changes: Chrome may coalesce a moving touch; the slide itself is T0.9's), one
     finger on A. Then one real event per control proves the mapping without the script. */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    const at = await page.evaluate(() => {
      const c = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
      return { L: c(document.querySelector('#rocker .zl')), R: c(document.querySelector('#rocker .zr')), A: c(document.querySelector('#btnA .glyph')) };
    });
    let rf = null, rdir = null, af = null;
    for (const [n, mask] of climb.runs) {
      const dir = mask & 1 ? 'L' : mask & 2 ? 'R' : null;
      if (rf && dir !== rdir) { await rf.end(); rf = null; rdir = null; }
      if (dir && !rf) { rf = await page.touchscreen.touchStart(at[dir].x, at[dir].y); rdir = dir; }
      if ((mask & 4) && !af) af = await page.touchscreen.touchStart(at.A.x, at.A.y);
      else if (!(mask & 4) && af) { await af.end(); af = null; }
      await page.evaluate(n => window.SB_DEV.step(n), n);
    }
    if (rf) await rf.end();
    if (af) await af.end();
    const st = await page.evaluate(() => ({ s: window.SB_DEV.state(), screen: window.SB_DEV.screen() }));
    R.say(st.s && st.s.room.cleared === 1 && st.screen === 'clear', 'the climb by real touches on the rocker and A reaches the lamp (screen ' + st.screen + ')');

    /* the per control checks start from a fresh room whatever the climb did (the goto liberty; Again's own real touch
       is proven in the keyboard pass), so each runs and names its own failure */
    await page.evaluate(() => window.SB_DEV.goto('sample'));
    for (let k = 0; k < 4; k++) await page.evaluate(() => window.SB_DEV.step(1));
    const x0 = await page.evaluate(() => window.SB_DEV.state().hero.x);
    let f = await page.touchscreen.touchStart(at.R.x, at.R.y);
    await page.evaluate(() => window.SB_DEV.step(1));
    const x1 = await page.evaluate(() => window.SB_DEV.state().hero.x);
    await f.end();
    R.say(x1 > x0, 'a real touch on the rocker\'s right zone moves the hero on the next step (' + x0 + ' to ' + x1 + ')');
    for (let k = 0; k < 8; k++) await page.evaluate(() => window.SB_DEV.step(1));
    f = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await f.end();
    await page.evaluate(() => window.SB_DEV.step(1));
    const vy = await page.evaluate(() => window.SB_DEV.state().hero.vy);
    R.say(vy < 0, 'a real tap on A makes the hero rise on the next step (vy ' + vy + ')');
    for (let k = 0; k < 60; k++) await page.evaluate(() => window.SB_DEV.step(1));
    const thumb = await page.touchscreen.touchStart(at.L.x, at.L.y);
    await page.evaluate(() => window.SB_DEV.step(2));
    const second = await page.touchscreen.touchStart(at.A.x, at.A.y);
    await page.evaluate(() => window.SB_DEV.step(1));
    const both = await page.evaluate(() => window.SB_DEV.lastInput());
    await second.end();
    await page.evaluate(() => window.SB_DEV.step(1));
    const after = await page.evaluate(() => window.SB_DEV.lastInput());
    await thumb.end();
    await page.evaluate(() => window.SB_DEV.step(1));
    const none = await page.evaluate(() => window.SB_DEV.lastInput());
    R.say((both & 1) && (both & 4), 'a second finger on A during a rocker hold: both register (word ' + both + ')');
    R.say((after & 1) && !(after & 4), 'lifting the second finger leaves the rocker held (word ' + after + ')');
    R.say(none === 0, 'lifting the thumb releases the rocker (word ' + none + ')');
    /* a thumb reaching high for jump, at the top of A's full height hit area, jumps and never leaves the play screen */
    const high = await page.evaluate(() => { const r = document.getElementById('btnA').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + 6 }; });
    for (let k = 0; k < 60; k++) await page.evaluate(() => window.SB_DEV.step(1));
    const hf = await page.touchscreen.touchStart(high.x, high.y);
    await page.evaluate(() => window.SB_DEV.step(1));
    const hv = await page.evaluate(() => ({ vy: window.SB_DEV.state().hero.vy, screen: window.SB_DEV.screen() }));
    await hf.end();
    R.say(hv.vy < 0 && hv.screen === 'play', 'a touch at the very top of A\'s hit area jumps and stays on the play screen (vy ' + hv.vy + ', screen ' + hv.screen + ')');
    R.say(errors.length === 0, 'touch pass: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
