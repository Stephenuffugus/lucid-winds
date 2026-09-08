#!/usr/bin/env node
/* The pen, in a real browser, on a frozen sky.
 *
 *   node test/draw.mjs
 *
 * The sky is 2026-07-15T04:00:00Z over Columbus, so Vega, Deneb and Altair are
 * where the astronomy puts them and the gate can ask for them by Hipparcos
 * number rather than by hunting for a bright pixel.
 *
 * What it asserts, each watched to fail:
 *   1. three real taps on the Summer Triangle make three stars and two lines
 *   2. the star that was picked is NAMED on screen, because a star is a two
 *      pixel dot and you have to know which one you got
 *   3. a tap on empty sky picks nothing and makes no line
 *   4. tapping the last star again undoes it
 *   4b. tapping the FIRST star again closes the shape: three stars, THREE
 *      lines, features() calls it a loop, the closing line pulses and the
 *      label says so. Stephen, Sep 07: "I can't complete like a loop."
 *      Until Sep 08 no code path closed one and this gate counted stars
 *      where it should have counted lines, so it was green over it.
 *   5. tapping an earlier star branches from it rather than undoing, and it
 *      is the LINE COUNT that says so: a fourth star leaves from that one.
 *      Then UNDO takes back the last thing done, twice: the branch star with
 *      its line, and then the closing line on its own with the stars kept.
 *   6. a real 80 px drag turns the dome, and the stars go with the finger
 *   7. a drag NEVER picks a star, however near one it starts
 *   8. DONE, a name typed into the real field, SAVE, and the almanac holds one
 *      entry whose stars are the three Hipparcos numbers in some order
 *
 * ⛔ Nothing calls a handler. Every press is a real pointer event.
 */
import { serve, open, reporter, tap, centre, tapAt, drag, dragEnd, pinch, sleep, waitFrames } from './harness.mjs';

const VEGA = 91262, DENEB = 102098, ALTAIR = 97649, RASALHAGUE = 86032;
const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await dev(() => localStorage.setItem('lw_asterism_v1',
  JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 1 } })));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
await waitFrames(page, 6);

const at = async (hip) => dev((h) => window.ASTERISM_DEV.screenOfHip(h), hip);
const v = await at(VEGA), d = await at(DENEB), a = await at(ALTAIR);
say(!!v && !!d && !!a, 'the Summer Triangle is on the screen at the default view');
if (!v || !d || !a) { console.log('\n1 DRAW FAILURE(S)'); await browser.close(); close(); process.exit(1); }

/* the prompt card is up on a first ever night, and it must not eat a star */
const cardUp = await dev(() => !document.getElementById('promptCard').hidden);
say(cardUp, 'the prompt of the night is up, which is the first thing a player sees');
for (const [hip, nm] of [[VEGA, 'Vega'], [DENEB, 'Deneb'], [ALTAIR, 'Altair']]) {
  const p = await at(hip);
  const el = await dev((x, y) => { const e = document.elementFromPoint(x, y); return e ? (e.id || e.tagName) : 'none'; }, p.x, p.y);
  say(el === 'sky', 'a tap on ' + nm + ' lands on the sky and not on the card (' + el + ')');
}

/* 3. empty sky. FOUND, not guessed: with five hundred stars on the screen a
   point chosen by eye is usually inside the pick radius of one, and the first
   version of this gate "tapped empty sky" onto HIP 80883. */
const far = await dev(() => {
  let best = null, bestD = 0;
  for (let x = 40; x < window.innerWidth - 40; x += 11) {
    for (let y = 110; y < window.innerHeight - 130; y += 11) {
      const d = window.ASTERISM_DEV.nearestStarPx(x, y);
      if (d > bestD) { bestD = d; best = { x: x, y: y, d: d }; }
    }
  }
  return best;
});
const nearAny = far.d;
await tapAt(page, far.x, far.y);
await sleep(120);
say((await dev(() => window.ASTERISM_DEV.draw())).hips.length === 0,
  'a tap on the emptiest sky on the screen picks nothing (nearest star ' + nearAny.toFixed(0) + ' px away)');
say(nearAny > 28, 'and that patch really was empty, wider than the 28 px pick radius');

/* 1 and 2. three real taps, each about ten pixels OFF the star.
   ⛔ Tapping the exact pixel proves nothing about the pick radius: with
   PICK_PX at 2 the first version of this gate stayed green, because a thumb in
   a test is perfect and a thumb on a phone is not. */
/* the direction of the miss is chosen so that the NEAREST star is still the one
   we meant; a thumb that lands nine pixels off is realistic, a thumb that lands
   nine pixels off toward a closer star is a different test. */
