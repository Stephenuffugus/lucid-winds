#!/usr/bin/env node
/* YONDER P1: the road, Mode 2 FLAG and the traveler's walk (plans/yonder/HANDOFF-YONDER.md P1; the handoff's test gates
 * 3 and 4 on the page, Y3, Y4, Y6 and the reveal contract).
 *
 *   node test/play.mjs          (in the foreground, under the gate lock)
 *
 * Rounds are played by real pointer drags on the flag and by real keys. Every target and every road the page must show
 * come from engine.js and CORE's pure.js in Node for the same seed, never from the page; the page only declares the
 * road it drew (data-offset and data-width on #road) and when each walk began.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: nothing on the console, nothing fetched after load, no sideways scroll; the start, the flag
 *      and next are 56 px targets a thumb lands on
 *   2. the number on the page is the engine's target, round by round, the probe first at a new road
 *   3. the seam: the placement the page scored is where the thumb let go, read through toNormalized in Node, and its
 *      error is engine.js's scoreEstimate
 *   4. Y4: before the flag goes down the road carries its two ends and nothing else; no post, numeral or traveler
 *   5. Y6: next cannot be pressed until the walk is done, by thumb or by key
 *   6. the reveal: the flag stays where it was put; the traveler walks from the flag and ends on the true place; the
 *      true place's numeral is the target; it sits clear of the road's end numerals, inside the scene
 *   7. the same walk on every round: two rounds, one near and one far, walk on the same curve of progress in time and
 *      take the same time, and no colour in the scene differs between them or from the scene before any walk
 *   8. a probe round's walk is the slower one, and only the probe's
 *   9. at 1366x768 with no touch: Tab to start, Enter, arrows move the flag, Enter puts it down, next by Enter
 *  10. Y3 over 100 rounds played by keys: the road the page drew each round is the road pure.js deals for the seed,
 *      its width and offset spread and never repeat back to back; every numeral clear of the ends and in the scene
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng, lineGeometry, toNormalized, fromNormalized } from '../../math/core/pure.js';
import { generateStage, scoreEstimate, STAGE_SIZE } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242, MAX = 100;
const PAGE = { path: '/yonder/index.html?seed=' + SEED + '&', ready: 'window.YONDER && window.YONDER.ready' };
/* the targets round by round and the roads round by round, dealt in Node */
const TARGETS = [];
for (let n = 0; TARGETS.length < 130; n++) TARGETS.push(...generateStage(rng((SEED + n) >>> 0), MAX, { isNew: n === 0 }));
const ROADS = (() => { const r = rng((SEED + 7919) >>> 0); return Array.from({ length: 130 }, () => lineGeometry(r)); })();

