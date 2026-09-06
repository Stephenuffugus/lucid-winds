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
import { serve, open, reporter, tap, centre, flick, stroke, waitFrames, sleep } from './harness.mjs';

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

await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' FLICK FAILURE(S)'); process.exit(1); }
console.log('FLICK OK');
