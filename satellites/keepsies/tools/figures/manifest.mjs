/**
 * KEEPSIES m5: writes assets/figures/manifest.json from figfit.py's report and the packed files.
 *   node tools/figures/manifest.mjs WORK/fit-report.json assets/figures
 * Each row: id, file, bytes, triangles, bounds (height 1, origin the base centre, front +Z, game axes), the low
 * band half extents the game fits by, and the collider ARCHETYPE the figure suits (statues) or 'grail'.
 *
 * ⚖️ THE ARCHETYPES (Fable's reading, Stephen's call to change): each figure goes to the collider its lowest third
 * already fits, because a marble on the dirt only ever touches a figure's lowest third (a 16 to 22 mm marble's
 * contact is under 22 mm). The fit (below) is per axis on that band, so the colliders in core/statues.js are
 * untouched and what the player sees is what the marble hits, to the millimetre the report prints.
 *   loaf   wide and low:  void_loaf, moon_moo (both turned a quarter: a lying cat and a lying cow are long from the
 *                         side), mothlight (wide already)
 *   orb    round:         boba_buddy, bolt_buddy, dumpster_duke, snacktopus
 *   column narrow:        pickle_wizard, save_point, boo_brew, quarter_eater
 *   arch   the stone arch STAYS (a marble must pass under it and no figure has a 40 by 48 mm hole): a small figure
 *          keeps the gate on its lintel: book_wyrm, tiny_tyrant, moss_boss
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const ARCHETYPE = {
  void_loaf: 'loaf', moon_moo: 'loaf', mothlight: 'loaf',
  boba_buddy: 'orb', bolt_buddy: 'orb', dumpster_duke: 'orb', snacktopus: 'orb',
  pickle_wizard: 'column', save_point: 'column', boo_brew: 'column', quarter_eater: 'column',
  book_wyrm: 'arch', tiny_tyrant: 'arch', moss_boss: 'arch'
};
const YAW = { void_loaf: 90, moon_moo: 90 };
/* the colliders' half extents in the band a marble touches, and their heights (metres, from core/statues.js SHAPES):
   column shaft r 12 on a base r 18 (0 to 8 mm), orb plinth r 16 under the ball (r 15 at 16 mm, 18 at 20), loaf box
   45 by 26; the arch figure sits ON the lintel (top at 60 mm, 72 by 24) */
const BAND = { column: { hx: 0.014, hz: 0.014, h: 0.06 }, orb: { hx: 0.017, hz: 0.017, h: 0.054 },
  loaf: { hx: 0.045, hz: 0.026, h: 0.034 } };
/** The fit: scale x and z so the low band meets the collider's, y their mean (kept 45 to 63 mm tall: about three
    marbles), x and z never more than 15% off y (a figure squashed further reads wrong). */
function fitFor(id, b) {
  const kind = ARCHETYPE[id], yaw = YAW[id] || 0;
  if (kind === 'arch') {
    const lo = b.low30, s = Math.min(0.028, 0.03 / Math.max(lo.hx, lo.hz));
    return { yaw, sx: +s.toFixed(5), sy: +s.toFixed(5), sz: +s.toFixed(5), y0: 0.06, heightMm: +(s * 1000).toFixed(1), overhangMm: [0, 0] };
  }
  const C = BAND[kind], lo = b.low30;
  const hx = yaw ? lo.hz : lo.hx, hz = yaw ? lo.hx : lo.hz;
  const fx = C.hx / hx, fz = C.hz / hz;
  const s = Math.min(0.063, Math.max(0.045, Math.sqrt(fx * fz)));
  const sx = Math.min(s * 1.15, Math.max(s / 1.15, fx)), sz = Math.min(s * 1.15, Math.max(s / 1.15, fz));
  return { yaw, sx: +sx.toFixed(5), sy: +s.toFixed(5), sz: +sz.toFixed(5), y0: 0, heightMm: +(s * 1000).toFixed(1),
    overhangMm: [+((hx * sx - C.hx) * 1000).toFixed(1), +((hz * sz - C.hz) * 1000).toFixed(1)] };
}
const NAMES = {
  void_loaf: 'Void Loaf', moon_moo: 'Moon Moo', mothlight: 'Mothlight', dumpster_duke: 'Dumpster Duke',
  boba_buddy: 'Boba Buddy', bolt_buddy: 'Bolt Buddy', snacktopus: 'Snacktopus', moss_boss: 'Moss Boss',
  boo_brew: 'Boo Brew', quarter_eater: 'Quarter Eater', save_point: 'Save Point',
  tiny_tyrant: 'Tiny Tyrant', book_wyrm: 'Book Wyrm', pickle_wizard: 'Pickle Wizard',
  koi: 'Koi', the_astronomer: 'The Astronomer', the_drowned_knight: 'The Drowned Knight', the_ember_dragon: 'The Ember Dragon'
};

const [rep, dir] = process.argv.slice(2);
if (rep && dir) {
  const R = JSON.parse(readFileSync(rep, 'utf8'));
  const rows = Object.values(R).sort((a, b) => a.id.localeCompare(b.id)).map(r => {
    const file = r.id + '.glb';
    const bytes = statSync(join(dir, file)).size;
    // the triangles as packed (a figure gltfpack simplified has a different count from Blender's report)
    const b = readFileSync(join(dir, file)), jl = b.readUInt32LE(12), J = JSON.parse(b.subarray(20, 20 + jl).toString());
    r.triangles = J.meshes.reduce((t, m) => t + m.primitives.reduce((u, p) => u + J.accessors[p.indices].count / 3, 0), 0);
    return { id: r.id, name: NAMES[r.id] || r.id, file, bytes, triangles: r.triangles, texture: r.texture,
      archetype: r.grail ? 'grail' : (ARCHETYPE[r.id] || null), fit: r.grail ? null : fitFor(r.id, r.bounds), bounds: r.bounds };
  });
  const total = rows.reduce((s, r) => s + r.bytes, 0);
  const out = { note: 'KEEPSIES m5 THE FIGURES, made by tools/figures/fit.sh from the Meshy originals (never in the repo). Height 1, origin the centre of the base, +Y up, front +Z.',
    totalBytes: total, figures: rows };
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(out, null, 1) + '\n');
  for (const r of rows) console.log(r.id.padEnd(20), String(r.bytes).padStart(8), String(r.triangles).padStart(6), r.archetype, r.fit ? r.fit.heightMm + ' mm, overhang ' + r.fit.overhangMm.join('/') + ' mm' : '');
  console.log('total', total, 'largest', Math.max(...rows.map(r => r.bytes)));
}
