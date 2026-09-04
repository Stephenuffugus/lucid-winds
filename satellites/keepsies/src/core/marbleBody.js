/**
 * A catalog entry becomes a rigid body spec. Mass is DENSITY TIMES VOLUME and is
 * never set directly (DESIGN 5.2): a Peewee is light because it is small, a
 * steelie is heavy because it is steel, and every later system that reads mass
 * (damage, charge, the ice tiles that break under a density class over 4000)
 * gets a number that means something.
 */
import { PI, clamp } from './dmath.js?v=20260904d';

/**
 * @typedef {{id:string, class:string, diameterMm:number,
 *   physics?:{densityOverride?:number|null, restitutionOverride?:number|null, frictionOverride?:number|null},
 *   arena?:{hardness?:number}}} CatalogEntry
 * @typedef {{radius:number, diameterMm:number, density:number, mass:number, inertia:number,
 *   restitution:number, friction:number, hardness:number, materialClass:string}} BodySpec
 */

/**
 * @param {CatalogEntry} entry
 * @param {object} tuning
 * @returns {BodySpec}
 */
export function bodySpec(entry, tuning) {
  const cls = entry.class || 'glass';
  const base = tuning.material[cls];
  if (!base) throw new Error('marbleBody: unknown class "' + cls + '" on ' + entry.id);

  const cap = tuning.diameterMm.arenaOversizeCap;
  const dMm = clamp(entry.diameterMm || tuning.diameterMm.mib, 1, cap);
  const radius = dMm * 0.0005; // mm to metres, halved

  const ov = entry.physics || {};
  const swing = tuning.diameterMm.overrideMaxPercent / 100;
  const density = ov.densityOverride == null ? base.density
    : clamp(ov.densityOverride, base.density * (1 - swing), base.density * (1 + swing));
  const restitution = ov.restitutionOverride == null ? base.restitution
    : clamp(ov.restitutionOverride, base.restitution * (1 - swing), base.restitution * (1 + swing));
  const friction = ov.frictionOverride == null ? base.friction
    : clamp(ov.frictionOverride, base.friction * (1 - swing), base.friction * (1 + swing));

  const volume = (4 / 3) * PI * radius * radius * radius;
  const mass = density * volume;
  const inertia = (2 / 5) * mass * radius * radius; // solid sphere

  const hardness = (entry.arena && entry.arena.hardness != null) ? entry.arena.hardness : base.hardness;

  return { radius, diameterMm: dMm, density, mass, inertia, restitution, friction, hardness, materialClass: cls };
}

/**
 * The handful of catalog entries K0 and K1 need before `tools/catalog.mjs`
 * generates the real sixty five from the design's own tables in K2. Names, tiers
 * and lore are the design's (DESIGN 10.2); the render blocks are recipes, and a
 * recipe is a shader, never a painted texture, because a painted marble would
 * not turn with the marble.
 */
export const STARTER_ENTRIES = {
  commie: {
    id: 'commie', name: 'Commie', tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'Common as dirt and twice as brave.',
    render: { type: 'procedural', recipe: 'clearGlass', palette: ['#2f3f52', '#87a8c4', '#e6f1ff'] }
  },
  clearie: {
    id: 'clearie', name: 'Clearie', tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'Nothing to hide.',
    render: { type: 'procedural', recipe: 'clearGlass', palette: ['#3a4a45', '#b8d6cd', '#f2fffb'] }
  },
  dirt_plain: {
    id: 'dirt_plain', name: 'Dirt Plain', tier: 'common', class: 'clay', diameterMm: 16,
    lore: 'Somebody made ten thousand of these in an afternoon.',
    render: { type: 'procedural', recipe: 'clay', palette: ['#6b5641', '#8a7159', '#a8917a'] }
  },
  chalkie: {
    id: 'chalkie', name: 'Chalkie', tier: 'common', class: 'clay', diameterMm: 16,
    lore: 'Writes on pavement in a pinch.',
    render: { type: 'procedural', recipe: 'clay', palette: ['#cfc7b6', '#e6dfd1', '#fffaf0'] }
  },
  cats_banana: {
    id: 'cats_banana', name: "Cat's Eye Banana", tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'The playground standard, accept no substitute.',
    render: { type: 'procedural', recipe: 'catsEye', vaneCount: 3, palette: ['#2b3340', '#9fb6cc', '#f2d34a'] }
  },
  cats_bluejay: {
    id: 'cats_bluejay', name: "Cat's Eye Blue Jay", tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'The playground standard, accept no substitute.',
    render: { type: 'procedural', recipe: 'catsEye', vaneCount: 3, palette: ['#232c3a', '#93a9c0', '#3f7fd6'] }
  },
  cats_grass: {
    id: 'cats_grass', name: "Cat's Eye Grass Snake", tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'The playground standard, accept no substitute.',
    render: { type: 'procedural', recipe: 'catsEye', vaneCount: 3, palette: ['#20301f', '#8fb08c', '#48b04a' ] }
  },
  cats_ember: {
    id: 'cats_ember', name: "Cat's Eye Ember", tier: 'common', class: 'glass', diameterMm: 16,
    lore: 'The playground standard, accept no substitute.',
    render: { type: 'procedural', recipe: 'catsEye', vaneCount: 3, palette: ['#331f1c', '#c49a8e', '#e05a26'] }
  },
  bearing: {
    id: 'bearing', name: 'Bearing', tier: 'uncommon', class: 'steel', diameterMm: 16,
    lore: 'Came out of something that used to turn.',
    render: { type: 'procedural', recipe: 'steel', palette: ['#3a3d42', '#aeb4bb', '#f0f4f8'] }
  },
  taw_clearie: {
    id: 'taw_clearie', name: 'Clearie Shooter', tier: 'common', class: 'glass', diameterMm: 22,
    lore: 'The one you learn on.',
    render: { type: 'procedural', recipe: 'clearGlass', palette: ['#1f3a55', '#7fb6e2', '#eaf6ff'] }
  },
  taw_bumblebee: {
    id: 'taw_bumblebee', name: 'Bumblebee Shooter', tier: 'common', class: 'glass', diameterMm: 22,
    lore: 'Mind the stripes.',
    render: { type: 'procedural', recipe: 'agateBands', palette: ['#2a2110', '#d8a83a', '#3a2f18'] }
  }
};

/** The thirteen the cross is laid with, in the order they are placed. */
export const CROSS_MIX = [
  'commie', 'cats_banana', 'clearie', 'cats_bluejay', 'dirt_plain', 'cats_grass', 'commie',
  'chalkie', 'cats_ember', 'clearie', 'commie', 'dirt_plain', 'cats_banana'
];
