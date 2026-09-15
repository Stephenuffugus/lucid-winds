#!/usr/bin/env node
/* SPAN P1: the canyon, Mode 2 THE BLANK and the pier reveal (plans/span/HANDOFF-SPAN.md P1; the handoff's
 * build steps 1, 3 and 4, and its test gate 8).
 *
 *   node test/play.mjs          (in the foreground, under the gate lock)
 *
 * Rounds are played by real pointer drags, a real long press and real keys. The equation the page must show
 * and every value the reveal must draw come from engine.js in Node for the same seed, never from the page:
 * the page only declares how it draws (the pier base and the unit on #canyon) and when each reveal began.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 320, 375 and 412: nothing on the console, nothing fetched after load, no sideways scroll, and the
 *      start, the stone supply, the lay control and next are 56 px targets a thumb lands on
 *   2. the first item on the page is the engine's first item, term for term, with the blank on the right side
 *   3. a stone dragged onto the blank's pier counts in the blank; a long press on the supply adds five
 *   4. the reveal draws both piers at their true heights (base plus value times unit), the shortfall exactly
 *      the difference, the span flat when the sides are the same and tilted toward the lower side when not
 *   5. the caption is a fact: "is the same as" when they are, both values when not, never a verdict word
 *   6. the seam: the page's verdict for each laid span is engine.js's evaluate for that item and that fill
 *   7. a right round and a wrong round run the same reveal (the shortfall's and the caption's opacity as a
 *      function of time since each reveal began), and no computed colour in the canyon differs between them
 *   8. at 1366x768 with no touch: Tab to start, Enter, Tab to the canyon, arrow up, Enter lays a span, and a
 *      digit key changes nothing (S5)
 *   9. while a child builds, nothing drawn carries the sides' values: both piers stand at one height no stone
 *      changes, and no span is shown until it is laid (the reveal contract's rules 1 and 2, the mark first)
 *  10. the seat (handoff step 1): a stone put on the pier drops the last inch and dust lifts, then all is still;
 *      a laid span does the same, on the same curve right or wrong
 *  11. the span as drawn: flat, both ends rest on the piers; tilted, the end over the taller pier rests on it and
 *      the other end dips toward the lower pier without sinking into it
 *  12. the caption sits clear of the span and the piers
 *  13. Mode 1 TRUE OR NOT (?mode=judge): the engine's judged item term for term, no blank, no supply, no lay
 *      control; two choices that are 56 px targets; the choice tapped is marked at once and stays marked
 *  14. a round chosen with the engine's truth and one chosen against it: the page records the choice and the
 *      truth, the reveal draws the truth (laws 4, 5, 11, 12), the same reveal and seat, the mark looks the same
 *      on both, and no colour in the canyon differs from before either choice
 *  15. a choice is made by keys alone at 1366x768
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad, assertKeyboardCompletable } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { generateSet, evaluate, valueOf } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
/* the harness appends ?probe=<n>; the trailing & keeps the seed its own pair (the probe arrives as an unknown key) */
const PAGE = { path: '/span/index.html?seed=' + SEED + '&', ready: 'window.SPAN && window.SPAN.ready' };
const SET = generateSet(rng(SEED), { mode: 'blank', size: 20, first: true });
const VERDICT = /\b(wrong|incorrect|right|correct|try again|oops|good|great|well done|answer|solve|equals)\b/i;

const blankSide = eq => eq.left.some(t => t.blank) ? 'left' : 'right';
const pageTerms = page => page.evaluate(() => Array.from(document.querySelectorAll('#equation .term')).map(el =>
  el.dataset.blank !== undefined ? { blank: true, side: el.dataset.side } : el.dataset.op ? { op: el.dataset.op } : { n: Number(el.dataset.n), side: el.dataset.side }));
