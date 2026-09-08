#!/usr/bin/env node
/* The river, measured in pixels as a DIFFERENTIAL against the plain sky.
 *
 *   node test/sky.mjs
 *
 * The frozen night is 2026-07-15T04:00:00Z over Columbus, when the summer
 * Milky Way stands from Sagittarius in the south up through Aquila to Cygnus
 * overhead. The gate names a view that holds that run and asks the page's own
 * probe (a scratch canvas with the plain sky and drawMilkyWay alone, no stars)
 * for the mean colour around galactic points. Every point is asked for by
 * galactic coordinate and the Rift's course is asked of the code, so nothing
 * here is a memorised pixel.
 *
 * What it asserts, each watched to fail:
 *   1. the plane is brighter than the sky forty degrees off it, at every
 *      longitude sampled and in the mean, by a margin a person can see
 *   2. the Great Rift is darker than BOTH its banks, along its run (the old
 *      wash was brightest on the plane, and this line was red on it)
 *   3. THE CEILING: the mean along the plane stays under 48 of 255 and the
 *      brightest reach under 90, so a magnitude four star (about 106 over a
 *      sky at 45) still stands fifty levels proud of the river
 *   4. the Sagittarius reach is brighter than the Aquila reach, which is the
 *      river's whole gradient toward its centre
 *   5. the coarse tile a drag draws is the same river, only softer
 *   6. the render is not ten times what it was, and the drag tile is under
 *      half of it
 */
import { serve, open, reporter } from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base, { width: 412, height: 915, deviceScaleFactor: 2 });
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

/* a view that holds the summer run: south, tilted up, wide */
const VIEW = { alt: 42, az: 175, fov: 105 };
const L = [12, 20, 28, 36, 44, 52, 60, 68, 76, 84];
const probe = async (view, pts) => dev((v, p) => window.ASTERISM_DEV.milkyWayProbe(v, p, 3), view, pts);

/* 1. plane against forty degrees off, both sides, same longitude */
const plane = await probe(VIEW, L.map(l => [l, 0]));
const offN = await probe(VIEW, L.map(l => [l, 40]));
const offS = await probe(VIEW, L.map(l => [l, -40]));
const pairs = [];
for (let i = 0; i < L.length; i++) {
  const p = plane.samples[i], o = offN.samples[i] || offS.samples[i];
  if (p && o) pairs.push({ l: L[i], plane: p.mean, off: o.mean });
}
say(pairs.length >= 6, pairs.length + ' longitudes have both the plane and a point forty degrees off it on the screen');
const meanPlane = pairs.reduce((s, p) => s + p.plane, 0) / Math.max(1, pairs.length);
const meanOff = pairs.reduce((s, p) => s + p.off, 0) / Math.max(1, pairs.length);
say(meanPlane > meanOff + 14, 'the plane is brighter than the sky forty degrees off it: ' + meanPlane.toFixed(1) + ' against ' + meanOff.toFixed(1) + ' of 255');
const dimPairs = pairs.filter(p => p.plane < p.off + 4);
say(dimPairs.length === 0, 'and at every longitude sampled' + (dimPairs.length ? ', except ' + JSON.stringify(dimPairs) : ' (' + pairs.map(p => p.plane.toFixed(0)).join(' ') + ')'));
say(meanOff < 18, 'and forty degrees off the plane the sky is the plain sky, ' + meanOff.toFixed(1) + ' (it is painted at 14.3)');

/* 2. the Rift against both banks, where the code says it runs, at four
   degrees either side. The two sided cuts stop at l 60: in Cygnus the lane
   runs along the band's northern side, so what is four degrees north of it is
   the last thin shred of the river and not a bank (24 against 27 at l 78 on
   the first run, a coin toss); there the lane is measured against the star
   cloud south of it, which is the thing it visibly splits off. */