/* the lane, the road the page says it drew, and the flag */
const lane = page => page.evaluate(() => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const line = document.querySelector('#road .lw-line').getBoundingClientRect();
  return { left: r.left, width: r.width, offset: Number(road.dataset.offset), widthPct: Number(road.dataset.width),
    lineLeft: line.left - r.left, lineWidth: line.width, stoneX: st ? parseFloat(st.style.left) : null };
});
/* a real drag of the flag to a fraction of the road; returns where the thumb let go */
const dragFlag = (page, frac) => page.evaluate(frac => {
  const road = document.getElementById('road'), r = road.getBoundingClientRect(), st = document.querySelector('#road .lw-stone');
  const a = st.getBoundingClientRect(), x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = r.left + r.width * (Number(road.dataset.offset) + frac * Number(road.dataset.width));
  const fire = (type, x) => (document.elementFromPoint(x, y0) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 31, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y0 }));
  fire('pointerdown', x0);
  for (let i = 1; i <= 8; i++) fire('pointermove', x0 + (x1 - x0) * i / 8);
  /* the flag is under the thumb all the way, and the pointer is captured by it, so the lift goes to the flag */
  st.dispatchEvent(new PointerEvent('pointerup', { pointerId: 31, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x1, clientY: y0 }));
  return { x: x1 - r.left, width: r.width };
}, frac);
/* the traveler frame by frame from the moment the flag goes down until the page says the walk is done */
const record = page => page.evaluate(() => {
  window.__walk = [];
  const grab = () => {
    const t = document.getElementById('traveler');
    window.__walk.push({ t: performance.now(), x: t.hidden ? null : parseFloat(t.style.left) });
    if (!window.YONDER.walkDone() || window.__walk.length < 3) requestAnimationFrame(grab);
  };
  requestAnimationFrame(grab);
});
const walkOf = async page => ({ frames: await page.evaluate(() => window.__walk), result: await page.evaluate(() => window.YONDER.results[window.YONDER.results.length - 1]) });
/* after the walk: the flag, the traveler, the post and the numeral, and whether the numeral sits clear */
const after = page => page.evaluate(() => {
  const road = document.getElementById('road'), rr = road.getBoundingClientRect(), sc = document.getElementById('scene').getBoundingClientRect();
  const truth = document.getElementById('truth'), tr = truth.getBoundingClientRect();
  const ends = Array.from(document.querySelectorAll('#road .lw-end')).map(e => e.getBoundingClientRect());
  const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  return { stoneX: parseFloat(document.querySelector('#road .lw-stone').style.left), travelerX: parseFloat(document.getElementById('traveler').style.left),
    markX: parseFloat(document.getElementById('truth-mark').style.left), truthText: truth.textContent, truthShown: !truth.hidden,
    width: rr.width, clash: ends.some(e => hit(e, tr)), inside: tr.left >= sc.left - 0.5 && tr.right <= sc.right + 0.5 && tr.bottom <= sc.bottom + 0.5 };
});
/* ⛔ the first version named each element by its whole className, so the flag's lw-locked after it went down read as a
   colour change against the scene before any walk; an element is named by its id or its first class, never its state */
const colours = page => page.evaluate(() => Array.from(document.querySelectorAll('#scene, #scene *')).map(el => {
  const cs = getComputedStyle(el); return [el.id || el.tagName + '.' + (el.classList[0] || ''), cs.color, cs.backgroundColor, cs.borderTopColor].join('|');
}).join('\n'));
/* what is on the road before the flag goes down */
const roadNow = page => page.evaluate(() => {
  const seen = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01 && r.width > 0 && r.height > 0; };
  const known = e => e.matches('.lw-line, .lw-end, .lw-stone, .lw-loupe, .lw-loupe *, #signpost');
  return { ends: document.querySelectorAll('#road .lw-end').length, extra: Array.from(document.querySelectorAll('#road *')).filter(e => seen(e) && !known(e)).map(e => e.id || e.className || e.tagName) };
});
/* the progress of a walk, 0 at the flag and 1 at the truth, against the time since it began */
const progress = rec => {
  const r = rec.result, f0 = rec.frames.find(f => f.x !== null);
  if (!r || !f0) return [];
  const from = rec.frames.filter(f => f.x !== null)[0].x, to = rec.frames.filter(f => f.x !== null).slice(-1)[0].x;
  return rec.frames.filter(f => f.x !== null && f.t >= r.revealAt && Math.abs(to - from) > 1).map(f => ({ dt: f.t - r.revealAt, p: (f.x - from) / (to - from) }));
};
function sameCurve(a, b) {
  const interp = (c, dt) => { for (let i = 0; i + 1 < c.length; i++) if (c[i].dt <= dt && dt <= c[i + 1].dt) return c[i].p + (c[i + 1].p - c[i].p) * (dt - c[i].dt) / ((c[i + 1].dt - c[i].dt) || 1); return null; };
  let worst = 0, n = 0;
  for (const x of a) { const y = interp(b, x.dt); if (y !== null) { worst = Math.max(worst, Math.abs(x.p - y)); n++; } }
  return { worst, n };
}

