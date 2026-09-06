#!/usr/bin/env node
/* THE DAILY LAKE GATE, with real pointers.
 *
 *   flock -w 1800 /tmp/sws-gate.lock node test/daily.mjs
 *
 * What it proves, in order:
 *   1. the menu opens the daily lake, the bank goes away and the day's stone
 *      is in the hand, whatever the player had picked
 *   2. five REAL flicks on the canvas fill five throws, in order, and the sixth
 *      does not count
 *   3. the card comes up on its own after the fifth sink and shows the five
 *      numbers the model produced, and SHARE is there at 48 px
 *   4. the link round trips: a FRESH browser opened on it shows the same five
 *      numbers and the same stone, with THROW YOURS at 48 px and no SHARE
 *   5. the buttons a thumb needs are what elementFromPoint finds at their centre
 *
 * Shape copied from test/flick.mjs.
 */
import { serve, open, reporter, tap, flick, stroke, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = fn => page.evaluate(fn);
const hit = (pg, sel) => pg.evaluate(sel => {
  const el = document.querySelector(sel); if (!el) return { ok: false, why: 'missing' };
  const r = el.getBoundingClientRect();
  const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { ok: !!at && (at === el || el.contains(at)), w: r.width, h: r.height, why: at ? (at.id || at.className) : 'nothing' };
}, sel);

say(errors.length === 0, 'the page boots clean' + (errors.length ? ': ' + errors.join(' | ') : ''));

/* 1. into the daily lake */
await tap(page, '#btnPlay');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 20000 });
await tap(page, '.stone[data-id="skimmer"]');
await tap(page, '#btnMenu');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'sheet', { timeout: 10000 });
const bd = await hit(page, '#btnDaily');
say(bd.ok && bd.w >= 48 && bd.h >= 48, 'DAILY LAKE is on the sheet at ' + bd.w.toFixed(0) + 'x' + bd.h.toFixed(0) + ' and a thumb lands on it');
await tap(page, '#btnDaily');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake' && window.GERPLUNK_DEV.daily().on, { timeout: 10000 }).catch(() => {});
const d0 = await dev(() => window.GERPLUNK_DEV.daily());
const stone0 = await dev(() => window.GERPLUNK_DEV.stone());
say(d0.on, 'the daily lake is on');
say(d0.bank.length === 1 && d0.bank[0] === d0.stone, 'and the bank holds one stone today, the day\'s: ' + d0.bank.join(' '));
say(stone0 === d0.stone, 'the day\'s stone is in the hand, not the skimmer the player picked: ' + stone0 + ' (day says ' + d0.stone + ')');
say(d0.throws.length === 0, 'nothing thrown yet');

/* 2. five real flicks */
const lay = await dev(() => window.GERPLUNK_DEV.layout());
const y0 = Math.round(lay.H * 0.72), x0 = Math.round(lay.W * 0.32);
const seen = [];
for (let i = 0; i < 5; i++) {
  const f = await flick(page, stroke({ x0, y0, arc: 260 + i * 18, ms: 170, rise: 0.5 + i * 0.03, hook: 0.7, n: 14 }));
  const smp = await dev(() => window.GERPLUNK_DEV.samples());
  const scr = await dev(() => ({ screen: window.GERPLUNK_DEV.screen(), touch: window.GERPLUNK_DEV.state().inFlight, line: window.GERPLUNK_DEV.state().line }));
  console.log('        stroke ' + (i + 1) + ' landed on ' + f.el + ' over ' + f.ms.toFixed(0) + ' ms; page has ' + (smp ? smp.n + ' samples over ' + smp.ms.toFixed(0) + ' ms' : 'no samples') + '; screen ' + scr.screen + (scr.line ? '; line: ' + scr.line : ''));
  const ok = await page.waitForFunction(i => window.GERPLUNK_DEV.daily().throws.length === i + 1, { timeout: 15000 }, i).then(() => true).catch(() => false);
  const d = await dev(() => window.GERPLUNK_DEV.daily());
  const res = await dev(() => window.GERPLUNK_DEV.lastResult());
  say(ok && d.throws.length === i + 1, 'throw ' + (i + 1) + ' of five is on the card: ' + d.throws.length + ' recorded' + (res ? ' (' + res.skips + ' skips, ' + res.distance.toFixed(1) + ' m)' : ''));
  if (res) { seen.push(res.skips); say(d.throws[i] && d.throws[i].skips === res.skips, 'and it is the count the model gave: ' + (d.throws[i] ? d.throws[i].skips : 'none') + ' against ' + res.skips); }
  /* wait for the sink and the rings so the next flick starts on still water */
  await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight, { timeout: 15000 }).catch(() => {});
  if (i < 4) await waitFrames(page, 6);
}

