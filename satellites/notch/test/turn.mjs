#!/usr/bin/env node
/* NOTCH's TURN, played by a real mouse and real keys against the engine replayed in Node (plans/notch/HANDOFF-NOTCH.md P1; N1,
 * N2, 3.5, 3.6).
 *
 *   node test/turn.mjs          (in the foreground, under the gate lock)
 *
 * The gate turns pieces by dragging the pointer round the bench's centre, deciding where from Node's replay of the sessions,
 * never from the page's state. Asserted, each watched to fail on a planted fault:
 *   1. N1: a TURN round offers no turn buttons and no choices: the only buttons are set aside, go on and the gear
 *   2. every round's task is dealSession's for the seed, the stage and the tier (piece, start angle, mirror, tolerance)
 *   3. a drag that leaves the piece outside its tolerance does not seat it; a drag that lands it inside seats it, and the round
 *      is scoreTurn's for the angle it was left at
 *   4. twelve seated rounds at stage 1 open stage 2, whose sessions hold foils; a foil dragged all the way onto the notch never
 *      seats, and set aside makes it right
 *   5. the grain turns with the piece: the drawn grain line's angle on the screen moves by the piece's turn
 *   6. 1366x768 by keys: Enter lets go and seats only a piece already within its tolerance (a task dealt at 0 degrees), arrows
 *      turn a piece 15 degrees a press until it seats, Enter on go on moves on, focus returns to the bench
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, scoreTurn, angleOff, SESSION_LENGTH } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const SEED = 4242;
const replay = rng(SEED >>> 0);
const sessionOne = dealSession(replay, { stage: 1, tier: 0 });
const sessionTwo = dealSession(replay, { stage: 2, tier: 0 });

/* turn the piece from its angle to `target` by dragging round the centre, in steps of 10 degrees of pointer travel */
async function dragTo(page, from, target) {
  const [cx, cy] = await page.evaluate(() => window.NOTCH.centre());
  const R = 110, rad = d => d * Math.PI / 180;
  /* the page lowers the angle as the pointer turns clockwise on the screen (atan2 with y down): pointer delta = from - target */
  const delta = ((from - target) % 360 + 540) % 360 - 180, steps = Math.max(1, Math.ceil(Math.abs(delta) / 10));
  const start = -Math.sign(delta) * Math.min(80, Math.abs(delta) / 2);
  await page.mouse.move(cx + R * Math.cos(rad(start)), cy + R * Math.sin(rad(start)));
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) { const a = start + delta * i / steps; await page.mouse.move(cx + R * Math.cos(rad(a)), cy + R * Math.sin(rad(a))); }
  await page.mouse.up();
  await sleep(60);
}
const revealed = page => page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000 });
const grainAngle = d => { const [[x1, y1], [x2, y2]] = d.grain; return ((Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI) % 180 + 180) % 180; };
const turnDiff = (a, b) => { const d = ((a - b) % 180 + 180) % 180; return Math.min(d, 180 - d); };

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '#start');
  await sleep(150);
  const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button, [role="radio"], [role="option"], select, input')).filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden'; }).map(b => b.id || b.className));
  say(buttons.every(b => b === 'aside' || /lw-settings-open/.test(b)) && buttons.indexOf('aside') >= 0, '375x667 N1: a TURN round offers no turn buttons and no choices (' + JSON.stringify(buttons) + ')');

  const seamBad = [], scoreBad = [];
  let shortOk = null, grainOk = null;
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const want = sessionOne[i];
    const task = await page.evaluate(() => window.NOTCH.task());
    if (task.pieceId !== want.pieceId || task.startAngle !== want.startAngle || task.isMirror !== want.isMirror || task.tolerance !== want.tolerance) seamBad.push('1/' + i + ' page ' + JSON.stringify(task) + ' Node ' + JSON.stringify(want));
    const before = await page.evaluate(() => window.NOTCH.drawn());
    if (i === 0 || angleOff(task.startAngle) >= 60) {
      /* first leave it 30 degrees off: no seat */
      await dragTo(page, task.startAngle, 30);
      const off = await page.evaluate(() => ({ phase: window.NOTCH.phase(), angle: window.NOTCH.angle() }));
      if (shortOk === null) shortOk = off.phase === 'turn' && angleOff(off.angle) > task.tolerance;
      if (grainOk === null) { const d = await page.evaluate(() => window.NOTCH.drawn()); grainOk = { moved: turnDiff(grainAngle(d), grainAngle(before)), turned: angleOff(off.angle - task.startAngle) % 180 }; }
      await dragTo(page, off.angle, 3);
    } else {
      await dragTo(page, task.startAngle, -4);
    }
    await revealed(page);
    const res = (await page.evaluate(() => window.NOTCH.results))[i];
    if (!res.seated) scoreBad.push('1/' + i + ' not seated');
    await tap(page, '#next');
    await sleep(80);
  }
  say(seamBad.length === 0, '375x667 every stage 1 task is dealSession\'s for the seed (piece, start, mirror, tolerance)' + (seamBad.length ? ': ' + seamBad.slice(0, 2).join('; ') : ''));
  say(shortOk === true && scoreBad.length === 0, '375x667 a drag left 30 degrees off does not seat, and a drag onto the notch seats all twelve (' + JSON.stringify({ shortOk, notSeated: scoreBad }) + ')');
  say(!!grainOk && Math.abs(grainOk.moved - Math.min(grainOk.turned, 180 - grainOk.turned)) <= 2, '375x667 the grain turns with the piece: the drawn grain moved ' + (grainOk ? grainOk.moved.toFixed(1) : '?') + ' degrees for a turn of ' + (grainOk ? grainOk.turned.toFixed(1) : '?'));

  /* ⛔ since P3 a clean session (ten or more of twelve right) earns a village building, and the village opens over the next round
     with the round inert under it (CREASE's sp5). This gate predates the village: its stage 2 drags landed on an inert page and
     waited 30 s for a reveal that could not come (turn.mjs:103). Go on closes the village, as a child would, before stage 2. */
  const villageOpen = await page.evaluate(() => window.NOTCH.shelf.shown());
  if (villageOpen) { await tap(page, '#shelf-go'); await sleep(120); }
  const live = await page.evaluate(() => ({ shown: window.NOTCH.shelf.shown(), inert: document.getElementById('play').inert, phase: window.NOTCH.phase() }));
  say(!live.shown && !live.inert && live.phase === 'turn', '375x667 after a clean first session the village is closed by go on onto a live round (' + JSON.stringify(Object.assign({ villageOpen }, live)) + ')');

  /* stage 2 */
  const stage = await page.evaluate(() => window.NOTCH.stage());
  const seam2 = [];
  let foilSeen = null;
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const want = sessionTwo[i];
    const task = await page.evaluate(() => window.NOTCH.task());
    if (task.pieceId !== want.pieceId || task.startAngle !== want.startAngle || task.isMirror !== want.isMirror || task.tolerance !== want.tolerance) seam2.push('2/' + i + ' page ' + JSON.stringify(task) + ' Node ' + JSON.stringify(want));
    if (task.isMirror) {
      await dragTo(page, task.startAngle, 0);
      const still = await page.evaluate(() => ({ phase: window.NOTCH.phase(), angle: window.NOTCH.angle() }));
      await tap(page, '#aside');
      await revealed(page);
      const res = (await page.evaluate(() => window.NOTCH.results))[SESSION_LENGTH + i];
      const want2 = scoreTurn(task, { finalAngle: still.angle, setAside: true });
      if (foilSeen === null) foilSeen = { stillTurning: still.phase === 'turn', near: angleOff(still.angle) <= task.tolerance, correct: res.correct, seated: res.seated, scored: want2.correct === res.correct && want2.error === res.error };
    } else {
      await dragTo(page, task.startAngle, 2);
      await revealed(page);
    }
    await tap(page, '#next');
    await sleep(80);
  }
  say(stage === 2 && seam2.length === 0 && sessionTwo.some(t => t.isMirror), '375x667 twelve seated rounds open stage 2, whose tasks are dealSession\'s with foils (' + stage + ')' + (seam2.length ? ': ' + seam2.slice(0, 2).join('; ') : ''));
  say(!!foilSeen && foilSeen.stillTurning && foilSeen.near && foilSeen.correct && !foilSeen.seated && foilSeen.scored, '375x667 a foil dragged onto the notch never seats, and set aside is right and scoreTurn\'s (' + JSON.stringify(foilSeen) + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6: keys at 1366 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const rows = [];
  for (let i = 0; i < 3; i++) {
    const task = await page.evaluate(() => window.NOTCH.task());
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.id);
    let presses = 0;
    /* a piece dealt inside its tolerance is let go with Enter, no turn; one outside it Enter must not seat */
    await page.keyboard.press('Enter');
    await sleep(40);
    const enterSeated = (await page.evaluate(() => window.NOTCH.phase())) !== 'turn';
    while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
      const a = await page.evaluate(() => window.NOTCH.angle());
      await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
      presses++;
    }
    await revealed(page);
    const res = (await page.evaluate(() => window.NOTCH.results))[i];
    const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
    await page.keyboard.press('Enter');
    await sleep(100);
    const inside = angleOff(task.startAngle) <= task.tolerance;
    rows.push({ start: task.startAngle, enterSeated, inside, presses, want: Math.ceil(Math.max(0, angleOff(task.startAngle) - task.tolerance) / 15), seated: res.seated, focused, onNext });
  }
  const back = await page.evaluate(() => document.activeElement && document.activeElement.id);
  say(rows.some(x => x.inside) && rows.some(x => !x.inside) && rows.every(x => x.seated && x.enterSeated === x.inside && x.presses === x.want && x.onNext === 'next') && rows[0].focused === 'bench' && back === 'bench', '1366x768 by keys: Enter lets go and seats only a piece already in the notch, arrows turn a piece 15 degrees a press until it seats, go on takes focus and Enter returns it to the bench (' + JSON.stringify(rows) + ', back on ' + back + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' TURN FAILURE(S)'); process.exit(1); }
console.log('TURN OK');