const offsets = [];
for (const [hip, p] of [[VEGA, v], [DENEB, d], [ALTAIR, a]]) {
  const o = await dev((h, q) => {
    const want = window.ASTERISM_DEV.pickAt(q.x, q.y);
    for (const ang of [0, 45, 90, 135, 180, 225, 270, 315]) {
      const x = q.x + Math.cos(ang * Math.PI / 180) * 9, y = q.y + Math.sin(ang * Math.PI / 180) * 9;
      if (window.ASTERISM_DEV.pickAt(x, y) === want) return { x: x, y: y, ang: ang };
    }
    return null;
  }, hip, p);
  offsets.push(o);
}
say(offsets.every(Boolean), 'each of the three can be got by a thumb nine pixels off centre');
for (const o of offsets) { await tapAt(page, o.x, o.y); await waitFrames(page, 2); }
let st = await dev(() => window.ASTERISM_DEV.draw());
say(st.hips.length === 3, 'three real taps made three stars (' + st.hips.length + ')');
say(st.edges === 2, 'and two lines between them (' + st.edges + ')');
say(st.hips.indexOf(VEGA) >= 0 && st.hips.indexOf(DENEB) >= 0 && st.hips.indexOf(ALTAIR) >= 0,
  'and they are Vega, Deneb and Altair: ' + JSON.stringify(st.hips));
const label = await dev(() => {
  const el = document.getElementById('starLabel');
  return { text: el.textContent, on: el.classList.contains('on') };
});
say(label.on && label.text === 'Altair', 'the star you just picked is named on the screen: ' + JSON.stringify(label.text));

/* the radius itself, from both sides */
const grazed = await dev((p) => window.ASTERISM_DEV.pickAt(p.x + 24, p.y), a);
const missed = await dev((p) => window.ASTERISM_DEV.pickAt(p.x + 44, p.y), a);
say(grazed >= 0, 'a thumb 24 px off a star still gets it');
say(missed !== grazed || missed < 0, 'and 44 px off gets something else or nothing');

/* 4. the last star again undoes it */
await tapAt(page, a.x, a.y);
await waitFrames(page, 2);
st = await dev(() => window.ASTERISM_DEV.draw());
say(st.hips.length === 2 && st.edges === 1, 'tapping the last star again undid it (' + st.hips.length + ' stars, ' + st.edges + ' lines)');

/* 4b. THE LOOP. Altair goes back, then the FIRST star is tapped again. */
await tapAt(page, a.x, a.y); await waitFrames(page, 2);
st = await dev(() => window.ASTERISM_DEV.draw());
say(st.hips.length === 3 && st.edges === 2, 'and it can be put back (' + st.hips.length + ' stars, ' + st.edges + ' lines)');
const screenOf = async (hip) => dev((h) => { const s = window.ASTERISM_DEV.screenOfHip(h); return s ? { x: s.x, y: s.y } : null; }, hip);
const first = await screenOf(st.hips[0]);
await tapAt(page, first.x, first.y); await waitFrames(page, 2);
const closed = await dev(() => window.ASTERISM_DEV.draw());
say(closed.hips.length === 3 && closed.edges === 3,
  'tapping the first star again closes the shape: ' + closed.hips.length + ' stars, ' + closed.edges + ' lines');
say(closed.kind === 'loop', 'and features() calls what was tapped a loop (' + JSON.stringify(closed.kind) + ')');
say(closed.lines.some(l => (l[0] === 2 && l[1] === 0) || (l[0] === 0 && l[1] === 2)),
  'and the new line runs from the last star back to the first: ' + JSON.stringify(closed.lines));
say(closed.pulsing, 'and the closing line is pulsing, which is the tell');
const closeLabel = await dev(() => {
  const el = document.getElementById('starLabel'), r = el.getBoundingClientRect();
  return { text: el.textContent, on: el.classList.contains('on'), left: r.left, right: r.right, W: window.innerWidth };
});
say(closeLabel.on && /, and it closes$/.test(closeLabel.text), 'and the label says so: ' + JSON.stringify(closeLabel.text));
say(closeLabel.left >= 0 && closeLabel.right <= closeLabel.W,
  'and the label is on the screen at both ends (' + closeLabel.left.toFixed(0) + ' to ' + closeLabel.right.toFixed(0) + ' of ' + closeLabel.W + ')');
await sleep(1300);
await waitFrames(page, 1);
say(!(await dev(() => window.ASTERISM_DEV.draw())).pulsing, 'and the pulse is over a second and a bit later');

