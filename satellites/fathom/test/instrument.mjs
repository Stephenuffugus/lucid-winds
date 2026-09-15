#!/usr/bin/env node
/* CALL 62's INSTRUMENT, in a real browser (2026-09-15).
 *
 *   node test/instrument.mjs
 *
 * The stone economy is Stephen's design and nothing in the game's rules moved. What call 62 asked of a builder
 * is an instrument: with ?fathomtest=1, and only then, a panel on the cave that prints every attempt at the cave
 * you are in, so his next note on the counts has numbers under it. What it asserts, each watched to fail:
 *   1. without the flag nothing is drawn
 *   2. the flag does NOT open the self test (`fathomtest=1` contains `test=1`, and the boot read indexOf)
 *   3. the panel prints what the sim holds: its start and thrown are the run's own numbers after real taps
 *   4. RESTART CAVE, pressed for real, closes the attempt as restarted and opens a new one at zero thrown
 *   5. the panel sits out of the music chip's corner, reads at 0.7 rem or more, eats no tap, and CUTS NOTHING
 *      OFF, at 375 and at 320
 *
 * ⛔ 5 is there because the first version of this gate read the panel's textContent and passed while the panel
 * clipped every line at "cached 0 ref" on the screen (p5-instrument-mid): the words were in the DOM and not on
 * the phone. What the eye gets is the scroll box against the client box.
 * ⛔ Every press is a real pointer event on the element a thumb lands on; every wait is on what the sim believes.
 */
import { serve, open, reporter, tap, tapAt, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();

async function intoCave(page) {
  await tap(page, '#btnPlay');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
  await tap(page, '.card[data-lv="0"]');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
  await waitFrames(page, 6);
}
const panelOf = (page) => page.evaluate(() => {
  const d = document.getElementById('devPanel');
  if (!d) return { has: false, shown: false, text: '' };
  const cs = getComputedStyle(d), r = d.getBoundingClientRect();
  return { has: true, shown: cs.display !== 'none' && r.width > 0, text: d.textContent, font: parseFloat(cs.fontSize),
    pe: cs.pointerEvents, l: r.left, t: r.top, r: r.right, b: r.bottom, H: innerHeight, W: innerWidth,
    sw: d.scrollWidth, cw: d.clientWidth, sh: d.scrollHeight, ch: d.clientHeight };
});
const cutOf = p => p.shown && (p.sw > p.cw + 1 || p.sh > p.ch + 1);

/* 1. no flag, no panel */
{
  const { browser, page, errors } = await open(base);
  await intoCave(page);
  const p = await panelOf(page);
  say(!p.shown, 'without ?fathomtest=1 the cave draws no stones panel (' + (p.has ? (p.shown ? 'shown' : 'present, hidden') : 'absent') + ')');
  say(errors.length === 0, 'nothing on the console without the flag' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

/* 2 to 5. with the flag, at the middle phone and the narrowest */
for (const size of [{ width: 375, height: 667 }, { width: 320, height: 568 }]) {
  const tag = size.width + 'x' + size.height;
  const { browser, page, errors } = await open(base, size);
  await page.goto(base + '/index.html?fathomtest=1&probe=' + Math.floor(Math.random() * 1e9), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.FATHOM_DEV && window.FATHOM_DEV.frames() > 2, { timeout: 30000 });
  const selfTest = await page.evaluate(() => document.getElementById('testPanel').classList.contains('on'));
  say(!selfTest, tag + ' the flag does not open the self test over the game (' + (selfTest ? 'the self test panel is up' : 'no self test') + ')');
  await intoCave(page);

  const s0 = await page.evaluate(() => window.FATHOM_DEV.state());
  const inst0 = await page.evaluate(() => window.FATHOM_DEV.instrument ? window.FATHOM_DEV.instrument() : null);
  const start = inst0 && inst0.attempts.length ? inst0.attempts[inst0.attempts.length - 1].start : null;
  say(start !== null && start === s0.stones, tag + ' the attempt starts with the stones the run holds (' + start + ' against ' + s0.stones + ')');

  /* two real taps on the cave, each waited on until the sim has thrown it */
  let threw = 0;
  for (let k = 0; k < 2; k++) {
    const s = await page.evaluate(() => window.FATHOM_DEV.state());
    const here = await page.evaluate(() => { const p = window.FATHOM_DEV.player(); return window.FATHOM_DEV.screenOf(p.x, p.y); });
    await tapAt(page, Math.round(here.x + (k ? -30 : 30)), Math.round(here.y + 70));
    const ok = await page.waitForFunction((n) => window.FATHOM_DEV.state().throws === n + 1, { timeout: 20000 }, s.throws).then(() => true).catch(() => false);
    if (ok) threw++;
  }
  await waitFrames(page, 4);
  const s1 = await page.evaluate(() => window.FATHOM_DEV.state());
  const p1 = await panelOf(page);
  say(threw === 2 && s1.throws === 2, tag + ' two real taps threw two stones (' + s1.throws + ' throws); the panel ate neither tap (pointer events ' + p1.pe + ')');
  say(p1.shown && new RegExp('try 1 +start ' + start + ' +thrown ' + s1.throws + '\\b').test(p1.text),
    tag + ' the panel prints what the sim holds: ' + JSON.stringify(p1.text));
  say(p1.shown && p1.font >= 11.2, tag + ' and reads at 0.7 rem or more (' + (p1.font || 0).toFixed(1) + ' px)');
  const inCorner = p1.shown && p1.l < 120 && p1.b > p1.H - 120;
  say(p1.shown && !inCorner && p1.r <= p1.W && p1.b <= p1.H, tag + ' and sits inside the screen, out of the music chip\'s 120 by 120 ('
    + [p1.l, p1.t, p1.r, p1.b].map(v => Math.round(v || 0)).join(', ') + ')');
  say(p1.shown && !cutOf(p1), tag + ' and cuts nothing off (scroll ' + p1.sw + ' by ' + p1.sh + ' in a box of ' + p1.cw + ' by ' + p1.ch + ')');

  /* 4. RESTART CAVE for real */
  await tap(page, '#btnPause');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'pause', { timeout: 20000 });
  await tap(page, '#btnRestart');
  await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play' && window.FATHOM_DEV.state().throws === 0, { timeout: 20000 }).catch(() => {});
  await waitFrames(page, 4);
  const p2 = await panelOf(page);
  say(/try 1 +start \d+ +thrown 2\b[^\n]*\n[^\n]*restarted/.test(p2.text) && /try 2 +start \d+ +thrown 0\b[^\n]*\n[^\n]*now/.test(p2.text),
    tag + ' RESTART CAVE closes the attempt as restarted and opens the next at nothing thrown: ' + JSON.stringify(p2.text));
  say(p2.shown && !cutOf(p2), tag + ' and with two attempts on it the panel still cuts nothing off (scroll ' + p2.sw + ' by ' + p2.sh + ' in a box of ' + p2.cw + ' by ' + p2.ch + ')');

  say(errors.length === 0, tag + ' nothing on the console with the flag' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' INSTRUMENT FAILURE(S)'); process.exit(1); }
console.log('INSTRUMENT OK');
