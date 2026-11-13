/**
 * KEEPSIES m5, THE FIGURES: Meshy's eighteen sculpts in the game (tools/figures made them; assets/figures holds
 * them with their manifest). Fourteen stand on the dirt as the STATUES, four live inside the grail marbles.
 *
 * ⛔ PHYSICS DOES NOT CHANGE. A statue is still one of the four code shapes (core/statues.js) and the marble
 * still hits that shape's colliders; a figure is only how it LOOKS. Each figure belongs to the shape whose
 * colliders its lowest third fits (the marble only ever touches a figure's lowest third), scaled per axis to
 * them by the fit in the manifest, so what the player sees is what the marble hits. The Arch keeps its stone (a
 * marble passes under it, and no figure has a hole that size): its figure keeps the gate on the lintel.
 *
 * LAZY: nothing here is fetched until a match has statues or a grail is inspected (a first visit downloads none
 * of it). While a figure loads, or if it fails, the code shape shows.
 *
 * DETERMINISTIC: which figure a statue gets is a function of the match's setup record (its seed and the statue
 * list): the k-th statue of a shape takes the shape's pool at (a mix of the seed and the shape) + k.
 */
import * as THREE from 'three';

const MAN_URL = 'assets/figures/manifest.json?v=20261113a';
const Q = MAN_URL.slice(MAN_URL.indexOf('?'));

/* the same table as tools/figures/manifest.mjs ARCHETYPE, in a fixed order: a replay must pick the same figure
   whether or not the manifest has arrived */
export const POOLS = {
  column: ['boo_brew', 'pickle_wizard', 'quarter_eater', 'save_point'],
  loaf: ['moon_moo', 'mothlight', 'void_loaf'],
  arch: ['book_wyrm', 'moss_boss', 'tiny_tyrant'],
  orb: ['boba_buddy', 'bolt_buddy', 'dumpster_duke', 'snacktopus']
};

function mix(a) {
  a = Math.imul(a ^ (a >>> 16), 0x45d9f3b);
  a = Math.imul(a ^ (a >>> 16), 0x45d9f3b);
  return (a ^ (a >>> 16)) >>> 0;
}
function salt(shape) { let h = 0; for (let i = 0; i < shape.length; i++) h = (h * 31 + shape.charCodeAt(i)) | 0; return h; }
function pick(seed, shape, k) {
  const pool = POOLS[shape];
  if (!pool) return null;
  return pool[(mix((seed | 0) ^ salt(shape)) + k) % pool.length];
}
/** The figure statue `index` of the list wears. */
export function figureFor(seed, statues, index) {
  const s = statues[index];
  if (!s) return null;
  let k = 0;
  for (let i = 0; i < index; i++) if (statues[i].shape === s.shape) k++;
  return pick(seed, s.shape, k);
}
/** The figure the NEXT statue of `shape` would wear (the tray's tile). */
export function nextFigureFor(seed, statues, shape) {
  let k = 0;
  for (const s of statues || []) if (s.shape === shape) k++;
  return pick(seed, shape, k);
}
const GRAIL_GLOW = { default: { color: 0xfff4e0, k: 1.1 }, the_ember_dragon: { color: 0xff8a3c, k: 1.7 }, koi: { color: 0xffffff, k: 0.3 } };
export function tileUrl(id) { return 'assets/figures/' + id + '.tile.png' + Q; }

let manP = null, loaderP = null;
const glbP = {};
/** The manifest, by id (null if it cannot be had). */
export function figureManifest() {
  if (!manP) {
    manP = fetch(MAN_URL).then(r => (r.ok ? r.json() : null)).then((m) => {
      if (!m) return null;
      const by = {};
      for (const f of m.figures) by[f.id] = f;
      return by;
    }).catch(() => null);
  }
  return manP;
}
/** One figure's scene, loaded once and shared by every statue that wears it (never disposed). */
export function loadFigure(id) {
  if (!glbP[id]) {
    if (!loaderP) loaderP = import('../../lib/loaders/GLTFLoader.js').then(m => new m.GLTFLoader());
    glbP[id] = Promise.all([loaderP, figureManifest()]).then(([loader, man]) => new Promise((ok) => {
      const row = man && man[id];
      if (!row) { ok(null); return; }
      loader.load('assets/figures/' + row.file + Q, (g) => {
        g.scene.traverse((n) => {
          if (n.isMesh) {
            n.castShadow = true; n.receiveShadow = true;
            if (n.material && n.material.map) n.material.map.anisotropy = 4;
          }
        });
        ok({ scene: g.scene, row });
      }, undefined, () => ok(null));
    })).catch(() => null);
  }
  return glbP[id];
}

