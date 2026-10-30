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
 * event per control: the rocker moves the hero, A rises, a second finger on A leaves the rocker held). The second review
 * (30 Oct, before sb-m0-2) added MAX_STEPS_1, DT_MAX_20 and PHASE_ZERO (the test's own replay of its logged frames, total
 * and frame by frame), SLIDE_KEEPS_OLD and GAP_IS_LEFT (the slide), STRIP_KEEPS_PRESSED (a blur), ROCKER_NO_ADOPT (the
 * pointer still down takes the rocker), TITLE_UNDER_ROCKER (Title at 320x568), CHIP_OVER_PLAY (the fleet's chrome
 * hidden in play), FITS2_NO_STRIP (1366x843 and 844), CANVAS_TAKES_POINTERS (Again) and BEACON_PULSE_BY_FRAME. */
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
  const a1 = await page.evaluate(() => { window.SB_DEV.hold(true); window.__log = false; const p = window.SB_DEV.perf(); return { f: window.SB_DEV.frames(), loop: p.loop, frames: p.frames, t: window.__t.slice(), m0: window.__m0, m1: window.__t.length, rec: window.SB_DEV.recording() }; });
  /* the books cover only the steps the accumulator ran (SB_DEV.step's steps are the held gate's, outside the clock) */
  const L = a1.loop, books = L.accSteps * L.stepMs + L.acc + L.dropped - L.consumed - L.seeded;
  R.say(L.accSteps >= 40 && Math.abs(books) < 0.01, 'the accumulator\'s books balance: ' + L.accSteps + ' steps x ' + L.stepMs.toFixed(3) + ' ms + owed + dropped = consumed + the quarter steps seeded (off by ' + books.toFixed(4) + ' ms over ' + L.raf + ' frames, ' + L.stalls + ' stalls)');
  R.say(L.maxSteps <= 4, 'never more than four steps in one frame (max ' + L.maxSteps + ')');
  /* the rate: section 1.5's accumulator replayed HERE on the frames the test logged (each frame clamped to 100 ms, at
     most four steps of 1000 / 60, a stall drops the rest; a run starts, and a stall restarts, a quarter step off the
     frame boundary); the page must have run exactly that many steps, frame by frame */
  const STEP = 1000 / 60, PHASE = STEP / 4, dSteps = a1.loop.accSteps - a0.loop.accSteps;
  const pageN = new Map(a1.frames.map(([t, n]) => [t, n]));
  let acc = PHASE, want = 0, firstOff = null;
  for (let i = a1.m0; i < a1.m1; i++) {
    acc += Math.min(a1.t[i] - a1.t[i - 1], 100);
    let n = 0;
    while (acc >= STEP && n < 4) { acc -= STEP; n++; }
    if (acc >= STEP) acc = PHASE;
    want += n;
    if (firstOff === null && pageN.get(a1.t[i]) !== n) firstOff = { k: i - a1.m0, page: pageN.get(a1.t[i]), want: n };
  }
  R.say(firstOff === null, 'frame by frame the page ran the steps the accumulator owes, a quarter step off the boundary' + (firstOff ? ' (frame ' + firstOff.k + ': the page ran ' + firstOff.page + ', owed ' + firstOff.want + ')' : ' (' + (a1.m1 - a1.m0) + ' frames)'));
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

    /* releaseAll (blur, hidden, Title) forgets what the strip showed pressed: a thumb still down presses again on its
       next move inside the zone */
    const keep = await page.touchscreen.touchStart(at.R.x, at.R.y);
    const wHold = await word();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    const wBlur = await word(), litAfterBlur = await page.evaluate(() => !!document.querySelector('#rocker .zone.on'));
    await keep.move(at.R.x + 4, at.R.y);
    await page.waitForFunction(() => document.querySelector('#rocker .zr.on'), { timeout: 5000 }).catch(() => {});
    const wMove = await word();
    await keep.end();
    R.say(wHold === 2 && wBlur === 0 && !litAfterBlur, 'a blur releases a held thumb and its zone stops showing pressed (words ' + wHold + ', ' + wBlur + ')');
    R.say(wMove === 2, 'the same thumb moved inside its zone after the blur presses right again (word ' + wMove + ')');
    /* a palm on the left zone first, then the thumb on the right: the first rules; the palm lifted, the thumb still down
       takes the rocker (it is never left dead) */
    const palm = await page.touchscreen.touchStart(at.L.x, at.L.y);
    const late = await page.touchscreen.touchStart(at.R.x, at.R.y);
    const wBoth = await word();
    await palm.end();
    await page.waitForFunction(() => document.querySelector('#rocker .zr.on'), { timeout: 5000 }).catch(() => {});
    const wAdopt = await word();
    await late.end();
    const wNone = await word();
    R.say(wBoth === 1, 'two pointers on the rocker: the first down rules it (word ' + wBoth + ')');
    R.say(wAdopt === 2 && wNone === 0, 'the first lifted, the pointer still down takes the rocker where it rests, then lifts to nothing (words ' + wAdopt + ', ' + wNone + ')');

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

  /* under 360 the reservation is released and the rocker (or A and B mirrored) starts at x 0: Title must stay on top */
  {
    const { page, errors } = await newPage(browser, { width: 320, height: 568 });
    await gotoGame(page, srv.base);
    await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    for (const mirror of [false, true]) {
      const r = await page.evaluate(m => {
        document.getElementById('strip').classList.toggle('mirror', m);
        const b = document.getElementById('back').getBoundingClientRect(), top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
        return { onTop: !!top && top.id === 'back', topName: top ? (top.id || top.className) : 'nothing', w: b.width, h: b.height };
      }, mirror);
      R.say(r.onTop && r.w >= 48 && r.h >= 48, '320x568 ' + (mirror ? 'mirrored' : 'default') + ': Title is ' + r.w.toFixed(0) + 'x' + r.h.toFixed(0) + ' and on top at its centre (a thumb lands on ' + r.topName + ')');
    }
    await page.evaluate(() => document.getElementById('strip').classList.remove('mirror'));
    await tap(page, '#back');
    R.say(await page.evaluate(() => window.SB_DEV.screen()) === 'title', '320x568: a real touch on Title returns to the title');
    R.say(errors.length === 0, '320x568: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* the fleet's floating chrome is hidden while a room runs and back on the title (Q48's addendum: its saved drag can
     put the chip on the strip); Q62's ?edge=1 keeps the verbs 32 px off the right edge at 412 with the rocker zones
     over 56, while the default keeps A on the edge as designed */
  for (const edge of [false, true]) {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await gotoGame(page, srv.base, edge ? 'edge=1' : '');
    await ready(page);
    const shown = () => page.evaluate(() => ['sws-music-chip', 'sws-music-pill', 'sws-music-card', 'sws-music-toast']
      .filter(id => { const el = document.getElementById(id); return !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0; }));
    const tag = edge ? '412x915 ?edge=1' : '412x915';
    if (!edge) {
      await page.waitForFunction(() => !!document.getElementById('sws-music-chip'), { timeout: 8000 }).catch(() => {});
      const onTitle = await shown();
      console.log('  info  on the title the fleet shows: ' + (onTitle.join(', ') || 'nothing'));
      await page.evaluate(() => window.SB_DEV.hold(true));
      await tap(page, '#sample');
      const inPlay = await shown();
      R.say(inPlay.length === 0, 'in play the fleet\'s chip, pill, card and toast are hidden (shown: ' + (inPlay.join(', ') || 'none') + ')');
      await tap(page, '#back');
      const back = await shown();
      R.say(onTitle.every(id => back.includes(id)), 'back on the title the fleet\'s chrome is as it was (' + (back.join(', ') || 'nothing') + ')');
    } else {
      await page.evaluate(() => window.SB_DEV.hold(true));
      await tap(page, '#sample');
    }
    if (await page.evaluate(() => window.SB_DEV.screen()) !== 'play') await tap(page, '#sample');
    const g = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      return { vw: window.innerWidth, aR: r('#btnA').right, bR: r('#btnB').right, zl: r('#rocker .zl').width, zr: r('#rocker .zr').width, gap: r('#rocker .gap').width };
    });
    const off = edge ? 32 : 0;
    R.say(Math.abs(g.vw - g.aR - off) < 0.5 && Math.abs(g.aR - g.bR - 64) < 0.5, tag + ': A ends ' + (g.vw - g.aR).toFixed(0) + ' px from the right edge (want ' + off + '), B beside it');
    R.say(g.zl >= 56 && g.zr >= 56 && Math.abs(g.gap - 16) < 0.5, tag + ': the rocker zones are ' + g.zl.toFixed(0) + ' and ' + g.zr.toFixed(0) + ' px (56 or more) with the 16 px gap');
    R.say(errors.length === 0, tag + ': zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();