const riftL = [20, 30, 40, 50, 60];
const riftB = await Promise.all(riftL.concat([76]).map(l => dev((x) => window.ASTERISM_DEV.rift(x).b, l)));
const pts = [];
riftL.forEach((l, i) => { pts.push([l, riftB[i]], [l, riftB[i] - 4], [l, riftB[i] + 4]); });
pts.push([76, riftB[5]], [76, riftB[5] - 4]);
const rift = await probe(VIEW, pts);
const lanes = [];
for (let i = 0; i < riftL.length; i++) {
  const c = rift.samples[3 * i], a = rift.samples[3 * i + 1], b = rift.samples[3 * i + 2];
  if (c && a && b) lanes.push({ l: riftL[i], lane: c.mean, banks: [a.mean, b.mean] });
}
say(lanes.length >= 4, lanes.length + ' of the five two sided Rift cuts are on the screen with both banks');
const bright = lanes.filter(x => !(x.lane < Math.min(x.banks[0], x.banks[1]) - 3));
say(bright.length === 0, 'the Great Rift is darker than both its banks at every cut from Sagittarius through Aquila'
  + (bright.length ? ', except ' + JSON.stringify(bright.map(x => [x.l, x.lane.toFixed(0), x.banks.map(v => v.toFixed(0))])) : ' ('
    + lanes.map(x => x.l + ':' + x.lane.toFixed(0) + '<' + Math.min(x.banks[0], x.banks[1]).toFixed(0)).join(' ') + ')'));
const cyg = rift.samples.slice(-2);
say(!!cyg[0] && !!cyg[1] && cyg[0].mean < cyg[1].mean * 0.7,
  'and in Cygnus the lane is darker than the star cloud south of it (' + (cyg[0] ? cyg[0].mean.toFixed(0) : '?') + ' against ' + (cyg[1] ? cyg[1].mean.toFixed(0) : '?') + ')');

/* 3. the ceiling, which is the law that keeps the faint stars */
const all = plane.samples.filter(Boolean).concat(rift.samples.filter(Boolean));
const peak = Math.max(...all.map(s => s.mean));
say(meanPlane < 48, 'the mean along the plane stays under 48 of 255 (' + meanPlane.toFixed(1) + '), so a magnitude four star still stands fifty levels proud of it');
say(peak < 90, 'and the brightest point measured stays under 90 (' + peak.toFixed(1) + ')');
say(meanPlane > 26, 'and it is a river and not a rumour: the plane averages ' + meanPlane.toFixed(1) + ', twelve or more over the sky');

/* 4. the gradient toward the centre, on the plane's own bank rather than in
   the lane: Sagittarius (l 12 to 20) against Aquila (l 52 to 60) */
const sgr = pairs.filter(p => p.l <= 20), aql = pairs.filter(p => p.l >= 52 && p.l <= 60);
if (sgr.length && aql.length) {
  const ms = sgr.reduce((s, p) => s + p.plane, 0) / sgr.length, ma = aql.reduce((s, p) => s + p.plane, 0) / aql.length;
  say(ms > ma * 1.25, 'the Sagittarius reach is brighter than the Aquila reach (' + ms.toFixed(1) + ' against ' + ma.toFixed(1) + ')');
} else say(false, 'Sagittarius and Aquila are both on the screen for the gradient');

/* 5 and 6. the coarse tile, and the cost */
const coarse = await probe(Object.assign({ coarse: true }, VIEW), L.map(l => [l, 0]));
const cp = [];
for (let i = 0; i < L.length; i++) if (plane.samples[i] && coarse.samples[i]) cp.push([plane.samples[i].mean, coarse.samples[i].mean]);
const worstC = Math.max(...cp.map(x => Math.abs(x[0] - x[1])));
say(coarse.cell === plane.cell * 3, 'a drag draws the tile at cells three times as wide (' + coarse.cell + ' against ' + plane.cell + ' css px)');
say(worstC < 16, 'and it is the same river, softer: the worst difference along the plane is ' + worstC.toFixed(1) + ' levels');
/* ⛔ a clock on a two core box that another gate may be sharing: the bound is
   a tenfold regression's, not a budget's. The budget is the number printed
   (61 ms fine, 7 coarse, alone on this box on Sep 08) and a phone is the judge. */
say(plane.ms < 250, 'the fine river renders in ' + plane.ms.toFixed(0) + ' ms on this box at 412x915 at 2x');
say(coarse.ms < plane.ms * 0.45, 'and the coarse one in ' + coarse.ms.toFixed(0) + ' ms, well under it');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' SKY FAILURE(S)'); process.exit(1); }
console.log('SKY OK');
