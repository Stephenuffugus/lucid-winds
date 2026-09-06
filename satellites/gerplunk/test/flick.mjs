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
 *   9. a weak lob, mostly up, is a throw that dies inside two skips
 *  10. a slow slide before the throw turns the lake, and the turn survives
 *
 * ⛔ every subject is asserted to EXIST and be VISIBLE before it is measured.
 * A gate that measures a hidden element measures nothing and reports PASS.
 */
import { serve, open, reporter, tap, centre, flick, hold, moveOn, resume, stroke, waitFrames, sleep } from './harness.mjs';

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

/* 9. a weak lob dies inside two skips */
await flick(page, stroke({ x0, y0: y0 + 40, arc: 210, ms: 230, rise: 0.92, hook: 0, n: 10 }));
await page.waitForFunction(() => window.GERPLUNK_DEV.save().throws === 2, { timeout: 30000 }).catch(() => {});
const lob = await dev(() => ({ res: window.GERPLUNK_DEV.lastResult(), th: window.GERPLUNK_DEV.lastThrow(), throws: window.GERPLUNK_DEV.save().throws }));
say(lob.throws === 2, 'the lob was a throw (' + (lob.th ? 'v ' + lob.th.v.toFixed(1) + ', theta ' + lob.th.theta.toFixed(1) : 'none') + ')');
say(lob.throws === 2 && lob.res.skips <= 2, 'and it died inside two skips: ' + (lob.res ? lob.res.skips : '?'));
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
   moved. So the ring is measured by reading the CANVAS on the annulus the ring
   would occupy, before the touch and again mid wind up, and the assertion is
   that the water there got brighter. Emptying drawSpinRing leaves the water and
   turns it red; changing the ring's colour or radius by a hair does not, which
   is the right sensitivity for a drawing.
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
/* the control is read at the EXACT point the thumb will be holding, with no
   touch on the screen, so the comparison is the same water either way */
const holdPt = wound[HOLD_AT - 1], fastPt = wound[LOOPPTS + 7];
const waterInk = await dev((cx, cy) => window.GERPLUNK_DEV.ink(cx, cy, 23, 45), holdPt.x, holdPt.y);
const waterInkFast = await dev((cx, cy) => window.GERPLUNK_DEV.ink(cx, cy, 23, 45), fastPt.x, fastPt.y);
await hold(page, wound.slice(0, HOLD_AT));
await waitFrames(page, 3);
const sp = await dev(() => window.GERPLUNK_DEV.spin());
say(sp.down && sp.bank > 0.55 && sp.bank < 0.9,
  'a loop and a half of the thumb banks most of the spin: ' + (sp.bank === undefined ? '?' : sp.bank.toFixed(3)));
const rNow = 26 + 16 * Math.abs(sp.bank || 0);
const ringInk = await dev((cx, cy, lo, hi) => window.GERPLUNK_DEV.ink(cx, cy, lo, hi), sp.x, sp.y, rNow - 3, rNow + 3);
say(ringInk > waterInk + 25,
  'and a ring is DRAWN under the thumb at that radius: the water there reads ' + waterInk.toFixed(0)
  + ' and with the ring on it ' + ringInk.toFixed(0) + ' (radius ' + rNow.toFixed(1) + ' px)');
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
const fastInk = await dev((cx, cy) => window.GERPLUNK_DEV.ink(cx, cy, 23, 45), spFast.x, spFast.y);
say(spFast.down && spFast.bank > 0.8,
  'with the arm already moving the bank is still full: ' + (spFast.bank === undefined ? '?' : spFast.bank.toFixed(3)));
say(fastInk < waterInkFast + 25,
  'and no ring is drawn there any more: ' + fastInk.toFixed(0) + ' against water ' + waterInkFast.toFixed(0));
await resume(page, wound2.slice(LOOPPTS + 8));
await waitFrames(page, 2);

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' FLICK FAILURE(S)'); process.exit(1); }
console.log('FLICK OK');