const blankCount = page => page.evaluate(() => { const b = document.querySelector('#equation .term[data-blank]'); return b ? Number(b.dataset.count) : null; });
const heights = page => page.evaluate(() => {
  const c = document.getElementById('canyon'), h = id => document.getElementById(id).getBoundingClientRect().height;
  const span = document.getElementById('span');
  return { base: Number(c.dataset.base), unit: Number(c.dataset.unit), left: h('pier-left'), right: h('pier-right'),
    shortfall: h('shortfall'), tilt: Number(span.dataset.tilt) };
});

async function dragStoneTo(page, pierId) {
  await page.evaluate((pierId) => {
    const src = document.querySelector('#supply .stone-source'), pier = document.getElementById(pierId);
    const a = src.getBoundingClientRect(), b = pier.getBoundingClientRect();
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + Math.min(b.height / 2, 40);
    const fire = (type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
      { pointerId: 61, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    fire('pointerdown', x0, y0);
    for (let i = 1; i <= 6; i++) fire('pointermove', x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6);
    fire('pointerup', x1, y1);
  }, pierId);
  await sleep(120);
}
async function longPressSupply(page, ms) {
  const at = await page.evaluate(() => { const r = document.querySelector('#supply .stone-source').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const fire = type => page.evaluate((type, x, y) => (document.elementFromPoint(x, y) || document.body).dispatchEvent(new PointerEvent(type,
    { pointerId: 62, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y })), type, at[0], at[1]);
  await fire('pointerdown');
  await sleep(ms);
  await fire('pointerup');
  await sleep(120);
}
/* the piers and the span while a child is still building */
const building = page => page.evaluate(() => {
  const h = id => document.getElementById(id).getBoundingClientRect().height, cs = getComputedStyle(document.getElementById('span'));
  return { left: h('pier-left'), right: h('pier-right'), span: cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.01 };
});
/* the stone on the blank's pier and the dust, frame by frame for ms after the call; started before a drop, awaited after */
const watchSeat = (page, ms) => page.evaluate(ms => new Promise(done => {
  const frames = [], t0 = performance.now();
  const grab = () => {
    const st = document.getElementById('stack'), cs = st ? getComputedStyle(st) : null;
    frames.push({ y: cs && cs.transform !== 'none' ? new DOMMatrix(cs.transform).m42 : 0, dust: document.querySelectorAll('#canyon .dust').length });
    if (performance.now() - t0 < ms) requestAnimationFrame(grab); else done(frames);
  };
  requestAnimationFrame(grab);
}), ms);
const seatSays = frames => {
  const last = frames[frames.length - 1] || { y: 99, dust: 99 };
  const lift = frames.length ? Math.min(...frames.map(f => f.y)) : 0, dust = frames.length ? Math.max(...frames.map(f => f.dust)) : 0;
  return { ok: frames.length > 3 && lift <= -4 && Math.abs(last.y) < 0.5 && dust >= 1 && last.dust === 0,
    detail: 'lift ' + lift.toFixed(1) + ' px, ' + dust + ' dust, then ' + last.y.toFixed(1) + ' px with ' + last.dust + ' dust left' };
};
/* the span's two bottom corners as drawn (its transform about its origin), the piers' tops, and the caption's clearance,
   all in the canyon's own coordinates */
const drawn = page => page.evaluate(() => {
  const c = document.getElementById('canyon'), span = document.getElementById('span'), cs = getComputedStyle(span);
  const m = cs.transform === 'none' ? new DOMMatrix() : new DOMMatrix(cs.transform);
  const o = cs.transformOrigin.split(' ').map(parseFloat);
  const end = x => span.offsetTop + o[1] + m.transformPoint(new DOMPoint(x - o[0], span.offsetHeight - o[1])).y;
  const cr = c.getBoundingClientRect(), pl = document.getElementById('pier-left').getBoundingClientRect(), pr = document.getElementById('pier-right').getBoundingClientRect();
  const cap = document.getElementById('caption').getBoundingClientRect(), sr = span.getBoundingClientRect();
  return { left: end(0), right: end(span.offsetWidth), leftTop: pl.top - cr.top, rightTop: pr.top - cr.top,
    gap: Math.min(sr.top, pl.top, pr.top) - cap.bottom };
});
/* the reveal, recorded frame by frame until the page says it is done, then one frame after */
const record = page => page.evaluate(() => {
  window.__frames = [];
  const grab = () => {
    const o = id => { const el = document.getElementById(id); return el ? Number(getComputedStyle(el).opacity) : null; };
    const st = getComputedStyle(document.getElementById('span'));
    window.__frames.push({ t: performance.now(), shortfall: o('shortfall'), caption: o('caption'),
      spanY: st.transform === 'none' ? 0 : new DOMMatrix(st.transform).m42, dust: document.querySelectorAll('#canyon .dust').length });
    if (!window.SPAN.revealDone() || window.__frames.length < 3) requestAnimationFrame(grab);
  };
  requestAnimationFrame(grab);
});
const colours = page => page.evaluate(() => Array.from(document.querySelectorAll('#canyon, #canyon *')).map(el => {
  const cs = getComputedStyle(el); return [el.id || el.className, cs.color, cs.backgroundColor, cs.borderTopColor].join('|');
}).join('\n'));
/* two recorded rounds laid over each other on each page's own revealAt: the shortfall, the caption and the seat */
const curve = (rec, k) => rec.frames.filter(f => rec.result && f.t >= rec.result.revealAt).map(f => ({ dt: f.t - rec.result.revealAt, v: f[k] }));
function compareReveals(a, b) {
  const interp = (c, dt) => { for (let i = 0; i + 1 < c.length; i++) if (c[i].dt <= dt && dt <= c[i + 1].dt) return c[i].v + (c[i + 1].v - c[i].v) * (dt - c[i].dt) / ((c[i + 1].dt - c[i].dt) || 1); return null; };
  let worst = 0, compared = 0;
  for (const k of ['shortfall', 'caption', 'spanY']) {
    const p = curve(a, k), q = curve(b, k), scale = k === 'spanY' ? 14 : 1;
    for (const x of p) { const y = interp(q, x.dt); if (y !== null) { worst = Math.max(worst, Math.abs(x.v - y) / scale); compared++; } }
  }
  return { worst, compared };
}
const laySeat = rec => seatSays(curve(rec, 'spanY').map((p, i) => ({ y: p.v, dust: curve(rec, 'dust')[i].v })));

function checkReveal(label, eq, fill, h, caption, result, d) {
  const vL = valueOf(eq.left, fill), vR = valueOf(eq.right, fill);
  const near = (a, b) => Math.abs(a - b) <= 1.5;
  say(near(h.left, h.base + vL * h.unit) && near(h.right, h.base + vR * h.unit),
    label + ' both piers stand at their true heights (' + Math.round(h.left) + ' and ' + Math.round(h.right) + ' px for ' + vL + ' and ' + vR + ')');
  say(near(h.shortfall, Math.abs(vL - vR) * h.unit), label + ' and the shortfall is the difference (' + Math.round(h.shortfall) + ' px for ' + Math.abs(vL - vR) + ')');
  const wantTilt = vL === vR ? 0 : (vL > vR ? 1 : -1);
  say(Math.sign(h.tilt) === wantTilt, label + ' and the span is ' + (wantTilt === 0 ? 'flat' : 'tilted toward the lower side') + ' (tilt ' + h.tilt + ')');
  /* ⛔ the tilt above is the page's own flag; the first page set it right and drew the rotation backwards, the end over
     the lower pier lifted and the other sunk into the taller pier, seen only in a shot. This law reads the drawing. */
  const ends = 'ends ' + d.left.toFixed(1) + ' and ' + d.right.toFixed(1) + ', pier tops ' + d.leftTop.toFixed(1) + ' and ' + d.rightTop.toFixed(1);
  if (wantTilt === 0) say(Math.abs(d.left - d.leftTop) <= 2 && Math.abs(d.right - d.rightTop) <= 2, label + ' and as drawn both ends of the span rest on the piers (' + ends + ')');
  else {
    const hi = wantTilt > 0 ? 'left' : 'right', lo = wantTilt > 0 ? 'right' : 'left', drop = Math.abs(vL - vR) * h.unit;
    say(Math.abs(d[hi] - d[hi + 'Top']) <= 3 && d[lo] - d[hi] >= Math.min(4, drop) - 1.5 && d[lo] <= d[lo + 'Top'] + 1.5,
      label + ' and as drawn the span rests on the taller pier and dips toward the lower one without sinking into it (' + ends + ')');
  }
  say(d.gap >= 4, label + ' and the caption sits clear of the span and the piers (' + d.gap.toFixed(1) + ' px)');
  const fact = vL === vR ? /is the same as/.test(caption) : caption.indexOf(String(vL)) >= 0 && caption.indexOf(String(vR)) >= 0;
  say(fact && !VERDICT.test(caption), label + ' and the caption is a fact (' + JSON.stringify(caption) + ')');
  say(result && result.same === evaluate(eq, fill) && result.fill === fill,
    label + ' the page\'s verdict is the engine\'s evaluate for the same item and fill (' + JSON.stringify(result) + ')');
}

/* ---- the phones: boot, targets, the whole round at 375 ---- */
for (const size of SIZES.slice(0, 3)) {
  const at = size.name;
  const opened = await open(s.base, Object.assign({}, size, PAGE));
  const { browser, page, errors } = opened;
  const start = await centre(page, '#start');
  say(!!start && start.w >= 56 && start.h >= 56 && start.onTop, at + ' the start is a 56 px target ('
    + (start ? Math.round(start.w) + 'x' + Math.round(start.h) : 'missing') + ')');
  if (start) await tap(page, '#start');
  await sleep(200);
  const targets = [];
  for (const sel of ['#supply .stone-source', '#lay']) {
    const r = await centre(page, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) targets.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
  }
  say(targets.length === 0, at + ' the stone supply and the lay control are 56 px targets' + (targets.length ? ': ' + targets.join(', ') : ''));
  const sideways = await page.evaluate(w => document.documentElement.scrollWidth - w, size.width);
  say(sideways <= 1, at + ' the page does not scroll sideways (' + sideways + ' px over ' + size.width + ')');

  if (size.width === 375) {
    /* round 1: the first item, filled right */
    /* the canyon's colours before any span is laid, the baseline both reveals are held to */
    const baselineColours = await colours(page);
    const eq0 = SET[0], terms = await pageTerms(page);
    const want = eq0.left.map(t => Object.assign({}, t, t.op ? {} : { side: 'left' })).concat([{ op: '=' }], eq0.right.map(t => Object.assign({}, t, t.op ? {} : { side: 'right' })));
    const same = terms.length === want.length && terms.every((t, i) => (want[i].op ? t.op === want[i].op : want[i].blank ? t.blank && t.side === want[i].side : t.n === want[i].n));
    say(same, at + ' the first item on the page is the engine\'s, term for term (' + JSON.stringify(terms) + ')');
    const side0 = blankSide(eq0);
    const built = [await building(page)];
    const seat = watchSeat(page, 1000);
    await dragStoneTo(page, 'pier-' + side0);
    const seated = seatSays(await seat);
    say(seated.ok, at + ' a stone put on the pier drops the last inch and dust lifts, then all is still (' + seated.detail + ')');
    const one = await blankCount(page);
    built.push(await building(page));
    await dragStoneTo(page, 'pier-' + side0);
    const two = await blankCount(page);
    built.push(await building(page));
    say(one === 1 && two === 2, at + ' a stone dragged onto the blank\'s pier counts in the blank (' + one + ', then ' + two + ')');
    const layBefore = await centre(page, '#lay');
    await record(page);
    await tap(page, '#lay');
    await page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 });
    await sleep(150);
    /* ⛔ the P1 page moved the lay control from the right edge to the middle when next appeared, under the thumb that
       had just used it; seen in a shot, not in a gate */
    const layAfter = await centre(page, '#lay');
    say(!!layBefore && !!layAfter && Math.abs(layBefore.x - layAfter.x) <= 1 && Math.abs(layBefore.y - layAfter.y) <= 1,
      at + ' round 1: the lay control stays where the thumb left it when next appears ('
      + (layBefore ? Math.round(layBefore.x) + ',' + Math.round(layBefore.y) : 'missing') + ' then ' + (layAfter ? Math.round(layAfter.x) + ',' + Math.round(layAfter.y) : 'missing') + ')');
    const right = { frames: await page.evaluate(() => window.__frames), result: await page.evaluate(() => window.SPAN.results[0]) };
    checkReveal(at + ' round 1:', eq0, two, await heights(page), await page.$eval('#caption', el => el.textContent), right.result, await drawn(page));
    const rightColours = await colours(page);
    /* a laid span cannot be laid again; the first page did nothing on a second tap but left the control looking ready */
    const layLook = await page.$eval('#lay', el => Number(getComputedStyle(el).opacity));
    say(layLook <= 0.6, at + ' round 1: once the span is laid the lay control looks unavailable (opacity ' + layLook + ')');

    /* round 2: the next item, filled wrong on purpose (a stack of five, one more if five is the fill) */
    const nx = await centre(page, '#next');
    say(!!nx && nx.w >= 56 && nx.h >= 56 && nx.onTop, at + ' next is a 56 px target');
    await tap(page, '#next');
    await sleep(200);
    const eq1 = SET[1], side1 = blankSide(eq1);
    built.push(await building(page));
    await longPressSupply(page, 800);
    let fill = await blankCount(page);
    built.push(await building(page));
    say(fill === 5, at + ' a long press on the supply puts a stack of five on the blank\'s pier (' + fill + ')');
    if (fill === eq1.blankValue) { await dragStoneTo(page, 'pier-' + side1); fill = await blankCount(page); built.push(await building(page)); }
    /* ⛔ the first page drew both piers at their true heights while the child was still putting stones on, and laid the
       span flat on them before the child laid it: the truth before the mark. PLAY stayed OK; a shot showed it. */
    const moved = built.filter(b => Math.abs(b.left - built[0].left) > 1.5 || Math.abs(b.right - built[0].left) > 1.5);
    say(moved.length === 0, at + ' while a child builds, both piers stand at one height no stone changes ('
      + built.map(b => Math.round(b.left) + '/' + Math.round(b.right)).join(', ') + ')');
    say(built.every(b => !b.span), at + ' and no span is shown before it is laid (' + built.map(b => b.span ? 'shown' : 'none').join(', ') + ')');
    await record(page);
    await tap(page, '#lay');
    await page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 });
    await sleep(150);
    const wrong = { frames: await page.evaluate(() => window.__frames), result: await page.evaluate(() => window.SPAN.results[1]) };
    checkReveal(at + ' round 2:', eq1, fill, await heights(page), await page.$eval('#caption', el => el.textContent), wrong.result, await drawn(page));

    /* the same reveal, a right round laid over a wrong one on each page's own revealAt */
    for (const [name, rec] of [['round 1', right], ['round 2', wrong]]) {
      const seatLaid = laySeat(rec);
      say(seatLaid.ok, at + ' ' + name + ': the laid span drops the last inch and dust lifts, then all is still (' + seatLaid.detail + ')');
    }
    const { worst, compared } = compareReveals(right, wrong);
    say(compared >= 6 && worst < 0.1, at + ' a right round and a wrong round run the same reveal and the same seat (largest difference '
      + worst.toFixed(3) + ' of full scale, ' + compared + ' comparisons)');
    /* ⛔ against the canyon before any reveal too, not only against each other: a colour set on a right round and
       never cleared leaks into the next round, both snapshots carry it, and the first version of this law, comparing
       the two reveals alone, stayed green with the span planted green on the right round */
    const wrongColours = await colours(page);
    say(rightColours === wrongColours && rightColours === baselineColours,
      at + ' and no colour in the canyon differs between them, or from the canyon before any span was laid');
  }

  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* ---- Mode 1 TRUE OR NOT: the phone by thumb, then the Chromebook by keys ---- */
{
  const JSET = generateSet(rng(SEED), { mode: 'judge', size: 5, first: true });
  const JPATH = '/span/index.html?seed=' + SEED + '&count=5&mode=judge&';
  const at = '375x667 TRUE OR NOT';
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: JPATH, ready: PAGE.ready }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(200);
  const eq0 = JSET[0], terms = await pageTerms(page);
  const want = eq0.left.map(t => t.op ? t : Object.assign({}, t, { side: 'left' })).concat([{ op: '=' }], eq0.right.map(t => t.op ? t : Object.assign({}, t, { side: 'right' })));
  const same = terms.length === want.length && terms.every((t, i) => want[i].op ? t.op === want[i].op : !t.blank && t.n === want[i].n && t.side === want[i].side);
  say(same, at + ' the first item on the page is the engine\'s judged item, term for term (' + JSON.stringify(terms) + ')');
  const usable = await page.evaluate(() => ['#equation .term[data-blank]', '#supply .stone-source', '#lay'].filter(sel => {
    const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  }));
  say(usable.length === 0, at + ' there is no blank, no stone supply and no lay control to use (' + (usable.join(', ') || 'none shown') + ')');
  const small = [];
  for (const sel of ['#same', '#apart']) {
    const r = await centre(page, sel);
    if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel + (r ? ' ' + Math.round(r.w) + 'x' + Math.round(r.h) + (r.onTop ? '' : ' COVERED') : ' missing'));
  }
  say(small.length === 0, at + ' the two choices are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));
  const baseline = await colours(page), rounds = [], built = [];
  /* ⛔ items are played until a true one and a false one have both been revealed: the first version played two rounds,
     both items on this seed were true, and a false item's reveal (the tilt, the shortfall, a one number side's caption)
     was never seen while PLAY said OK. Odd rounds are chosen with the engine's truth, even rounds against it; five items
     always hold a false one (S3 leaves one false standard item in five). */
  for (let k = 0; k < JSET.length && !(rounds.some(r => r.truth) && rounds.some(r => !r.truth) && rounds.length >= 2); k++) {
    const eq = JSET[k], truth = evaluate(eq, null);
    const choice = (k % 2 === 0) === truth ? 'same' : 'apart';
    if (k > 0) { await tap(page, '#next'); await sleep(200); }
    built.push(await building(page));
    const there = await centre(page, '#' + choice);
    if (!there) { say(false, at + ' round ' + (k + 1) + ': the choice #' + choice + ' is on the page'); break; }
    await record(page);
    await tap(page, '#' + choice);
    const marked = await page.evaluate(c => [document.getElementById(c).getAttribute('aria-pressed'),
      document.getElementById(c === 'same' ? 'apart' : 'same').getAttribute('aria-pressed')], choice);
    await page.waitForFunction(() => window.SPAN.revealDone(), { timeout: 30000 });
    await sleep(150);
    const rec = { frames: await page.evaluate(() => window.__frames), result: await page.evaluate(k => window.SPAN.results[k] || null, k) };
    const stayed = await centre(page, '#' + choice);
    say(!!stayed && Math.abs(stayed.x - there.x) <= 1 && Math.abs(stayed.y - there.y) <= 1,
      at + ' round ' + (k + 1) + ': the choice stays where the thumb left it when next appears (' + Math.round(there.x) + ',' + Math.round(there.y)
      + ' then ' + (stayed ? Math.round(stayed.x) + ',' + Math.round(stayed.y) : 'missing') + ')');
    const kept = await page.evaluate(c => { const e = document.getElementById(c), cs = getComputedStyle(e);
      return { pressed: e.getAttribute('aria-pressed'), look: [cs.color, cs.backgroundColor, cs.borderTopColor, cs.boxShadow, cs.opacity].join('|') }; }, choice);
    const label = at + ' round ' + (k + 1) + ' (' + choice + ', the engine: ' + (truth ? 'the same' : 'not the same') + '):';
    say(marked[0] === 'true' && marked[1] !== 'true' && kept.pressed === 'true',
      label + ' the choice tapped is marked the moment it is tapped and still marked after the reveal (' + marked.join('/') + ', then ' + kept.pressed + ')');
    say(!!rec.result && rec.result.choice === choice && rec.result.same === truth,
      label + ' the page records the choice and the engine\'s truth (' + JSON.stringify(rec.result) + ')');
    checkReveal(label, eq, null, await heights(page), await page.$eval('#caption', el => el.textContent), rec.result, await drawn(page));
    const seated = laySeat(rec);
    say(seated.ok, label + ' the laid span drops the last inch and dust lifts, then all is still (' + seated.detail + ')');
    rec.look = kept.look;
    rec.colours = await colours(page);
    rec.truth = truth;
    rec.withTruth = k % 2 === 0;
    rounds.push(rec);
  }
  say(rounds.some(r => r.truth) && rounds.some(r => !r.truth),
    at + ' a true item and a false item were both played and revealed (' + rounds.map(r => r.truth ? 'true' : 'false').join(', ') + ')');
  const withIt = rounds.find(r => r.withTruth), against = rounds.find(r => !r.withTruth);
  if (withIt && against) {
    say(built.every(b => Math.abs(b.left - built[0].left) <= 1.5 && Math.abs(b.right - built[0].left) <= 1.5 && !b.span),
      at + ' before a choice both piers stand at one height and no span is shown (' + built.map(b => Math.round(b.left) + '/' + Math.round(b.right) + (b.span ? ' span' : '')).join(', ') + ')');
    const { worst, compared } = compareReveals(withIt, against);
    say(compared >= 6 && worst < 0.1, at + ' a round chosen with the truth and one chosen against it run the same reveal and seat (largest difference '
      + worst.toFixed(3) + ' of full scale, ' + compared + ' comparisons)');
    say(rounds.every(r => r.look === rounds[0].look), at + ' and the mark on the choice looks the same on every round (' + Array.from(new Set(rounds.map(r => r.look))).join(' and ') + ')');
    say(rounds.every(r => r.colours === baseline), at + ' and no colour in the canyon differs from the canyon before any choice');
  }
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, at + ' nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, at + ' nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();

  const kbo = await open(s.base, Object.assign({}, SIZES[3], { path: JPATH, ready: PAGE.ready }));
  await kbo.page.keyboard.press('Tab');
  await kbo.page.keyboard.press('Enter');
  await sleep(200);
  const kb = await assertKeyboardCompletable(kbo.page, [{ key: 'Tab', until: '#same' }, 'Enter'], () => window.SPAN.results.length > 0);
  const kres = await kbo.page.evaluate(() => window.SPAN.results[0] || null);
  say(kb.ok && !!kres && kres.choice === 'same', '1366x768 TRUE OR NOT a choice is made by keys alone (' + kb.detail + ', ' + JSON.stringify(kres) + ')');
  say(kbo.errors.length === 0, '1366x768 TRUE OR NOT nothing landed on the console' + (kbo.errors.length ? ': ' + kbo.errors[0] : ''));
  await kbo.browser.close();
}

/* ---- the Chromebook, by keys ---- */
{
  const opened = await open(s.base, Object.assign({}, SIZES[3], PAGE));
  const { page, errors } = opened;
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await sleep(200);
  const before = await blankCount(page);
  const kb = await assertKeyboardCompletable(page, [{ key: 'Tab', until: '#canyon' }, 'ArrowUp', 'ArrowUp', '7', 'Enter'],
    () => window.SPAN.results.length > 0);
  const laid = await page.evaluate(() => window.SPAN.results[0] || null);
  say(kb.ok, '1366x768 keyboard a span is laid by keys alone (' + kb.detail + ')');
  say(!!laid && laid.fill === (before || 0) + 2, '1366x768 keyboard two presses of arrow up put two stones in, and the digit 7 put in nothing (S5) ('
    + JSON.stringify(laid) + ')');
  say(errors.length === 0, '1366x768 keyboard nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await opened.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLAY FAILURE(S)'); process.exit(1); }
console.log('PLAY OK');
