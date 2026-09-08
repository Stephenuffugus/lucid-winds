#!/usr/bin/env node
/* A thumb throws a stone, and the page counts what the model counted.
 *
 *   node test/flick.mjs
 *
 * Every input here is a real pointer event on the real canvas with real time
 * between the samples. Nothing calls a handler and nothing seeds a save.
 *
 * What it asserts, each watched to fail (the fail column is in the ledger):
 *   1. the page boots with nothing on the console, and framed it posts ready
 *   2. a real tap on TO THE LAKE reaches the lake, and the first boot line is
 *      on the screen and says what to do
 *   3. a real tap on the Perfect Skimmer picks it (the button is marked, the
 *      page agrees)
 *   4. a real 14 sample stroke, 320 px across and up in about 170 ms with a
 *      hook at the end, makes a throw with v over 8, theta under 24 and |spin|
 *      over 0.3, and at least six skip events
 *   5. the tally on the post GROWS during the flight and equals the event
 *      count at the sink; the number the thumb reads is the number the model
 *      produced
 *   6. one tick was scheduled per skip
 *   7. the readout line appears after the sink
 *   8. a slow push, 60 px in 300 ms, is a set down and not a throw, and it
 *      TURNS the lake, because a slow slide is the plant and the turn
 *      survives a set down (DECISIONS D18); a fast throw never turns it
 *   9. a weak lob, mostly up, is a throw that beats no record, and the page
 *      counted for it exactly what the model counts for that tuple on the
 *      day's face (the seam; the old "dies inside two skips" was a count)
 *  10. a slow slide before the throw turns the lake, and the turn survives
 *  12. THE RELEASE, SHOWN (call 58): the ring frozen where the thumb let go
 *      and the angle line are PAINTED at the moment of release (a differential
 *      of one instant), the picture holds for at least 300 ms of play and is
 *      gone by half a second; after the sink the seam on the water is the
 *      throw's own trace, ending at its sink, labelled, and not the nominal
 *      preview; the readout's curve word is the path's; a new touch brings
 *      the preview back
 *
 * ⛔ every subject is asserted to EXIST and be VISIBLE before it is measured.
 * A gate that measures a hidden element measures nothing and reports PASS.
 */
import { serve, open, reporter, tap, centre, flick, hold, moveOn, resume, stroke, waitFrames, sleep } from './harness.mjs';
import { readFileSync } from 'node:fs';
/* THE MODEL, built in node from the same index.html the page is serving, the
   way sim.js builds it, so section 9 can ask the model what the page's throw
   tuple does and compare the two producers' answers (a seam assertion). */
const HTML_SRC = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const cut = (src, a, b) => src.slice(src.indexOf(a) + a.length, src.indexOf(b));
const SIM = new Function(cut(HTML_SRC, '// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----')
  + '\nreturn { newThrow: newThrow, runThrow: runThrow, mixSeed: mixSeed, dailySeedFor: dailySeedFor };')();

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

/* 1. boot */
say(errors.length === 0, 'the page boots with nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
const host = await browser.newPage();
await host.setViewport({ width: 375, height: 667 });
await host.setContent(
  `<body style="margin:0"><script>window.__msgs=[];addEventListener('message',e=>{if(e.data&&e.data.sws)window.__msgs.push(e.data.sws)})</script>
   <iframe src="${base}/index.html?framed=1" style="width:375px;height:640px;border:0"></iframe></body>`,
  { waitUntil: 'load' });
await host.waitForFunction(() => window.__msgs && window.__msgs.indexOf('ready') >= 0, { timeout: 20000 }).catch(() => {});
const msgs = await host.evaluate(() => window.__msgs);
say(msgs.indexOf('ready') >= 0, 'framed, it posts ready to the arcade (' + JSON.stringify(msgs) + ')');
await host.close();

/* 2. to the lake */
const bPlay = await centre(page, '#btnPlay');
say(!!bPlay && bPlay.onTop, 'TO THE LAKE is on the title and a thumb at its centre lands on it');
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 10000 });
await waitFrames(page, 3);
const line0 = await dev(() => {
  const el = document.getElementById('line');
  const cs = getComputedStyle(el);
  return { on: el.classList.contains('on'), vis: cs.visibility !== 'hidden' && Number(cs.opacity) > 0.5, text: el.textContent };
});
say(line0.on && line0.vis && line0.text === 'Flick a stone across the water.', 'the first boot line is visible and says what to do: ' + JSON.stringify(line0.text));
/* call 58 (c): before the first throw the seam is the nominal preview and it
   is LABELLED as the ideal line. ⛔ ONLY THE STATE IS READ HERE, the ink is
   read on a fresh page at the END of this file, and the reason cost a round:
   under swiftshader the canvas runs at 4 frames a second with EXACT timers
   until the first getImageData, and at 24 with every timer delayed behind a
   paint after it. Reading the tag's ink here made the first stroke below
   take 437 ms instead of 170 and plant 22 degrees, and nineteen lines went
   red on a game that had not changed. No gate may read the canvas before the
   first stroke it times. */
const seam0 = await dev(() => window.GERPLUNK_DEV.seam());
say(!seam0.mine && seam0.tag === 'ideal line', 'before any throw the seam is the nominal preview and it is tagged as the ideal line: ' + JSON.stringify(seam0.tag));

/* 3. pick the skimmer */
const stones = await dev(() => document.querySelectorAll('.stone').length);
say(stones === 3, 'three stones are on the bank (' + stones + ')');
const sk = await centre(page, '.stone[data-id="skimmer"]');
say(!!sk && sk.onTop && sk.inView, 'the Perfect Skimmer is on the bank where a thumb can reach it');
await tap(page, '.stone[data-id="skimmer"]');
await waitFrames(page, 2);
const picked = await dev(() => ({ id: window.GERPLUNK_DEV.stone(), marked: document.querySelector('.stone[data-id="skimmer"]').classList.contains('picked') }));
say(picked.id === 'skimmer' && picked.marked, 'a real tap picks it: page says ' + picked.id + ', button ' + (picked.marked ? 'marked' : 'NOT marked'));
await sleep(2600);

