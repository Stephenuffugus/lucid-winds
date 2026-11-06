// The grab circle: the shooter's drawn radius, r (the floor), grabR, in CSS px, per framing and screen.
import { makeGame } from './harness.mjs';
for (const [w, h] of [[412, 839], [412, 915], [375, 667]]) {
  for (const c of [{ n: 'match start, full cross', o: {} }, { n: 'endgame, one mib 1.2 m ahead', o: { mibs: [{ x: 0, z: 0.3 }] } },
                   { n: 'endgame, one mib 2.4 m ahead (far side)', o: { mibs: [{ x: 0, z: -0.9 }] } }, { n: 'CALIBRATION (bare)', o: { bare: true } }]) {
    const g = makeGame(Object.assign({ w, h, phase: 'aim' }, c.o));
    for (let i = 0; i < 120; i++) g.frame(1 / 60);
    const tp = g.world.taw, rad = g.T.diameterMm.taw / 2000;
    const a = g.rig.project(tp.x, tp.y, tp.z), e = g.rig.project(tp.x, tp.y + rad, tp.z);
    const raw = Math.hypot(e.x - a.x, e.y - a.y);
    const t = g.tawOnScreen();
    console.log(`${w}x${h} ${c.n.padEnd(40)} drawn marble radius ${raw.toFixed(1)} px | r = max(16, ${(raw * 1.35).toFixed(1)}) = ${t.r.toFixed(1)} | grabR ${t.grabR.toFixed(1)} px (${(t.grabR * 2 * 0.264).toFixed(1)} mm across) | camera ${g.rig.state.distance.toFixed(2)} m | shooter at y ${t.y.toFixed(0)}`);
  }
}
