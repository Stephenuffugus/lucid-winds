#!/usr/bin/env node
/* THE COACH (call 57, 2026-09-08): a returning hand is taught the three things
 * the game never named, once each, at the moment each matters, and HOW TO
 * THROW gives the whole ladder back.
 *
 *   node test/coach.mjs
 *
 * His words, Sep 07: "It needs a bit of a tutorial to explain how it works."
 * His save had `seen.how` and `seen.turn` set on Sep 06, so on Sep 07 the game
 * taught him nothing. So this gate SEEDS that save, and nothing else: a hand
 * that has thrown and turned, with the three new flags absent the way an old
 * save has them absent. Every throw is a real stroke on the real canvas; the
 * line on the water is watched by a MutationObserver on the element itself,
 * so a beat that flashed for one frame is on the record and a beat shown
 * twice cannot hide between two polls.
 *
 * What it asserts, each watched to fail (the plan's SESSION STATE has the
 * mutations):
 *   1. the seeded save does NOT see the first boot line: beats 1 and 2 are
 *      his already
 *   2. the first unspun sink teaches nothing (the wind up waits for the
 *      second), and the readout and the advice still come first
 *   3. by the second unspun sink the wind up beat is on the water, the save
 *      marks it seen, and the line names the ring and the spin
 *   4. a throw that CURLED (the coach's own word for it, asserted as the
 *      premise) is followed by the hook beat, at the third sink, so it was the
 *      curve and not the fourth sink count that brought it
 *   5. two more sinks, one unspun and one curled, show no beat again
 *   6. the first slow slide past the point puts the faces beat on the water
 *      under the thumb, once, and a second slide past it shows nothing
 *   7. HOW TO THROW is on the sheet where a thumb can reach it, and a tap on it
 *      returns to the water with the first line on it at once and every flag
 *      unset; the next sink brings the slide lesson, so the ladder replays in
 *      order
 *   8. over the whole run no beat appeared twice
 *
 * ⛔ a fixed sleep is not a settle: every wait is for the sink, the rings, the
 * line, or the count, the way flick.mjs does it, and a release that came out
 * slow on two cores is thrown again rather than believed.
 */
import { serve, open, reporter, tap, centre, flick, hold, resume, stroke, waitFrames, sleep } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

/* THE SEED: his save, in shape. `seen` carries how and turn and NOTHING else,
   the way a save written before the coach carries it. Everything else is what
   a blank save has, so the count of sinks starts at zero and the ladder's
   "second sink" and "fourth sink" are this run's own. */
await dev(() => {
  localStorage.setItem('lw_gerplunk_v1', JSON.stringify({ v: 1, seen: { how: 1, turn: 1 }, yaw: 0 }));
});
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.GERPLUNK_DEV && window.GERPLUNK_DEV.frames() > 2, { timeout: 20000 });
say(errors.length === 0, 'the page boots on the seeded save with nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
const seed = await dev(() => window.GERPLUNK_DEV.coach());
say(seed.seen.how === 1 && seed.seen.turn === 1 && !seed.seen.wind && !seed.seen.hook && !seed.seen.faces,
  'the save reads as a hand that has thrown and turned and seen none of the three new beats: ' + JSON.stringify(seed.seen));
const LINES = seed.lines;
say(!!LINES.wind && !!LINES.hook && !!LINES.faces && !!LINES.how && !!LINES.turn, 'the coach hands out its five lines');

/* THE WATCHER: every change to the line element, with the time, whether it is
   on, and what it says. Installed before the lake is entered so the first
   boot line, if it ever showed, would be on the record. */
await dev(() => {
  const el = document.getElementById('line');
  window.__coachLog = [];
  const note = () => window.__coachLog.push({ t: performance.now(), on: el.classList.contains('on'), text: el.textContent });
  new MutationObserver(note).observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  note();
});
const log = () => dev(() => window.__coachLog.slice());
/* an APPEARANCE of a text is a log entry that is on with that text, whose
   previous entry was not (off, or another text) */
const appearances = (entries, text) => entries.filter((e, i) => e.on && e.text === text && !(i > 0 && entries[i - 1].on && entries[i - 1].text === text)).length;

/* 1. to the lake, with no first boot line */
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 10000 });
await waitFrames(page, 3);
const line0 = await dev(() => window.GERPLUNK_DEV.state().line);
say(line0 !== LINES.how, 'a hand that has thrown before is not told to flick: the line reads ' + JSON.stringify(line0));
await tap(page, '.stone[data-id="skimmer"]');
await waitFrames(page, 2);

