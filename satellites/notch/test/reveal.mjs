#!/usr/bin/env node
/* NOTCH's slow reveal, read off the page's frames (plans/notch/HANDOFF-NOTCH.md 3.6; the handoff's step 5: "on a mirror miss the
 * piece rotates a full 360 degrees, visibly failing to seat at every angle, then flips to show the mirror").
 *
 *   node test/reveal.mjs          (in the foreground, under the gate lock)
 *
 * Stage 2 is reached by play (twelve seated rounds by keys), never by writing the store. Asserted, each watched to fail on a
 * planted fault:
 *   1. a right piece set aside turns home the short way at 60 degrees a second, taking its angle off over 60 seconds, and ends
 *      seated with one thunk
 *   2. a mirror set aside turns a full turn in six seconds without flipping, flips once (one flip sound), turns home at the same
 *      speed, and ends seated with one thunk
 *   3. a piece the child seats ends with one thunk, and every round plays exactly one thunk
 *   4. with less motion, a mirror's whole reveal is done within 300 ms and still ends seated and flipped
 *   5. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, angleOff, SESSION_LENGTH } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const SEED = 4242;
const replay = rng(SEED >>> 0);
dealSession(replay, { stage: 1, tier: 0 });
const two = dealSession(replay, { stage: 2, tier: 0 });
const firstMirror = two.findIndex(t => t.isMirror), firstRight = two.findIndex(t => !t.isMirror && angleOff(t.startAngle) >= 90);

/* ⛔ this helper timed out three times, twice under load and once alone, and a bare timeout named nothing. Probing showed the
   page reveals promptly on every trial when #aside is tapped while it is VISIBLE, so the suspicion is that the gate taps it while
   it is hidden (after its own key seating) and then waits 30 s for a reveal that was never asked for. The helper now says what the
   page was doing when it gave up. */
/* ⛔ the gate tapped #aside while its own key driven turn was still animating, and the page ignores the button mid turn, so
   the tap did nothing and the gate then waited thirty seconds for a reveal nobody had asked for. Evidence: the helper reported
   phase "turn", aside VISIBLE, frames 0, angle -120. The gate waits for the piece to stop moving before it asks to set aside. */
const steady = async page => {
  let last = null;
  for (let i = 0; i < 60; i++) {
    const a = await page.evaluate(() => window.NOTCH.angle());
    if (a === last) return a;
    last = a;
    await sleep(100);
  }
  return last;
};
/* ⛔ CAUSE, and it is the same shape as two other gates tonight: #shelf is `position: fixed; inset: 0; z-index: 25`, a full
   screen overlay. When it is open it covers everything, so a tap on #aside lands on #shelf-canvas and the button never hears it,
   while the round underneath is still in phase turn and the button still reports visible and enabled. GAUGE's gate had to close
   its instrument case and HUSH's had to close the living clearing; this one never closed the shelf. The gate closes it now.
   ⚠ A PAGE QUESTION FOR STEPHEN REMAINS: a round appears to begin underneath an open shelf, so a child returning from the
   shelf meets a live round whose controls are behind the overlay. That is recorded in the ledger, not fixed here. */
const closeShelf = async page => {
  const open = await page.evaluate(() => { const s = document.querySelector('#shelf'); return !!s && !s.hidden; });
  if (!open) return false;
  await tap(page, '#shelf-go');
  await sleep(200);
  return true;
};
const revealed = async page => {
  try {
    await page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });
  } catch (e) {
    const seen = await page.evaluate(() => ({
      phase: window.NOTCH.phase(), done: window.NOTCH.revealDone(), frames: window.NOTCH.revealFrames().length,
      aside: !!document.querySelector('#aside') && !document.querySelector('#aside').hidden,
      next: !!document.querySelector('#next') && !document.querySelector('#next').hidden,
      angle: window.NOTCH.angle && window.NOTCH.angle(),
    })).catch(() => null);
    throw new Error('the reveal never finished; the page was ' + JSON.stringify(seen));
  }
};
const soundOn = async page => {
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
};
/* ⛔ FIVE theories about this gate have each been contradicted by the next measurement, while the evidence line never changed
   (phase turn, aside visible, angle -120, frames 0). A probe shows the mechanism is sound: from angle 0 a press of ArrowLeft gives
   15 and a press of ArrowRight brings it back to 0, at which point the piece SEATS and the reveal starts on its own. So the failure
   is somewhere in how this loop walks a particular trial, and rather than guess a sixth time the loop now writes down what it did. */
