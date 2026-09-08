#!/usr/bin/env node
/* The sun and the wind by the hour (Director call 66, item 3), in a real browser at 375x667.
 *
 *   node test/sun.mjs
 *
 * Boots with ?hour=23 on the URL, which is how the shots force a band, so the
 * override is proven working. What it asserts, each watched to fail:
 *   1. the sun's y at 12:00 is above its y at 07:00 (smaller, on this screen), and
 *      at 23:00 no sun is drawn: a differential off the canvas, and the moon is
 *   2. the sky crossfades: the biggest colour step between one twentieth of an
 *      hour and the next, across all twenty four, is small; a hard cut is not
 *   3. the thermal reads the hour: a flight started at 23:00 carries hour 23 and
 *      no sunny patch is painted at night; at 12:00 the patch is
 *
 * UPDRAFT_DEV.hour is the camera's liberty, the same as ?hour=, used here to move
 * the clock between checks; nothing else here writes to the sim.
 */
import { serve, open, reporter, tap, waitFrames } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base, { width: 375, height: 667, query: '&hour=23' });
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await tap(page, '#btnPlay');
await page.waitForFunction(() => window.UPDRAFT_DEV.screen() === 'play', { timeout: 20000 });
await waitFrames(page, 3);

/* 1. the arc */
const s7 = await dev(() => window.UPDRAFT_DEV.sun(7)), s12 = await dev(() => window.UPDRAFT_DEV.sun(12)), s23 = await dev(() => window.UPDRAFT_DEV.sun(23));
say(s7.sun > 0 && s12.sun > 0 && s12.y < s7.y, 'the sun at 12:00 stands higher than at 07:00 (y ' + s12.y.toFixed(0) + ' against ' + s7.y.toFixed(0) + ')');
say(s12.x > s7.x, 'and it has moved across the sky (x ' + s7.x.toFixed(0) + ' to ' + s12.x.toFixed(0) + ')');
say(s23.sun === 0 && s23.moon > 0, 'at 23:00 the function has no sun and a moon');
const h = await dev(() => window.UPDRAFT_DEV.hour());
say(h === 23, '?hour=23 on the URL set the clock (' + h + ')');
const night = await dev(() => window.UPDRAFT_DEV.skyInk());
say(night.sun === 0, 'and at 23:00 no sun is drawn: hiding the sun changes ' + night.sun + ' pixels');
say(night.moon >= 60, 'and the moon is: hiding it changes ' + night.moon + ' pixels');
say(night.patch === 0, 'and the sunny patch is not drawn at night (' + night.patch + ' pixels)');
const fh = await dev(() => window.UPDRAFT_DEV.flightHour());
say(fh === 23, 'the flight that started at 23:00 carries hour 23 into the model (' + fh + ')');
const th = await dev(() => [window.UPDRAFT_DEV.thermalAt(23), window.UPDRAFT_DEV.thermalAt(14)]);
say(th[0] === 0 && th[1] === 1, 'so its thermal is zero, and a two o\'clock flight would have all of it (' + th.join(', ') + ')');
await dev(() => window.UPDRAFT_DEV.hour(12));
await waitFrames(page, 2);
const noon = await dev(() => window.UPDRAFT_DEV.skyInk());
say(noon.hour === 12 && noon.sun >= 150, 'at 12:00 the sun is drawn: hiding it changes ' + noon.sun + ' pixels');
say(noon.moon === 0, 'and no moon (' + noon.moon + ' pixels)');
say(noon.patch > 0, 'and the sunny patch is, at the thermal\'s 65 percent of noon (' + noon.patch + ' pixels)');
await dev(() => window.UPDRAFT_DEV.hour(14));
await waitFrames(page, 2);
const two = await dev(() => window.UPDRAFT_DEV.skyInk());
say(two.patch >= 60 && two.patch > noon.patch, 'and stronger at 14:00, the thermal\'s peak (' + two.patch + ' pixels)');
await dev(() => window.UPDRAFT_DEV.hour(7));
await waitFrames(page, 2);
const dawn = await dev(() => window.UPDRAFT_DEV.skyInk());
say(dawn.sun >= 100, 'at 07:00 the sun is drawn low (' + dawn.sun + ' pixels)');

/* 2. the crossfade */
const steps = await dev(() => {
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  let worst = 0, at = 0, prev = null;
  for (let h = 0; h <= 24; h += 0.05) {
    const s = window.UPDRAFT_DEV.sky(h);
    const cur = [...rgb(s.top), ...rgb(s.mid), ...rgb(s.hor), ...rgb(s.grass[0])];
    if (prev) { const d = Math.max(...cur.map((v, i) => Math.abs(v - prev[i]))); if (d > worst) { worst = d; at = h; } }
    prev = cur;
  }
  return { worst, at };
});
say(steps.worst <= 20, 'the sky never jumps: the biggest colour step across a twentieth of an hour is ' + steps.worst + ' of 255, at ' + steps.at.toFixed(2));
const mid = await dev(() => ({ a: window.UPDRAFT_DEV.sky(7.0).mid, m: window.UPDRAFT_DEV.sky(7.5).mid, b: window.UPDRAFT_DEV.sky(8.0).mid }));
say(mid.m !== mid.a && mid.m !== mid.b, 'and on a band edge the sky is between its neighbours, not one of them (' + mid.a + ' ' + mid.m + ' ' + mid.b + ')');

say(errors.length === 0, 'nothing on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
close();
console.log('');
if (fails.length) { console.log(fails.length + ' SUN FAILURE(S)'); process.exit(1); }
console.log('SUN OK');
