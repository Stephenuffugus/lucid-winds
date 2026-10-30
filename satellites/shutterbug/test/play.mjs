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
  /* the beacon pulses by the clock, never by drawn frames (a 120 Hz screen must not blink it twice as fast): with the
     loop held and the hero on the exit, the room is drawn with performance.now pinned to t, t + 399 and t + 400 ms */
  const pulse = await page.evaluate(() => {
    const cv = document.getElementById('view'), cx = cv.getContext('2d'), real = performance.now;
    const shot = t => {
      performance.now = () => t;
      try { window.SB_DEV.step(0); } finally { performance.now = real; }
      const d = cx.getImageData(0, 0, cv.width, cv.height).data; let h = 0;
      for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0;
      return h;
    };
    return [shot(400000), shot(400399), shot(400400)];
  });
  R.say(pulse[0] === pulse[1], 'the beacon pulses by the clock: drawn at t and at t + 399 ms the frame is the same');
  R.say(pulse[2] !== pulse[0], 'and drawn at t + 400 ms the exit\'s outline has changed colour');
  await tap(page, '#again');
  const after = await page.evaluate(() => {
    const view = document.getElementById('view').getBoundingClientRect();
    /* the canvas takes no pointer events, so a thumb on the play area lands on its stage; nothing of the card may be there */
    const top = document.elementFromPoint(view.left + view.width / 2, view.top + view.height * 0.35);
    const card = getComputedStyle(document.getElementById('clear'));
    return { screen: window.SB_DEV.screen(), frame: window.SB_DEV.state().frame, onCanvas: !!top && top.id === 'stage', cardShown: card.display !== 'none' };
  });
  R.say(after.screen === 'play' && after.frame === 0, 'a real touch on Again restarts the room (screen ' + after.screen + ', frame ' + after.frame + ')');
  R.say(!after.cardShown && after.onCanvas, 'Again leaves nothing painted over the play area');

  /* the unheld check: the real loop, a real key held. The test keeps its own log of every animation frame's timestamp
     (a requestAnimationFrame chain of its own, registered after the page's, so it sees each frame the page saw) */
  await page.evaluate(() => { window.__t = []; window.__log = true; const tick = t => { window.__t.push(t); if (window.__log) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await page.waitForFunction(() => window.__t.length >= 3, { timeout: 30000, polling: 20 });
  const a0 = await page.evaluate(() => { window.__m0 = window.__t.length; window.SB_DEV.hold(false); const p = window.SB_DEV.perf(); return { f: window.SB_DEV.frames(), loop: p.loop }; });
  await page.keyboard.down('ArrowLeft');
  /* two long tasks of the test's own, so the window has a frame owing two or more steps and one over the 100 ms clamp
     (a stall), whatever the machine's own frame rate: the accumulator's every path is exercised */
  await page.waitForFunction(f => window.SB_DEV.frames() >= f + 6, { timeout: 30000, polling: 20 }, a0.f);
  await page.evaluate(() => { const t = performance.now(); while (performance.now() - t < 45); });
  await page.waitForFunction(f => window.SB_DEV.frames() >= f + 12, { timeout: 30000, polling: 20 }, a0.f);
  await page.evaluate(() => { const t = performance.now(); while (performance.now() - t < 140); });
  await page.waitForFunction(f => window.SB_DEV.frames() >= f + 40, { timeout: 60000, polling: 20 }, a0.f);
  await page.keyboard.up('ArrowLeft');
  const a1 = await page.evaluate(() => { window.SB_DEV.hold(true); window.__log = false; const p = window.SB_DEV.perf(); return { f: window.SB_DEV.frames(), loop: p.loop, t: window.__t.slice(), m0: window.__m0, m1: window.__t.length, rec: window.SB_DEV.recording() }; });
  /* the books cover only the steps the accumulator ran (SB_DEV.step's steps are the held gate's, outside the clock) */
  const L = a1.loop, books = L.accSteps * L.stepMs + L.acc + L.dropped - L.consumed;
  R.say(L.accSteps >= 40 && Math.abs(books) < 0.01, 'the accumulator\'s books balance: ' + L.accSteps + ' steps x ' + L.stepMs.toFixed(3) + ' ms + owed + dropped = consumed (off by ' + books.toFixed(4) + ' ms over ' + L.raf + ' frames, ' + L.stalls + ' stalls)');
  R.say(L.maxSteps <= 4, 'never more than four steps in one frame (max ' + L.maxSteps + ')');
  /* the rate: section 1.5's accumulator replayed HERE on the frames the test logged (each frame clamped to 100 ms, at
     most four steps of 1000 / 60, a stall drops the rest); the page must have run exactly that many steps */
  const STEP = 1000 / 60, dSteps = a1.loop.accSteps - a0.loop.accSteps;
  let acc = 0, want = 0;
  for (let i = a1.m0; i < a1.m1; i++) {
    acc += Math.min(a1.t[i] - a1.t[i - 1], 100);
    let n = 0;
    while (acc >= STEP && n < 4) { acc -= STEP; n++; }
    if (acc >= STEP) acc = 0;
    want += n;
  }
  const span = a1.t[a1.m1 - 1] - a1.t[a1.m0 - 1];
  const dts = []; for (let i = a1.m0; i < a1.m1; i++) dts.push(a1.t[i] - a1.t[i - 1]);
  R.say(dts.some(d => d > 100) && dts.some(d => d >= 2 * STEP && d <= 100), 'the window holds a frame over the 100 ms clamp and one owing two or more steps (longest ' + Math.max(...dts).toFixed(0) + ' ms)');
  R.say(Math.abs(a1.loop.stepMs - STEP) < 1e-9, 'the step is 16.667 ms (1000 / 60, computed here): the page says ' + a1.loop.stepMs);
  R.say(dSteps === want, 'the loop ran exactly the steps the accumulator owes on the test\'s own frame log: ' + dSteps + ' steps, ' + want + ' owed over ' + (a1.m1 - a1.m0) + ' frames, ' + span.toFixed(0) + ' ms');
  const flat = a1.rec.flatMap(([n, w]) => Array(n).fill(w));
  const firstL = flat.findIndex(w => w & 1), lastL = flat.length - 1 - [...flat].reverse().findIndex(w => w & 1);
  const gaps = flat.slice(firstL, lastL + 1).filter(w => !(w & 1)).length;
  R.say(firstL >= 0 && lastL - firstL + 1 >= 39 && gaps === 0, 'with the key held every step sampled it (' + (lastL - firstL + 1) + ' steps, ' + gaps + ' missed)');
  R.say(errors.length === 0, 'zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
  await page.close();
  /* a short laptop window keeps 1x (2x only when the minimum view fits at 2x); a tall one gets 2x; nothing overflows */
  const EDGE2X = 36 + 20 * 16 * 2 + 168;     /* the top strip, the 20 row minimum at 2x, the control strip: 844 */
  for (const [w, h, want] of [[1366, 650, 384], [1366, EDGE2X - 1, 384], [1366, EDGE2X, 768], [1366, 1100, 768]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h, dpr: 1, touch: false });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    const m = await page.evaluate(() => {
      const v = document.getElementById('view').getBoundingClientRect(), st = document.getElementById('strip').getBoundingClientRect();
      return { cssW: v.width, canvasBottom: v.bottom, stripH: st.height, stripBottom: st.bottom, inner: innerHeight, scroll: document.documentElement.scrollHeight };
    });
    R.say(m.cssW === want, w + 'x' + h + ': the canvas is ' + (want === 384 ? '1x, 384 CSS px wide (2x would not fit the height)' : '2x, 768 CSS px wide') + ' (measured ' + m.cssW + ')');
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
      return { L: c(document.querySelector('#rocker .zl')), R: c(document.querySelector('#rocker .zr')), A: c(document.querySelector('#btnA .glyph')),
        B: c(document.querySelector('#btnB .glyph')), gap: c(document.querySelector('#rocker .gap')) };
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
    /* the slide: a thumb down on the left zone and moved to the right zone without lifting switches the direction; moved
       into the gap it is neutral; lifted it is nothing; and B taps (each move waited on, since Chrome may coalesce one) */
    for (let k = 0; k < 20; k++) await page.evaluate(() => window.SB_DEV.step(1));
    const word = async () => { await page.evaluate(() => window.SB_DEV.step(1)); return page.evaluate(() => window.SB_DEV.lastInput()); };
    const slide = await page.touchscreen.touchStart(at.L.x, at.L.y);
    const wL = await word();
    await slide.move(at.R.x, at.R.y);
    await page.waitForFunction(() => document.querySelector('#rocker .zr.on'), { timeout: 5000 }).catch(() => {});
    const wR = await word();
    await slide.move(at.gap.x, at.gap.y);
    await page.waitForFunction(() => !document.querySelector('#rocker .zone.on'), { timeout: 5000 }).catch(() => {});
    const wGap = await word();
    await slide.end();
    const wUp = await word();
    R.say(wL === 1, 'the slide: a thumb down on the left zone is left (word ' + wL + ')');
    R.say(wR === 2, 'the slide: moved to the right zone without lifting it is right, and only right (word ' + wR + ')');
    R.say(wGap === 0, 'the slide: moved into the neutral gap it is nothing (word ' + wGap + ')');
    R.say(wUp === 0, 'the slide: lifted it is nothing (word ' + wUp + ')');
    const bf = await page.touchscreen.touchStart(at.B.x, at.B.y);
    await bf.end();
    const wB = await word();
    R.say((wB & 32) !== 0 && (wB & 4) === 0, 'a tap on B is the dive verb\'s tap, never A (word ' + wB + ')');

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
