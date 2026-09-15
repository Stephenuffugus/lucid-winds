#!/usr/bin/env node
/* CREASE P1: FREEHAND and the reveal (plans/crease/HANDOFF-CREASE.md P1; the handoff's test gates 3, 4 and 6 on the page,
 * C1, C2, C5, C8 and the reveal contract).
 *
 *   node test/freehand.mjs          (in the foreground, under the gate lock)
 *
 * Rounds are played by real pointer drags on the clip and by real keys. Every task the page must show is replayed in Node
 * from engine.js and CORE's pure.js for the same seed, the tier fed from the page's own results through adaptTier; the
 * page only declares the strip it drew (data-offset, data-width, data-whole on #strip) and when each reveal began.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: nothing on the console, nothing fetched after load, no sideways scroll; the start, the clip and
 *      next are 56 px targets a thumb lands on
 *   2. the fraction at the top and the strip's whole are Node's task for the round, round after round
 *   3. the seam: the placement scored is where the thumb let go, read through toNormalized in Node, and the result is
 *      engine.js's scoreAttempt at the tier the page was on
 *   4. C2 and C5: before the clip goes down, and while it is dragged, the strip holds no crease, no tick, no label and no
 *      truth: only its line, its two ends, its pins and the clip
 *   5. the reveal: the clip stays where it was put; the truth's clip stands at the true place; the gap between them is
 *      hatched exactly from one to the other; the strip creases itself into whole times denominator equal parts, every
 *      crease at its own k over that count to the pixel; the true place's crease, and only it, carries the fraction (C8)
 *   6. the same reveal on every path: a near round and a far round fade the truth in on the same curve in time, and no
 *      colour in the scene differs between them or from the scene before any reveal
 *   7. at 1366x768 with no touch: Tab to start, Enter, arrows move the clip, Enter puts it down, next by Enter
 *   8. C1 over 100 rounds played by keys: each strip is the one pure.js deals for the round, as declared and as drawn; width
 *      and offset spread and never repeat back to back
 *   9. the tier ladder on the page is adaptTier on the page's own results, and placing every clip exactly climbs it
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng, toNormalized, fromNormalized, adaptTier } from '../../math/core/pure.js';
import { freshRun, generateTask, scoreAttempt, TIER_CONFIG } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.CREASE && window.CREASE.ready';
const PAGE = { path: '/crease/index.html?seed=' + SEED + '&mode=freehand&', ready: READY };

/* the page's tasks replayed in Node: one generator state, the tier before each task from the results before it */
function replay(results, n) {
  const r = rng(SEED >>> 0);
  let state = freshRun({ grade: 3, mode: 'freehand' });
  const tasks = [];
  for (let i = 0; i < n; i++) {
    state.tier = adaptTier(results.slice(0, i).map(x => x.correct), TIER_CONFIG);
    const step = generateTask(r, state);
    tasks.push(step.task);
    state = step.state;
  }
  return tasks;
}
const same = (a, b) => a && b && a.numerator === b.numerator && a.denominator === b.denominator && a.whole === b.whole
  && Math.abs(a.strip.widthPct - b.strip.widthPct) < 1e-12 && Math.abs(a.strip.offsetPct - b.strip.offsetPct) < 1e-12 && a.tier === b.tier;