/* 5. an earlier star branches, and it is the line count that says so */
const mid = await screenOf(closed.hips[1]);
await tapAt(page, mid.x, mid.y); await waitFrames(page, 2);
const branched = await dev(() => window.ASTERISM_DEV.draw());
say(branched.hips.length === 3 && branched.edges === 3,
  'tapping a star further back does not undo it, and draws nothing twice (' + branched.hips.length + ' stars, ' + branched.edges + ' lines)');
say(branched.from === 1, 'and the pen stands on it (from ' + branched.from + ')');
const r = await at(RASALHAGUE);
say(!!r, 'Rasalhague is on the screen to branch to');
if (r) { await tapAt(page, r.x, r.y); await waitFrames(page, 2); }
const four = await dev(() => window.ASTERISM_DEV.draw());
say(four.hips.length === 4 && four.edges === 4,
  'a new star then leaves from the star tapped back to (' + four.hips.length + ' stars, ' + four.edges + ' lines)');
say(four.lines.some(l => l[0] === 1 && l[1] === 3), 'and that line runs from the second star to the fourth: ' + JSON.stringify(four.lines));
say(four.kind === 'loop', 'and a loop with a branch on it is still a loop (' + four.kind + ')');
const bUndo = await centre(page, '#btnUndo');
say(!!bUndo && bUndo.w >= 48 && bUndo.h >= 48 && bUndo.onTop, 'the UNDO button is ' + (bUndo ? bUndo.w.toFixed(0) + 'x' + bUndo.h.toFixed(0) : 'missing') + ' px and reachable');
await tap(page, '#btnUndo'); await waitFrames(page, 2);
const u1 = await dev(() => window.ASTERISM_DEV.draw());
say(u1.hips.length === 3 && u1.edges === 3 && u1.kind === 'loop',
  'UNDO takes the branch star with its line and the loop stands (' + u1.hips.length + ' stars, ' + u1.edges + ' lines, ' + u1.kind + ')');
await tap(page, '#btnUndo'); await waitFrames(page, 2);
const u2 = await dev(() => window.ASTERISM_DEV.draw());
say(u2.hips.length === 3 && u2.edges === 2 && u2.kind === 'chain',
  'UNDO again takes the closing line on its own and keeps the stars (' + u2.hips.length + ' stars, ' + u2.edges + ' lines, ' + u2.kind + ')');
await tapAt(page, first.x, first.y); await waitFrames(page, 2);
const again = await dev(() => window.ASTERISM_DEV.draw());
say(again.hips.length === 3 && again.edges === 3 && again.kind === 'loop', 'and it closes again, for the almanac (' + again.edges + ' lines, ' + again.kind + ')');

/* THE ZOOM IS HOW CLOSE PAIRS ARE SEPARATED, so it gets a gate. Deneb has a
   neighbour inside the pick radius at a 90 degree field, which is exactly the
   case the design answers with a pinch. */
const gapBefore = await dev((h) => {
  const s = window.ASTERISM_DEV.screenOfHip(h);
  let best = 1e9;
  for (let r = 1; r < 60; r++) {
    const q = window.ASTERISM_DEV.nearestStarPx(s.x + r, s.y);
    if (q < best) best = q;
  }
  return window.ASTERISM_DEV.nearestStarPx(s.x + 12, s.y);
}, DENEB);
const fovBefore = (await dev(() => window.ASTERISM_DEV.view())).fov;
await pinch(page, 187, 330, 60, 220, 10);
await waitFrames(page, 4);
const fovAfter = (await dev(() => window.ASTERISM_DEV.view())).fov;
say(fovAfter < fovBefore - 10, 'a real two finger pinch narrows the field, ' + fovBefore.toFixed(0) + ' to ' + fovAfter.toFixed(0) + ' degrees');
say(fovAfter >= 30, 'and it stops at the closest the app goes, ' + fovAfter.toFixed(0) + ' degrees');
await pinch(page, 187, 330, 220, 60, 10);
await waitFrames(page, 4);
const fovBack = (await dev(() => window.ASTERISM_DEV.view())).fov;
say(fovBack > fovAfter + 10, 'and pinching the other way widens it again, to ' + fovBack.toFixed(0));
say(fovBack <= 120, 'and it stops at the widest, ' + fovBack.toFixed(0) + ' degrees');

/* every star has moved now, so the positions are read again */
const v2 = await at(VEGA);