/* 4. the throw */
const yaw0 = await dev(() => window.GERPLUNK_DEV.yaw());
const lay = await dev(() => window.GERPLUNK_DEV.layout());
const y0 = Math.round(lay.H * 0.72), x0 = Math.round(lay.W * 0.32);
const f = await flick(page, stroke({ x0, y0, arc: 320, ms: 170, rise: 0.55, hook: 0.7, n: 14 }));
say(f.el === 'stage', 'the stroke starts on the water (it landed on ' + f.el + ', ' + f.ms.toFixed(0) + ' ms)');
await page.waitForFunction(() => window.GERPLUNK_DEV.lastThrow() !== null, { timeout: 5000 }).catch(() => {});
const th = await dev(() => window.GERPLUNK_DEV.lastThrow());
const smp = await dev(() => window.GERPLUNK_DEV.samples());
say(!!smp && smp.n >= 10, 'the page recorded the stroke: ' + (smp ? smp.n + ' samples over ' + smp.ms.toFixed(0) + ' ms' : 'nothing'));
say(!!th, 'the release was a throw');
if (th) {
  say(th.v > 8, 'v over 8: ' + th.v.toFixed(2));
  say(th.theta < 24, 'theta under 24: ' + th.theta.toFixed(1));
  say(Math.abs(th.spin) > 0.3, '|spin| over 0.3: ' + th.spin.toFixed(2));
  say(th.stone === 'skimmer', 'and it threw the stone that was picked: ' + th.stone);
}
const res = await dev(() => window.GERPLUNK_DEV.lastResult());
say(!!res && res.skips >= 6, 'at least six skip events: ' + (res ? res.skips + ' skips, ' + res.distance.toFixed(1) + ' m, ' + res.ended : 'no result'));

/* 4b. THE RECORD IS WATCHED. A throw that beats the hand's best slows from the moment
   the last skip lands until the plunk, so the final leap is seen rather than gone. The
   ratio is a literal here on purpose: the last stretch takes about three times as long
   to watch as it took to happen. Reading CONFIG.SLOW_MO and dividing by it would be a
   test of arithmetic, not of the game. */
const sm = await dev(() => window.GERPLUNK_DEV.slowmo());
say(!!sm && sm.slowFrom !== null && Math.abs(sm.slowFrom - sm.lastSkip) < 1e-9,
  'the first throw is a record and it slows from the last skip (' + (sm ? sm.slowFrom : 'no play') + ')');
const stretch = sm && sm.slowFrom !== null ? (sm.sinkWall - sm.slowFrom) / Math.max(1e-6, sm.sinkSim - sm.slowFrom) : 0;
say(stretch > 2.7 && stretch < 3.2,
  'and the last stretch takes about three times as long to watch: ' + stretch.toFixed(2) + ' times');
say(!!sm && sm.sinkWall > sm.sinkSim, 'so the plunk lands later on the screen than in the model ('
  + (sm ? sm.sinkWall.toFixed(2) + ' s against ' + sm.sinkSim.toFixed(2) : '?') + ')');

/* 5. the tally grows, and ends on the count */
const post = await dev(() => {
  const el = document.getElementById('tally'), r = el.getBoundingClientRect(), cs = getComputedStyle(document.getElementById('hud'));
  return { w: r.width, h: r.height, vis: cs.visibility === 'visible', top: r.top };
});
say(post.vis && post.h > 10 && post.top >= 0, 'the tally is on the screen (' + post.w.toFixed(0) + 'x' + post.h.toFixed(0) + ')');
const mid = await page.waitForFunction(() => {
  const s = window.GERPLUNK_DEV.state();
  return s.inFlight && s.shown >= 1 ? s : null;
}, { timeout: 8000 }).then(h => h.jsonValue()).catch(() => null);
say(!!mid && mid.tally === String(mid.shown) && mid.shown < (res ? res.skips : 0),
  'the tally grows in flight and matches the page: ' + (mid ? mid.tally + ' on the post, ' + mid.shown + ' shown' : 'never saw a skip in flight'));
await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 30000 });
await waitFrames(page, 2);
const end = await dev(() => window.GERPLUNK_DEV.state());
say(!!res && end.tally === String(res.skips) && end.shown === res.skips,
  'at the sink the post says ' + end.tally + ' and the model counted ' + (res ? res.skips : '?'));

/* 6. the ticks */
const audio = await dev(() => ({ ready: window.GERPLUNK_DEV.audioReady(), ticks: window.GERPLUNK_DEV.ticks() }));
say(audio.ready, 'the audio context opened on the first touch');
say(!!res && audio.ticks === res.skips, 'one tick was scheduled per skip: ' + audio.ticks + ' ticks for ' + (res ? res.skips : '?') + ' skips');

/* 7. the readout */
const line1 = await page.waitForFunction(() => {
  const el = document.getElementById('line');
  return el.classList.contains('on') && el.textContent.length > 8 ? el.textContent : null;
}, { timeout: 6000 }).then(h => h.jsonValue()).catch(() => null);
say(!!line1 && !/[-!]/.test(line1), 'the readout line appears after the sink: ' + JSON.stringify(line1));
/* call 58: the line names the three numbers a throw has and which way it
   went. The speed is a word, the angle is against the magic angle, the spin
   is a fraction of full, and the curve is a direction; a line missing any one
   of the four is red. */
/* the spaces inside "2 below", "spin 1.0" and "no spin" are no break spaces
   in the game, so the number cannot wrap away from its word on a 375 px line */
