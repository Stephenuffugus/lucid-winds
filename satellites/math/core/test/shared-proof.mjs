#!/usr/bin/env node
/* Proof that every shared assertion can fail (plans/math/HANDOFF-CORE.md P3).
 *
 *   node test/shared-proof.mjs
 *
 * Each assertion in test/shared.mjs runs twice: GREEN on the live demo or the live folder,
 * and RED on a planted fault. The faults are real misbehaviour, not doctored numbers: a
 * fetch after load, a file that asks for the camera, a forbidden word, a page that swallows
 * Enter, figures forced back to proportional, a line pinned in place, a flash hidden on a
 * timer. An assertion that cannot be made red is decoration and a game must not import it.
 */
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { serve, open, reporter, SIZES, MATH } from './harness.mjs';
import {
  assertNoNetworkAfterLoad, assertNoGetUserMedia, assertForbiddenStrings, assertKeyboardCompletable,
  assertTabularNumerals, assertLineRandomization, assertTimingPicksNearest
} from './shared.mjs';

const { fails, say } = reporter();
const pair = (name, green, red) => {
  say(green.ok, name + ' is green on the live thing (' + green.detail + ')');
  say(!red.ok, name + ' is red on its planted fault (' + red.detail + ')');
};

/* ---- the folder assertions ---- */
{
  const tmp = mkdtempSync(join(tmpdir(), 'core-shared-'));
  writeFileSync(join(tmp, 'game.js'), 'export function cam() { return navigator.mediaDevices.getUserMedia({ video: true }); }\n');
  pair('assertNoGetUserMedia', assertNoGetUserMedia(MATH), assertNoGetUserMedia(tmp));
  const words = mkdtempSync(join(tmpdir(), 'core-shared-'));
  writeFileSync(join(words, 'index.html'), '<p>Play every day and get smarter</p>\n');
  pair('assertForbiddenStrings', assertForbiddenStrings(MATH), assertForbiddenStrings(words));
  const span = mkdtempSync(join(tmpdir(), 'core-shared-'));
  writeFileSync(join(span, 'index.html'), '<p>Drag stones to find the answer</p>\n');
  pair('assertForbiddenStrings with a game\'s own words', assertForbiddenStrings(MATH, ['answer', 'solve']),
    assertForbiddenStrings(span, ['answer', 'solve']));
  /* a game's words are about what a child reads: a comment and a field called answer are code, a string is copy */
  const code = mkdtempSync(join(tmpdir(), 'core-shared-'));
  writeFileSync(join(code, 'engine.js'), '/* the answer the rule would give */\nexport const score = ({ answer }) => answer === 1;\n');
  const shown = mkdtempSync(join(tmpdir(), 'core-shared-'));
  writeFileSync(join(shown, 'engine.js'), "export const caption = 'Find the answer';\n");
  pair('assertForbiddenStrings reads copy, not code', assertForbiddenStrings(code, ['answer']),
    assertForbiddenStrings(shown, ['answer']));
  for (const d of [tmp, words, span, code, shown]) rmSync(d, { recursive: true, force: true });
}

const s = await serve();

/* ---- the page assertions, on a phone ---- */
{
  const live = await open(s.base, SIZES[1]);
  const green = await assertNoNetworkAfterLoad(live);
  const planted = await open(s.base, SIZES[1]);
  await planted.page.evaluate(() => setTimeout(() => fetch('../core.css?v=20260915a'), 300));
  const red = await assertNoNetworkAfterLoad(planted);
  pair('assertNoNetworkAfterLoad', green, red);
  await planted.browser.close();

  const tabGreen = await assertTabularNumerals(live.page);
  await live.page.addStyleTag({ content: '* { font-variant-numeric: normal !important; }' });
  const tabRed = await assertTabularNumerals(live.page);
  pair('assertTabularNumerals', tabGreen, tabRed);
  await live.browser.close();

  const lines = await open(s.base, SIZES[1]);
  const lineGreen = await assertLineRandomization(lines.page, { next: () => CORE_DEMO.next(), line: '#stage .lw-line' });
  const lineRed = await assertLineRandomization(lines.page, {
    next: () => { CORE_DEMO.next(); const l = document.querySelector('#stage .lw-line'); l.style.left = '10%'; l.style.width = '80%'; },
    line: '#stage .lw-line'
  });
  pair('assertLineRandomization', lineGreen, lineRed);

  const flashGreen = await assertTimingPicksNearest(lines.page, { flash: o => CORE_DEMO.flash(o) });
  /* a sloppy flash: shown on a frame, hidden by a timer that overshoots, the S1 mistake */
  const flashRed = await assertTimingPicksNearest(lines.page, {
    flash: ({ durationMs }) => new Promise(done => requestAnimationFrame(t0 => {
      setTimeout(() => requestAnimationFrame(t1 => done({ shownAt: t0, hiddenAt: t1, interval: 16.7 })), durationMs + 60);
    }))
  });
  pair('assertTimingPicksNearest', flashGreen, flashRed);
  await lines.browser.close();
}

/* ---- keyboard, on the Chromebook with no touch ---- */
{
  const steps = [{ key: 'Tab', until: '#stage .lw-stone' }, { key: 'ArrowRight', times: 5 }, 'Enter'];
  const live = await open(s.base, SIZES[3]);
  const green = await assertKeyboardCompletable(live.page, steps, () => CORE_DEMO.results.length > 0);
  await live.browser.close();
  const planted = await open(s.base, SIZES[3]);
  await planted.page.evaluate(() => window.addEventListener('keydown', e => { if (e.key === 'Enter') e.stopImmediatePropagation(); }, true));
  const red = await assertKeyboardCompletable(planted.page, steps, () => CORE_DEMO.results.length > 0);
  pair('assertKeyboardCompletable', green, red);
  await planted.browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SHARED FAILURE(S)'); process.exit(1); }
console.log('SHARED OK');
