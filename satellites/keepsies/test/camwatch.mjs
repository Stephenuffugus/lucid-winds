/* CAMWATCH (m3 step 4): the camera holds while a shot plays. Real Rapier matches, Rookie against Rookie, the REAL frameShot and the rig's
 * own smoothing at 60 fps, one match at ten foot and one at seven. Before m3 (docs/m3/VIEW.md) the camera followed the rolling shooter: a
 * median 234 degrees of turn a shot, up to 3880 degrees a second, the long way round the seam in 57% of shots.
 */
import { T, scene, D } from './inputlab.mjs?v=20261107a';
import { initPhysics } from '../src/core/physics.js?v=20261107a';
import { createRinger } from '../src/game/ringer.js?v=20261107a';

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
await initPhysics();
const W = 412, H = 915;
for (const [FT, seed] of [[10, 9100], [7, 9200]]) {
  const R = createRinger({ tuning: T, seed, skipLag: false, houseRules: { keepsies: false, slips: true, bombing: false, poison: false, ringSizeFt: FT },
    players: [{ name: 'A', ai: 'rookie', tawEntry: 'taw_clearie' }, { name: 'B', ai: 'rookie', tawEntry: 'taw_clearie' }] });
  R.doLag();
  const rig = scene.createOrbitRig({ width: W, height: H }, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33, fov: T.render.ringerCam.fov });
  let last = -1, guard = 0, shots = 0, worstTurn = 0, worstStep = 0, longWay = 0, cur = null;
  while (R.state.phase !== 'over' && guard++ < 40000 && shots < 60) {
    if (R.state.simulating) { R.tick(); if (R.state.simulating) R.tick(); }
    if (!R.state.simulating && R.state.phase !== 'over' && R.isAiTurn() && !R.state.aiThinking) { R.aiTurn(); shots++; cur = { turn: 0 }; }
    const t = R.match.turn, snap = t !== last, az0 = rig.state.azimuth;
    if (snap) rig.resetUser();
    R.frameShot(rig, snap);
    if (snap) { last = t; rig.update(1 / 60); }
    rig.update(1 / 60);
    if (R.state.simulating && !snap) {
      const d = Math.abs(rig.state.azimuth - az0) * D;
      if (cur) { cur.turn += d; worstTurn = Math.max(worstTurn, cur.turn); }
      worstStep = Math.max(worstStep, d);
      if (Math.abs(rig.state.wantAzimuth - rig.state.azimuth) > Math.PI) longWay++;
    }
  }
  ok(shots > 3, FT + ' foot: the match played ' + shots + ' shots');
  ok(worstTurn < 2, FT + ' foot: while a shot plays the camera turns ' + worstTurn.toFixed(2) + ' degrees at most (under 2; shipped a median 234)');
  ok(worstStep < 2 && longWay === 0, FT + ' foot: largest step ' + worstStep.toFixed(2) + ' degrees a frame, ' + longWay + ' frames the long way round the seam (shipped 57% of shots)');
  R.dispose();
}
console.log(fails ? fails + ' FAILED' : 'CAMWATCH OK');
process.exit(fails ? 1 : 0);