const READOUT = /^(Soft|Easy|Brisk|Hard), (on the magic angle|\d+\u00A0(above|below) the magic angle), (spin\u00A0\d\.\d|no\u00A0spin), and it (curled (left|right)|drifted (left|right)|ran straight)\.$/;
say(!!line1 && READOUT.test(line1), 'and it names the three numbers, speed as a word, angle against the magic angle, spin as a fraction, and which way it went');
const line1Spin = line1 && th ? line1.match(/spin\u00A0(\d\.\d)/) : null;
say(!!line1Spin && Math.abs(Number(line1Spin[1]) - Math.abs(th.spin)) < 0.051, 'and the spin it names is the spin the throw had: ' + (line1Spin ? line1Spin[1] : 'none') + ' against ' + (th ? Math.abs(th.spin).toFixed(3) : '?'));
/* ⛔ THE LINE MAY NOT EAT A THROW. It sits ON THE WATER, 172 px off the bottom,
   which on a 667 tall phone is the band a thumb throws from, and it is up for
   two and a half seconds after every sink. Nothing in this file had ever asked
   whether a thumb can throw THROUGH it: every earlier flick starts where the
   line is not, or after it has gone. It cannot eat a throw today, because #hud
   is pointer-events:none, and that is a property of the parent that a later
   hand could take away in one word. So the law is asserted where it belongs:
   while the line is SHOWING, the water under it is still the water. */
const underLine = await dev((px, py) => {
  const el = document.getElementById('line');
  const on = el.classList.contains('on'), r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(px, py);
  return { on: on, top: r.top, bottom: r.bottom, over: py >= r.top && py <= r.bottom, hit: hit ? (hit.id || hit.tagName) : null };
}, x0, y0);
say(underLine.on && underLine.over, 'the readout line is showing and it covers the throw point ('
  + underLine.top.toFixed(0) + ' to ' + underLine.bottom.toFixed(0) + ', thumb at ' + y0 + ')');
say(underLine.hit === 'stage', 'and a thumb there still lands on the water, not on the line: ' + underLine.hit);
/* and the folk advice line still follows it, a second line after the first */
const line2 = await page.waitForFunction((prev) => {
  const el = document.getElementById('line');
  return el.classList.contains('on') && el.textContent.length > 8 && el.textContent !== prev ? el.textContent : null;
}, { timeout: 7000 }, line1).then(h => h.jsonValue()).catch(() => null);
say(!!line2 && !/[-!]/.test(line2) && !READOUT.test(line2), 'and the folk advice line follows it: ' + JSON.stringify(line2));
const best = await dev(() => ({ text: document.getElementById('best').textContent, save: window.GERPLUNK_DEV.save() }));
say(!!res && best.text === 'best ' + res.skips && best.save.best === res.skips && best.save.throws === 1,
  'the best is on the post and in the save: ' + best.text + ', save best ' + best.save.best + ', throws ' + best.save.throws);

/* 8. a slow push is a set down, and it is a plant */
await sleep(300);
const yaw1 = await dev(() => window.GERPLUNK_DEV.yaw());
say(Math.abs(yaw1 - yaw0) < 1e-6, 'a fast throw with no slide in front of it does not turn the lake (' + yaw0.toFixed(1) + ' then ' + yaw1.toFixed(1) + ')');
await flick(page, stroke({ x0, y0, arc: 60, ms: 300, rise: 0.6, hook: 0, n: 8 }));
await waitFrames(page, 2);
const after8 = await dev(() => ({ throws: window.GERPLUNK_DEV.save().throws, inFlight: window.GERPLUNK_DEV.state().inFlight }));
say(after8.throws === 1 && !after8.inFlight, 'a 60 px push over 300 ms is a set down, not a throw');
const yawSD = await dev(() => window.GERPLUNK_DEV.yaw());
say(yawSD > yaw1 + 3, 'and because it was slow and sideways it was a plant: the lake turned ' + yaw1.toFixed(1) + ' to ' + yawSD.toFixed(1) + ' and the turn survived the set down');

/* 9. a weak lob is a throw, beats no record, and the page counted what the model counts
   ⛔ THIS LINE WAS "a weak lob dies inside two skips" AND IT WAS A COUNT, NOT A
   LAW. A throw's seed is mixSeed(dailySeedFor(day), 100 + throws), the game's
   own formula (index.html, onUp), so the lob's skips are the DAY'S: the model
   gives this same tuple (v 4.6, theta 27.3, the second throw) 2 skips on Sep 07
   and 5 on Sep 08, with the wind zeroed or not, and the line went red on Sep 08
   with nothing in the game changed. A gate green by the day it was written. The
   law that holds on every day is the seam: the page's count IS the model's for
   the tuple the page says it threw, on the face the day says it threw it at.
   "Beats no record" is the slowmo line below (slowFrom null). What this lob
   does across the week is PRINTED for the throw model's owner (his line 7,
   "not tuned properly"), not asserted.
   ⛔ AND THE LOB IS WATCHED, NOT BELIEVED. On two cores the driver's dispatch
   stretches, the release comes out slow, and the game correctly reads it as a
   set down. `lastThrow()` and `lastResult()` then still hold the PREVIOUS
   throw, so the gate printed the fast throw's v 10.1 and its 13 skips and
   called them the lob's, which is a failure that lies about what it saw. The
   count is the only thing that says a throw happened, so the count is watched
   and the lob is thrown again, up to three times. */
let lobTries = 0, lobFlew = false;
while (!lobFlew && lobTries < 3) {
  lobTries++;
  await flick(page, stroke({ x0, y0: y0 + 40, arc: 210, ms: 230, rise: 0.92, hook: 0, n: 10 }));
  lobFlew = await page.waitForFunction(() => window.GERPLUNK_DEV.save().throws === 2, { timeout: 30000 }).then(() => true).catch(() => false);
  if (!lobFlew) {
    console.log('        the lob came out as a set down on attempt ' + lobTries + ', throwing it again');
    await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight, { timeout: 15000 }).catch(() => {});
    await waitFrames(page, 6);
  }
}
const lob = await dev(() => ({ res: window.GERPLUNK_DEV.lastResult(), th: window.GERPLUNK_DEV.lastThrow(), throws: window.GERPLUNK_DEV.save().throws }));
say(lob.throws === 2, 'the lob was a throw after ' + lobTries + ' attempt(s) (' + (lob.th ? 'v ' + lob.th.v.toFixed(1) + ', theta ' + lob.th.theta.toFixed(1) : 'none') + ')');
const lobFace = lob.th ? await dev((yaw) => window.GERPLUNK_DEV.face(yaw), lob.th.yaw) : null;
const lobEnv = lobFace ? { water: lobFace.water, wind: lobFace.wind, reach: lobFace.reach } : null;
const lobModel = lob.th ? SIM.runThrow(SIM.newThrow(lob.th), lobEnv) : null;
say(lob.throws === 2 && !!lob.res && !!lobModel && lobModel.skips === lob.res.skips && lobModel.ended === lob.res.ended,
  'and the page counted what the model counts for that tuple on the day\'s face: '
  + (lob.res ? lob.res.skips + ' skips, ' + lob.res.ended : 'no result')
  + ' (model ' + (lobModel ? lobModel.skips + ', ' + lobModel.ended : '?') + '; seed ' + (lob.th ? lob.th.seed : '?')
  + ', ' + (lobFace ? lobFace.face + ' face, ' + lobFace.water : '?') + ')');
