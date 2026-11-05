/**
 * The statues as stone (STATUES, KEEPSIES_BUILD_PLAN.md step 9). Each mesh is built from the SAME parts the
 * physics collides with (core/statues.js), so what you see is exactly what a marble hits. Stone in the lot's
 * palette, lit by the one lamp and casting its shadow; a chalk footprint on the dirt under each. No art yet:
 * the real figures are a Meshy lane (DECISIONS 1 and 2).
 *
 * The ghost is the statue under a finger: the same stone, half seen, and its footprint drawn whole when the spot
 * is legal and broken when it is not (the tray also says "Not here" in words: never by colour alone).
 */
import * as THREE from 'three';
import { SHAPES } from '../core/statues.js?v=20261105b';

const STONE = 0x8f877b, STONE_P1 = 0x7d7468;
const CHALK = 0xe8dcc8;

function partMesh(p, mat) {
  let g;
  if (p.box) g = new THREE.BoxGeometry(p.box.hx * 2, p.box.hy * 2, p.box.hz * 2);
  else if (p.cyl) g = new THREE.CylinderGeometry(p.cyl.r, p.cyl.r, p.cyl.hh * 2, 28);
  else g = new THREE.SphereGeometry(p.ball.r, 28, 18);
  const m = new THREE.Mesh(g, mat);
  m.position.set(p.at[0], p.at[1], p.at[2]);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** A statue's group: its stone parts and its chalk footprint, at its foot point. */
export function makeStatueMesh(statue, opts) {
  const o = opts || {};
  const S = SHAPES[statue.shape];
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: statue.owner === 1 ? STONE_P1 : STONE, roughness: 0.92, metalness: 0,
    transparent: !!o.ghost, opacity: o.ghost ? 0.55 : 1
  });
  for (const p of S.parts) group.add(partMesh(p, mat));
  // the footprint: a chalk ring on the dirt, whole, or dashed for a spot that is not allowed
  const ring = new THREE.Mesh(new THREE.RingGeometry(S.foot, S.foot + 0.007, 40, 1),
    new THREE.MeshBasicMaterial({ color: CHALK, transparent: true, opacity: 0.8, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.0013;
  group.add(ring);
  const broken = new THREE.Group();
  for (let k = 0; k < 8; k++) {
    const seg = new THREE.Mesh(new THREE.RingGeometry(S.foot, S.foot + 0.007, 6, 1, k * Math.PI / 4, Math.PI / 8),
      new THREE.MeshBasicMaterial({ color: 0xd86a5a, transparent: true, opacity: 0.9, depthWrite: false }));
    seg.rotation.x = -Math.PI / 2; seg.position.y = 0.0014;
    broken.add(seg);
  }
  broken.visible = false;
  group.add(broken);
  group.userData = { ring, broken, mat };
  group.position.set(statue.x, 0, statue.z);
  return group;
}

/** Show a ghost's spot as legal (the whole chalk ring) or not (the broken one). */
export function markGhost(group, ok) {
  group.userData.ring.visible = !!ok;
  group.userData.broken.visible = !ok;
}

/** Give a statue mesh's memory back. */
export function disposeStatueMesh(group) {
  group.traverse((n) => { if (n.geometry) n.geometry.dispose(); if (n.material) n.material.dispose(); });
}
