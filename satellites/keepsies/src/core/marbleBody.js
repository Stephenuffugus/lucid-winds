/**
 * A catalog entry becomes a rigid body spec. Mass is DENSITY TIMES VOLUME and is
 * never set directly (DESIGN 5.2): a Peewee is light because it is small, a
 * steelie is heavy because it is steel, and every later system that reads mass
 * (damage, charge, the ice tiles that break under a density class over 4000)
 * gets a number that means something.
 */
import { PI, clamp } from './dmath.js?v=20260904a';

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

/** The three catalog entries the harness and K0 need before there is a catalog. */
export const STARTER_ENTRIES = {
  commie: { id: 'commie', name: 'Commie', tier: 'common', class: 'glass', diameterMm: 16 },
  clearie: { id: 'clearie', name: 'Clearie', tier: 'common', class: 'glass', diameterMm: 16 },
  taw_clearie: { id: 'taw_clearie', name: 'Clearie Shooter', tier: 'common', class: 'glass', diameterMm: 22 }
};