const strip = page => page.evaluate(() => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), line = el.querySelector('.lw-line').getBoundingClientRect();
  return { left: r.left, width: r.width, offset: Number(el.dataset.offset), widthPct: Number(el.dataset.width), whole: Number(el.dataset.whole),
    lineLeft: line.left - r.left, lineWidth: line.width };
});
const shown = page => page.evaluate(() => ({ num: Number(document.querySelector('#target .num').textContent), den: Number(document.querySelector('#target .den').textContent) }));
/* a real drag of the clip to a fraction of the strip; returns where the thumb let go */
const dragClip = (page, frac) => page.evaluate(frac => {
  const el = document.getElementById('strip'), r = el.getBoundingClientRect(), st = el.querySelector('.lw-stone');
  const a = st.getBoundingClientRect(), y = a.top + a.height / 2, x0 = a.left + a.width / 2;
  const x1 = r.left + r.width * (Number(el.dataset.offset) + frac * Number(el.dataset.width));
  const o = x => ({ pointerId: 171, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y });
  st.dispatchEvent(new PointerEvent('pointerdown', o(x0)));
  for (let i = 1; i <= 6; i++) st.dispatchEvent(new PointerEvent('pointermove', o(x0 + (x1 - x0) * i / 6)));
  window.__during = Array.from(el.querySelectorAll('.crease, .crease-label, #truth-clip, #gap')).filter(e => getComputedStyle(e).display !== 'none' && Number(getComputedStyle(e).opacity) > 0.01).length;
  st.dispatchEvent(new PointerEvent('pointerup', o(x1)));
  return { x: x1 - r.left, width: r.width };
}, frac);
/* what stands in the strip that is not its line, ends, pins, clip or the loupe */
const extras = page => page.evaluate(() => {
  const seen = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01 && r.width > 0 && r.height > 0; };
  const known = e => e.matches('.lw-line, .lw-end, .lw-stone, .lw-stone *, .lw-loupe, .lw-loupe *, .pin, .pin *');
  return Array.from(document.querySelectorAll('#strip *')).filter(e => seen(e) && !known(e)).map(e => e.id || e.className || e.tagName);
});
const revealed = page => page.waitForFunction(() => window.CREASE.revealDone(), { timeout: 30000 }).then(() => sleep(120));
const record = page => page.evaluate(() => {
  window.__frames = [];
  const grab = () => {
    const t = document.getElementById('truth-clip');
    window.__frames.push({ t: performance.now(), o: t ? Number(getComputedStyle(t).opacity) : 0 });
    if (!window.CREASE.revealDone() || window.__frames.length < 3) requestAnimationFrame(grab);
  };
  requestAnimationFrame(grab);
});
const after = page => page.evaluate(() => {
  const el = document.getElementById('strip'), W = el.getBoundingClientRect().width;
  const px = e => parseFloat(e.style.left);
  const creases = Array.from(el.querySelectorAll('.crease')).map(c => ({ x: px(c), label: (c.querySelector('.crease-label') || {}).textContent || '',
    unit: c.classList.contains('unit'), h: c.getBoundingClientRect().height }));
  const gap = document.getElementById('gap');
  /* the true crease's label against the strip's two end numerals, as drawn */
  const tag = el.querySelector('.crease-label'), box = tag ? tag.getBoundingClientRect() : null;
  const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  const labelClash = !!box && Array.from(el.querySelectorAll('.lw-end')).some(e => hit(e.getBoundingClientRect(), box));
  return { W, clipX: px(el.querySelector('.lw-stone')), truthX: px(document.getElementById('truth-clip')), gapLeft: px(gap), gapWidth: parseFloat(gap.style.width), creases,
    hatched: /repeating-linear-gradient/.test(getComputedStyle(gap).backgroundImage), labelClash };
});
/* ⛔ the first version joined the whole scene into one string; the reveal ADDS the truth's clip and the gap, so any shot
   after a reveal held lines the shot before it could not, and the law went red without saying whether a colour had changed.
   Each element is keyed by its id or first class; the law holds every element of the scene before the reveal to its own
   colours after, and the near round's scene to the far round's entirely. */
const colours = page => page.evaluate(() => {
  const out = {};
  for (const el of document.querySelectorAll('#scene, #scene *')) {
    if (el.matches('.crease, .crease *')) continue;
    const cs = getComputedStyle(el), k = el.id || el.tagName + '.' + (el.classList[0] || '');
    out[k] = [cs.color, cs.backgroundColor, cs.borderTopColor, cs.backgroundImage].join('|');
  }
  return out;
});
const sameColours = (a, b) => Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(k => a[k] === b[k]);
const keepsBaseline = (base, after) => Object.keys(base).every(k => after[k] === base[k]);

