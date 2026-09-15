#!/usr/bin/env node
/* BRIM P2: Mode 2 HALF (plans/brim/HANDOFF-BRIM.md P2; the handoff's build step 5).
 *
 *   node test/half.mjs          (in the foreground, under the gate lock)
 *
 * An etched line at half of every glass, always there in this mode; it brightens once both glasses have filled. Pairs on
 * one side of a half come only after a streak of five right, from the next session on. Played by real taps on ?mode=half.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. at 375: both glasses carry the half line at exactly half their inside height, dashed and not bright before a choice
 *   2. B1 still: no water before a choice
 *   3. every pair is dealSession's for HALF: session 0 dealt closed, and session 1 dealt open because the first five rounds
 *      were right (the page's streak, read back)
 *   4. before the streak no pair lies on one side of a half
 *   5. a wrong choice sets the streak back to nothing, and the page opens same side pairs only after five right in a row
 *   6. after the reveal both half lines are bright, and the caption is the fact
 *   7. both glasses 56 px targets; nothing fetched after load; nothing on the console
 */
import { join } from 'node:path';
import { serve, open, reporter, centre, tap, SIZES, sleep, MATH } from '../../math/core/test/harness.mjs';
import { assertNoNetworkAfterLoad } from '../../math/core/test/shared.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSession, scoreChoice, features } from '../engine.js';
import { caption } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const SEED = 4242;
const READY = 'window.BRIM && window.BRIM.ready';
const text = f => f.n + '/' + f.d;
const val = f => f.n / f.d;
const revealed = page => page.waitForFunction(() => window.BRIM.revealDone(), { timeout: 30000 }).then(() => sleep(100));
const halfLines = page => page.evaluate(() => ['left', 'right'].map(id => {
  const g = document.querySelector('#' + id + ' .glass'), h = document.querySelector('#' + id + ' .half-line');
  const gr = g.getBoundingClientRect(), hr = h.getBoundingClientRect(), cs = getComputedStyle(h);
  const insideBottom = gr.top + g.clientTop + g.clientHeight;
  /* the stroke's centre, not the box's top edge: the line is a border, and its middle is where the eye reads it */
  const centre = hr.top + parseFloat(cs.borderTopWidth) / 2;
  return { shown: cs.display !== 'none', fromBottom: insideBottom - centre, inner: g.clientHeight, style: cs.borderTopStyle, bright: h.classList.contains('bright') };
}));
const dry = page => page.evaluate(() => ['left', 'right'].every(id => { const w = document.querySelector('#' + id + ' .water'); return w.getBoundingClientRect().height < 0.5 && getComputedStyle(w).visibility === 'hidden'; }));

/* the page's run, all right: session 0 closed; five right open HALF, so session 1 is dealt open */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/brim/index.html?seed=' + SEED + '&grade=4&mode=half&', ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const lines = await halfLines(page);
  say(lines.every(l => l.shown && Math.abs(l.fromBottom - l.inner / 2) <= 1 && l.style === 'dashed' && !l.bright),
    '375x667 both glasses carry the half line at exactly half their inside height, dashed, not bright before a choice (' + JSON.stringify(lines.map(l => [l.fromBottom.toFixed(1), l.inner, l.style, l.bright])) + ')');
  const small = [];
  for (const sel of ['#left', '#right']) { const r = await centre(page, sel); if (!r || r.w < 56 || r.h < 56 || !r.onTop) small.push(sel); }
  say(small.length === 0, '375x667 both glasses are 56 px targets a thumb lands on' + (small.length ? ': ' + small.join(', ') : ''));

  const r = rng(SEED >>> 0);
  const closed = dealSession(r, { mode: 'half', grade: 4, session: 0, sameSideOpen: false });
  const openSession = dealSession(r, { mode: 'half', grade: 4, session: 1, sameSideOpen: true });
  const want = closed.concat(openSession.slice(0, 2));
  const rows = [];
  for (let i = 0; i < 14; i++) {
    if (i) { await tap(page, '#next'); await sleep(200); }
    const got = await page.evaluate(() => window.BRIM.pair());
    const wet = !(await dry(page));
    const side = scoreChoice(want[i], 'left').larger === 'right' ? 'right' : 'left';
    await tap(page, '#' + side);
    await revealed(page);
    const after = await halfLines(page), cap = await page.evaluate(() => document.getElementById('caption').textContent);
    const big = val(want[i].left) >= val(want[i].right) ? want[i].left : want[i].right, little = big === want[i].left ? want[i].right : want[i].left;
    rows.push({ i, seam: text(got.left) === text(want[i].left) && text(got.right) === text(want[i].right), wet, bright: after.every(l => l.bright), cap: cap === caption(big, little, false),
      sameSide: features(got).includes('same-side-half'), open: await page.evaluate(() => window.BRIM.halfOpen()), got: text(got.left) + ' ' + text(got.right) });
  }
  say(rows.every(x => x.seam), '375x667 every pair is dealSession\'s for HALF, session 0 dealt closed and session 1 dealt open (' + rows.map(x => x.seam ? 'ok' : 'OFF ' + x.got).join(',') + ')');
  say(rows.every(x => !x.wet), '375x667 B1: no water before any choice');
  say(rows.slice(0, 12).every(x => !x.sameSide), '375x667 before the streak no pair lies on one side of a half (' + rows.slice(0, 12).filter(x => x.sameSide).map(x => x.got).join(', ') + ')');
  say(rows.slice(0, 4).every(x => !x.open) && rows.slice(4).every(x => x.open), '375x667 five right in a row open same side pairs, not four (' + rows.map(x => x.open ? 1 : 0).join('') + ')');
  say(rows.every(x => x.bright && x.cap), '375x667 after every reveal both half lines are bright and the caption is the fact');
  const g2 = await assertNoNetworkAfterLoad(opened);
  say(g2.ok, '375x667 nothing is fetched after load (' + g2.detail + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* a wrong choice sets the streak back */
{
  const opened = await open(s.base, Object.assign({}, SIZES[1], { path: '/brim/index.html?seed=' + SEED + '&grade=4&mode=half&', ready: READY }));
  const { browser, page, errors } = opened;
  await tap(page, '#start');
  await sleep(250);
  const streaks = [];
  for (let i = 0; i < 7; i++) {
    if (i) { await tap(page, '#next'); await sleep(200); }
    const got = await page.evaluate(() => window.BRIM.pair());
    const right = scoreChoice(got, 'left').larger === 'right' ? 'right' : 'left';
    const side = i === 3 ? (right === 'left' ? 'right' : 'left') : right;
    await tap(page, '#' + side);
    await revealed(page);
    streaks.push(await page.evaluate(() => [window.BRIM.streak(), window.BRIM.halfOpen()]));
  }
  say(JSON.stringify(streaks.map(x => x[0])) === '[1,2,3,0,1,2,3]' && streaks.every(x => !x[1]), '375x667 a wrong choice sets the streak back to nothing, and seven rounds with one wrong open nothing (' + JSON.stringify(streaks) + ')');
  say(errors.length === 0, '375x667 streak: nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' HALF FAILURE(S)'); process.exit(1); }
console.log('HALF OK');