/* 3. the card */
const cardUp = await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'card', { timeout: 15000 }).then(() => true).catch(() => false);
say(cardUp, 'the card comes up on its own after the fifth sink');
const card = await dev(() => window.GERPLUNK_DEV.card());
const mine = await dev(() => window.GERPLUNK_DEV.daily());
say(card.slots.length === 5 && card.slots.every((v, i) => Number(v) === mine.throws[i].skips), 'the card shows the five numbers thrown: ' + card.slots.join(' ') + ' against ' + mine.throws.map(t => t.skips).join(' '));
say(card.share && !card.throwMine, 'SHARE is there and THROW YOURS is not, because these are mine');
const bs = await hit(page, '#btnShare');
say(bs.ok && bs.w >= 48 && bs.h >= 48, 'SHARE THE LAKE at ' + bs.w.toFixed(0) + 'x' + bs.h.toFixed(0) + ' and a thumb lands on it');
const link = await dev(() => window.GERPLUNK_DEV.dailyLink());
say(/#d=\d{4}-\d{2}-\d{2}\.[a-z]+\.[\d,]+\.[\d.,]+$/.test(link), 'the link carries the date, the stone and the numbers: ' + link.slice(link.indexOf('#')));
/* the share button in headless has no navigator.share, so the fallback field must show the link */
await tap(page, '#btnShare');
await waitFrames(page, 2);
const afterShare = await dev(() => window.GERPLUNK_DEV.card());
say(afterShare.out === link, 'with no share sheet the link is put in the hand as text: ' + (afterShare.out ? 'shown' : 'NOT shown'));

/* a sixth flick must not count */
await tap(page, '#btnCardBack');
await page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake', { timeout: 10000 });
await flick(page, stroke({ x0, y0, arc: 300, ms: 170, rise: 0.55, hook: 0.7, n: 14 }));
await page.waitForFunction(() => !window.GERPLUNK_DEV.state().inFlight && window.GERPLUNK_DEV.lastResult() !== null, { timeout: 15000 }).catch(() => {});
const six = await dev(() => window.GERPLUNK_DEV.daily());
say(six.throws.length === 5, 'a sixth throw is a throw on the lake but not on the card: still ' + six.throws.length);

/* 4. the round trip, in a fresh browser */
await browser.close();
const hash = link.slice(link.indexOf('#'));
const fresh = await open(base, { query: hash });
const s2 = await fresh.page.evaluate(() => window.GERPLUNK_DEV.screen());
say(s2 === 'card', 'a fresh browser opened on the link lands on the card: ' + s2);
const card2 = await fresh.page.evaluate(() => window.GERPLUNK_DEV.card());
const d2 = await fresh.page.evaluate(() => window.GERPLUNK_DEV.daily());
say(card2.slots.join(',') === card.slots.join(','), 'and it shows the sender\'s five: ' + card2.slots.join(' '));
say(d2.stone === mine.stone && d2.day === mine.day, 'on the same day with the same stone: ' + d2.stone + ' on ' + d2.day);
say(!card2.share && card2.throwMine, 'THROW YOURS is there and SHARE is not, because these are not mine');
const bt = await hit(fresh.page, '#btnThrowMine');
say(bt.ok && bt.w >= 48 && bt.h >= 48, 'THROW YOURS at ' + bt.w.toFixed(0) + 'x' + bt.h.toFixed(0) + ' and a thumb lands on it');
await tap(fresh.page, '#btnThrowMine');
await fresh.page.waitForFunction(() => window.GERPLUNK_DEV.screen() === 'lake' && window.GERPLUNK_DEV.daily().on, { timeout: 10000 }).catch(() => {});
const d3 = await fresh.page.evaluate(() => window.GERPLUNK_DEV.daily());
say(d3.on && d3.throws.length === 0 && d3.day === mine.day, 'and the recipient is on the sender\'s lake with five throws to make: day ' + d3.day + ', ' + d3.throws.length + ' thrown');
say(fresh.errors.length === 0, 'the fresh page booted clean' + (fresh.errors.length ? ': ' + fresh.errors.join(' | ') : ''));
await fresh.browser.close();

close();
console.log('');
if (fails.length) { console.log(fails.length + ' DAILY FAILURE(S)'); process.exit(1); }
console.log('DAILY OK');