if (lob.th && lobEnv) {
  const dayNow = await dev(() => window.GERPLUNK_DEV.day());
  const d0 = new Date(dayNow.day + 'T12:00:00Z'), week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(d0.getTime() + i * 86400000).toISOString().slice(0, 10);
    /* the second throw of that day, the game's own seeding: 100 + 1 */
    const th = Object.assign({}, lob.th, { seed: SIM.mixSeed(SIM.dailySeedFor(d), 100 + 1) });
    week.push(d.slice(5) + ' ' + SIM.runThrow(SIM.newThrow(th), lobEnv).skips);
  }
  console.log('        note: this lob as the second throw of each of the next seven days, on today\'s face, by the model: '
    + week.join(', ') + ' skips (the old law said two or fewer)');
}
/* and a throw that beats nothing is not slowed: the record is the whole reason to slow */
const smLob = await dev(() => window.GERPLUNK_DEV.slowmo());
say(!!smLob && smLob.slowFrom === null,
  'a lob that beats no record plays at the model\'s own speed (slowFrom ' + (smLob ? smLob.slowFrom : '?') + ')');
say(!!smLob && Math.abs(smLob.sinkWall - smLob.sinkSim) < 1e-9,
  'so its plunk lands on the screen when the model sank it');
const yawLob = await dev(() => window.GERPLUNK_DEV.yaw());
say(Math.abs(yawLob - yawSD) < 1.5, 'and being a throw it did not turn the lake (' + yawSD.toFixed(1) + ' then ' + yawLob.toFixed(1) + ')');

/* 10. the plant turns the lake */
await sleep(2600);
await page.waitForFunction(() => window.GERPLUNK_DEV.state().rings === 0, { timeout: 10000 }).catch(() => {});
const yawA = await dev(() => window.GERPLUNK_DEV.yaw());
await flick(page, stroke({ x0: x0 + 40, y0, arc: 320, ms: 170, rise: 0.55, hook: 0.7, n: 14, plantPx: 120, plantMs: 450 }));
await page.waitForFunction(() => window.GERPLUNK_DEV.save().throws === 3, { timeout: 30000 }).catch(() => {});
const yawB = await dev(() => window.GERPLUNK_DEV.yaw());
const saved = await dev(() => window.GERPLUNK_DEV.save().yaw);
say(yawB > yawA + 5, 'a 120 px slide before the throw turned the lake right: ' + yawA.toFixed(1) + ' to ' + yawB.toFixed(1) + ' degrees');
say(Math.abs(saved - yawB) < 1e-6, 'and the turn is in the save for next time: ' + saved.toFixed(1));

/* 11. THE WIND UP AND THE SPIN RING (P4, docs/THROW-REFERENCE.md)

   ⛔ THE THING THIS HAS TO PROVE IS THAT A PICTURE WAS DRAWN, not that a number
   moved. So the ring is measured by reading the CANVAS on the ring's own circle,
   at the centre and radius the game hands out, as the difference between one
   instant painted with the ring and without it. Emptying drawSpinRing leaves
   the water and turns it red; changing the ring's colour by a hair does not,
   which is the right sensitivity for a drawing. Shrinking it back under the
   thumb turns the occlusion law red.
   ⛔ and the wind up may not swing the shore. The plant and the bank read the
   same slow segments, so the yaw is read on both sides of the loops. */
/* ⛔ a fixed sleep is not a settle. The wound throw below is a record, so it
   runs long AND in slow motion, and 2600 ms lands in the middle of it. Wait for
   the sink, the rings and the readout line, or the next gesture starts on top
   of the last one. */
const settle = async () => {
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().sunk, { timeout: 40000 }).catch(() => {});
  await page.waitForFunction(() => window.GERPLUNK_DEV.state().rings === 0 && !window.GERPLUNK_DEV.state().line,
    { timeout: 20000 }).catch(() => {});
  await waitFrames(page, 2);
};
await settle();
const yawW0 = await dev(() => window.GERPLUNK_DEV.yaw());
const wound = stroke({ x0, y0, arc: 320, ms: 170, rise: 0.55, hook: 0, n: 14, loops: 2 });
const LOOPPTS = 48;                      /* loopN 24 times two loops */
const HOLD_AT = 36;                      /* a loop and a half, so the ring is part filled */
/* ⛔ THE RING IS READ WHERE THE RING IS, AND WITH A THUMB ON IT. Until Sep 08
   this read the brightest pixel in a 23 to 45 px annulus at the touch point,
   against the water at its brightest over ten frames, and the two numbers were
   a coin toss apart (164 to 185 water, 207 ring) because the sun's road crawls.
   And it could not see the fault the Director saw: a ring of 26 to 42 px sits
   INSIDE a thumb pad, and this annulus had no thumb in it.
   `ringInk(maskR)` paints ONE instant twice, with and without the ring, and
   walks the ring's own circle at the radius and centre the game hands out,
   clockwise from twelve o'clock; each degree says whether the ring moved the
   picture there, how much lighter it made it, and whether that point of the
   circle lies outside a 45 px disc around the thumb. A thumb pad on glass is
   12 to 16 mm and a Pixel 9 CSS px is 0.158 mm, so 45 px is the pad's radius.
   No water baseline, no colour: whatever the ring is painted in, on whatever
   water, the pixels it moved are the ring. */
