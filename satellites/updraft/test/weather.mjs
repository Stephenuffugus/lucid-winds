#!/usr/bin/env node
/* Real Wind, the promise on the store page, held to its laws in a real page.
 *
 *   node test/weather.mjs
 *
 * The laws: nothing is fetched until the player turns the toggle on (counted
 * at the network, from boot, not from the module's own counter); when it is
 * on, one Open-Meteo call with no key, answered here by an interceptor with
 * literal numbers, and the flight's base wind is those numbers in m/s; a
 * second flight inside the hour makes no second call; under 3 mph the app
 * says so and flies Gentle; a 500 falls back to the picked mood and says so;
 * turning it off returns the chip to the mood. The direction only changes
 * the words. Every step is a real tap on the card.
 */
import { serve, open, reporter, tap, centre, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { fails, say } = reporter();
const MPH = 0.44704;

async function freshPage(browser, answer) {
  /* a page with the interceptor and the location in place BEFORE boot, so the count starts at the first byte */
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [], hits = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  /* Chrome logs a failed resource itself; a 500 from the feed is the feed's line, not the game's */
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  await page.setRequestInterception(true);
  page.on('request', r => {
    if (r.url().indexOf('open-meteo') >= 0) {
      hits.push(r.url());
      const a = answer(r.url());
      const headers = { 'Access-Control-Allow-Origin': '*' };
      if (a.status === 200) r.respond({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(a.body) });
      else r.respond({ status: a.status, headers, contentType: 'text/plain', body: 'no' });
    } else r.continue();
  });
  await browser.defaultBrowserContext().overridePermissions(base, ['geolocation']);
  await page.setGeolocation({ latitude: 40.713, longitude: -74.006 });
  await page.goto(base + '/index.html?probe=' + Math.floor(Math.random() * 1e9), { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => window.UPDRAFT_DEV && window.UPDRAFT_DEV.frames() > 2, { timeout: 30000 });
  return { page, errors, hits };
}
const screen = (page, name) => page.waitForFunction((n) => window.UPDRAFT_DEV.screen() === n, { timeout: 20000 }, name);
const dev = (page, fn, ...a) => page.evaluate(fn, ...a);
async function newFlightVia(page) {
  /* pause, LAND IT, FLY AGAIN: a new flight the way a thumb gets one */
  await tap(page, '#btnPause'); await screen(page, 'pause');
  await tap(page, '#btnLand'); await screen(page, 'end');
  await tap(page, '#btnAgain'); await screen(page, 'play');
  await waitFrames(page, 2);
}

/* ---- 1. off by default: a flight, the mood screen, and not one byte to the weather ---- */
{
  const { browser, page: first } = await open(base);
  await first.close();
  const { page, errors, hits } = await freshPage(browser, () => ({ status: 200, body: { current: { windspeed_10m: 9.2, winddirection_10m: 270 } } }));
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 3);
  let s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 5.4) < 1e-9 && s.mood === 'fresh', 'a first flight is the picked mood, Fresh at 5.4 m/s (' + s.windBase + ', ' + s.mood + ')');
  await tap(page, '#btnMood'); await screen(page, 'mood');
  const c = await centre(page, '#moodReal');
  say(!!c && c.h >= 72 && c.onTop, 'the REAL WIND card is on the mood screen at 72 px and on top (' + (c ? c.h.toFixed(0) : 'missing') + ')');
  const line0 = await dev(page, () => document.getElementById('moodRealLine').textContent);
  say(/^Off\./.test(line0), 'and it says it is off: "' + line0 + '"');
  say(hits.length === 0, 'no request to the weather from boot through a flight and the mood screen (' + hits.length + ')');
  const chip0 = await dev(page, () => document.getElementById('btnMood').textContent);
  say(chip0 === 'FRESH', 'the chip reads the mood (' + chip0 + ')');

  /* ---- 2. on: one call, the numbers on the card, the next flight in that wind ---- */
  await tap(page, '#moodReal');
  await page.waitForFunction(() => /mph|Could not|Barely/.test(document.getElementById('moodRealLine').textContent), { timeout: 15000 }).catch(() => {});
  const line1 = await dev(page, () => document.getElementById('moodRealLine').textContent);
  say(line1 === '9 mph from the west. Tap to turn it off.', 'the card reads the wind from the answer: "' + line1 + '"');
  say(hits.length === 1, 'exactly one request went out (' + hits.length + ')');
  say(hits.length && /latitude=40\.713&longitude=-74\.006/.test(hits[0]) && /windspeed_10m/.test(hits[0]) && !/key=/.test(hits[0]), 'to Open-Meteo with the location at 3 dp, wind fields, no key');
  const chip1 = await dev(page, () => document.getElementById('btnMood').textContent);
  say(chip1 === '9 MPH', 'the chip reads the wind (' + chip1 + ')');
  const ticks = await dev(page, () => Array.from(document.querySelectorAll('#scrMood .card.sel')).map(e => e.id));
  say(ticks.length === 1 && ticks[0] === 'moodReal', 'one tick on the screen, on the wind that will fly (' + ticks.join(', ') + ')');
  await tap(page, '#btnMoodBack'); await screen(page, 'play');
  s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 5.4) < 1e-9, 'the flight already in the air keeps its wind (' + s.windBase + ')');
  await newFlightVia(page);
  s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 9.2 * MPH) < 1e-6 && s.mood === 'fresh', 'the next flight flies 9.2 mph as ' + (9.2 * MPH).toFixed(3) + ' m/s under the Fresh rules (' + s.windBase.toFixed(3) + ', ' + s.mood + ')');
  const hud = await dev(page, () => document.getElementById('windLine').textContent);
  say(hud === '9 mph from the west', 'the wind line under the chip: "' + hud + '"');
  await newFlightVia(page);
  say(hits.length === 1, 'a second flight inside the hour makes no second call (' + hits.length + ')');
  const cache = await dev(page, () => JSON.parse(localStorage.getItem('lw_updraft_v1')));
  say(cache.settings.realWind === 1 && cache.weatherCache && cache.weatherCache.mph === 9.2, 'the save holds the toggle and the hour cache');

  /* ---- 3. off again ---- */
  await tap(page, '#btnMood'); await screen(page, 'mood');
  await tap(page, '#moodReal');
  const line2 = await dev(page, () => document.getElementById('moodRealLine').textContent);
  const chip2 = await dev(page, () => document.getElementById('btnMood').textContent);
  say(/^Off\./.test(line2) && chip2 === 'FRESH', 'a second tap turns it off and the chip is the mood again (' + chip2 + ')');
  await tap(page, '#btnMoodBack'); await screen(page, 'play');
  await newFlightVia(page);
  s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 5.4) < 1e-9, 'and the next flight is Fresh again (' + s.windBase + ')');
  say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