function checkReveal(label, result, drop, done, task) {
  const g = task.strip, W = done.W, value = task.numerator / task.denominator;
  if (drop) {
    const expect = Math.min(1, Math.max(0, toNormalized(drop.x, g, drop.width))) * task.whole;
    say(Math.abs(result.placement - expect) < 0.005 * task.whole, label + ' the placement scored is where the thumb let go, read in Node (' + result.placement.toFixed(3) + ', Node ' + expect.toFixed(3) + ')');
  }
  const want = scoreAttempt(task, result.placement, task.tier);
  say(result.pae === want.pae && result.correct === want.correct && result.near === want.near, label + ' the result is engine.js\'s scoreAttempt at tier ' + task.tier + ' (' + JSON.stringify({ pae: result.pae, correct: result.correct }) + ')');
  const clipAt = fromNormalized(result.placement / task.whole, g, W), truthAt = fromNormalized(value / task.whole, g, W);
  say(Math.abs(done.clipX - clipAt) <= 1 && Math.abs(done.truthX - truthAt) <= 1, label + ' the clip stays where it was put and the truth\'s clip stands at the true place (' + done.clipX.toFixed(1) + '/' + clipAt.toFixed(1) + ', ' + done.truthX.toFixed(1) + '/' + truthAt.toFixed(1) + ')');
  say(done.hatched && Math.abs(done.gapLeft - Math.min(clipAt, truthAt)) <= 1 && Math.abs(done.gapWidth - Math.abs(truthAt - clipAt)) <= 1, label + ' the gap is hatched from the clip to the truth (' + done.gapLeft.toFixed(1) + ' + ' + done.gapWidth.toFixed(1) + ')');
  const parts = task.whole * task.denominator;
  const off = done.creases.filter((c, k) => Math.abs(c.x - fromNormalized((k + 1) / parts, g, W)) > 0.5);
  say(done.creases.length === parts - 1 && off.length === 0, label + ' the strip creases itself into ' + parts + ' equal parts, every crease at its own place (' + done.creases.length + ' creases, ' + off.length + ' off)');
  /* the creases are at k over whole times denominator, so the true place, numerator over denominator of a whole of
     `whole`, is crease k = numerator (1 is the first crease, the strip's ends are not creases) */
  /* a whole's end (every denominator-th crease) is a taller crease, so a strip longer than one shows where 1 and 2 are */
  const units = done.creases.map((c, k) => ({ k: k + 1, unit: c.unit, h: c.h })).filter(c => c.k % task.denominator === 0);
  const plain = done.creases.filter((c, k) => (k + 1) % task.denominator !== 0);
  say(units.every(c => c.unit) && plain.every(c => !c.unit) && units.every(c => plain.every(p => c.h > p.h)),
    label + ' every whole\'s end is a taller crease and no other crease is (' + units.length + ' of them, ' + (task.whole - 1) + ' wanted)');
  say(units.length === task.whole - 1, label + ' and there is one at each whole inside the strip (' + units.length + ')');
  say(!done.labelClash, label + ' the fraction on the true crease sits clear of the strip\'s end numerals');
  const labelled = done.creases.map((c, k) => ({ k: k + 1, label: c.label })).filter(c => c.label);
  say(labelled.length === 1 && labelled[0].k === task.numerator && labelled[0].label === task.numerator + '/' + task.denominator,
    label + ' the true place\'s crease, and only it, carries ' + task.numerator + '/' + task.denominator + ' (' + JSON.stringify(labelled) + ', crease ' + task.numerator + ')');
}