const PAD = 45;
/* the smallest per channel move that counts as paint. On a fixed instant the
   ring's absence reads exactly 0, and the faintest the ring's own paint gets is
   its track over black land, which read 31 on the first run; 12 is under that
   and far over nothing. The least moved degree is printed so the margin shows. */
const MOVED = 12;
const ringRead = async () => dev((m) => window.GERPLUNK_DEV.ringInk(m), PAD);
await hold(page, wound.slice(0, HOLD_AT));
await waitFrames(page, 3);
const sp = await dev(() => window.GERPLUNK_DEV.spin());
say(sp.down && sp.bank > 0.55 && sp.bank < 0.9,
  'a loop and a half of the thumb banks most of the spin: ' + (sp.bank === undefined ? '?' : sp.bank.toFixed(3)));
const ring = await ringRead();
const painted = ring ? ring.deg.filter(d => d.changed > MOVED) : [];
const leastMoved = ring ? ring.deg.reduce((m, d) => Math.min(m, d.changed), 999) : -1;
/* the ring's inner edge (r less half its 6 px ground) clears the pad: the law
   of the shape that shipped, D45, and the reason a thumb can see it */
say(!!ring && painted.length === 360 && ring.r - 3 > PAD,
  'a ring is DRAWN all the way round, at the centre and radius the game hands out, and that radius clears a thumb pad: '
  + painted.length + ' of 360 degrees moved the picture at r ' + (ring ? ring.r.toFixed(1) : '?')
  + ' about ' + (ring ? ring.x.toFixed(0) + ',' + ring.y.toFixed(0) : '?') + ' (least moved ' + leastMoved + ', pad ' + PAD + ')');
/* ⛔ THE OCCLUSION LAW, his line 11. With a thumb pad masked out around the
   touch point, MORE THAN HALF of the ring's circumference is still painted
   outside it; that is 180 of the 360 degrees, and the old ring scored zero. */
const clear = ring ? ring.deg.filter(d => d.outside && d.changed > MOVED).length : 0;
say(clear > 180,
  'and with a ' + PAD + ' px thumb pad masked out at the touch, more than half of the circumference is still painted outside it: '
  + clear + ' of 360 degrees (' + (ring ? ring.deg.filter(d => d.outside).length : 0) + ' lie outside the pad at all)');
/* ⛔ AND THE FILL READS ITS DIRECTION. The thumb wound clockwise, so the fill
   runs clockwise from the mark at twelve o'clock: the first 36 degrees past the
   mark are fill and the last 36 degrees before it are track, because the bank
   is between 0.55 and 0.9 (asserted above) so the fill ends somewhere between
   six and eleven o'clock. Fill is cream at 0.55 alpha or more, track is cream
   at 0.3 over a dark ground, so the median lift of the two windows is at least
   40 apart. Medians, because a gold streak of the sun's road under one degree
   can null the lift there. Flipping the sweep's sign turns this red. */
const median = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : -999; };
const headLift = ring ? median(ring.deg.slice(0, 36).map(d => d.brighter)) : -999;
const tailLift = ring ? median(ring.deg.slice(324).map(d => d.brighter)) : -999;
say(headLift - tailLift > 40,
  'and the fill runs the way the thumb wound, clockwise from the mark: the first 36 degrees lift the picture by '
  + headLift.toFixed(0) + ' and the last 36 by ' + tailLift.toFixed(0));
/* ⛔ THE WIND UP MAY NOT SWING THE SHORE, and the honest form of that law is a
   comparison rather than a zero. The plant and the bank read the same slow
   segments, so a circle DOES travel sideways and part way round one the lake
   has genuinely moved a little. What must be true is that it is worth almost
   nothing: three hundred px of thumb spent on loops turns the lake by less than
   a fifth of what a hundred and twenty px spent on a SLIDE turned it, measured
   above rather than assumed. At a whole number of loops it comes back. */
const yawMid = await dev(() => window.GERPLUNK_DEV.yaw());
const slideWorth = Math.abs(yawB - yawA);
say(Math.abs(yawMid - yawW0) < 0.2 * slideWorth,
  'a loop and a half of thumb turns the lake ' + Math.abs(yawMid - yawW0).toFixed(2)
  + ' degrees where a 120 px slide turned it ' + slideWorth.toFixed(2));
/* ⛔ AND AT THE END OF THE WIND UP THE LAKE IS BACK WHERE IT STARTED. The
   measurement is taken HERE, with the circle closed and the thumb still down,
   and not after the throw, and the reason is worth writing down because it cost
   an hour: on two cores the ARM'S dispatch stretches, a 13 ms step becomes 60,
   and at 24 px a step that is 410 px per second, which is under the game's own
   TURN_FADE_LO. The game then reads the first inch of the flick as a slow hand
   and turns the lake with it, WHICH IS CORRECT, and the end to end assertion
   was measuring the driver's timers rather than the mechanic. The end to end
   version of this law lives in the sim, where the clock is exact
   ('two loops of the thumb leave the lake exactly where it was'). */
await moveOn(page, wound.slice(HOLD_AT, LOOPPTS + 1));
await waitFrames(page, 2);
const closed = await dev(() => ({ yaw: window.GERPLUNK_DEV.yaw(), bank: window.GERPLUNK_DEV.spin().bank }));
say(Math.abs(closed.yaw - yawW0) < 0.6,
  'and with the circle closed the lake is back where it started: ' + yawW0.toFixed(2)
  + ' then ' + closed.yaw.toFixed(2) + ' degrees');
say(closed.bank > 0.9, 'with the bank full: ' + closed.bank.toFixed(3));
const throwsBefore = await dev(() => window.GERPLUNK_DEV.save().throws);
await resume(page, wound.slice(LOOPPTS));
await page.waitForFunction((n) => window.GERPLUNK_DEV.save().throws === n, { timeout: 30000 }, throwsBefore + 1).catch(() => {});
const wt = await dev(() => window.GERPLUNK_DEV.lastThrow());
say(!!wt && Math.abs(wt.spin) > 0.6,
  'and the straight flick after it commits the spin that was wound: |spin| ' + (wt ? Math.abs(wt.spin).toFixed(3) : 'no throw'));

