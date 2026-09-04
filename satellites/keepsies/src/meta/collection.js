/**
 * The collection, and the turntable that makes a marble worth owning.
 *
 * DESIGN 20's "never sacrifice" list has three things on it and one of them is
 * "the marble inspect turntable's beauty". So inspect is the one screen that
 * runs HIGH materials on a Medium device: it is a static scene with one object
 * in it and it can afford what a match cannot.
 *
 * Integrity and hardness are shown as WORDS, not numbers. A marble that
 * "endures" tells you what it is for; 1.3 tells you nothing and invites a
 * spreadsheet. Numbers are for the Practice Ring.
 *
 * This module owns no storage. `meta/save.js` does, and the inventory arrives
 * here as data.
 */
import * as THREE from 'three';
import { makeMarbleMesh } from '../render/marbleMesh.js?v=20260904b';
import { bodySpec } from '../core/marbleBody.js?v=20260904b';

export { TIER_ORDER, TIER_LABEL } from './tiers.js?v=20260904b';
import { TIER_ORDER } from './tiers.js?v=20260904b';
// the word ladders live in a file with no imports so they can be measured
// against the catalogue in Node, where three.js cannot follow
export { hardnessWord, weightWord } from './words.js?v=20260904b';


/**
 * The starter set of DESIGN 16.4: the clay pool, all six cat's eyes, two
 * uncommons, and the heirloom the player chooses. The three heirloom candidates
 * are named in the design and the two they do not pick go back into the pouch
 * pool, which is why they are returned rather than granted.
 */
export function starterGrant(catalog, rng) {
  const byId = {};
  for (const m of catalog.marbles) byId[m.id] = m;
  const give = [];
  const add = (id, source) => {
    const e = byId[id];
    if (!e) return;
    give.push({ id, uid: id + '-' + (give.length + 1), acquired: 0, source, cosmeticSeed: rng.next() });
  };
  for (let i = 0; i < 10; i++) add('dirt_plain', 'clay');
  for (const m of catalog.marbles) if (m.id.indexOf('cats_eye_') === 0) add(m.id, 'starter');
  add('bearing', 'starter');
  const swirls = catalog.marbles.filter(m => m.tier === 'uncommon' && m.render.recipe === 'swirl');
  if (swirls.length) add(rng.pick(swirls).id, 'starter');
  return { give, heirlooms: ['bloodstone_aggie', 'lutz', 'mercury'].filter(id => byId[id]) };
}

/** One line about where a marble came from. Provenance matters when they change hands. */
export function provenance(item) {
  // a marble you have never held says so, rather than saying nothing
  if (!item) return 'You have never held one of these.';
  if (item.wonFrom) return 'Won from ' + item.wonFrom + '.';
  if (item.source === 'clay') return 'Out of the clay pool. Worth one shot, same as anything.';
  if (item.source === 'starter') return 'Dusty gave you this one out of his tin.';
  if (item.source === 'pouch') return 'Came out of a pouch.';
  if (item.source === 'boss') return 'Taken off a boss.';
  return 'Somebody owned this before you.';
}

/**
 * The turntable. Its own scene and camera, drawn through the game's ONE renderer:
 * a second WebGL context on a phone is a second GPU allocation for one marble.
 */
export function createTurntable(stage, tuning) {
  const scene = new THREE.Scene();
  scene.environment = stage.scene.environment;
  scene.environmentIntensity = tuning.render.envIntensity * 1.35;
  scene.add(new THREE.HemisphereLight(0xe6ecd8, 0x241c15, 1.0));
  const key = new THREE.DirectionalLight(0xfff6e6, 2.4);
  key.position.set(-1.4, 2.2, 1.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd0ff, 0.85);
  rim.position.set(1.8, 0.6, -1.6);
  scene.add(rim);

  /* ⛔ FRAMED, not just pointed at. DESIGN 7's screen table says the marble is
   * drawn at 140 px on the inspect card and the card sits below it. The first
   * version put the camera three units away with a 28 degree field: on a 375 by
   * 667 portrait screen the vertical field is the constraint, and a unit sphere
   * at that distance filled the whole top half and ran off the left edge.
   *
   * The distance is solved rather than guessed. Visible height at distance d is
   * 2 d tan(fov/2); the marble is two units across; so d puts it at exactly the
   * fraction of the screen we asked for. The camera axis stays parallel to z and
   * the whole rig is offset DOWNWARD instead of tilting, because tilting a
   * portrait camera skews the sphere into an egg. */
  const FOV = 28, WANT = 0.21, LIFT = 0.20;
  const halfTan = Math.tan(FOV * Math.PI / 360);
  const dist = 2 / (WANT * 2 * halfTan);
  const cam = new THREE.PerspectiveCamera(FOV, 1, 0.01, dist * 3);
  const drop = -(LIFT * 2 * halfTan * dist);
  cam.position.set(0, drop, dist);
  cam.lookAt(0, drop, 0);

  const S = { mesh: null, spin: 0.0, drag: null, momentum: 0.22, entry: null };

  return {
    scene, camera: cam,
    /** Put a marble on the table. Always at High, whatever the device is. */
    show(entry) {
      this.clear();
      S.entry = entry;
      const spec = bodySpec(entry, tuning);
      const mesh = makeMarbleMesh(entry, spec, tuning, { name: 'high', shadows: 'off' }, entry.id);
      // drawn at a fixed size on the card rather than at real scale: this is the
      // one place in the game where the marble is a portrait, not an object
      mesh.scale.setScalar(1.0);
      mesh.position.set(0, 0, 0);
      scene.add(mesh);
      S.mesh = mesh;
      S.spin = 0.6;
      S.momentum = 0.22;
      return spec;
    },
    clear() {
      if (!S.mesh) return;
      scene.remove(S.mesh);
      S.mesh.material.dispose();
      S.mesh = null;
      S.entry = null;
    },
    entry: () => S.entry,
    update(dt) {
      if (!S.mesh) return;
      S.spin += S.momentum * dt;
      S.momentum += (0.22 - S.momentum) * Math.min(1, dt * 1.6);
      S.mesh.rotation.set(0.32, S.spin, 0.1);
    },
    /** A drag spins it, and it keeps a little of that when you let go. */
    nudge(dx) { S.momentum = Math.max(-6, Math.min(6, S.momentum + dx * 0.02)); },
    aspect(w, h) {
      const a = w / Math.max(1, h);
      if (cam.aspect !== a) { cam.aspect = a; cam.updateProjectionMatrix(); }
    },
    dispose() { this.clear(); }
  };
}

