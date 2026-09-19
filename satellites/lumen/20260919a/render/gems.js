// Gem factory: faceted procedural mesh per cut (render/gemgeo.js), physical glass by stone or the matcap
// fallback (render/materials.js), plus the juice: drop squash (80 ms), a 60-degree rotation snap with
// overshoot, a flare in the beam's colour on every strike. The Mirror is a silvered plate whose bright side
// faces its facing (SIM_SPEC R5); the Lens carries a small brass pointer where it fires.
import * as THREE from 'three';
import { dirVec } from './layout.js';
import { gemGeometry } from './gemgeo.js';
import { gemMaterial, mirrorSilver, quality } from './materials.js';

const pointerGeo = new THREE.ConeGeometry(0.1, 0.26, 6).rotateX(Math.PI / 2);
const pipGeo = new THREE.SphereGeometry(0.045, 6, 4);
const brassMat = new THREE.MeshStandardMaterial({ color: 0xd8b060, metalness: 0.9, roughness: 0.3 });
const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const backMat = new THREE.MeshStandardMaterial({ color: 0x17120e, roughness: 0.7, metalness: 0.2 });

const LIFT = { mirror: 0.34, filter: 0.16, resonator: 0.3, lens: 0.3, prism: 0.32, geode: 0.34 };

export function makeGem(data, spec) {
  const stone = data.stone[spec.stone];
  const group = new THREE.Group();
  const spin = new THREE.Group(); // idle jitter rotation lives here, facing on the group
  group.add(spin);
  const geo = gemGeometry(spec.cut, spec.gemId >>> 0);
  const y = LIFT[spec.cut] ?? 0.38;
  let mat;
  let body;
  const isMirror = spec.cut === 'mirror';
  if (isMirror) {
    mat = mirrorSilver(stone);
    body = new THREE.Mesh(geo, mat);
    body.position.y = y;
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.58, 0.035), backMat);
    back.position.set(0, y, -0.06);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.14), brassMat);
    edge.position.set(0, 0.04, -0.02);
    spin.add(body, back, edge);
  } else {
    mat = gemMaterial(stone);
    body = new THREE.Mesh(geo, mat);
    body.position.y = y;
    if (spec.cut !== 'lens') spin.rotation.y = (((spec.gemId >>> 0) % 997) / 997) * Math.PI * 2;
    spin.add(body);
  }
  let pointer = null;
  if (spec.cut === 'lens' || (data.cut[spec.cut].facing && !isMirror)) {
    pointer = new THREE.Mesh(pointerGeo, brassMat);
    pointer.position.set(0, 0.12, 0.62);
    group.add(pointer);
  }
  if (isMirror) {
    pointer = new THREE.Mesh(pointerGeo, brassMat);
    pointer.scale.setScalar(0.7);
    pointer.position.set(0, 0.08, 0.24);
    group.add(pointer);
  }
  if (spec.inclusion) {
    const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.06, 0), sparkMat);
    s.position.set(0.12, y + 0.14, 0.06);
    s.name = 'inclusion';
    group.add(s);
  }
  for (let k = 0; k < (spec.tier | 0); k++) {
    const pip = new THREE.Mesh(pipGeo, brassMat);
    pip.position.set(-0.64 + k * 0.13, 0.06, 0.52);
    group.add(pip);
  }
  const baseEmissive = mat.emissive ? mat.emissive.clone() : null;
  const baseColor = mat.color ? mat.color.clone() : null;
  const st = { facing: 0, target: 0, angle: 0, vel: 0, flash: 0, flashColor: new THREE.Color(0xffffff), squash: 0, t: Math.random() * 10, fixed: !!spec.fixed };

  const onQuality = () => {
    if (isMirror) return;
    const m = gemMaterial(stone);
    body.material.dispose();
    body.material = m;
    mat = m;
  };
  quality.listeners.add(onQuality);

  function angleFor(f) { const v = dirVec(f); return Math.atan2(v.x, v.z); }
  return {
    group, body, spec, state: st,
    setFacing(f, snap) {
      st.facing = f;
      let a = angleFor(f);
      while (a - st.target > Math.PI) a -= Math.PI * 2;
      while (a - st.target < -Math.PI) a += Math.PI * 2;
      st.target = a;
      if (snap) { st.angle = a; st.vel = 0; }
    },
    flash(colorMask, hex) { st.flash = 1; st.flashColor.setHex(hex); },
    drop() { st.squash = 1; },
    dispose() { quality.listeners.delete(onQuality); geo.dispose(); },
    update(dt) {
      // spring toward the target facing: a 60-degree snap with a little overshoot
      const acc = 340 * (st.target - st.angle) - 24 * st.vel;
      st.vel += acc * dt;
      st.angle += st.vel * dt;
      group.rotation.y = st.angle;
      st.t += dt;
      if (!isMirror && spec.cut !== 'lens') spin.rotation.y += dt * 0.12;
      const inc = group.getObjectByName('inclusion');
      if (inc) inc.rotation.y += dt * 3;
      const fl = st.flash;
      if (fl > 0) st.flash = Math.max(0, fl - dt * 4.5);
      if (mat.emissive && baseEmissive) mat.emissive.copy(baseEmissive).lerp(st.flashColor, st.flash * 0.95);
      else if (mat.color && baseColor) mat.color.copy(baseColor).lerp(st.flashColor, st.flash * 0.6);
      if (st.squash > 0) {
        st.squash = Math.max(0, st.squash - dt / 0.08);
        const s = 1 - 0.2 * Math.sin(st.squash * Math.PI);
        spin.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
      } else spin.scale.set(1, 1, 1);
    },
  };
}
