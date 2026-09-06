#!/usr/bin/env node
/* The Daily Wind: one wind a day, the same gusts for everyone, carried in a link.
 *
 *   node test/daily.mjs
 *
 * A #w= link is opened in two independent boots and both flights get the
 * same seed and mood (the premise: a friend flies YOUR gusts), which differ
 * from a free flight's. The link's tally is read back into words. The time
 * call at DAILY_FLIGHT_S ends the flight with its own word and a SHARE
 * button a thumb can reach; the journal keeps the day. Every step is a real
 * tap; the sim runs fast through UPDRAFT_DEV.timeScale, a clock and not a
 * placement.
 */
import { serve, open, reporter, tap, centre, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const LINK = '#w=2026-09-06.41.LD';
const screen = (page, name) => page.waitForFunction((n) => window.UPDRAFT_DEV.screen() === n, { timeout: 30000 }, name);
const dev = (page, fn, ...a) => page.evaluate(fn, ...a);

/* ---- a free flight's seed, for contrast ---- */
let freeSeed;
{
  const { browser, page } = await open(base);
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  freeSeed = await dev(page, () => window.UPDRAFT_DEV.state().seed);
  const chip = await dev(page, () => document.getElementById('btnMood').textContent);
  say(chip === 'FRESH' && !(await dev(page, () => window.UPDRAFT_DEV.daily().flying)), 'a free flight is not the daily (chip ' + chip + ')');
  await browser.close();
}

/* ---- boot one: the link ---- */
let seedA, moodA;
{
  const { browser, page, errors } = await open(base, { query: LINK });
  await browser.defaultBrowserContext().overridePermissions(base, ['clipboard-write', 'clipboard-read']);
  const btn = await dev(page, () => document.getElementById('btnDaily').textContent);
  say(btn === 'FLY THEIR WIND', 'the title button knows a friend sent the wind (' + btn + ')');
  /* ⛔ THIS PAIR OF ASSERTIONS USED TO PIN THE BUG. They required the literal string
     "the wind of 2026-09-06", so an ISO date in player copy, with its two dashes, was
     the thing the gate protected. They hold the LAW now: the invitation names the day
     in words, carries the height it was flown to, and contains no dash of any kind.
     The invitation is also a line in the title's column rather than a floating toast,
     because as a toast it covered the art, then the wordmark, then the sound row. */
  await page.waitForFunction(() => {
    const el = document.getElementById('titleFrom');
    return el && !el.hidden && el.textContent.length > 10;
  }, { timeout: 5000 }).catch(() => {});
  const t0 = await dev(page, () => {
    const el = document.getElementById('titleFrom');
    const cs = el ? getComputedStyle(el) : null;
    return { text: el ? el.textContent : '', shown: !!el && !el.hidden && cs.display !== 'none' && cs.visibility !== 'hidden' };
  });
  say(t0.shown, 'the friend\'s line is showing on the title, not hidden behind a toast');
  say(/6 September/.test(t0.text), 'and it names the day in words: "' + t0.text + '"');
  say(/41/.test(t0.text) && /Loop/.test(t0.text), 'with the height and the stamps it was flown to');
  say(!/[-\u2013\u2014]/.test(t0.text), 'and no dash of any kind in it, which an ISO date would carry');
  const hashGone = await dev(page, () => location.hash === '');
  say(hashGone, 'the address no longer carries the tally (a reload is a fresh day)');
  const c = await centre(page, '#btnDaily');
  say(!!c && c.w >= 48 && c.h >= 48 && c.onTop, 'DAILY WIND on the title is 48 px and on top (' + (c ? c.w.toFixed(0) + 'x' + c.h.toFixed(0) : 'missing') + ')');
  await tap(page, '#btnDaily'); await screen(page, 'play'); await waitFrames(page, 2);
  const d = await dev(page, () => window.UPDRAFT_DEV.daily());
  const s = await dev(page, () => window.UPDRAFT_DEV.state());
  seedA = s.seed; moodA = s.mood;
  say(d.flying === '2026-09-06', 'the flight is the daily of the link\'s date (' + d.flying + ')');
  say(seedA !== freeSeed, 'and its seed is not a free flight\'s (' + seedA + ' vs ' + freeSeed + ')');
  const chip = await dev(page, () => document.getElementById('btnMood').textContent);
  say(chip === 'DAILY', 'the chip says DAILY (' + chip + ')');
  /* the time call */
  await dev(page, () => window.UPDRAFT_DEV.timeScale(40));
  await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'end', { timeout: 90000 });
  const word = await dev(page, () => document.getElementById('endWord').textContent);
  say(word === 'TIME. THE DAILY WIND IS FLOWN', 'at three minutes the flight is called with its own word: "' + word + '"');
  const st = await dev(page, () => window.UPDRAFT_DEV.state());
  say(st.ended === 'daily' && st.endT >= 180 && st.endT < 180.02, 'called at DAILY_FLIGHT_S of sim time, 180 s (' + st.endT.toFixed(2) + ')');
  const sh = await centre(page, '#btnShare');
  say(!!sh && sh.h >= 48 && sh.onTop, 'SHARE THE WIND on the end screen, 48 px and on top (' + (sh ? sh.h.toFixed(0) : 'missing') + ')');
  const j = await dev(page, () => window.UPDRAFT_DEV.daily());
  say(j.journal && j.journal.date === '2026-09-06' && j.journal.tricks.length === 0, 'the journal keeps the day (' + JSON.stringify(j.journal) + ')');
  say(!!j.link && /\/index\.html#w=2026-09-06\.\d+\.$/.test(j.link), 'and the link carries date, altitude and stamps (' + j.link + ')');
  await tap(page, '#btnShare');
  await page.waitForFunction(() => document.getElementById('toast').classList.contains('on'), { timeout: 5000 }).catch(() => {});
  const t1 = await dev(page, () => document.getElementById('toast').textContent);
  say(/Link copied|#w=2026-09-06/.test(t1), 'a tap on SHARE copies the link or shows it: "' + t1 + '"');
  await tap(page, '#btnJournal2'); await screen(page, 'journal');
  const row = await dev(page, () => document.getElementById('jDaily').textContent);
  say(/6 SEP/.test(row), 'the journal row names the day in words: "' + row + '"');
  say(!/[-\u2013\u2014]/.test(row), 'and carries no dash, so it cannot be an ISO date again');
  say(/\bM\b/.test(row) && !/LOOP|DIVE/.test(row),
    'and it carries the height only, the stamps are the list below it: "' + row + '"');
  const sj = await centre(page, '#btnShareJ');
  say(!!sj && sj.h >= 48 && sj.onTop, 'SHARE THE WIND in the journal, 48 px and on top');
  say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

/* ---- boot two: the same link on another phone flies the same gusts ---- */
{
  const { browser, page } = await open(base, { query: LINK });
  await tap(page, '#btnDaily'); await screen(page, 'play'); await waitFrames(page, 2);
  const s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(s.seed === seedA && s.mood === moodA, 'a second boot of the same link gets the same seed and mood (' + s.seed + ', ' + s.mood + ')');
  const other = await dev(page, () => ({ seed: window.UPDRAFT_DEV.daily().seedFor('2026-09-07'), mood: window.UPDRAFT_DEV.daily().moodFor('2026-09-07') }));
  say(other.seed !== seedA, 'and the next day is another wind (' + other.seed + ')');
  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' DAILY FAILURE(S)'); process.exit(1); }
console.log('DAILY OK');