/**
 * The grid's thumbnails.
 *
 * ⛔ Its OWN small renderer, not the game's. The first version borrowed the main
 * renderer, changed its viewport and scissor, and read pixels back out of its
 * canvas: the tiles came out empty and the game's renderer was left with a 96 px
 * viewport. A menu is allowed one 128 px context for as long as it is open, and
 * `close()` gives it back.
 */
export function createThumbnailer(tuning) {
  let renderer = null, scene = null, cam = null, geo = null, size = 0;
  return {
    open(px) {
      size = px;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = px;
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(px, px, false);
      scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xe6ecd8, 0x241c15, 1.0));
      const key = new THREE.DirectionalLight(0xfff6e6, 2.4);
      key.position.set(-1.4, 2.2, 1.6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xbcd0ff, 0.8);
      rim.position.set(1.8, 0.6, -1.6);
      scene.add(rim);
      // far enough back that the marble sits IN the tile rather than filling it
      cam = new THREE.PerspectiveCamera(26, 1, 0.01, 20);
      cam.position.set(0, 0.12, 5.0);
      cam.lookAt(0, 0, 0);
      geo = new THREE.SphereGeometry(1, 36, 18);
    },
    /** One marble, drawn into the given 2D canvas. */
    paint(canvas2d, entry, seedIndex) {
      if (!renderer) return false;
      const mat = makeMarbleMaterialFor(entry, tuning);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(0.34, 0.6 + (seedIndex || 0) * 0.5, 0.12);
      scene.add(mesh);
      renderer.render(scene, cam);
      scene.remove(mesh);
      mat.dispose();
      const g = canvas2d.getContext('2d');
      g.clearRect(0, 0, canvas2d.width, canvas2d.height);
      g.drawImage(renderer.domElement, 0, 0, size, size, 0, 0, canvas2d.width, canvas2d.height);
      return true;
    },
    close() {
      if (!renderer) return;
      geo.dispose();
      renderer.dispose();
      renderer = null; scene = null; cam = null; geo = null;
    }
  };
}

/* kept separate so the thumbnailer does not import the mesh factory's LOD table */
function makeMarbleMaterialFor(entry, tuning) {
  const { makeMarbleMaterial } = MAT;
  return makeMarbleMaterial(entry.render, tuning, entry.id);
}
let MAT = null;
/** Hand the module its material factory once, at boot, to avoid a cycle. */
export function useMaterialFactory(mod) { MAT = mod; }

/**
 * Group an inventory into what the grid shows: one tile per catalog entry, with
 * a count, because ten identical clay marbles are ten marbles and one tile.
 */
export function groupForGrid(inventory, catalog, filter) {
  const byId = {};
  for (const m of catalog.marbles) byId[m.id] = m;
  const groups = new Map();
  for (const item of inventory) {
    const entry = byId[item.id];
    if (!entry) continue;
    if (filter === 'stakeable' && entry.stakeable === false) continue;
    if (TIER_ORDER.indexOf(filter) >= 0 && entry.tier !== filter) continue;
    let g = groups.get(item.id);
    if (!g) { g = { entry, count: 0, items: [] }; groups.set(item.id, g); }
    g.count++;
    g.items.push(item);
  }
  return [...groups.values()].sort((a, b) => {
    const t = TIER_ORDER.indexOf(b.entry.tier) - TIER_ORDER.indexOf(a.entry.tier);
    return t !== 0 ? t : a.entry.name.localeCompare(b.entry.name);
  });
}
