// How the flick's DIRECTION becomes the shot: screen error of the flick -> fine angle (ground yaw) -> lateral miss.
import { makeGame, playTouch, useKnuckle } from './harness.mjs';
useKnuckle('ts');   // timestamps fixed, so only direction is being measured
const mj = (s) => (s <= 0 ? 0 : s >= 1 ? 1 : 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
const D = 180 / Math.PI;
for (const err of [0, 2, 5, 8, 10, 15, 20, 30]) {
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 120; i++) g.frame(1 / 60);
  const ts = g.tawOnScreen();
  const th = err / D;
  playTouch(g, (t) => { const s = t > 300 ? mj((t - 300) / 70) : 0; return { x: ts.x + Math.sin(th) * 220 * s, y: ts.y - Math.cos(th) * 220 * s }; }, 370, { fps: 120, touchHz: 240, preFrames: 5 });
  const a = g.G.log.aims[0];
  console.log(`flick ${String(err).padStart(2)} deg off screen-vertical -> fine angle ${a.fineDeg.toFixed(2)} deg on the ground -> lateral miss at 1.5 m ${(Math.tan(a.fineDeg / D) * 150).toFixed(1)} cm (a mib is 1.6 cm wide; the taw 2.2 cm)`);
}
// a natural thumb ARC: the same straight-ish flick bowed sideways by b px at mid travel (a right thumb pivots at its base)
for (const bow of [0, 5, 10, 20]) {
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 120; i++) g.frame(1 / 60);
  const ts = g.tawOnScreen();
  playTouch(g, (t) => { const s = t > 300 ? mj((t - 300) / 70) : 0; return { x: ts.x - bow * Math.sin(Math.PI * s), y: ts.y - 220 * s }; }, 370, { fps: 120, touchHz: 240, preFrames: 5 });
  const a = g.G.log.aims[0];
  console.log(`arc bowed ${String(bow).padStart(2)} px: wildness ${a.wildness01.toFixed(2)} (cone x${(1 + a.wildness01).toFixed(2)}), fine ${a.fineDeg.toFixed(2)}, curvature ${a.pathCurvature.toFixed(4)} rad/px`);
}
