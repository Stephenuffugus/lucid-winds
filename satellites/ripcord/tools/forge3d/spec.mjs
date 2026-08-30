/* forge3d/spec.mjs — the parts catalogue, flattened for Blender.
 *
 * Blender's python cannot require sim2.js, so this writes spec.json: every
 * part with the stats its geometry is derived from, plus the derivation
 * rules' RESULTS (family, tooth count) so the mesh and the game can never
 * disagree about what a part looks like. The rules are copied from the two
 * places that already own them:
 *
 *   teeth  = round(3 + sharp*8)          src/play-shell.html drawTop
 *   blade  sharp>0.7 deep | <0.3 smooth | scallop      tools/assets.js
 *   assist gearMul>1.3 toothed | <0.7 smooth | neutral tools/assets.js
 *   bit    dash>1.2 cogs | <0.5 sharp | rounded        tools/assets.js
 *   ratchet: the name IS the geometry, teeth-height
 *
 * Run: node tools/forge3d/spec.mjs   (writes tools/forge3d/spec.json)
 */
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const here = path.dirname(fileURLToPath(import.meta.url));
const S = createRequire(import.meta.url)(path.join(here, '..', '..', 'src', 'sim2.js'));

const TIER = p => ['', 'stock', 'forged', 'relic'][p.tier || 1];

const spec = {
  mount: {
    // millimetres, +Y up, origin at the floor contact point. The Y values
    // are the NOMINAL stack: a bit is a fixed 12mm, a ratchet body is its
    // named height/10, so the reference 60 ratchet puts the blade underside
    // at 12+6=18 and the core top at 26 exactly as the source list says;
    // a taller ratchet raises the strike plane, which is what the game
    // fiction says it does.
    coreTopY: 26, bladeUnderY: 18, bossDia: 22, socketBossDia: 8,
    lugs: 3, ratchetRingDia: 14, thread: 'M16x1', bitShaftDia: 9,
    bitInsertDepth: 6, bitLength: 12, weightHoleDia: 3.5, weightHoleDepth: 4,
    holeRings: [0.42, 0.80], holesPerRing: 6,
  },
  budgets: { core: 300, blade: 1200, assist: 600, ratchet: 500, bit: 400, weight: 120, launcher: 400 },
  cores: S.CORES.map(p => ({
    id: p.id, name: p.name, tier: TIER(p), mass: p.mass, dir: p.dir,
    ability: p.ability, charge: p.charge, role: p.role,
  })),
  blades: S.BLADES.map(p => ({
    id: p.id, name: p.name, tier: TIER(p), mass: p.mass,
    radiusMm: +(p.radius * 1000).toFixed(1), sharp: p.sharp,
    teeth: Math.round(3 + p.sharp * 8),
    family: p.sharp > 0.7 ? 'deep' : p.sharp < 0.3 ? 'smooth' : 'scallop',
    rest: p.rest, taken: p.taken, role: p.role,
  })),
  assists: S.ASSISTS.filter(p => p.id !== 'none').map(p => ({
    id: p.id, name: p.name, tier: TIER(p), mass: p.mass,
    gearMul: p.gearMul, radAddMm: +((p.radAdd || 0) * 1000).toFixed(2),
    absorb: p.absorb, family: p.gearMul > 1.3 ? 'toothed' : p.gearMul < 0.7 ? 'smooth' : 'neutral',
  })),
  ratchets: S.RATCHETS.map(p => ({
    id: p.id, tier: TIER(p), mass: p.mass,
    teeth: parseInt(p.id.split('-')[0], 10),
    heightName: p.height, bodyMm: +(p.height / 10).toFixed(1),
    lock: p.lock, strikeHigh: p.strikeHigh,
  })),
  bits: S.BITS.map(p => ({
    id: p.id, name: p.name, tier: TIER(p), mass: p.mass,
    dash: p.dash, stable: p.stable, stamina: p.stamina, shaft: p.shaft,
    family: p.dash > 1.2 ? 'cogs' : p.dash < 0.5 ? 'sharp' : 'rounded',
  })),
  weights: S.WEIGHTS.filter(w => w.id !== 'none').map(w => ({
    id: w.id, name: w.name, mass: w.mass,
  })),
  finishes: S.FINISHES, launchers: S.LAUNCHERS,
};

writeFileSync(path.join(here, 'spec.json'), JSON.stringify(spec, null, 1));
const n = spec.cores.length + spec.blades.length + spec.assists.length +
          spec.ratchets.length + spec.bits.length + spec.weights.length;
console.log('spec.json: %d parts (%d cores, %d blades, %d assists, %d ratchets, %d bits, %d weights)',
  n, spec.cores.length, spec.blades.length, spec.assists.length,
  spec.ratchets.length, spec.bits.length, spec.weights.length);
