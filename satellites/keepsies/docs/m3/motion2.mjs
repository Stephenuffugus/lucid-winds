// The camera through real shots: real Rapier matches (AI v AI), the REAL frameShot from game/ringer.js,
// and scene.js's damping, frame by frame at 60 Hz, exactly as main.js's loop orders them.
import { readFileSync } from 'node:fs';
import * as THREE from '/workspaces/lucid-winds/satellites/keepsies/lib/three.module.min.js';
import { initPhysics, positionOf } from '/workspaces/lucid-winds/satellites/keepsies/src/core/physics.js?v=20261105b';
import { createRinger } from '/workspaces/lucid-winds/satellites/keepsies/src/game/ringer.js?v=20261105b';
const T = JSON.parse(readFileSync('/workspaces/lucid-winds/satellites/keepsies/src/data/tuning.json', 'utf8'));
const FT = parseInt(process.argv[2] || '10', 10), GAMES = parseInt(process.argv[3] || '4', 10);
const W = 412, H = 915, DEG = Math.PI / 180;
await initPhysics();
const cam = new THREE.PerspectiveCamera(T.render.ringerCam.fov, W / H, 0.01, 200);
function makeRig() {
  const state = { target: new THREE.Vector3(0, 0.012, 0), azimuth: 0, wantAzimuth: 0, distance: 2.2, wantDistance: 2.2,
    elevationDeg: 33, damping: 0.18, userAz: 0, userZoom: 1, minDistance: 0.12, maxDistance: 6 };
  return {
    state, viewport: { w: W, h: H },
    setTarget(x, y, z) { state.target.set(x, y, z); },
    resetUser() { state.userAz = 0; state.userZoom = 1; },
    update(dt) {
      const k = 1 - Math.pow(1 - state.damping, Math.max(1, dt * 60));
      state.azimuth += (state.wantAzimuth - state.azimuth) * k;
      state.distance += (state.wantDistance - state.distance) * k;
      const el = state.elevationDeg * DEG, r = state.distance, t = state.target;
      cam.position.set(t.x + Math.sin(state.azimuth) * Math.cos(el) * r, t.y + Math.sin(el) * r, t.z + Math.cos(state.azimuth) * Math.cos(el) * r);
      cam.lookAt(t); cam.updateMatrixWorld(true);
    }
  };
}
function onScreen(p) {
  const v = new THREE.Vector3(p.x, p.y, p.z).project(cam);
  const x = (v.x * 0.5 + 0.5) * W, y = (-v.y * 0.5 + 0.5) * H;
  return { x, y, on: v.z < 1 && x >= 0 && x <= W && y >= 59 && y <= H - 94 };
}
const shots = [];
for (let g = 0; g < GAMES; g++) {
  const R = createRinger({ tuning: T, seed: 9100 + g, skipLag: false,
    houseRules: { keepsies: false, slips: true, bombing: false, poison: false, ringSizeFt: FT },
    players: [{ name: 'A', ai: 'rookie', tawEntry: 'taw_clearie' }, { name: 'B', ai: 'rookie', tawEntry: 'taw_clearie' }] });
  R.doLag();
  const rig = makeRig();
  let lastTurn = -1, frames = 0, cur = null, guard = 0;
  while (R.state.phase !== 'over' && guard++ < 40000) {
    frames++;
    // physics first (main.js 2115), two 1/120 steps per 60 Hz frame
    if (R.state.simulating) { R.tick(); if (R.state.simulating) R.tick(); }
    if (!R.state.simulating && R.state.phase !== 'over' && R.isAiTurn() && !R.state.aiThinking) {
      if (cur) shots.push(cur);
      R.aiTurn();
      cur = { game: g, turn: R.match.turn, frames: 0, wantTravel: 0, early: 0, late: 0, tl: [], maxStepDeg: 0, travelDeg: 0, seam: 0, dMin: 9, dMax: 0, tawOn: 0, tawOff: 0, mibsOn: 0, mibsAll: 0, longSwing: 0 };
    }
    const t = R.match.turn, snap = t !== lastTurn;
    if (snap) rig.resetUser();
    const wantBefore = rig.state.wantAzimuth, azBefore = rig.state.azimuth;
    R.frameShot(rig, snap);
    if (snap) { lastTurn = t; rig.update(1 / 60); }
    rig.update(1 / 60);
    if (cur && R.state.simulating) {
      cur.frames++;
      const dAz = (rig.state.azimuth - azBefore) / DEG;
      if (!snap) { cur.maxStepDeg = Math.max(cur.maxStepDeg, Math.abs(dAz)); cur.travelDeg += Math.abs(dAz); if (cur.frames <= 15) cur.early += Math.abs(dAz); else cur.late += Math.abs(dAz); }
      let dw = rig.state.wantAzimuth - wantBefore; while (dw > Math.PI) dw -= 2 * Math.PI; while (dw < -Math.PI) dw += 2 * Math.PI;
      if (!snap) cur.wantTravel += Math.abs(dw) / DEG;
      { const tw0 = R.taws[R.match.turn]; if (R.world.marbles.has(tw0.id) && cur.frames % 6 === 1) { const p = positionOf(R.world, tw0.id); cur.tl.push([cur.frames, p.x.toFixed(2), p.z.toFixed(2), (rig.state.wantAzimuth / DEG).toFixed(0), (rig.state.azimuth / DEG).toFixed(0), rig.state.distance.toFixed(2), onScreen(p).y.toFixed(0)]); } }
      if (!snap && Math.abs(rig.state.wantAzimuth - wantBefore) > Math.PI) cur.seam++;
      cur.dMin = Math.min(cur.dMin, rig.state.distance); cur.dMax = Math.max(cur.dMax, rig.state.distance);
      const tw = R.taws[R.match.turn];
      if (R.world.marbles.has(tw.id)) { const o = onScreen(positionOf(R.world, tw.id)); if (o.on) cur.tawOn++; else cur.tawOff++; }
      for (const m of R.liveMibs()) { cur.mibsAll++; if (onScreen(positionOf(R.world, m.id)).on) cur.mibsOn++; }
    }
  }
  if (cur) shots.push(cur);
  R.dispose();
}
const n = shots.length;
const pct = (a, b) => (b ? (100 * a / b).toFixed(0) : '-') + '%';
let seamShots = 0, bigSwing = 0, sumTravel = 0, maxStep = 0, tawOn = 0, tawAll = 0, mibOn = 0, mibAll = 0, dMin = 9, dMax = 0;
const travel = [];
for (const s of shots) {
  if (s.seam) seamShots++;
  if (s.travelDeg > 90) bigSwing++;
  sumTravel += s.travelDeg; travel.push(s.travelDeg); maxStep = Math.max(maxStep, s.maxStepDeg);
  tawOn += s.tawOn; tawAll += s.tawOn + s.tawOff; mibOn += s.mibsOn; mibAll += s.mibsAll;
  dMin = Math.min(dMin, s.dMin); dMax = Math.max(dMax, s.dMax);
}
travel.sort((a, b) => a - b);
console.log(`${FT} ft, ${GAMES} games, ${n} shots (AI v AI, real physics, real frameShot, 412x915)`);
console.log(`camera turns during a shot: median ${travel[Math.floor(n / 2)].toFixed(0)} deg, 90th pct ${travel[Math.floor(n * 0.9)].toFixed(0)} deg, max ${travel[n - 1].toFixed(0)} deg; ${bigSwing} of ${n} shots (${pct(bigSwing, n)}) swing the camera more than 90 deg`);
console.log(`fastest camera turn: ${maxStep.toFixed(1)} deg in one frame (${(maxStep * 60).toFixed(0)} deg/s)`);
console.log(`the wanted azimuth jumped across the +-pi seam (the damping then goes the LONG way round) in ${seamShots} of ${n} shots`);
let wt = 0, early = 0, late = 0; for (const s of shots) { wt += s.wantTravel; early += s.early; late += s.late; }
console.log(`mean per shot: camera turns ${(sumTravel / n).toFixed(0)} deg, of which ${(early / n).toFixed(0)} deg in the first quarter second (the swing to the re-placed shooter) and ${(late / n).toFixed(0)} after; the bearing it is chasing (unwrapped) moves ${(wt / n).toFixed(0)} deg, so ${Math.max(0, (sumTravel - wt) / n).toFixed(0)} deg a shot is the long way round`);
const ex = shots.filter(s => s.seam && s.tl.length > 8)[0];
if (ex) { console.log('one shot with a seam jump, every 0.1 s: frame, taw x, taw z, wanted az, camera az, distance, taw screen y'); for (const r of ex.tl.slice(0, 26)) console.log('   ' + r.join('  ')); }
console.log(`camera distance during shots ${dMin.toFixed(2)} .. ${dMax.toFixed(2)} m`);
console.log(`while the shot runs: the shooter is in the HUD-free frame ${pct(tawOn, tawAll)} of frames; live mibs are in it ${pct(mibOn, mibAll)} of mib-frames`);
