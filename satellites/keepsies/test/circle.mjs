/* CIRCLE (m3 step 3): the circle you hold and flick on is 154 CSS px across in every frame, the same in calibration and the match, and is
 * not the marble's. Stephen, 5 Nov: "The circle that you have to hold and flick on is far too small. We need to make it like three times
 * bigger. Doesn't have to be the size of the marble. That's so stupid."
 * Before m3 (docs/m3/INPUT.md): 51 px across in a match, the 16 px floor times 1.6; 184 to 200 in calibration; 61% of it read as full spin.
 */
import { T, clock, makeGame, ev, playTouch, D, mainSrc } from './inputlab.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './inputlab.mjs';

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const R0 = 77;

/* 1. the circle in every frame, at both phones */
for (const [w, h] of [[412, 839], [360, 780]]) {
  for (const [name, o] of [['a full cross', {}], ['three mibs', { mibs: 3 }], ['one mib', { mibs: 1 }], ['calibration', { bare: true, mibs: 1 }]]) {
    const g = makeGame(Object.assign({ w, h, phase: 'aim' }, o));
    for (let i = 0; i < 90; i++) g.frame(1 / 60);
    const t = g.taw();
    ok(!!t && Math.abs(t.grabR - R0) < 0.01, w + 'x' + h + ' ' + name + ': the circle is ' + (t ? (2 * t.grabR).toFixed(1) : 'off the screen') + ' px across (154; shipped 51)');
  }
  const g = makeGame({ w, h, phase: 'aim' });
  for (let i = 0; i < 90; i++) g.frame(1 / 60);
  g.rig.state.elevationDeg = 84; g.rig.state.wantDistance = T.ringer.ringRadius * 2.5; for (let i = 0; i < 60; i++) { g.rig.update(1 / 60); g.rig.camera.updateMatrixWorld(); }
  const t = g.taw();
  ok(!!t && Math.abs(t.grabR - R0) < 0.01, w + 'x' + h + ' top down: the circle is ' + (t ? (2 * t.grabR).toFixed(1) : 'off the screen') + ' px across');
}

/* 2. a touch 70 px from the shooter's centre braces, and the camera never gets it */
{
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 90; i++) g.frame(1 / 60);
  const t = g.taw(), az0 = g.rig.state.azimuth;
  clock.set(1000); g.canvas.dispatch('pointerdown', ev(3, t.x + 70, t.y, 1000));
  ok(g.G.knuckle.state().bracing, 'a touch 70 px from the shooter braces (shipped: an orbit)');
  ok(g.G.cam.activePointers() === 0, 'the camera never gets that finger');
  for (let k = 1; k <= 10; k++) { clock.set(1000 + 16 * k); g.canvas.dispatch('pointermove', ev(3, t.x + 70 + k, t.y, 1000 + 16 * k)); g.frame(1 / 60); }
  ok(Math.abs(g.rig.state.azimuth - az0) < 1e-9, 'and its small moves turn nothing');
  g.canvas.dispatch('pointercancel', ev(3, t.x + 80, t.y, 1200));
}

/* a flick from an anchor: hold still, then the given flick, by real pointer events */
function flick(g, ax, ay, dx, dy, ms, hold) {
  let now = 2000 + Math.random() * 0;
  const f = 1000 / 120;
  clock.set(now); g.canvas.dispatch('pointerdown', ev(9, ax, ay, now));
  for (let i = 0; i < (hold || 30); i++) { now += f; clock.set(now); g.canvas.dispatch('pointermove', ev(9, ax, ay, now)); }
  const n = Math.max(2, Math.round(ms / f));
  for (let i = 1; i <= n; i++) { now += f; clock.set(now); g.canvas.dispatch('pointermove', ev(9, ax + dx * i / n, ay + dy * i / n, now)); }
  clock.set(now); g.canvas.dispatch('pointerup', ev(9, ax + dx, ay + dy, now));
}

/* 3. the spin ring: a touch 30 px below is a stop shot, not full backspin; 8 px off is a centre ball */
{
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 90; i++) g.frame(1 / 60);
  let t = g.taw();
  flick(g, t.x, t.y + 30, 0, -220, 70);
  const a = g.aims[g.aims.length - 1];
  ok(!!a && a.contactOffset.y <= -0.3 && a.contactOffset.y >= -0.7, 'a touch 30 px below reads contactOffset.y ' + (a ? a.contactOffset.y.toFixed(2) : 'no shot') + ' (between -0.3 and -0.7; shipped -1)');
  t = g.taw();
  flick(g, t.x + 8, t.y, 0, -220, 70);
  const b = g.aims[g.aims.length - 1];
  ok(!!b && b !== a && b.contactOffset.x === 0 && b.contactOffset.y === 0, '8 px off the middle is a centre ball (' + (b ? b.contactOffset.x.toFixed(2) : 'no shot') + ')');
}

/* 4. a thumb on the marble going 300 px sideways in 120 ms fires no shot */
{
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 90; i++) g.frame(1 / 60);
  const t = g.taw();
  flick(g, t.x, t.y, 300, 0, 120);
  ok(g.aims.length === 0, 'thumb on the marble, 300 px sideways in 120 ms fires no shot (' + g.aims.length + ' shots)');
  const gb = makeGame({ w: 412, h: 839, phase: 'aim', bombing: true });
  for (let i = 0; i < 90; i++) gb.frame(1 / 60);
  const tb = gb.taw();
  flick(gb, tb.x, tb.y, 0, 200, 70);
  ok(gb.aims.length === 1 && gb.aims[0].bomb, 'with Bombing on, a flick down past 40 px is still a bomb');
}

/* 5. every grab test reads t.grabR; the fallbacks are gone */
{
  const K = readFileSync(join(ROOT, 'src', 'input', 'knuckle.js'), 'utf8'), P = readFileSync(join(ROOT, 'src', 'input', 'pullback.js'), 'utf8');
  ok(!/r \* 1\.6/.test(K) && !/r \* 1\.6/.test(P) && !/r \* 1\.6/.test(mainSrc), 'no grab test derives the circle from the marble (r * 1.6) any more');
  ok(typeof T.snap.grabRadiusPx === 'number' && T.snap.grabRadiusPx === R0 && T.snap.spinRadiusFrac === 0.6 && T.snap.spinDeadZone === 0.2, 'the circle lives in tuning (snap.grabRadiusPx 77, spinRadiusFrac 0.6, spinDeadZone 0.2)');
  ok(mainSrc.indexOf("$('grabRing')") >= 0, 'the circle is drawn (a faint chalk ring)');
}

console.log(fails ? fails + ' FAILED' : 'CIRCLE OK');
process.exit(fails ? 1 : 0);
