#!/usr/bin/env node
/* NOTCH's FIND, played by real taps and keys against the engine replayed in Node (plans/notch/HANDOFF-NOTCH.md 3.10, P2).
 *
 *   node test/find.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. every panel is dealFind's for the seed: its piece and its regions, in their slots, mirrored and turned as dealt
 *   2. the target above is drawn as the panel's piece
 *   3. every region is a 56 px button a thumb lands on, drawn as its own piece, with no words
 *   4. exactly one region is drawn as the target itself (the same outline, point for point), and it is the slot Node names
 *   5. a right tap and a wrong tap alike: the chosen region stays marked, the piece's own region is outlined, one thunk, and go on
 *      comes after the same hold; the result is right exactly when the tap was the piece's slot
 *   6. 1366x768 by keys: the first region takes focus, Enter answers, focus moves to go on, Enter deals the next panel with focus
 *      on its first region
 *   7. nothing landed on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, centre, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealFind } from '../engine.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.NOTCH && window.NOTCH.ready';
const SEED = 4242;
const ROUNDS = 4;
const replay = rng(SEED >>> 0);
const panels = Array.from({ length: ROUNDS + 1 }, () => dealFind(replay, { stage: 1 }));
const pieceSlot = p => p.regions.find(g => g.pieceId === p.pieceId && !g.mirror && (g.turn || 0) === 0).slot;
const revealed = page => page.waitForFunction(() => window.NOTCH.revealDone(), { timeout: 30000, polling: 'raf' });

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  await tap(page, '#start-find');
  await sleep(150);
  const seam = [], drawnBad = [], smallBad = [], identity = [], marks = [], holds = [];
  for (let i = 0; i < ROUNDS; i++) {
    const want = panels[i], got = await page.evaluate(() => window.NOTCH.panel());
    if (JSON.stringify(got) !== JSON.stringify(want)) seam.push(i + ': page ' + JSON.stringify(got).slice(0, 80) + ' Node ' + JSON.stringify(want).slice(0, 80));
    const view = await page.evaluate(() => {
      const target = document.querySelector('#target svg');
      const regions = Array.from(document.querySelectorAll('#panel .region')).map(b => ({ slot: Number(b.dataset.slot), piece: b.querySelector('svg') && b.querySelector('svg').dataset.piece, points: b.querySelector('svg polygon[data-part="piece"]') && b.querySelector('svg polygon[data-part="piece"]').getAttribute('points'), text: b.innerText.trim() }));
      return { target: target && target.dataset.piece, targetPoints: target && target.querySelector('polygon[data-part="piece"]').getAttribute('points'), regions };
    });
    if (view.target !== want.pieceId) drawnBad.push(i + ' target drawn as ' + view.target);
    for (const g of want.regions) {
      const v = view.regions.find(x => x.slot === g.slot);
      if (!v || v.piece !== g.pieceId || v.text !== '') drawnBad.push(i + ' slot ' + g.slot + ' drawn ' + JSON.stringify(v && { piece: v.piece, text: v.text }));
      const c = await centre(page, '#panel .region[data-slot="' + g.slot + '"]');
      if (!c || c.w < 56 || c.h < 56 || !c.onTop) smallBad.push(i + '/' + g.slot);
    }
    const same = view.regions.filter(v => v.points === view.targetPoints).map(v => v.slot);
    identity.push({ same, want: pieceSlot(want) });
    const choice = i % 2 === 0 ? pieceSlot(want) : want.regions.find(g => g.slot !== pieceSlot(want)).slot;
    const thunks0 = (await page.evaluate(() => window.NOTCH.audio.sounded())).filter(x => x === 'thunk').length;
    const t0 = Date.now();
    await tap(page, '#panel .region[data-slot="' + choice + '"]');
    await revealed(page);
    holds.push(Date.now() - t0);
    const after = await page.evaluate(() => ({
      pressed: Array.from(document.querySelectorAll('#panel .region[aria-pressed="true"]')).map(b => Number(b.dataset.slot)),
      outlined: Array.from(document.querySelectorAll('#panel .region.is-piece')).map(b => Number(b.dataset.slot)),
      result: window.NOTCH.results[window.NOTCH.results.length - 1],
      thunks: window.NOTCH.audio.sounded().filter(x => x === 'thunk').length,
      next: !document.getElementById('next').hidden
    }));
    marks.push({ i, choice, piece: pieceSlot(want), right: choice === pieceSlot(want), pressed: after.pressed, outlined: after.outlined, correct: after.result.correct, thunks: after.thunks - thunks0, next: after.next });
    await tap(page, '#next');
    await sleep(100);
  }
  say(seam.length === 0, '375x667 every panel is dealFind\'s for the seed, piece and regions as dealt' + (seam.length ? ': ' + seam.slice(0, 2).join('; ') : ''));
  say(drawnBad.length === 0, '375x667 the target is drawn as the panel\'s piece and every region as its own, with no words' + (drawnBad.length ? ': ' + drawnBad.slice(0, 4).join('; ') : ''));
  say(smallBad.length === 0, '375x667 every region is a 56 px button a thumb lands on' + (smallBad.length ? ' (small: ' + smallBad.join(', ') + ')' : ''));
  say(identity.every(x => x.same.length === 1 && x.same[0] === x.want), '375x667 exactly one region is drawn as the target itself, the slot Node names (' + JSON.stringify(identity) + ')');
  const spread = Math.max(...holds) - Math.min(...holds);
  /* ⛔ this law counted outlines and never said WHICH region carried one, so plant f1 (outline the chosen region instead of the
     piece) kept the count at one and sailed through green. A reveal that outlines the wrong region teaches a child the wrong
     piece, which is the whole point of the screen. The slot is named now. */
  say(marks.every(m => m.pressed.length === 1 && m.pressed[0] === m.choice && m.outlined.length === 1 && m.outlined[0] === m.piece && m.correct === m.right && m.thunks === 1 && m.next) && marks.some(m => !m.right) && spread <= 250,
    '375x667 right and wrong alike: the choice stays marked, the piece\'s region is outlined, one thunk, go on after the same hold (holds ' + holds.join(', ') + ' ms) ' + JSON.stringify(marks.map(m => ({ right: m.right, correct: m.correct, pressed: m.pressed, outlined: m.outlined, thunks: m.thunks }))));
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[3], { path: '/notch/index.html?seed=' + SEED + '&', ready: READY }));
  await page.evaluate(() => document.getElementById('start-find').focus());
  await page.keyboard.press('Enter');
  await sleep(150);
  const focus0 = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('region') ? Number(document.activeElement.dataset.slot) : null);
  await page.keyboard.press('Enter');
  await revealed(page);
  const onNext = await page.evaluate(() => document.activeElement && document.activeElement.id);
  const answered = await page.evaluate(() => window.NOTCH.results.length);
  await page.keyboard.press('Enter');
  await sleep(150);
  const focus1 = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('region') ? Number(document.activeElement.dataset.slot) : null);
  const second = await page.evaluate(() => window.NOTCH.panel());
  say(focus0 === panels[0].regions[0].slot && answered === 1 && onNext === 'next' && focus1 === panels[1].regions[0].slot && JSON.stringify(second) === JSON.stringify(panels[1]),
    '1366x768 by keys: the first region takes focus, Enter answers, go on takes focus, Enter deals the next panel with focus on its first region (' + JSON.stringify({ focus0, answered, onNext, focus1 }) + ')');
  say(errors.length === 0, '1366x768 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' FIND FAILURE(S)'); process.exit(1); }
console.log('FIND OK');