/* the control: the SAME flick with no loops in front of it puts nothing on */
/* ⛔ AND IT HAS TO ACTUALLY THROW. On two cores a 170 ms arm can be dispatched
   over 500 ms, which the game correctly reads as a set down, and then
   lastThrow() is the PREVIOUS throw and the assertion below reads the wound
   throw's spin and calls it the control's. That is how a green gate lies about
   a number it never measured. So the count is watched, and a release that came
   out slow is thrown again rather than believed. */
const throwFresh = async (opts, what) => {
  for (let go = 0; go < 3; go++) {
    await settle();
    const before = await dev(() => window.GERPLUNK_DEV.save().throws);
    const r = await flick(page, stroke(Object.assign({ x0, y0 }, opts)));
    if (r.el !== 'stage') return { ok: false, why: 'the stroke landed on ' + r.el };
    const got = await page.waitForFunction((n) => window.GERPLUNK_DEV.save().throws === n,
      { timeout: 20000 }, before + 1).then(() => true).catch(() => false);
    if (got) return { ok: true, th: await dev(() => window.GERPLUNK_DEV.lastThrow()), tries: go + 1 };
  }
  return { ok: false, why: 'three releases in a row read as a set down (' + what + ')' };
};
const plain = await throwFresh({ arc: 320, ms: 170, rise: 0.55, hook: 0, n: 14 }, 'the control');
say(plain.ok, 'the control flick with no wind up threw' + (plain.ok ? ' (' + plain.tries + ' attempt(s))' : ': ' + plain.why));
say(plain.ok && Math.abs(plain.th.spin) < 0.1,
  'and it puts nothing on the stone: |spin| ' + (plain.ok ? Math.abs(plain.th.spin).toFixed(4) : '?'));

/* 11b. AND THE RING IS GONE THE MOMENT THE ARM IS FAST, which is the half of
   the rule that a bank reading alone cannot see: the ring is a wind up gauge,
   not a throw decoration, and the last thing a player should be looking at as
   the stone leaves is a widget. */
await settle();
const wound2 = stroke({ x0, y0, arc: 320, ms: 170, rise: 0.55, hook: 0, n: 14, loops: 2 });
/* the arm's samples are dispatched back to back with no wait between them, so
   the release window is unambiguously FAST however loaded the box is. Under a
   timer the same eight points can stretch to half a second on two cores, which
   is a slow hand, and the ring would be right to still be drawn. */
await hold(page, wound2.slice(0, LOOPPTS).concat(
  wound2.slice(LOOPPTS, LOOPPTS + 8).map(p => ({ x: p.x, y: p.y, dt: 0 }))));
await waitFrames(page, 3);
const spFast = await dev(() => window.GERPLUNK_DEV.spin());
const ringFast = await ringRead();
const fastPainted = ringFast ? ringFast.deg.filter(d => d.changed > MOVED).length : -1;
say(spFast.down && spFast.bank > 0.8,
  'with the arm already moving the bank is still full: ' + (spFast.bank === undefined ? '?' : spFast.bank.toFixed(3)));
/* the same differential, at one instant, so the water cannot move between the
   two pictures: with the ring gone NOTHING on its circle changes */
say(fastPainted === 0,
  'and no ring is drawn there any more: ' + fastPainted + ' of 360 degrees moved the picture at r '
  + (ringFast ? ringFast.r.toFixed(1) : '?'));
await resume(page, wound2.slice(LOOPPTS + 8));
await waitFrames(page, 2);

/* ⛔⛔ THE LAKE DOES NOT SWING WHILE THE ARM IS MOVING, which is the page half
   of the 2026-09-07 turn change and the half no sim assertion can reach. The
   plant's per segment speed fade was removed because it was eating the middle of
   every ordinary swipe; what kept the THROW out of the plant was never that
   fade, it was the arm onset walk back, and the page has to use the same walk
   back for the lake it draws live as the release uses for the yaw it commits.
   With `plantYaw(samples, yaw0, samples.length - 1)` on the page instead, a
   thumb would watch the whole shore swing round as it threw and then snap back
   when the stone left, which is two rules for one gesture.
   ⛔ THE ARM HERE IS DISPATCHED WITH NO AWAIT AT ALL, on purpose. On two cores a
   13 ms step becomes 60 and a gate's intended flick arrives as a slow slide,
   which is how an earlier assertion in this file ended up measuring the driver's
   timers. A burst in one tick is fast whatever the box is doing. */
await dev(() => window.GERPLUNK_DEV.setYaw(-18));
await waitFrames(page, 2);
const swing = await page.evaluate(async (a) => {
  const el = document.elementFromPoint(a.x0, a.y0);
  if (!el) throw new Error('nothing at ' + a.x0 + ',' + a.y0);
  const base = { pointerId: 21, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
  const ev = (t, p) => new PointerEvent(t, Object.assign({}, base, { clientX: p.x, clientY: p.y }));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  el.dispatchEvent(ev('pointerdown', { x: a.x0, y: a.y0 }));
  let i;
  for (i = 1; i <= 6; i++) { await wait(45); el.dispatchEvent(ev('pointermove', { x: a.x0 + i * 10, y: a.y0 })); }
  const afterPlant = window.GERPLUNK_DEV.yaw();
  for (i = 1; i <= 6; i++) el.dispatchEvent(ev('pointermove', { x: a.x0 + 60 + i * 30, y: a.y0 - i * 7 }));
  const duringArm = window.GERPLUNK_DEV.yaw();
  const smp = window.GERPLUNK_DEV.samples();
  el.dispatchEvent(ev('pointerup', { x: a.x0 + 240, y: a.y0 - 42 }));
  return { afterPlant: afterPlant, duringArm: duringArm, n: smp ? smp.length : 0 };
}, { x0, y0 });
say(swing.afterPlant > -18 + 4,
  'a slow slide turns the lake live under the thumb: -18.0 to ' + swing.afterPlant.toFixed(1));
say(Math.abs(swing.duringArm - swing.afterPlant) < 1.5,
  'and the lake does not swing while the arm is moving: ' + swing.afterPlant.toFixed(1)
  + ' then ' + swing.duringArm.toFixed(1));
await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight, { timeout: 20000 }).catch(() => {});
await waitFrames(page, 2);