const lay = await dev(() => window.GERPLUNK_DEV.layout());
const y0 = Math.round(lay.H * 0.72), x0 = Math.round(lay.W * 0.15);
/* the two strokes: an unspun one (no hook, no loops) and a hooked one, both
   from 0.15 W with a 240 px arc so the release stays on the glass */
const UNSPUN = { arc: 240, ms: 150, rise: 0.55, hook: 0, n: 14 };
const HOOKED = { arc: 240, ms: 150, rise: 0.55, hook: 0.7, n: 14 };
const settle = async () => {
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().rings === 0, { timeout: 20000 }).catch(() => {});
  await waitFrames(page, 2);
};
/* throw, watched: the count is the only thing that says a throw happened, so
   a release that read as a set down is thrown again, up to three times */
const throwWatched = async (opts, what) => {
  for (let go = 0; go < 3; go++) {
    const before = await dev(() => window.GERPLUNK_DEV.save().throws);
    const r = await flick(page, stroke(Object.assign({ x0, y0 }, opts)));
    if (r.el !== 'stage') return { ok: false, why: 'the stroke landed on ' + r.el };
    const got = await page.waitForFunction((n) => window.GERPLUNK_DEV.save().throws === n, { timeout: 20000 }, before + 1).then(() => true).catch(() => false);
    if (got) {
      await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 40000 }).catch(() => {});
      const th = await dev(() => window.GERPLUNK_DEV.lastThrow());
      const res = await dev(() => window.GERPLUNK_DEV.lastResult());
      const coach = await dev(() => window.GERPLUNK_DEV.coach());
      return { ok: true, th, res, curled: coach.curled, throws: before + 1, tries: go + 1, sunkAt: await dev(() => performance.now()) };
    }
    console.log('        ' + what + ' came out as a set down on attempt ' + (go + 1) + ', throwing it again');
    await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight, { timeout: 15000 }).catch(() => {});
    await waitFrames(page, 4);
  }
  return { ok: false, why: 'three releases in a row read as a set down (' + what + ')' };
};
/* wait for a beat's line to be ON the water, up to `ms` after now. The beat
   lands 6.7 s after the sink on the game's own timer (after the readout and
   the advice), later on a loaded box. */
const waitLine = (text, ms) => page.waitForFunction((t) => window.GERPLUNK_DEV.state().line === t, { timeout: ms }, text).then(() => true).catch(() => false);