/* the seam and the reveal, for one played round */
function checkRound(label, rec, drop, done, L) {
  const r = rec.result;
  const want = TARGETS[r.round];
  say(r.target === want, label + ' the number played is the engine\'s target for round ' + r.round + ' (' + r.target + ', the engine ' + want + ')');
  const g = ROADS[r.round];
  say(Math.abs(r.geom.offsetPct - g.offsetPct) < 1e-9 && Math.abs(r.geom.widthPct - g.widthPct) < 1e-9,
    label + ' the road is the one pure.js deals for this round (' + r.geom.widthPct.toFixed(4) + ' wide at ' + r.geom.offsetPct.toFixed(4) + ')');
  if (drop) {
    const expect = Math.min(1, Math.max(0, toNormalized(drop.x, g, drop.width))) * MAX;
    say(Math.abs(r.placement - expect) < 0.05, label + ' the placement scored is where the thumb let go, read in Node (' + r.placement.toFixed(3) + ', Node ' + expect.toFixed(3) + ')');
  }
  say(Math.abs(r.placement - r.value * MAX) < 1e-9 && r.pae === scoreEstimate(r.placement, r.target, { min: 0, max: MAX }),
    label + ' its error is engine.js\'s scoreEstimate (' + r.pae.toFixed(4) + ')');
  const fx = fromNormalized(r.value, g, done.width), tx = fromNormalized(r.target / MAX, g, done.width);
  const firstX = rec.frames.find(f => f.x !== null);
  say(Math.abs(done.stoneX - fx) <= 1, label + ' the flag stays where it was put (' + done.stoneX.toFixed(1) + ' px, put at ' + fx.toFixed(1) + ')');
  say(!!firstX && Math.abs(firstX.x - fx) <= 3 && Math.abs(done.travelerX - tx) <= 1 && Math.abs(done.markX - tx) <= 1,
    label + ' the traveler starts at the flag and ends on the true place, where the post stands (from ' + (firstX ? firstX.x.toFixed(1) : 'nowhere') + ' to ' + done.travelerX.toFixed(1) + ', truth ' + tx.toFixed(1) + ')');
  say(done.truthShown && done.truthText === String(r.target), label + ' the true place\'s numeral is the target (' + JSON.stringify(done.truthText) + ')');
  say(!done.clash && done.inside, label + ' and it sits clear of the road\'s end numerals, inside the scene' + (done.clash ? ' (it overlaps an end)' : '') + (done.inside ? '' : ' (it is cut by the scene)'));
}