/* 12. THE RELEASE, SHOWN (call 58, 2026-09-08). His line 12: nothing showed
   the moment the stone left the hand. Now the ring freezes where the thumb
   let go, an angle line runs off along the throw with the magic angle dotted
   beside it, a spin arc rides with the stone, and the seam is the throw's own
   line until the next touch.
   ⛔ THE PICTURE IS READ AT THE INSTANT OF RELEASE, IN THE SAME TICK AS THE
   POINTERUP, by a differential (releaseInk: one instant painted with and
   without it, walked on the frozen ring's circle and along the angle line).
   A round trip to the driver after the up could land anywhere inside the 350
   ms and a slow box would read a red that is its own. Then the picture is
   polled every 20 ms from the same evaluate for 700 ms: it must be on at
   every sample up to 300 ms and off at some sample past 500. The ratio and
   the two times are literals here on purpose: reading LAKE.RELEASE_MS back
   would be a test of arithmetic. */
await settle();
await dev(() => window.GERPLUNK_DEV.setYaw(0));
await waitFrames(page, 2);
/* ⛔ THE STROKE STARTS AT THE LEFT, x 0.15 W, and is shorter than the others.
   The gate's usual stroke from 0.32 W ends at x 406 on a 375 px page, off the
   glass, which no thumb can do, and the first run of this section read the
   ring 129 of 129 degrees on screen and the line 0 of 0. The release point
   here is at about 0.72 W, so the ring's far side still leaves the glass at
   full bank, which is why the ring law below is a fraction of the degrees on
   screen with a floor on how many there are. */
const relX0 = Math.round(lay.W * 0.15);
let rel = null;
for (let go = 0; go < 3 && !(rel && rel.threw); go++) {
  if (go) { await settle(); }
  rel = await page.evaluate(async (pts) => {
    const el = document.elementFromPoint(pts[0].x, pts[0].y);
    if (!el) throw new Error('nothing at ' + pts[0].x + ',' + pts[0].y);
    const base = { pointerId: 31, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
    const ev = (type, p) => new PointerEvent(type, Object.assign({}, base, { clientX: p.x, clientY: p.y }));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    el.dispatchEvent(ev('pointerdown', pts[0]));
    for (let i = 1; i < pts.length; i++) { if (pts[i].dt) await wait(pts[i].dt); el.dispatchEvent(ev('pointermove', pts[i])); }
    el.dispatchEvent(ev('pointerup', pts[pts.length - 1]));
    const threw = window.GERPLUNK_DEV.state().inFlight;
    const ink = threw ? window.GERPLUNK_DEV.releaseInk() : null;
    const first = window.GERPLUNK_DEV.release();
    const seen = [], t0 = performance.now();
    while (performance.now() - t0 < 700) { await wait(20); const r = window.GERPLUNK_DEV.release(); seen.push({ t: performance.now() - t0, on: r.on, age: r.age }); }
    return { threw, ink, first, seen, th: window.GERPLUNK_DEV.lastThrow() };
  }, stroke({ x0: relX0, y0, arc: 240, ms: 150, rise: 0.55, hook: 0.7, n: 14 }));
  if (!rel.threw) console.log('        the release came out as a set down on attempt ' + (go + 1) + ', throwing it again');
}
say(!!rel && rel.threw, 'a real flick threw, so the release can be looked at');
const ink = rel && rel.ink;
say(!!ink && ink.ringOnScreen >= 240 && ink.ring >= ink.ringOnScreen * 0.92,
  'at the instant of release the ring is FROZEN on the water where the thumb let go, painted all the way round where the glass has it: '
  + (ink ? ink.ring + ' of ' + ink.ringOnScreen + ' degrees moved the picture at r ' + ink.r.toFixed(1) + ' about ' + ink.x.toFixed(0) + ',' + ink.y.toFixed(0) + ', age ' + ink.age.toFixed(0) + ' ms' : 'no picture'));
say(!!ink && ink.lineOnScreen >= 40 && ink.line >= ink.lineOnScreen * 0.8,
  'and the angle line runs off along the throw, outside a thumb pad: ' + (ink ? ink.line + ' of ' + ink.lineOnScreen + ' px along it moved the picture' : 'no picture'));
say(!!rel && rel.first.on && rel.first.rise > 0 && rel.first.rise < 1 && Math.abs(rel.first.spin - (rel.th ? rel.th.spin : 99)) < 1e-9,
  'the picture carries the throw\'s own numbers: rise ' + (rel ? rel.first.rise.toFixed(3) : '?') + ', spin ' + (rel ? rel.first.spin.toFixed(3) : '?') + ' (the throw\'s ' + (rel && rel.th ? rel.th.spin.toFixed(3) : '?') + ')');
const early = rel ? rel.seen.filter(s => s.t <= 300) : [];
say(early.length >= 8 && early.every(s => s.on),
  'and it is on the screen at every sample for the first 300 ms after the thumb lets go: ' + early.filter(s => s.on).length + ' of ' + early.length + ' samples on');
const late = rel ? rel.seen.filter(s => s.t >= 500) : [];
say(late.length >= 3 && late.some(s => !s.on),
  'and gone by half a second, a moment and not a widget: ' + late.filter(s => !s.on).length + ' of ' + late.length + ' late samples off (last age ' + (late.length ? late[late.length - 1].age.toFixed(0) : '?') + ' ms)');
/* the seam after the sink is the throw's own line. The readout's word for the
   curve is captured on the way, so it can be held against the model's own
   numbers for the same throw: two producers, one question. */
const relLine = await page.waitForFunction(() => {
  const el = document.getElementById('line');
  return window.GERPLUNK_DEV.state().sunk && el.classList.contains('on') && /magic angle/.test(el.textContent) ? el.textContent : null;
}, { timeout: 40000 }).then(h => h.jsonValue()).catch(() => null);
await settle();
const own = await dev(() => window.GERPLUNK_DEV.seam());
say(own.mine && !!own.sink && own.pts.length > 5, 'after the sink the seam on the water is the player\'s own line, not the preview (' + own.pts.length + ' points)');
const smEnd = own.pts[own.pts.length - 1];
say(own.mine && !!own.sink && Math.abs(smEnd.x - own.sink.x) < 1e-6 && Math.abs(smEnd.y - own.sink.y) < 1e-6,
  'and it ends exactly where the stone went under: ' + (own.sink ? own.sink.x.toFixed(2) + ', ' + own.sink.y.toFixed(2) : '?') + ' m');
/* THE SEAM LAW: the line on the water is the MODEL's own trace for the tuple
   the page says it threw, on the face it threw at, point for point; and it
   is not the nominal, whose end is a good throw's end and not this one's.
   A drawn line pasted from the nominal fails the first; a line drawn from a
   second physics fails it too. */
const ownTh = await dev(() => window.GERPLUNK_DEV.lastThrow());
const ownFace = ownTh ? await dev((yaw) => window.GERPLUNK_DEV.face(yaw), ownTh.yaw) : null;
const ownModel = ownTh ? SIM.runThrow(SIM.newThrow(ownTh), { water: ownFace.water, wind: ownFace.wind, reach: ownFace.reach, trace: true }) : null;
let offTrace = 0, onTrace = 0;
if (ownModel) {
  for (const p of own.pts) {
    let best = 1e9;
    for (const q of ownModel.trace) { const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < best) best = d; }
    if (Math.hypot(ownModel.sinkX - p.x, ownModel.sinkY - p.y) < best) best = Math.hypot(ownModel.sinkX - p.x, ownModel.sinkY - p.y);
    if (best < 1e-6) onTrace++; else { offTrace++; }
  }
}
say(!!ownModel && own.pts.length > 5 && offTrace === 0,
  'and every point of it lies on the model\'s own trace for the tuple the page threw (seed ' + (ownTh ? ownTh.seed : '?') + ', ' + (ownFace ? ownFace.face + ' face' : '?') + '): ' + onTrace + ' on, ' + offTrace + ' off');