/* 2. the first unspun sink teaches nothing */
const t1 = await throwWatched(UNSPUN, 'the first unspun throw');
say(t1.ok, 'the first unspun throw threw' + (t1.ok ? ' (v ' + t1.th.v.toFixed(1) + ', spin ' + t1.th.spin.toFixed(2) + ', ' + t1.res.skips + ' skips, ' + t1.tries + ' attempt(s))' : ': ' + t1.why));
say(t1.ok && Math.abs(t1.th.spin) < 0.3, 'and it carried spin under 0.3, the premise of the wind up beat: ' + (t1.ok ? Math.abs(t1.th.spin).toFixed(3) : '?'));
const wind1 = await waitLine(LINES.wind, 11000);
say(!wind1, 'the wind up is not taught at the first sink (the ladder says the second): ' + (wind1 ? 'it WAS' : 'the line reads ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line))));
await settle();

/* 3. the second unspun sink teaches the wind up */
const t2 = await throwWatched(UNSPUN, 'the second unspun throw');
say(t2.ok && Math.abs(t2.th.spin) < 0.3 && t2.throws === 2, 'the second unspun throw threw and sank as the second sink' + (t2.ok ? ' (spin ' + t2.th.spin.toFixed(2) + ', throws ' + t2.throws + ')' : ': ' + t2.why));
const wind2 = await waitLine(LINES.wind, 14000);
const log2 = await log();
say(wind2, 'by the second unspun sink the wind up beat is on the water: ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line)));
say(/ring/.test(LINES.wind) && /spin/.test(LINES.wind) && /slow thumb/.test(LINES.wind), 'and it names the slow thumb, the spin and the ring: ' + JSON.stringify(LINES.wind));
say(!/[-!]/.test(LINES.wind + LINES.hook + LINES.faces), 'and none of the three new lines carries a dash or an exclamation point');
const seen3 = await dev(() => window.GERPLUNK_DEV.coach().seen);
say(seen3.wind === 1 && !seen3.hook && !seen3.faces, 'the save marks the wind up seen and nothing else new: ' + JSON.stringify(seen3));
/* the readout and the advice still come before the beat: on the record the
   last readout (a line with the magic angle in it) precedes the beat */
const beatAt = log2.findIndex(e => e.on && e.text === LINES.wind);
const readoutAt = log2.reduce((m, e, i) => (e.on && /magic angle/.test(e.text) && i < beatAt ? i : m), -1);
say(beatAt > 0 && readoutAt >= 0 && readoutAt < beatAt, 'and the readout came before it on the record (readout at entry ' + readoutAt + ', the beat at ' + beatAt + ')');
await settle();

/* 4. a curled throw brings the hook beat, at the third sink */
const t3 = await throwWatched(HOOKED, 'the hooked throw');
say(t3.ok && t3.throws === 3, 'the hooked throw threw and sank as the third sink' + (t3.ok ? ' (spin ' + t3.th.spin.toFixed(2) + ', ' + t3.res.skips + ' skips, throws ' + t3.throws + ')' : ': ' + t3.why));
/* ⛔ THE PREMISE IS ASSERTED, not assumed: the coach's own word for the path is
   "curled" (the same word the readout uses), else the hook beat's cause below
   could be the count and not the curve */
say(t3.ok && t3.curled === true, 'and by the coach\'s own word its path CURLED, the premise of the hook beat: curled ' + (t3.ok ? t3.curled : '?'));
const hook3 = await waitLine(LINES.hook, 14000);
say(hook3, 'after the throw that curled the hook beat is on the water: ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line)));
say(t3.ok && t3.throws < 4, 'and it was the curve that brought it, not the count: this was sink ' + (t3.ok ? t3.throws : '?') + ' of the four the count needs');
say(/wrist/.test(LINES.hook) && /spin/.test(LINES.hook) && /off the line/.test(LINES.hook), 'and the line names the wrist, the spin and the aim off the line: ' + JSON.stringify(LINES.hook));
const seen4 = await dev(() => window.GERPLUNK_DEV.coach().seen);
say(seen4.wind === 1 && seen4.hook === 1 && !seen4.faces, 'the save marks the hook seen: ' + JSON.stringify(seen4));
await settle();

/* 5. two more sinks show no beat again */
const t4 = await throwWatched(UNSPUN, 'the third unspun throw');
say(t4.ok && Math.abs(t4.th.spin) < 0.3, 'a fourth throw, unspun, threw' + (t4.ok ? ' (spin ' + t4.th.spin.toFixed(2) + ', throws ' + t4.throws + ')' : ': ' + t4.why));
const again4 = await waitLine(LINES.wind, 11000);
say(!again4, 'and the wind up is not taught twice (the line reads ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line)) + ')');
await settle();
const t5 = await throwWatched(HOOKED, 'the second hooked throw');
say(t5.ok, 'a fifth throw, hooked, threw' + (t5.ok ? ' (curled ' + t5.curled + ', throws ' + t5.throws + ')' : ': ' + t5.why));
const again5 = await waitLine(LINES.hook, 11000);
say(!again5, 'and the hook is not taught twice (the line reads ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line)) + ')');
await settle();

/* 6. the faces, under the thumb, the first time past the point */
await dev(() => window.GERPLUNK_DEV.setYaw(0));
await waitFrames(page, 2);
/* a slow slide right: 240 px over 1.2 s is 0.05 m/s of glass, under the
   game's own slow hand, so all of it is the plant; at 480 degrees a metre it
   is over 30 degrees of turn and the point is at 15 */
const slide = (from, n, step, dt) => Array.from({ length: n }, (_, i) => ({ x: from + i * step, y: y0, dt: i ? dt : 0 }));
await hold(page, slide(x0, 25, 10, 50));
await waitFrames(page, 2);
const facesOn = await dev(() => ({ line: window.GERPLUNK_DEV.state().line, yaw: window.GERPLUNK_DEV.yaw(), down: window.GERPLUNK_DEV.spin().down }));
say(facesOn.down && facesOn.yaw >= 15, 'a slow slide with the thumb still down has turned the lake past the point: ' + facesOn.yaw.toFixed(1) + ' degrees');
say(facesOn.line === LINES.faces, 'and the faces beat is on the water under the thumb: ' + JSON.stringify(facesOn.line));
say(/lee/.test(LINES.faces) && /bay/.test(LINES.faces) && /forgives/.test(LINES.faces) && /greedy/.test(LINES.faces), 'and it says the lee forgives and the bay is greedy: ' + JSON.stringify(LINES.faces));
const seen6 = await dev(() => window.GERPLUNK_DEV.coach().seen);
say(seen6.faces === 1, 'the save marks the faces seen: ' + JSON.stringify(seen6));
/* a slow set down, then a second slide past the other point: nothing */
await resume(page, [{ x: x0 + 244, y: y0, dt: 60 }, { x: x0 + 246, y: y0, dt: 80 }]);
await waitFrames(page, 2);
say(!(await dev(() => window.GERPLUNK_DEV.state().inFlight)), 'the slide ended as a set down, not a throw');
await dev(() => { window.GERPLUNK_DEV.setYaw(0); });
await waitFrames(page, 2);
const before7 = await log();
await hold(page, slide(x0 + 240, 25, -10, 50));
await waitFrames(page, 2);
const facesAgain = await dev(() => ({ line: window.GERPLUNK_DEV.state().line, yaw: window.GERPLUNK_DEV.yaw() }));
await resume(page, [{ x: x0 - 4, y: y0, dt: 60 }, { x: x0 - 6, y: y0, dt: 80 }]);
await waitFrames(page, 2);
say(facesAgain.yaw <= -15, 'a second slow slide turned the lake past the point the other way: ' + facesAgain.yaw.toFixed(1) + ' degrees');
const after7 = await log();
say(appearances(after7, LINES.faces) === appearances(before7, LINES.faces), 'and the faces beat did not come back (the line reads ' + JSON.stringify(facesAgain.line) + ')');

/* 7. HOW TO THROW */
await tap(page, '#btnMenu');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 10000 });
const bHow = await centre(page, '#btnHow');
say(!!bHow && bHow.w >= 48 && bHow.h >= 48 && bHow.onTop && bHow.inView, 'HOW TO THROW is on the sheet, 48 px, where a thumb lands on it: ' + (bHow ? bHow.w.toFixed(0) + 'x' + bHow.h.toFixed(0) + (bHow.onTop ? '' : ' NOT ON TOP') + (bHow.inView ? '' : ' OFF THE SCREEN') : 'MISSING'));
say(!!bHow && !(bHow.x < 120 && bHow.y > lay.H - 120), 'and it is not in the music chip\'s corner');
const howBefore = appearances(await log(), LINES.how);
await tap(page, '#btnHow');
/* AT ONCE: the screen and the line are read in the frame after the tap */
await waitFrames(page, 1);
const replay = await dev(() => ({ screen: window.GERPLUNK_DEV.screen(), line: window.GERPLUNK_DEV.state().line, seen: window.GERPLUNK_DEV.coach().seen }));
say(replay.screen === 'lake', 'a tap on it returns to the water at once: screen ' + replay.screen);
say(replay.line === LINES.how, 'with the first line on the water: ' + JSON.stringify(replay.line));
say(howBefore === 0 && appearances(await log(), LINES.how) === 1, 'which had not been shown to this hand before the replay (' + howBefore + ' before, 1 now)');
say(replay.seen.how === 0 && replay.seen.turn === 0 && replay.seen.wind === 0 && replay.seen.hook === 0 && replay.seen.faces === 0, 'and every beat is unseen again: ' + JSON.stringify(replay.seen));
/* the ladder replays in order: the next sink brings the slide lesson */
const t8 = await throwWatched(HOOKED, 'the replay throw');
say(t8.ok, 'a throw after the replay threw' + (t8.ok ? '' : ': ' + t8.why));
const turn8 = await waitLine(LINES.turn, 14000);
say(turn8, 'and its sink brings the slide lesson, the second beat, so the ladder replays in order: ' + JSON.stringify(await dev(() => window.GERPLUNK_DEV.state().line)));
const seen8 = await dev(() => window.GERPLUNK_DEV.coach().seen);
say(seen8.how === 1 && seen8.turn === 0, 'with the flick seen again at that sink and the turn still waiting: ' + JSON.stringify(seen8));

/* 8. no beat twice, over the whole record */
const all = await log();
const counts = { wind: appearances(all, LINES.wind), hook: appearances(all, LINES.hook), faces: appearances(all, LINES.faces), how: appearances(all, LINES.how) };
say(counts.wind === 1 && counts.hook === 1 && counts.faces === 1 && counts.how === 1,
  'over the whole run each beat appeared exactly once on the record (' + all.length + ' changes of the line): ' + JSON.stringify(counts));
say(errors.length === 0, 'and nothing reached the console' + (errors.length ? ': ' + errors.join(' | ') : ''));

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' COACH FAILURE(S)'); process.exit(1); }
console.log('COACH OK');