/* ---- the phones ---- */
for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  say(await page.evaluate(() => window.YONDER.max()) === MAX, at + ' the page plays the road to ' + MAX);
  const start = await centre(page, '#start');
  say(!!start && start.w >= 56 && start.h >= 56 && start.onTop, at + ' the start is a 56 px target (' + (start ? Math.round(start.w) + 'x' + Math.round(start.h) : 'missing') + ')');
  await tap(page, '#start');
  await sleep(250);
  const baseline = await colours(page);
  const before = await roadNow(page);
  say(before.ends === 2 && before.extra.length === 0, at + ' before the flag goes down the road carries its two ends and nothing else (Y4) (' + before.ends + ' ends' + (before.extra.length ? ', and ' + before.extra.join(', ') : '') + ')');
  const shown = await page.$eval('#target', e => e.textContent);
  say(shown === String(TARGETS[0]), at + ' the number at the top is the engine\'s first target, the probe (' + shown + ')');
  const flag = await centre(page, '#road .lw-stone');
  say(!!flag && flag.w >= 56 && flag.h >= 56 && flag.onTop, at + ' the flag is a 56 px target a thumb lands on (' + (flag ? Math.round(flag.w) + 'x' + Math.round(flag.h) + (flag.onTop ? '' : ' COVERED') : 'missing') + ')');

  /* round 1, the probe, put down far past it */
  await record(page);
  const drop1 = await dragFlag(page, 0.7);
  await sleep(250);
  const nextSpot = await page.evaluate(() => { const r = document.getElementById('next').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const early = await page.evaluate(([x, y]) => { const hit = document.elementFromPoint(x, y); return { onNext: !!hit && hit.closest && !!hit.closest('#next'), done: window.YONDER.walkDone() }; }, nextSpot);
  const roundBefore = await page.evaluate(() => window.YONDER.round());
  await page.evaluate(([x, y]) => { const hit = document.elementFromPoint(x, y) || document.body; const o = { pointerId: 32, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y };
    hit.dispatchEvent(new PointerEvent('pointerdown', o)); hit.dispatchEvent(new PointerEvent('pointerup', o)); if (typeof hit.click === 'function') hit.click(); }, nextSpot);
  const roundAfter = await page.evaluate(() => window.YONDER.round());
  say(!early.done && !early.onNext && roundAfter === roundBefore, at + ' during the walk a thumb on next\'s place presses nothing (Y6) (on next: ' + early.onNext + ', round ' + roundBefore + ' then ' + roundAfter + ')');
  await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
  await sleep(120);
  const probe = await walkOf(page);
  checkRound(at + ' round 1:', probe, drop1, await after(page));
  const nx = await centre(page, '#next');
  say(!!nx && nx.w >= 56 && nx.h >= 56 && nx.onTop, at + ' next is a 56 px target once the walk is done (' + (nx ? Math.round(nx.w) + 'x' + Math.round(nx.h) : 'missing') + ')');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');

  if (size.width === 375) {
    /* round 2 near the truth, round 3 far from it: the same walk */
    const recs = [];
    for (const [k, off] of [[1, 0.03], [2, 0.45]]) {
      await tap(page, '#next');
      await sleep(250);
      const again = await roadNow(page);
      say(again.ends === 2 && again.extra.length === 0, at + ' round ' + (k + 1) + ': before the flag goes down, only the two ends again (' + (again.extra.join(', ') || 'nothing else') + ')');
      const t = TARGETS[k] / MAX, frac = t + off <= 1 ? t + off : t - off;
      await record(page);
      const drop = await dragFlag(page, frac);
      await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
      await sleep(120);
      const rec = await walkOf(page);
      checkRound(at + ' round ' + (k + 1) + ':', rec, drop, await after(page));
      rec.colours = await colours(page);
      recs.push(rec);
    }
    const [near, far] = recs;
    const { worst, n } = sameCurve(progress(near), progress(far));
    say(n >= 20 && worst < 0.05 && near.result.walkMs === far.result.walkMs,
      at + ' a near round and a far round walk on the same curve in the same time (largest difference ' + worst.toFixed(3) + ' over ' + n + ' frames, ' + near.result.walkMs + ' and ' + far.result.walkMs + ' ms)');
    say(near.colours === far.colours && near.colours === baseline, at + ' and no colour in the scene differs between them, or from the scene before any walk');
    say(probe.result.isProbe && !near.result.isProbe && !far.result.isProbe && probe.result.walkMs > near.result.walkMs,
      at + ' the probe\'s walk is the slower one, and only the probe is a probe (' + probe.result.walkMs + ' ms against ' + near.result.walkMs + ')');
  }

  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keys: one round by arrows, then a hundred rounds for Y3 ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  /* less motion is the device's own wish here, so a hundred walks fit a gate; the walk still walks */
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'ArrowRight', times: 20 }, 'Enter'],
    () => window.YONDER.results.length > 0);
  const first = await page.evaluate(() => window.YONDER.results[0] || null);
  say(kb.ok && !!first && Math.abs(first.value - 0.2) < 1e-9 && first.byKey, '1366x768 keyboard Tab to start, Enter, twenty presses of arrow right, Enter puts the flag down at a fifth of the road (' + kb.detail + ', ' + (first ? first.value : 'none') + ')');
  const earlyKey = await page.evaluate(() => window.YONDER.round());
  await page.keyboard.press('Enter');
  const stillKey = await page.evaluate(() => window.YONDER.round());
  say(earlyKey === stillKey, '1366x768 keyboard Enter during the walk starts no new round (Y6) (' + earlyKey + ' then ' + stillKey + ')');
  await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 30000 });
  await sleep(100);
  const focusNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(focusNext === 'next', '1366x768 keyboard once the walk is done, focus is on next (' + focusNext + ')');

  const rows = [], bad = [];
  for (let i = 1; i <= 100; i++) {
    await page.keyboard.press('Enter');
    await page.waitForFunction(i => window.YONDER.round() === i, { timeout: 10000 }, i).catch(() => {});
    const L = await lane(page);
    rows.push(L);
    /* a flag put down at the start, at the far end, or ten steps in */
    if (i % 3 === 1) await page.keyboard.press('End');
    else if (i % 3 === 2) for (let k = 0; k < 10; k++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.YONDER.walkDone(), { timeout: 10000 }).catch(() => bad.push('round ' + i + ' never finished its walk'));
    const d = await after(page);
    if (d.clash || !d.inside) bad.push('round ' + i + ' numeral ' + d.truthText + (d.clash ? ' overlaps an end' : ' is cut by the scene'));
  }
  const results = await page.evaluate(() => window.YONDER.results);
  const played = results.slice(1);
  say(played.length === 100 && bad.length === 0, '1366x768 a hundred rounds played by keys, every walk finished, every numeral clear of the ends and inside the scene' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ' (' + played.length + ')'));
  const wrongTarget = played.filter(r => r.target !== TARGETS[r.round]).map(r => r.round);
  say(wrongTarget.length === 0, '1366x768 every round\'s number is the engine\'s target, stage after stage' + (wrongTarget.length ? ' (rounds ' + wrongTarget.slice(0, 5).join(', ') + ')' : ''));
  const wrongRoad = rows.map((L, k) => ({ L, g: ROADS[k + 1], k: k + 1 })).filter(({ L, g }) => Math.abs(L.offset - g.offsetPct) > 1e-9 || Math.abs(L.widthPct - g.widthPct) > 1e-9
    || Math.abs(L.lineLeft - g.offsetPct * L.width) > 1 || Math.abs(L.lineWidth - g.widthPct * L.width) > 1).map(x => x.k);
  say(wrongRoad.length === 0, '1366x768 the road drawn each round is the road pure.js deals for the seed, as declared and as drawn' + (wrongRoad.length ? ' (rounds ' + wrongRoad.slice(0, 5).join(', ') + ')' : ''));
  const sd = a => { const mu = a.reduce((p, c) => p + c, 0) / a.length; return Math.sqrt(a.reduce((p, c) => p + (c - mu) * (c - mu), 0) / a.length); };
  const widths = rows.map(L => L.lineWidth / L.width), offsets = rows.map(L => L.lineLeft / L.width);
  const repeats = rows.filter((L, k) => k && Math.abs(widths[k] - widths[k - 1]) < 1e-4 && Math.abs(offsets[k] - offsets[k - 1]) < 1e-4).length;
  say(sd(widths) > 0.03 && sd(offsets) > 0.01 && repeats === 0, '1366x768 over a hundred rounds the road\'s width and offset spread and never repeat back to back (Y3) (spread of width '
    + sd(widths).toFixed(3) + ', of offset ' + sd(offsets).toFixed(3) + ', ' + repeats + ' repeats)');
  const probes = results.filter(r => r.isProbe).map(r => r.round);
  say(probes.length === 1 && probes[0] === 0, '1366x768 only the first round at the new road is a probe (' + probes.join(', ') + ')');
  const unscored = results.filter(r => r.pae !== scoreEstimate(r.placement, r.target, { min: 0, max: MAX })).length;
  say(unscored === 0, '1366x768 every round\'s error is engine.js\'s scoreEstimate (' + unscored + ' differ)');
  say(STAGE_SIZE[MAX] === 10 && results.filter(r => r.stage === 10).length > 0, '1366x768 the rounds ran on across stage after stage (' + (results[results.length - 1] || {}).stage + ' stages begun)');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLAY FAILURE(S)'); process.exit(1); }
console.log('PLAY OK');