const nomEnd = own.nominal[own.nominal.length - 1];
say(own.mine && !!own.sink && Math.hypot(own.sink.x - nomEnd.x, own.sink.y - nomEnd.y) > 1,
  'and it is not the nominal seam: the two lines end ' + (own.sink ? Math.hypot(own.sink.x - nomEnd.x, own.sink.y - nomEnd.y).toFixed(1) : '?') + ' m apart (yours at ' + (own.sink ? own.sink.x.toFixed(1) : '?') + ' m, the nominal at ' + nomEnd.x.toFixed(1) + ')');
say(own.tag === 'your line', 'and it is labelled as yours: ' + JSON.stringify(own.tag));
const tagMine = await dev(() => window.GERPLUNK_DEV.tagInk());
say(tagMine.of > 0 && tagMine.moved / tagMine.of > 0.25, 'and the label is painted: ' + tagMine.moved + ' of ' + tagMine.of + ' device pixels in its box moved for it');
/* the curve word against the model's numbers for the same throw */
const word = relLine ? (relLine.match(/and it (curled left|curled right|drifted left|drifted right|ran straight)\./) || [])[1] : null;
const agrees = word && own.sink && (
  (word === 'curled right' && own.sink.heading > 0 && Math.abs(own.sink.heading) >= 3) ||
  (word === 'curled left' && own.sink.heading < 0 && Math.abs(own.sink.heading) >= 3) ||
  (word === 'drifted right' && Math.abs(own.sink.heading) < 3 && own.sink.curveY > 0) ||
  (word === 'drifted left' && Math.abs(own.sink.heading) < 3 && own.sink.curveY < 0) ||
  (word === 'ran straight' && Math.abs(own.sink.heading) < 3 && Math.abs(own.sink.curveY) < 0.15));
say(!!agrees, 'the readout said the path ' + JSON.stringify(word) + ' and the model\'s own numbers agree: heading ' + (own.sink ? own.sink.heading.toFixed(1) + ' degrees, spin lateral ' + own.sink.curveY.toFixed(2) + ' m' : '?'));
/* a new touch brings the preview back, and after the first throw of the
   session it carries no ideal line tag */
await hold(page, [{ x: relX0, y: y0, dt: 0 }, { x: relX0 + 4, y: y0, dt: 60 }, { x: relX0 + 8, y: y0, dt: 60 }]);
await waitFrames(page, 2);
const smTouch = await dev(() => window.GERPLUNK_DEV.seam());
say(!smTouch.mine && smTouch.tag === '', 'under a new thumb the seam is the preview again, untagged: mine ' + smTouch.mine + ', tag ' + JSON.stringify(smTouch.tag));
await resume(page, [{ x: relX0 + 12, y: y0, dt: 60 }, { x: relX0 + 14, y: y0, dt: 80 }]);
await waitFrames(page, 2);
const smSet = await dev(() => ({ seam: window.GERPLUNK_DEV.seam(), inFlight: window.GERPLUNK_DEV.state().inFlight }));
say(!smSet.inFlight && !smSet.seam.mine, 'and after a set down it stays the preview: mine ' + smSet.seam.mine);

await browser.close();

/* 13. THE IDEAL LINE TAG IS INK, on a FRESH page, where a readback before the
   first stroke cannot stretch anything (see section 2). One instant painted
   with and without the tag; a tag that is a string in the state and no ink on
   the water reads zero. */
const fresh = await open(base);
await tap(fresh.page, '#btnPlay');
await fresh.page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 10000 });
await waitFrames(fresh.page, 3);
const tag0 = await fresh.page.evaluate(() => window.GERPLUNK_DEV.tagInk());
say(tag0.tag === 'ideal line' && tag0.of > 0 && tag0.moved / tag0.of > 0.25,
  'on a fresh lake the ideal line tag is painted on the water: ' + tag0.moved + ' of ' + tag0.of + ' device pixels in its box moved for ' + JSON.stringify(tag0.tag));
await fresh.browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' FLICK FAILURE(S)'); process.exit(1); }
console.log('FLICK OK');
