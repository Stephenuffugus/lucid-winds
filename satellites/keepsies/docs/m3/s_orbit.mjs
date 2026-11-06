// The AIM phase orbit: where the shooter goes on screen as userAz grows, and where it leaves.
import { makeGame } from './harness.mjs';
const D = 180 / Math.PI;
for (const [w, h] of [[412, 839], [412, 915]]) {
  for (const mibsCase of ['cross13', 'one mib 1.2 m ahead']) {
    const g = makeGame({ w, h, phase: 'aim', mibs: mibsCase === 'cross13' ? null : [{ x: 0, z: 0.3 }] });
    for (let i = 0; i < 120; i++) g.frame(1 / 60);
    const st = g.rig.state;
    const base = g.tawOnScreen();
    let leftAt = null, rows = [];
    for (let deg = 0; deg <= 60; deg += 1) {
      st.userAz = deg / D;
      for (let i = 0; i < 120; i++) g.frame(1 / 60);
      const t = g.tawOnScreen();
      if (deg % 5 === 0) rows.push(deg + ':' + (t ? Math.round(t.x) : 'OFF'));
      if (!t && leftAt === null) leftAt = deg;
    }
    const px1 = (() => { st.userAz = 1 / D; for (let i = 0; i < 200; i++) g.frame(1 / 60); const t = g.tawOnScreen(); return t.x - base.x; })();
    console.log(w + 'x' + h, mibsCase, '| dist', st.distance.toFixed(2), 'm, pivot', (Math.hypot(st.target.x - g.world.taw.x, st.target.z - g.world.taw.z)).toFixed(2),
      'm ahead of the shooter | shooter moves', Math.abs(px1).toFixed(2), 'px per degree of orbit =', (Math.abs(px1) * 0.007 * D).toFixed(2),
      'px per px of thumb drag | shooter leaves the screen at', leftAt, 'deg of orbit =', leftAt ? Math.round(leftAt / (0.007 * D)) : '-', 'px of drag | x by orbit deg:', rows.join(' '));
  }
}