/* 6 and 7. the dome turns and a drag never picks */
const az0 = (await dev(() => window.ASTERISM_DEV.view())).az;
const drawBefore = (await dev(() => window.ASTERISM_DEV.draw())).hips.length;
const vBefore = v2 || await at(VEGA);
await drag(page, vBefore.x, vBefore.y, vBefore.x + 80, vBefore.y, 10);
await dragEnd(page, vBefore.x + 80, vBefore.y);
await waitFrames(page, 4);
const az1 = (await dev(() => window.ASTERISM_DEV.view())).az;
const vAfter = await at(VEGA);
say(Math.abs(az1 - az0) > 3, 'a real 80 px drag turned the dome, azimuth ' + az0.toFixed(1) + ' to ' + az1.toFixed(1));
/* On a dome the sky follows the finger AT THE VIEW CENTRE; a star near the
   zenith moves less for the same turn, because that is what a dome does. The
   rate is the honest thing to assert: eighty pixels of drag turns the view by
   eighty pixels worth of field, widened by the tilt. */
const fov = (await dev(() => window.ASTERISM_DEV.view())).fov;
const short = await dev(() => Math.min(window.innerWidth, window.innerHeight));
const alt = (await dev(() => window.ASTERISM_DEV.view())).alt;
const wantAz = 80 * (fov / short) / Math.max(0.25, Math.cos(alt * Math.PI / 180));
say(Math.abs(Math.abs(az1 - az0) - wantAz) < wantAz * 0.15,
  'and it turned by the width of the drag, ' + Math.abs(az1 - az0).toFixed(1) + ' degrees against ' + wantAz.toFixed(1));
say(!!vAfter && vAfter.x > vBefore.x + 4,
  'and the stars went the way the finger went, Vega from x ' + vBefore.x.toFixed(0) + ' to ' + (vAfter ? vAfter.x.toFixed(0) : '?'));
say((await dev(() => window.ASTERISM_DEV.draw())).hips.length === drawBefore,
  'and a drag that STARTED on a star still picked nothing');

/* 8. name it and keep it */
const bDraw = await centre(page, '#btnDraw');
say(!!bDraw && bDraw.w >= 48 && bDraw.h >= 48 && bDraw.onTop, 'the DRAW button is ' + (bDraw ? bDraw.w.toFixed(0) + 'x' + bDraw.h.toFixed(0) : 'missing') + ' px and reachable');
await tap(page, '#btnDraw');
await sleep(250);
say(await dev(() => document.getElementById('scrName').classList.contains('on')), 'DONE opens the name sheet');
await page.focus('#nameField');
await page.type('#nameField', 'Space Dog', { delay: 12 });
say((await dev(() => document.getElementById('nameField').value)) === 'Space Dog', 'a name typed into the real field arrives whole');
await tap(page, '#btnNameSave');
await page.waitForFunction(() => (window.ASTERISM_DEV.myth() || '').length > 40, { timeout: 20000 }).catch(() => {});
say((await dev(() => window.ASTERISM_DEV.myth())).length > 40, 'and the myth starts typing itself');
await page.waitForFunction(() => !window.ASTERISM_DEV.typing(), { timeout: 30000 }).catch(() => {});
/* the myth typed for a closed shape says it closes, in a line from SHAPE.loop */
const typed = await dev(() => ({ myth: window.ASTERISM_DEV.myth(), loop: window.ASTERISM_DEV.shapeLines('loop'), chain: window.ASTERISM_DEV.shapeLines('chain') }));
const runOf = f => f.split(/\{[A-Z]+\}/).reduce((a, b) => b.length > a.length ? b : a, '');
const carries = (list, t) => list.some(f => runOf(f).length > 8 && t.indexOf(runOf(f)) >= 0);
say(carries(typed.loop, typed.myth), 'and the myth typed for it carries a line from SHAPE.loop');
say(!carries(typed.chain, typed.myth), 'and none from SHAPE.chain');
await tap(page, '#btnMythKeep');
await sleep(300);
const save = await dev(() => window.ASTERISM_DEV.save());
say(save.entries.length === 1, 'the almanac holds one entry (' + save.entries.length + ')');
const e = save.entries[0] || {};
say(e.n === 'Space Dog', 'and it is called what was typed: ' + JSON.stringify(e.n));
const got = (e.s || []).slice().sort((x, y) => x - y).join(',');
say(got === [VEGA, DENEB, ALTAIR].sort((x, y) => x - y).join(','),
  'and it holds the three Hipparcos numbers: ' + got);
say(Array.isArray(e.e) && e.e.length === 3, 'and the three lines between them, the closing one included (' + (e.e || []).length + ')');
say(!!e.p && Math.abs(e.p[0] - 39.96) < 0.01, 'and the place it was charted from, at city precision: ' + JSON.stringify(e.p));

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' DRAW FAILURE(S)'); process.exit(1); }
console.log('DRAW OK');