async function seatByKeys(page) {
  let presses = 0;
  const trail = [];
  while ((await page.evaluate(() => window.NOTCH.phase())) === 'turn' && presses < 14) {
    const a = await page.evaluate(() => window.NOTCH.angle());
    /* ⛔ THE CAUSE OF THREE THIRTY SECOND TIMEOUTS: the page binds its turning keys to the BOARD (main.js adds the keydown
       listener to the svg and advertises aria-keyshortcuts on it), and this loop pressed keys without ever focusing it. The
       presses landed on the body, the piece never seated, the loop spent its fourteen presses, and then the gate waited half a
       minute for a reveal nobody had asked for. Focus the board, then press. */
    await page.evaluate(() => { const b = document.querySelector('[aria-keyshortcuts]'); if (b && b.focus) b.focus(); });
    /* ⛔ focusing the board was not enough: the gate still parked at angle -120 every run, the SAME number every time, which is
       what a loop pressing the wrong way looks like. The gate assumed ArrowLeft raises a negative angle toward zero, while the page
       maps ArrowLeft to keyStep(angle, +1) and ArrowRight to keyStep(angle, -1). Rather than hard code a direction and be wrong a
       second time, the gate PRESSES ONE KEY, READS THE ANGLE, AND KEEPS WHICHEVER KEY MOVED IT TOWARDS ZERO. */
    /* ⛔ learning ONE direction and pressing it over and over was my own mistake: it marches the angle straight past zero, which
       is where the piece seats, and on down to -120 where the loop gives up. The probe that worked recomputed the direction on
       every press and stopped the moment the phase left turn. ArrowLeft raises the angle and ArrowRight lowers it (measured), so
       the direction is simply the sign of where the piece stands. */
    await page.keyboard.press(a > 0 ? 'ArrowRight' : 'ArrowLeft');
    /* ⛔ fourteen presses and the angle never moved once (trail: -120->-120, fourteen times), while the same presses turn the
       piece on a fresh page and the aside taps in this very run worked. So the keys are not reaching the board here. The trail now
       records what actually holds focus at press time and whether the board can take focus at all, because "I called focus()" and
       "the element took focus" are different claims and I have already confused them once tonight. */
    const after = await page.evaluate(() => {
      const b = document.querySelector('[aria-keyshortcuts]'), a = document.activeElement;
      return { angle: window.NOTCH.angle(), active: a ? (a.id || a.tagName) : 'none', boardTabindex: b ? b.getAttribute('tabindex') : 'no board', boardIsActive: !!b && a === b };
    });
    trail.push(a + '->' + after.angle + ' active=' + after.active + ' tabindex=' + after.boardTabindex + ' boardFocused=' + after.boardIsActive);
    presses++;
  }
  const seen = await page.evaluate(() => ({ phase: window.NOTCH.phase(), angle: window.NOTCH.angle(), mirror: window.NOTCH.task() ? !!window.NOTCH.task().isMirror : null }));
  if (seen.phase === 'turn') console.log('    seatByKeys gave up after ' + presses + ' presses: ' + JSON.stringify(seen) + ' trail ' + trail.join(' '));
  await revealed(page);
}
const speedOf = frames => {
  const moving = frames.filter((f, i) => i > 0 && f.t > 50 && Math.abs(f.angle - frames[i - 1].angle) > 1e-6);
  const a = moving[0], b = moving[moving.length - 1];
  return a && b && b.t > a.t ? Math.abs(b.angle - a.angle) / ((b.t - a.t) / 1000) : null;
};