/* ---- 4. calm: the honesty line, and Gentle ---- */
{
  const { browser, page: first } = await open(base);
  await first.close();
  const { page, hits } = await freshPage(browser, () => ({ status: 200, body: { current: { windspeed_10m: 1.8, winddirection_10m: 45 } } }));
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  await tap(page, '#btnMood'); await screen(page, 'mood');
  await tap(page, '#moodReal');
  await page.waitForFunction(() => /mph|Could not|Barely/.test(document.getElementById('moodRealLine').textContent), { timeout: 15000 }).catch(() => {});
  const line = await dev(page, () => document.getElementById('moodRealLine').textContent);
  say(line === 'Barely a breath today. The Gentle field is open. Tap to turn it off.', 'under 3 mph the card is honest: "' + line + '"');
  const chip = await dev(page, () => document.getElementById('btnMood').textContent);
  say(chip === 'CALM', 'the chip says CALM (' + chip + ')');
  await tap(page, '#btnMoodBack'); await screen(page, 'play');
  await newFlightVia(page);
  const s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 2.7) < 1e-9 && s.mood === 'gentle', 'and the flight is Gentle at 2.7 m/s, never 1.8 mph invented into lift (' + s.windBase + ', ' + s.mood + ')');
  say(hits.length === 1, 'one call (' + hits.length + ')');
  await browser.close();
}

/* ---- 5. the feed fails: silent fallback to the picked mood, said on the card ---- */
{
  const { browser, page: first } = await open(base);
  await first.close();
  const { page, errors, hits } = await freshPage(browser, () => ({ status: 500 }));
  await tap(page, '#btnPlay'); await screen(page, 'play'); await waitFrames(page, 2);
  await tap(page, '#btnMood'); await screen(page, 'mood');
  await tap(page, '#moodBlustery'); await screen(page, 'play');
  await tap(page, '#btnMood'); await screen(page, 'mood');
  await tap(page, '#moodReal');
  await page.waitForFunction(() => /mph|Could not|Barely/.test(document.getElementById('moodRealLine').textContent), { timeout: 15000 }).catch(() => {});
  const line = await dev(page, () => document.getElementById('moodRealLine').textContent);
  say(/^Could not read the wind today/.test(line), 'a 500 is said plainly: "' + line + '"');
  await tap(page, '#btnMoodBack'); await screen(page, 'play');
  await newFlightVia(page);
  const s = await dev(page, () => window.UPDRAFT_DEV.state());
  say(Math.abs(s.windBase - 8.0) < 1e-9 && s.mood === 'blustery', 'and the flight is the picked mood, Blustery at 8.0 (' + s.windBase + ', ' + s.mood + ')');
  say(hits.length === 1, 'one call, no retry storm (' + hits.length + ')');
  say(errors.length === 0, 'a failed feed puts nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
}

close();
console.log('');
if (fails.length) { console.log(fails.length + ' WEATHER FAILURE(S)'); process.exit(1); }
console.log('WEATHER OK');
