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
import { SHAPES } from '../core/statues.js?v=20261106a';
import { art } from './art.js?v=20261106a';

const STONE = 0x8f877b, STONE_P1 = 0x7d7468;
const INK = 0xeadfc9;
const OWNER_MM = astraOwner();

/* Astra's decals, one texture each for the whole game; a statue's material never owns them */
const loader = new THREE.TextureLoader(), textures = {};
function tex(name) {
  if (!textures[name]) { const t = loader.load(art(name)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; textures[name] = t; }
  return textures[name];
}
/** A decal flat on the dirt, `half` metres from its centre to its edge. */
function dirtDecal(name, half, y, opacity) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(half * 2, half * 2), new THREE.MeshBasicMaterial({ map: tex(name), transparent: true, depthWrite: false, opacity }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 2;
  return m;
}
/* her owner mark placements (anchors _owner_decal_placements_mm): each centre lies on its surface, front is minus z. In one place because astra_r2.json is the source and plates.mjs holds it to them */
function astraOwner() {
  return {
    column: { top_center: [0, 60, 0], top_box: [16, 16], front_center: [0, 40, -12], front_box: [16, 16] },
    loaf: { top_center: [0, 34, 0], top_box: [20, 18], front_center: [0, 22, -26], front_box: [20, 16] },
    arch: { top_center: [0, 60, 0], top_box: [20, 16], front_center: [0, 54, -12], front_box: [20, 8] },
    orb: { top_center: [0, 54, 0], top_box: [16, 14], front_center: [0, 36, -21.63], front_box: [16, 14] }
  };
}
export const OWNER_DECALS_MM = OWNER_MM;
/** One chalk bar means you, two an opponent (her owner_you and owner_dusty: a 1.8 unit stroke 14 long in a 24 unit box), on a face whose outward normal is n. */
function ownerBars(owner, centre, box, n, mat) {
  const w = (box[0] / 1000) / 24, h = (box[1] / 1000) / 24, barW = 2.4 * w, barL = 14 * h;
  const xs = owner === 0 ? [0] : [-4 * w, 4 * w];
  const g = new THREE.Group();
  for (const x of xs) { const b = new THREE.Mesh(new THREE.PlaneGeometry(barW, barL), mat); b.position.x = x; g.add(b); }
  const N = new THREE.Vector3(n[0], n[1], n[2]).normalize();
  g.position.set(centre[0] / 1000 + N.x * 0.0004, centre[1] / 1000 + N.y * 0.0004, centre[2] / 1000 + N.z * 0.0004);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), N);
  return g;
}

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
    transparent: !!o.ghost, opacity: o.ghost ? 0.6 : 1
  });
  for (const p of S.parts) group.add(partMesh(p, mat));
  // m3 step 10: her footprint decals, one drawing per state: r 108 of 256 px is the shape's own footprint radius
  const half = S.foot * 128 / 108;
  const ring = dirtDecal('env/footprint_allowed.png', half, 0.0013, 0.9);
  const broken = dirtDecal('env/footprint_blocked.png', half, 0.0014, 0.95);
  broken.visible = false;
  group.add(ring); group.add(broken);
  // A3: the owner's chalk bars on the top and front faces (the shapes are symmetric about y, so the visual turns to show its front to the near side; the colliders stay)
  const bars = new THREE.MeshBasicMaterial({ color: INK, transparent: true, depthWrite: false, opacity: o.ghost ? 0.7 : 0.95 });
  const P = OWNER_MM[statue.shape], own = statue.owner === 0 ? 0 : 1;
  group.add(ownerBars(own, P.top_center, P.top_box, [0, 1, 0], bars));
  const fn = statue.shape === 'orb' ? [0, P.front_center[1] - 32, P.front_center[2]] : [0, 0, -1];   // the orb's front is on the ball, its normal from the ball's centre
  group.add(ownerBars(own, P.front_center, P.front_box, fn, bars));
  group.rotation.y = Math.PI;
  group.userData = { ring, broken, mat };
  group.position.set(statue.x, 0, statue.z);
  return group;
}

/** m3 step 10: the marks a move leaves at the old spot until Confirm or Undo: her reach circle (r 480 of 1024 px is the reach) and the corner brackets over 45 by 45 mm of ground. */
export function makeMoveMarks(statue, reachM) {
  const g = new THREE.Group();
  g.add(dirtDecal('env/move_reach.png', reachM * 512 / 480, 0.0011, 0.9));
  g.add(dirtDecal('env/move_origin.png', 0.0225, 0.0015, 0.95));
  g.position.set(statue.x, 0, statue.z);
  return g;
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