/* 1 to 3 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await soundOn(page);
  await page.evaluate(() => window.NOTCH.audio.clear());
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const thunksPerRound = [];
  for (let i = 0; i < SESSION_LENGTH; i++) {
    const before = (await page.evaluate(() => window.NOTCH.audio.sounded())).filter(x => x === 'thunk').length;
    await seatByKeys(page);
    const after = (await page.evaluate(() => window.NOTCH.audio.sounded())).filter(x => x === 'thunk').length;
    thunksPerRound.push(after - before);
    await page.keyboard.press('Enter');
    await sleep(80);
  }
  const stage = await page.evaluate(() => window.NOTCH.stage());
  say(thunksPerRound.every(n => n === 1), '1366x768 a piece the child seats ends with one thunk, every round (' + thunksPerRound.join(',') + ')');

  const rows = {};
  for (let i = 0; i <= Math.max(firstMirror, firstRight); i++) {
    const task = await page.evaluate(() => window.NOTCH.task());
    if (i === firstMirror || i === firstRight) {
      const sounds0 = (await page.evaluate(() => window.NOTCH.audio.sounded())).length;
      /* ⛔ the seating loop's trail never printed, which says the throw comes from THIS call and not from seatByKeys: the gate taps
         #aside on a target trial and no reveal follows, while a probe tapping #aside on trial 0 starts one within a second. So the
         difference is the trial, and these two lines say which one and what state it was in before and after the tap. */
      /* ⛔ a separate probe could not reproduce this trial (its task dealt startAngle 0, where a real click works), so the question
         goes where the failure is: tap presses whatever elementFromPoint returns at the control's centre, so this line now reports
         what is actually under the thumb at the moment of the failing press. */
      const beforeAside = await page.evaluate(() => {
        const b = document.querySelector('#aside'), r = b.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const at = document.elementFromPoint(cx, cy);
        return { phase: window.NOTCH.phase(), angle: window.NOTCH.angle(), mirror: window.NOTCH.task() ? !!window.NOTCH.task().isMirror : null, start: window.NOTCH.task() ? window.NOTCH.task().startAngle : null,
          asideHidden: b.hidden, asideDisabled: b.disabled, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
          centre: [Math.round(cx), Math.round(cy)], atCentre: at ? (at.id || (at.tagName + '.' + (typeof at.className === 'string' ? at.className : 'svg'))) : 'nothing',
          insideButton: at ? (at === b || b.contains(at)) : false };
      });
      await closeShelf(page); await steady(page); await tap(page, '#aside');
      await sleep(400);
      const afterAside = await page.evaluate(() => ({ phase: window.NOTCH.phase(), done: window.NOTCH.revealDone(), frames: window.NOTCH.revealFrames().length }));
      console.log('    target trial ' + i + ' (' + (i === firstMirror ? 'mirror' : 'right') + ') before aside ' + JSON.stringify(beforeAside) + ' after ' + JSON.stringify(afterAside));
      await revealed(page);
      const frames = await page.evaluate(() => window.NOTCH.revealFrames());
      const sounds = (await page.evaluate(() => window.NOTCH.audio.sounded())).slice(sounds0);
      rows[i === firstMirror ? 'mirror' : 'right'] = { task, frames, sounds, end: frames[frames.length - 1] };
    } else {
      await seatByKeys(page);
    }
    await page.evaluate(() => document.getElementById('next').click());
    await sleep(80);
  }
  const R = rows.right, M = rows.mirror;
  if (R) {
    const want = angleOff(R.task.startAngle) / 60 * 1000, speed = speedOf(R.frames);
    say(stage === 2 && Math.abs(R.end.t - want) <= 80 && Math.abs(speed - 60) <= 3 && R.end.angle === 0 && !R.frames.some(f => f.flipped) && R.sounds.filter(x => x === 'thunk').length === 1 && !R.sounds.includes('flip'),
      '1366x768 a right piece set aside from ' + R.task.startAngle + ' turns home at ' + (speed || 0).toFixed(1) + ' degrees a second in ' + R.end.t.toFixed(0) + ' ms (want ' + want.toFixed(0) + '), seated, one thunk (' + JSON.stringify(R.sounds) + ')');
  } else say(false, '1366x768 the replay found no right piece of 90 degrees or more in stage 2\'s first session');
  if (M) {
    const turnEnd = M.frames.filter(f => f.t <= 5950), flipAt = M.frames.find(f => f.flipped);
    const turned = turnEnd.length ? turnEnd[turnEnd.length - 1].angle - M.task.startAngle : 0;
    const speed = speedOf(M.frames.filter(f => f.t <= 5950));
    const want = 6000 + 600 + angleOff(M.task.startAngle) / 60 * 1000;
    say(turnEnd.every(f => !f.flipped) && turned >= 350 && Math.abs(speed - 60) <= 3 && !!flipAt && flipAt.t >= 6000 && Math.abs(M.end.t - want) <= 100 && M.end.angle === 0 && M.end.flipped
      && M.sounds.filter(x => x === 'flip').length === 1 && M.sounds.filter(x => x === 'thunk').length === 1,
      '1366x768 a mirror set aside turns ' + turned.toFixed(0) + ' degrees in six seconds at ' + (speed || 0).toFixed(1) + ' a second unflipped, flips at ' + (flipAt ? flipAt.t.toFixed(0) : '?') + ' ms, turns home and ends seated at ' + M.end.t.toFixed(0) + ' ms (want ' + want.toFixed(0) + '), one flip and one thunk (' + JSON.stringify(M.sounds) + ')');
  } else say(false, '1366x768 the replay found no mirror in stage 2\'s first session');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 4 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluate(() => document.getElementById('start').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  for (let i = 0; i < SESSION_LENGTH; i++) { await seatByKeys(page); await page.keyboard.press('Enter'); await sleep(60); }
  for (let i = 0; i < firstMirror; i++) { await seatByKeys(page); await page.evaluate(() => document.getElementById('next').click()); await sleep(60); }
  const t0 = Date.now();
  await closeShelf(page); await steady(page); await tap(page, '#aside');
  await revealed(page);
  const ms = Date.now() - t0;
  const frames = await page.evaluate(() => window.NOTCH.revealFrames());
  const end = frames[frames.length - 1];
  say(ms <= 300 && end.angle === 0 && end.flipped, '1366x768 with less motion a mirror\'s whole reveal is done in ' + ms + ' ms (at most 300), seated and flipped');
  say(errors.length === 0, 'less motion: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' REVEAL FAILURE(S)'); process.exit(1); }
console.log('REVEAL OK');
