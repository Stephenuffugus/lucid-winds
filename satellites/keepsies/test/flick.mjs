/* FLICK (m3 step 6): what the thumb did is what the marble does. The SHIPPED knuckle.js through real pointer events with coalesced lists and
 * their own timeStamps, no _feed. Before m3 (docs/m3/INPUT.md): samples carried the time they were handled, so the same flick launched at 1.33
 * to 4.11 m/s at 60 fps and 1.33 to 6.00 at 40; power was the last 90 ms before the lift, so a hard flick resting 30 ms lost half and resting
 * 60 ms was cancelled 19 times in 24; the cone settled only under 2 px of jitter; finish() reset the gesture before reading the second finger
 * and the slip, so the knuckle down and the slip never fired.
 */
import { T, clock, makeGame, ev, playTouch } from './inputlab.mjs?v=20261105b';

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const mj = (s) => (s <= 0 ? 0 : s >= 1 ? 1 : 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
const game = () => { const g = makeGame({ w: 412, h: 839, phase: 'aim' }); for (let i = 0; i < 120; i++) g.frame(1 / 60); return g; };
const spread = (a) => Math.max(...a) - Math.min(...a);

/* 1. the same flick at 24 frame phases at 40, 60 and 120 fps */
for (const [fps, hz] of [[40, 120], [60, 120], [120, 240]]) {
  const pw = []; let canc = 0;
  for (let k = 0; k < 24; k++) {
    const g = game(), ts = g.taw();
    playTouch(g, (t) => ({ x: ts.x, y: ts.y - 60 * (t > 300 ? mj((t - 300) / 35) : 0) }), 335, { fps, touchHz: hz, t0: 1000 + k * (1000 / fps) / 24, pre: 5 });
    if (g.aims[0]) pw.push(g.aims[0].power01); else canc++;
  }
  ok(!canc && spread(pw) <= 0.02, fps + ' fps: a short snap gives power ' + (pw.length ? Math.min(...pw).toFixed(3) + ' to ' + Math.max(...pw).toFixed(3) : '-') + ', ' + canc + ' cancelled (within 0.02; shipped 0.12 to 0.56 at 60, 0.12 to 1.00 at 40)');
}

/* 2. a hard flick that rests before the lift keeps its power */
{
  const pw = []; let canc = 0;
  for (const dwell of [0, 30, 60, 100, 200]) {
    const g = game(), ts = g.taw();
    playTouch(g, (t) => ({ x: ts.x, y: ts.y - 220 * (t > 400 ? mj((t - 400) / 70) : 0) }), 470 + dwell, { pre: 5 });
    if (g.aims[0]) pw.push(g.aims[0].power01); else canc++;
  }
  ok(!canc && spread(pw) <= 0.05, 'a hard flick resting 0, 30, 60, 100 or 200 ms before the lift: power ' + pw.map(p => p.toFixed(2)).join(' ') + ', ' + canc + ' cancelled (within 0.05; shipped 0.63 to 0.77, 0.35, 19 of 24 cancelled, 24 of 24)');
}

/* 3. a deliberate slow push is a soft legal shot */
{
  const g = game(), ts = g.taw();
  playTouch(g, (t) => ({ x: ts.x, y: ts.y - 160 * Math.min(1, t / 220) }), 220, { pre: 5 });
  ok(!!g.aims[0] && g.aims[0].softNudge, 'a 160 px push over 220 ms is a soft legal shot (' + (g.aims[0] ? 'power ' + g.aims[0].power01.toFixed(2) : 'cancelled') + '; shipped: always cancelled)');
  const g2 = game(), t2 = g2.taw();
  playTouch(g2, (t) => ({ x: t2.x, y: t2.y - 6 * Math.min(1, t / 200) }), 200, { pre: 5 });
  ok(!g2.aims[0] && g2.cancels.length === 1, 'a slow 6 px creep is not a shot');
}

/* 4. the cone a real thumb can settle */
const noisy = (sigma, g, ts, ms) => {
  let seed = 7 + sigma * 100, r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const gauss = () => { let s = 0; for (let i = 0; i < 12; i++) s += r(); return s - 6; };
  const cache = new Map(); let settledAt = null;
  playTouch(g, (t) => { const k = Math.round(t * 1000); if (!cache.has(k)) cache.set(k, [gauss() * sigma, gauss() * sigma]); const n = cache.get(k); return { x: ts.x + n[0], y: ts.y + n[1] }; }, ms, { pre: 0, noUp: true, each: (post, t) => { if (settledAt === null && g.G.knuckle.state().settle01 >= 1) settledAt = t; } });
  return settledAt;
};
{
  const g2 = game(), s2 = noisy(2, g2, g2.taw(), 2600); g2.canvas.dispatch('pointercancel', ev(7, 0, 0, clock.get()));
  ok(s2 !== null && s2 <= 2000, '2 px of noise an axis settles at ' + (s2 === null ? 'never' : (s2 / 1000).toFixed(2) + ' s') + ' (inside 2.0; shipped never)');
  const g3 = game(), s3 = noisy(3, g3, g3.taw(), 3600); g3.canvas.dispatch('pointercancel', ev(7, 0, 0, clock.get()));
  ok(s3 !== null && s3 <= 3000, '3 px of noise an axis settles at ' + (s3 === null ? 'never' : (s3 / 1000).toFixed(2) + ' s') + ' (inside 3.0; shipped never)');
  const g = game(), ts = g.taw(); let before = 0, after = 0;
  playTouch(g, (t) => ({ x: ts.x + (t > 1500 ? 15 : 0), y: ts.y }), 1600, { pre: 0, noUp: true, each: (post, t) => { if (t < 1495) before = g.G.knuckle.state().settle01; if (t >= 1530) after = after || g.G.knuckle.state().settle01; } });
  ok(before >= 0.99 && after > 0.3 && after <= 0.65, 'a 15 px jump still costs half (' + before.toFixed(2) + ' to ' + after.toFixed(2) + ')');
  g.canvas.dispatch('pointercancel', ev(7, 0, 0, clock.get()));
  const g4 = game(), t4 = g4.taw();
  playTouch(g4, (t) => ({ x: t4.x, y: t4.y - 220 * (t > 1800 ? mj((t - 1800) / 70) : 0) }), 1870, { pre: 0 });
  ok(!!g4.aims[0] && Math.abs(g4.aims[0].coneDeg - T.snap.coneTightDeg) < 0.05, 'a settled hold and a hard flick fires at the settled cone (' + (g4.aims[0] ? g4.aims[0].coneDeg.toFixed(2) : 'no shot') + ' degrees; the flick does not spoil its own hold)');
}

/* 5. read before reset: the slip, the knuckle down, the contact from where the thumb landed */
{
  const g = game(), ts = g.taw();
  playTouch(g, (t) => ({ x: ts.x, y: ts.y - 1200 * (t > 300 ? mj((t - 300) / 80) : 0) }), 380, { pre: 5 });
  ok(!!g.aims[0] && g.aims[0].slipped === true, 'a flick whose last move is off the canvas is a slip (' + (g.aims[0] ? g.aims[0].slipped : 'no shot') + '; shipped never)');
  const g2 = game(), t2 = g2.taw();
  clock.set(5000); g2.canvas.dispatch('pointerdown', ev(1, t2.x, t2.y, 5000)); g2.canvas.dispatch('pointerdown', ev(2, 50, 300, 5000));
  let now = 5000; for (let i = 0; i < 20; i++) { now += 8; clock.set(now); g2.canvas.dispatch('pointermove', ev(1, t2.x, t2.y, now)); }
  for (let i = 1; i <= 8; i++) { now += 8; clock.set(now); g2.canvas.dispatch('pointermove', ev(1, t2.x, t2.y - 60 * i, now)); }
  g2.canvas.dispatch('pointerup', ev(1, t2.x, t2.y - 480, now));
  ok(!!g2.aims[0] && g2.aims[0].knuckledDown === true && g2.aims[0].power01 <= T.snap.knuckledPowerCap, 'a second finger sets knuckledDown and caps the power (' + (g2.aims[0] ? g2.aims[0].knuckledDown + ', ' + g2.aims[0].power01.toFixed(2) : 'no shot') + '; shipped false, uncapped)');
  const g3 = game(), t3 = g3.taw();
  playTouch(g3, (t) => ({ x: t3.x, y: t3.y + (t < 30 ? 30 : 12) - 220 * (t > 2000 ? mj((t - 2000) / 70) : 0) }), 2070, { pre: 0 });
  ok(!!g3.aims[0] && g3.aims[0].contactOffset.y <= -0.3, 'a 2 s hold reads its spin from where the thumb landed (' + (g3.aims[0] ? g3.aims[0].contactOffset.y.toFixed(2) : 'no shot') + ')');
}

/* 6. m3 step 7: the aim line is the aim. A flick off the line no longer steers (its wobble feeds the wildness), and a sideways motion inside the circle turns the aim like a dial */
{
  const g = game(), ts = g.taw(), azAim = g.rig.state.azimuth + Math.PI;
  const off = 10 * Math.PI / 180;
  playTouch(g, (t) => { const f = t > 300 ? mj((t - 300) / 70) : 0; return { x: ts.x + 220 * f * Math.sin(off), y: ts.y - 220 * f * Math.cos(off) }; }, 370, { pre: 0 });
  const a = g.aims[0];
  const shotOff = a ? Math.abs(Math.atan2(Math.sin(Math.atan2(a.dir.x, a.dir.z) - azAim), Math.cos(Math.atan2(a.dir.x, a.dir.z) - azAim))) * 180 / Math.PI : null;
  ok(!!a && shotOff <= 0.5, 'a flick 10 degrees off vertical fires ' + (a ? shotOff.toFixed(2) : 'no') + ' degrees off the aim line (within 0.5; shipped 6.24)');
  const b0 = game(), bt = b0.taw();
  playTouch(b0, (t) => { const f = t > 300 ? mj((t - 300) / 70) : 0; return { x: bt.x, y: bt.y - 220 * f }; }, 370, { pre: 0 });
  ok(!!a && !!b0.aims[0] && a.wildness01 > b0.aims[0].wildness01 + 0.05, 'the wobble feeds the wildness (' + (a ? a.wildness01.toFixed(2) : '-') + ' against ' + (b0.aims[0] ? b0.aims[0].wildness01.toFixed(2) : '-') + ')');
  const g2 = game(), t2 = g2.taw(), az0 = g2.rig.state.userAz || 0;
  playTouch(g2, (t) => ({ x: t2.x + 300 * Math.min(1, t / 120), y: t2.y }), 120, { pre: 0 });
  const turned = ((g2.rig.state.userAz || 0) - az0) * 180 / Math.PI, want = -300 * T.render.orbitRadPerPx * 180 / Math.PI;
  ok(g2.aims.length === 0, 'thumb on the marble, 300 px sideways in 120 ms fires no shot');
  ok(Math.abs(turned - want) < 3, 'and turns the aim by the orbit gain (' + turned.toFixed(1) + ' degrees, ' + want.toFixed(1) + ' wanted)');
  const g3 = game(), t3 = g3.taw(), az3 = g3.rig.state.userAz || 0;
  playTouch(g3, (t) => { if (t < 300) return { x: t3.x + 60 * t / 300, y: t3.y }; const f = t > 600 ? mj((t - 600) / 70) : 0; return { x: t3.x + 60, y: t3.y - 220 * f }; }, 670, { pre: 0 });
  ok(g3.aims.length === 1 && Math.abs(((g3.rig.state.userAz || 0) - az3) * 180 / Math.PI + 60 * T.render.orbitRadPerPx * 180 / Math.PI) < 1.5, 'a dial turn, a rest, then a forward flick shoots along the turned line (' + g3.aims.length + ' shot, turned ' + (((g3.rig.state.userAz || 0) - az3) * 180 / Math.PI).toFixed(1) + ' degrees)');
}

console.log(fails ? fails + ' FAILED' : 'FLICK OK');
process.exit(fails ? 1 : 0);
