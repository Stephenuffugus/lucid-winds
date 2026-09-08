#!/usr/bin/env node
/* The wanderers, in a real browser, on the night of Mars's 2025 opposition.
 *
 *   node test/planets.mjs
 *
 * 2025-01-16T05:00:00Z over Columbus is midnight, with Mars beside the Twins
 * near the zenith and Jupiter in the Bull to the west, both in the default
 * view. The table and the year of premises are proved in sim.js; what only a
 * browser can say is that the page acts on them.
 *
 * What it asserts, each watched to fail:
 *   1. every planet the astronomy puts above the horizon in the field is on
 *      the screen, and every one it puts below is not (the disc is where the
 *      maths says, as a set and not a position)
 *   2. THE DIFFERENTIAL: a planet's pixel does not change across frames while
 *      a star's of the twinkling magnitudes does, on the same composite, so
 *      "does not twinkle" is measured against something that does
 *   3. the tints: Mars reads red, Jupiter reads cream, and Jupiter, the
 *      brighter, is the larger disc
 *   4. a tap on Mars names it with its line, a planet can be a star of a
 *      chain, features() reads the chain, the almanac entry keeps the
 *      planet's number and the myth typed for it names the wanderer
 *   5. ⛔ nothing from the network: every request the page made was to the
 *      server this gate started
 */
import { serve, open, reporter, tap, tapAt, sleep, waitFrames } from './harness.mjs';

const POLLUX = 37826, CASTOR = 36850;
const { base, close } = await serve();
const requested = [];
const { browser, page, errors } = await open(base, { query: '&t=2025-01-16T05:00:00Z' });
page.on('request', r => requested.push(r.url()));
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await dev(() => localStorage.setItem('lw_asterism_v1',
  JSON.stringify({ v: 1, place: null, entries: [], settings: { sound: 1, twinkle: 1, motion: 1 }, seen: { how: 1 }, promptDay: '2025-01-16' })));
await page.reload({ waitUntil: 'load' });
await page.waitForFunction(() => window.ASTERISM_DEV && window.ASTERISM_DEV.ready() && window.ASTERISM_DEV.frames() > 2, { timeout: 30000 });
await waitFrames(page, 6);

/* 1. the set */
const pls = await dev(() => window.ASTERISM_DEV.planets());
say(pls.length === 5, 'five wanderers are computed (' + pls.length + ')');
const up = pls.filter(p => p.alt !== null && p.alt > 0), down = pls.filter(p => p.alt === null || p.alt < -2);
say(up.length >= 2, up.map(p => p.name).join(' and ') + ' are above the horizon at midnight on 2025 Jan 16');
say(down.every(p => !p.on), 'and none of the ones below it are on the screen (' + down.map(p => p.name).join(', ') + ')');
const mars = pls.find(p => p.id === 'mars'), jup = pls.find(p => p.id === 'jupiter');
say(!!mars && mars.on && mars.alt > 60, 'Mars is on the screen and ' + (mars ? mars.alt.toFixed(0) : '?') + ' degrees up, near the zenith at its opposition');
say(!!jup && jup.on, 'and so is Jupiter, ' + (jup ? jup.alt.toFixed(0) : '?') + ' degrees up in the west');
say(!!mars && mars.mag < -1 && !!jup && jup.mag < -2, 'both bright: Mars ' + (mars ? mars.mag.toFixed(1) : '?') + ', Jupiter ' + (jup ? jup.mag.toFixed(1) : '?'));
if (!mars || !mars.on || !jup || !jup.on) { console.log('\n1 PLANETS FAILURE(S)'); await browser.close(); close(); process.exit(1); }

/* 2. the twinkle differential */
const star = await dev((x, y) => window.ASTERISM_DEV.starNear(x, y, 2.0, 3.0), mars.x, mars.y);
say(!!star, 'a star of the twinkling magnitudes is near Mars to compare against' + (star ? ' (hip ' + star.hip + ', mag ' + star.mag.toFixed(1) + ')' : ''));
const pm = [], ps = [];
for (let i = 0; i < 8; i++) {
  await waitFrames(page, 1);
  await sleep(90);
  const [a, b] = await dev((mx, my, sx, sy) => [window.ASTERISM_DEV.pixelAt(mx, my), window.ASTERISM_DEV.pixelAt(sx, sy)], mars.x, mars.y, star ? star.x : 0, star ? star.y : 0);
  pm.push((a[0] + a[1] + a[2]) / 3); ps.push((b[0] + b[1] + b[2]) / 3);
}
const swing = a => Math.max(...a) - Math.min(...a);
say(swing(pm) <= 1, 'Mars is a steady disc: its pixel swings ' + swing(pm).toFixed(1) + ' across eight frames');
say(swing(ps) >= 3, 'and the star beside it twinkles: ' + swing(ps).toFixed(1) + ' across the same frames, so the measure can tell');

