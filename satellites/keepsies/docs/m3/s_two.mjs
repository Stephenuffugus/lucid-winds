// A thumb braced on the shooter, and a second finger (the other thumb, a palm edge) resting on the glass and drifting 30 px.
import { makeGame, setClock, useKnuckle } from './harness.mjs';
useKnuckle('real');
const D = 180 / Math.PI;
const g = makeGame({ w: 412, h: 839, phase: 'aim' });
for (let i = 0; i < 120; i++) g.frame(1 / 60);
const ts = g.tawOnScreen();
const ev = (id, x, y, t) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: t, pointerType: 'touch', preventDefault() { }, getCoalescedEvents() { return []; } });
let t = 1000; setClock(t);
g.canvas.dispatch('pointerdown', ev(1, ts.x, ts.y, t));
const az0 = g.rig.state.azimuth;
for (let i = 0; i < 20; i++) { t += 16.7; setClock(t); g.frame(1 / 60); }
setClock(t); g.canvas.dispatch('pointerdown', ev(2, 330, 420, t));
for (let i = 1; i <= 30; i++) { t += 16.7; setClock(t); g.canvas.dispatch('pointermove', ev(2, 330 + i, 420, t)); g.frame(1 / 60); }
for (let i = 0; i < 30; i++) { t += 16.7; setClock(t); g.frame(1 / 60); }
const st = g.G.knuckle.state();
console.log('braced', st.bracing, 'knuckledDown', st.knuckledDown, '| aim turned while braced by the second finger:', ((g.rig.state.azimuth - az0) * D).toFixed(1), 'deg',
  '| camera pointers', g.G.cam.activePointers(), '| knuckle owns pointer 2?', g.G.knuckle.owns(2));
// now the flick
const ty = ts.y; let y = ty;
for (let i = 1; i <= 8; i++) { t += 8.3; setClock(t); y = ty - i * 27; g.canvas.dispatch('pointermove', ev(1, ts.x, y, t)); }
setClock(t + 0.2); g.canvas.dispatch('pointerup', ev(1, ts.x, y, t));
const a = g.G.log.aims[0];
console.log('shot: power01', a.power01.toFixed(3), '(capped at knuckledPowerCap 0.9) thumbSpeed', a.thumbSpeed.toFixed(2), 'knuckledDown', a.knuckledDown, 'cone', a.coneDeg.toFixed(2));
