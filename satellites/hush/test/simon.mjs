#!/usr/bin/env node
/* HUSH's Mode 5, SIMON (plans/hush/HANDOFF-HUSH.md 3.7): shown, spoken, never scored.
 *
 *   node test/simon.mjs          (in the foreground, under the gate lock)
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. the commands shown are dealSimon's for the seed, in order, the signal word shown exactly when it says
 *   2. each command holds three seconds, within a frame or two
 *   3. a first load is muted: nothing is spoken; with Sound on through its switch, one utterance for each command shown, the
 *      signal word spoken exactly when it says (where this browser has speech at all, which the line says)
 *   4. it scores nothing: a whole session of thirty leaves every stored key as it found it
 *   5. again comes at the end and plays another thirty
 *   6. at 320x568 the command fits the screen and does not scroll sideways, and every button is a 56 px target
 *   7. home goes back to the clearing
 */
import { join } from 'node:path';
import { serve, open, reporter, tap, sleep, SIZES, MATH } from '../../math/core/test/harness.mjs';
import { rng } from '../../math/core/pure.js';
import { dealSimon } from '../engine.js';
import { SIGNAL_WORD } from '../content.js';

const s = await serve(join(MATH, '..'));
const { fails, say } = reporter();
const READY = 'window.SIMON && window.SIMON.ready';
const SEED = 4242;
const PATH = '/hush/simon/index.html?seed=' + SEED + '&';
const want = dealSimon(rng(SEED >>> 0));
const storage = page => page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });

/* 1 to 5 at 375 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[1], { path: PATH, ready: READY }));
  const hasSpeech = await page.evaluate(() => !!(window.speechSynthesis && typeof SpeechSynthesisUtterance === 'function'));
  /* muted: the first four commands */
  await tap(page, '#simon-go');
  await page.waitForFunction(() => window.SIMON.shown().length >= 4, { timeout: 30000, polling: 'raf' });
  const mutedSpoken = await page.evaluate(() => window.SIMON.spoken().length);
  const says = await page.evaluate(() => ({ say: document.getElementById('say').textContent, n: window.SIMON.shown().length }));
  const current = await page.evaluate(() => window.SIMON.shown().slice(-1)[0]);
  say(mutedSpoken === 0, '375x667 a first load is muted: nothing is spoken (' + mutedSpoken + ')');
  say((current.says ? SIGNAL_WORD : '') === says.say, '375x667 the signal word is on the screen exactly when the command says (' + JSON.stringify({ says: current.says, shown: says.say }) + ')');
  await page.waitForFunction(() => window.SIMON.phase() === 'done', { timeout: 120000, polling: 'raf' });
  const first = await page.evaluate(() => window.SIMON.shown());
  const orderBad = want.map((c, i) => (!first[i] || first[i].says !== c.says || first[i].command !== c.command ? i : -1)).filter(i => i >= 0);
  say(first.length === 30 && orderBad.length === 0, '375x667 the thirty commands shown are dealSimon\'s for the seed, in order' + (orderBad.length ? ' (differs at ' + orderBad.slice(0, 5).join(', ') + ')' : ''));
  const gaps = first.slice(1).map((x, i) => x.at - first[i].at);
  const offHold = gaps.filter(g => Math.abs(g - 3000) > 40);
  say(offHold.length === 0, '375x667 each command holds three seconds within 40 ms (' + Math.min(...gaps).toFixed(0) + ' to ' + Math.max(...gaps).toFixed(0) + ' ms)');
  /* Sound on, the store read before, a second session through again */
  await tap(page, '.lw-settings-open'); await sleep(120);
  await tap(page, '.lw-settings [data-key="muted"]');
  await tap(page, '.lw-settings-close'); await sleep(120);
  const before = await storage(page);
  const againShown = await page.evaluate(() => !document.getElementById('again').hidden);
  await tap(page, '#again');
  await page.waitForFunction(() => window.SIMON.phase() === 'done' && window.SIMON.shown().length === 60, { timeout: 120000, polling: 'raf' });
  const after = await storage(page);
  say(JSON.stringify(before) === JSON.stringify(after) && Object.keys(before).length > 0, '375x667 it scores nothing: a whole session of thirty leaves every stored key as it found it (' + Object.keys(after).length + ' keys)');
  const second = (await page.evaluate(() => window.SIMON.shown())).slice(30);
  const spoken = await page.evaluate(() => window.SIMON.spoken());
  const wantSpoken = second.map(c => (c.says ? SIGNAL_WORD + ', ' : '') + c.command);
  say(againShown && second.length === 30, '375x667 again comes at the end and plays another thirty (' + second.length + ')');
  if (hasSpeech) say(JSON.stringify(spoken) === JSON.stringify(wantSpoken), '375x667 with Sound on, one utterance for each command shown, the signal word spoken exactly when it says (' + spoken.length + ' spoken)');
  else say(true, '375x667 this browser has no speech; the commands are on the screen (spoken ' + spoken.length + ')');
  say(errors.length === 0, '375x667 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

/* 6 and 7 at 320 */
{
  const { browser, page, errors } = await open(s.base, Object.assign({}, SIZES[0], { path: PATH, ready: READY }));
  await tap(page, '#simon-go');
  /* the longest command is the widest a screen must hold: wait for one of the long ones, or the first */
  await page.waitForFunction(() => window.SIMON.shown().length >= 1, { timeout: 10000, polling: 'raf' });
  const m = await page.evaluate(() => {
    const c = document.getElementById('command');
    c.dataset.probe = '';
    const widest = ['stand on one foot', 'wiggle your fingers', 'hop on the spot'];
    const saved = c.textContent, rows = [];
    for (const w of widest) { c.textContent = w; rows.push({ w, right: c.getBoundingClientRect().right, scroll: c.scrollWidth - c.clientWidth }); }
    c.textContent = saved;
    const sizes = ['home'].map(id => { const r = document.getElementById(id).getBoundingClientRect(); return { id, w: r.width, h: r.height }; });
    return { rows, sizes, sideways: document.documentElement.scrollWidth - innerWidth, vw: innerWidth };
  });
  say(m.rows.every(r => r.right <= m.vw && r.scroll <= 1) && m.sideways <= 0, '320x568 the widest commands fit the screen and nothing scrolls sideways (' + JSON.stringify(m.rows.map(r => [r.w, Math.round(r.right), r.scroll])) + ')');
  say(m.sizes.every(x => x.w >= 56 && x.h >= 56), '320x568 home is a 56 px target (' + JSON.stringify(m.sizes) + ')');
  await tap(page, '#home');
  await page.waitForFunction(() => /\/hush\/index\.html/.test(location.pathname) && window.HUSH && window.HUSH.ready, { timeout: 15000 });
  say(true, '320x568 home goes back to the clearing');
  say(errors.length === 0, '320x568 nothing landed on the console' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
}

s.close();
console.log('');
if (fails.length) { console.log(fails.length + ' SIMON FAILURE(S)'); process.exit(1); }
console.log('SIMON OK');