/** A shared figure's copy: its geometry and material are the template's (marked so a dispose leaves them). */
function copyOf(tmpl, ghost) {
  const c = tmpl.scene.clone(true);
  c.traverse((n) => {
    n.userData.figureShared = true;
    if (ghost && n.isMesh) {
      n.material = n.material.clone();
      n.material.transparent = true; n.material.opacity = 0.6;
      n.userData.figureOwnMat = true;
      n.castShadow = false;
    }
  });
  return c;
}

/**
 * Dress a statue group (render/statues.js makeStatueMesh) in its figure once it has loaded. The code shape
 * stays until then, and stays for good if the load fails. The Arch keeps its stone and gains a figure on top.
 */
export function dressStatue(group, shape, id, opts) {
  if (!id) return;
  const o = opts || {};
  loadFigure(id).then((t) => {
    if (!t || !t.row.fit || group.userData.disposed) return;
    const f = t.row.fit;
    const holder = new THREE.Group();
    holder.scale.set(f.sx, f.sy, f.sz);
    holder.position.y = f.y0 || 0;
    const turn = new THREE.Group();
    // the group is turned half round so its front (local -z) faces the near side; a figure's front is its +Z
    turn.rotation.y = Math.PI + (f.yaw || 0) * Math.PI / 180;
    turn.add(copyOf(t, !!o.ghost));
    holder.add(turn);
    holder.userData.figure = id;
    const U = group.userData;
    if (shape !== 'arch') for (const p of U.parts || []) p.visible = false;
    if (U.bars) {
      U.bars.top.visible = false;
      // the owner's chalk on the dirt in front of a figure (its own faces are the sculpt's)
      if (shape !== 'arch' && U.dirtBars) { U.bars.front.visible = false; U.dirtBars.visible = true; }
    }
    group.add(holder);
    U.figure = id;
  });
}

/**
 * A grail's sculpt inside its glass (the inspect view): the figure centred in the unit sphere, its bounding box
 * mostly inside the glass (its longest side 1.5 of the 2 across, its box's corners within 0.95), added to `mesh` (the marble) once it loads if `still()` says the marble is still shown.
 */
export function addGrailFigure(mesh, id, still) {
  loadFigure(id).then((t) => {
    if (!t || !still()) return;
    const b = t.row.bounds, w = b.max[0] - b.min[0], h = b.max[1] - b.min[1], d = b.max[2] - b.min[2];
    // second look (13 Nov): the sculpt is the thing you look at, its longest side about 62% of the marble's diameter
    // (1.25 of 2); its box's corners may touch the glass, the sculpt's own corners never do
    const s = Math.min(1.25 / Math.max(w, h, d), 2.0 / Math.sqrt(w * w + h * h + d * d));
    const c = copyOf(t, false);
    /* LIT FROM WITHIN: behind the glass a dark sculpt read as a dark lump (the Astronomer, the Knight, the Dragon),
       so its own texture glows back a part of itself, a lift of its exposure; the Ember Dragon glows like an ember */
    const glow = GRAIL_GLOW[id] || GRAIL_GLOW.default;
    c.traverse((n) => {
      if (!n.isMesh) return;
      n.castShadow = false; n.receiveShadow = false;
      const m = n.material.clone();
      m.emissiveMap = m.map; m.emissive = new THREE.Color(glow.color).multiplyScalar(glow.k);
      m.roughness = 0.6;
      n.material = m; n.userData.figureOwnMat = true;
    });
    const holder = new THREE.Group();
    holder.scale.setScalar(s);
    holder.position.set(-(b.min[0] + b.max[0]) / 2 * s, -(b.min[1] + b.max[1]) / 2 * s, -(b.min[2] + b.max[2]) / 2 * s);
    holder.add(c);
    holder.renderOrder = 0;
    mesh.add(holder);
    mesh.userData.figure = holder;
  });
}