/* ---- the phones ---- */
for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  const start = await centre(page, '#start');
  say(!!start && start.w >= 56 && start.h >= 56 && start.onTop, at + ' the start is a 56 px target');
  await tap(page, '#start');
  await sleep(250);
  const baseline = await colours(page);
  const clip = await centre(page, '#strip .lw-stone');
  say(!!clip && clip.w >= 56 && clip.h >= 56 && clip.onTop, at + ' the clip is a 56 px target a thumb lands on');
  const before = await extras(page);
  say(before.length === 0, at + ' before the clip goes down the strip holds no crease, tick, label or truth (C2, C5)' + (before.length ? ': ' + before.join(', ') : ''));
  const recs = [];
  const rounds = size.width === 375 ? 3 : 1;
  for (let k = 0; k < rounds; k++) {
    if (k) { await tap(page, '#next'); await sleep(250); }
    const results = await page.evaluate(() => window.CREASE.results);
    const task = replay(results, k + 1)[k];
    const pageTask = await page.evaluate(() => window.CREASE.task());
    const top = await shown(page), st = await strip(page);
    say(same(pageTask, task) && top.num === task.numerator && top.den === task.denominator && st.whole === task.whole,
      at + ' round ' + (k + 1) + ': the fraction and the whole are Node\'s task (' + top.num + '/' + top.den + ' of ' + st.whole + ', Node ' + task.numerator + '/' + task.denominator + ' of ' + task.whole + ')');
    const value = task.numerator / task.denominator / task.whole, frac = k === 1 ? Math.min(1, value + 0.02) : (value + 0.45 <= 1 ? value + 0.45 : value - 0.45);
    await record(page);
    const drop = await dragClip(page, frac);
    const during = await page.evaluate(() => window.__during);
    say(during === 0, at + ' round ' + (k + 1) + ': while the clip is dragged the strip shows no crease, label or truth (' + during + ')');
    await revealed(page);
    const result = await page.evaluate(() => window.CREASE.results[window.CREASE.results.length - 1]);
    const done = await after(page);
    checkReveal(at + ' round ' + (k + 1) + ':', result, drop, done, task);
    recs.push({ frames: await page.evaluate(() => window.__frames), result, colours: await colours(page) });
  }
  if (size.width === 375) {
    const curve = rec => rec.frames.filter(f => f.t >= rec.result.revealAt).map(f => ({ dt: f.t - rec.result.revealAt, o: f.o }));
    const a = curve(recs[1]), b = curve(recs[2]);
    let worst = 0, n = 0;
    for (const x of a) { for (let i = 0; i + 1 < b.length; i++) if (b[i].dt <= x.dt && x.dt <= b[i + 1].dt) { const y = b[i].o + (b[i + 1].o - b[i].o) * (x.dt - b[i].dt) / ((b[i + 1].dt - b[i].dt) || 1); worst = Math.max(worst, Math.abs(x.o - y)); n++; break; } }
    say(n >= 10 && worst < 0.06, at + ' a near round and a far round fade the truth in on the same curve (largest difference ' + worst.toFixed(3) + ' over ' + n + ' frames)');
    say(sameColours(recs[1].colours, recs[2].colours) && keepsBaseline(baseline, recs[1].colours) && keepsBaseline(baseline, recs[2].colours), at + ' and no colour in the scene differs between them, and nothing that stood before the reveal changed colour');
  }
  const nx = await centre(page, '#next');
  say(!!nx && nx.w >= 56 && nx.h >= 56 && nx.onTop, at + ' next is a 56 px target once the reveal is done');
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- the Chromebook, by keys: one round by arrows, then a hundred rounds placed exactly ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#start' }, 'Enter', { key: 'ArrowRight', times: 25 }, 'Enter'], () => window.CREASE.results.length > 0);
  const first = await page.evaluate(() => window.CREASE.results[0] || null);
  say(kb.ok && !!first && first.byKey, '1366x768 keyboard Tab to start, Enter, arrows move the clip, Enter puts it down (' + kb.detail + ')');
  await revealed(page);
  const focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(focus === 'next', '1366x768 keyboard once the reveal is done, focus is on next (' + focus + ')');
  const rows = [], bad = [];
  let shelves = 0;
  for (let i = 1; i <= 100; i++) {
    await page.keyboard.press('Enter');
    await page.waitForFunction(i => window.CREASE.round() === i, { timeout: 10000 }, i).catch(() => {});
    /* a run ends every `count` rounds and its shelf opens over the next round with focus on go; a child at a keyboard presses
       Enter and plays the round under it.
       ⛔ this loop was written before runs ended: it waited on a round the shelf covered, every reveal timed out, and the
       check hung for most of an hour */
    if (await page.evaluate(() => window.CREASE.shelf.shown())) {
      shelves++;
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => !window.CREASE.shelf.shown() && !!document.activeElement && document.activeElement.classList.contains('lw-stone'), { timeout: 10000 })
        .catch(() => bad.push('round ' + i + ': the shelf did not close onto the clip by keys'));
    }
    rows.push(await strip(page));
    const t = await page.evaluate(() => window.CREASE.task());
    /* exactly: a hundredth of the strip a press, or as near as a hundredth gets */
    const presses = Math.round(t.numerator / t.denominator / t.whole * 100);
    for (let k = 0; k < presses; k++) await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await revealed(page).catch(() => bad.push('round ' + i + ' never finished its reveal'));
  }
  const results = await page.evaluate(() => window.CREASE.results);
  const tasks = replay(results, results.length);
  const pageTasks = await page.evaluate(() => window.CREASE.tasks());
  const wrong = pageTasks.map((t, i) => same(t, tasks[i]) ? null : i).filter(i => i !== null);
  say(results.length === 101 && bad.length === 0 && wrong.length === 0 && shelves === 10, '1366x768 a hundred rounds by keys, the shelf opened and closed by keys after every tenth (' + shelves + ' of 10), every task Node\'s replay with the tier from the page\'s own results' + (wrong.length ? ' (rounds ' + wrong.slice(0, 5).join(', ') + ')' : '') + (bad.length ? ': ' + bad[0] : ''));
  const offDrawn = rows.map((L, k) => ({ L, g: tasks[k + 1].strip, k: k + 1 })).filter(({ L, g }) => Math.abs(L.lineLeft - g.offsetPct * L.width) > 1 || Math.abs(L.lineWidth - g.widthPct * L.width) > 1).map(x => x.k);
  say(offDrawn.length === 0, '1366x768 every strip is drawn at the geometry pure.js deals for its round (C1)' + (offDrawn.length ? ' (rounds ' + offDrawn.slice(0, 5).join(', ') + ')' : ''));
  const sd = a => { const mu = a.reduce((p, c) => p + c, 0) / a.length; return Math.sqrt(a.reduce((p, c) => p + (c - mu) * (c - mu), 0) / a.length); };
  const widths = rows.map(L => L.lineWidth / L.width), offsets = rows.map(L => L.lineLeft / L.width);
  const repeats = rows.filter((L, k) => k && Math.abs(widths[k] - widths[k - 1]) < 1e-4 && Math.abs(offsets[k] - offsets[k - 1]) < 1e-4).length;
  say(sd(widths) > 0.03 && sd(offsets) > 0.01 && repeats === 0, '1366x768 over a hundred rounds the strip\'s width and offset spread and never repeat back to back (spread ' + sd(widths).toFixed(3) + ', ' + sd(offsets).toFixed(3) + ', ' + repeats + ' repeats)');
  const tiers = await page.evaluate(() => window.CREASE.tier());
  const want = adaptTier(results.map(r => r.correct), TIER_CONFIG);
  say(tiers === want && want > 0, '1366x768 the tier the page keeps is adaptTier on its own results, and exact placing climbed it (' + tiers + ', Node ' + want + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' FREEHAND FAILURE(S)'); process.exit(1); }
console.log('FREEHAND OK');