/* 3. the tints and the sizes */
const [pxM, pxJ] = await dev((mx, my, jx, jy) => [window.ASTERISM_DEV.pixelAt(mx, my), window.ASTERISM_DEV.pixelAt(jx, jy)], mars.x, mars.y, jup.x, jup.y);
say(pxM[0] - pxM[2] > 60, 'Mars reads red at its centre: rgb ' + pxM.join(','));
say(pxJ[0] > 200 && pxJ[1] > 200 && pxJ[0] - pxJ[2] > 15 && pxJ[0] - pxJ[2] < 80, 'Jupiter reads cream: rgb ' + pxJ.join(','));
say(jup.r > mars.r, 'and Jupiter, the brighter, is the larger disc (' + jup.r.toFixed(1) + ' against ' + mars.r.toFixed(1) + ' px)');

/* 4. a wanderer in a chain. The miss is eight pixels in whichever direction
   still picks Mars: kappa Geminorum sits two degrees from Mars on this night,
   which is eight pixels at this field, and a thumb that lands eight pixels
   toward it is a different test (the design's answer to a close pair is the
   pinch, and draw.mjs proves that). */
const off = await dev((x, y) => {
  for (const ang of [0, 45, 90, 135, 180, 225, 270, 315]) {
    const px = x + Math.cos(ang * Math.PI / 180) * 8, py = y + Math.sin(ang * Math.PI / 180) * 8;
    if (window.ASTERISM_DEV.pickAt(px, py) === 'p2') return { x: px, y: py, ang };
  }
  return null;
}, mars.x, mars.y);
say(!!off, 'a thumb eight pixels off Mars picks Mars' + (off ? ' (from ' + off.ang + ' degrees)' : ''));
await tapAt(page, off ? off.x : mars.x, off ? off.y : mars.y); await waitFrames(page, 2);
const label = await dev(() => { const el = document.getElementById('starLabel'); return { text: el.textContent, on: el.classList.contains('on') }; });
say(label.on && label.text === 'Mars, the red one', 'and the label names it with its line: ' + JSON.stringify(label.text));
for (const hip of [POLLUX, CASTOR]) {
  const p = await dev((h) => window.ASTERISM_DEV.screenOfHip(h), hip);
  say(!!p, 'hip ' + hip + ' is on the screen beside Mars');
  if (p) { await tapAt(page, p.x, p.y); await waitFrames(page, 2); }
}
const st = await dev(() => window.ASTERISM_DEV.draw());
say(st.hips.length === 3 && st.edges === 2 && st.hips[0] === -3, 'Mars, Pollux and Castor make a chain of three with the planet first: ' + JSON.stringify(st.hips));
/* seven degrees across, so the shape rule calls it compact; what matters is
   that a chain with a planet in it is read at all, and read as open */
say(st.kind === 'compact' || st.kind === 'chain', 'and features() reads it as an open shape (' + JSON.stringify(st.kind) + ')');
await tap(page, '#btnDraw'); await sleep(250);
await page.focus('#nameField');
await page.type('#nameField', 'The Red Guest', { delay: 10 });
await tap(page, '#btnNameSave');
await page.waitForFunction(() => !window.ASTERISM_DEV.typing() && (window.ASTERISM_DEV.myth() || '').length > 40, { timeout: 30000 }).catch(() => {});
const myth = await dev(() => window.ASTERISM_DEV.myth());
say(myth.indexOf('Mars') >= 0, 'the myth typed for it names the wanderer');
say(myth.indexOf('Pollux') >= 0, 'and Pollux, the brightest star of it that stays');
await tap(page, '#btnMythKeep'); await sleep(300);
const save = await dev(() => window.ASTERISM_DEV.save());
const e = save.entries[0] || {};
say(save.entries.length === 1 && Array.isArray(e.s) && e.s.indexOf(-3) >= 0, 'the almanac entry keeps the planet by its number: ' + JSON.stringify(e.s));

/* 5. nothing from the network */
const foreign = requested.filter(u => u.indexOf(base) !== 0);
say(foreign.length === 0, 'every request the page made went to this gate\'s own server (' + requested.length + ' of them)' + (foreign.length ? ', except ' + foreign.join(' ') : ''));

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLANETS FAILURE(S)'); process.exit(1); }
console.log('PLANETS OK');
