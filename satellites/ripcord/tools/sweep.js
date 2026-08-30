/* A stat sweep for one part. Measure, do not guess.
 *
 * Hand tuning against the part audit does not work: its ceiling has a standard
 * error of two or three points even at 192 matches, so a change worth two points
 * is invisible and you end up chasing noise. This sweeps a set of candidate stat
 * blocks for ONE part through every reference chassis at a high sample count and
 * prints them side by side, which is a comparison rather than a measurement and
 * is therefore far more stable.
 *
 *   node tools/sweep.js <slot> <id>          shows the part as it stands
 *   node tools/sweep.js <slot> <id> <json>   plus one or more candidate variants
 */
const SIM = require('../src/sim2.js');
const PANEL = Object.keys(SIM.ARCHETYPES);
const SLOTS = { core: SIM.CORES, blade: SIM.BLADES, assist: SIM.ASSISTS,
                ratchet: SIM.RATCHETS, bit: SIM.BITS };

const slot = process.argv[2], id = process.argv[3];
const variants = process.argv.slice(4).map(s => JSON.parse(s));
const list = SLOTS[slot];
const orig = list.find(p => p.id === id);
if (!orig) { console.error('no such part'); process.exit(1); }

const MPG = 60;
function score(cfg, seed) {
  let w = 0, n = 0;
  for (const g of PANEL) for (let i = 0; i < MPG; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(seed + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
    const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  return w / n;
}
function measure(label) {
  const row = []; let sum = 0, best = 0;
  for (const c of PANEL) {
    const cfg = JSON.parse(JSON.stringify(SIM.ARCHETYPES[c]));
    cfg[slot] = id;
    const v = score(cfg, 4242);
    row.push((v * 100).toFixed(1).padStart(9));
    sum += v; best = Math.max(best, v);
  }
  console.log(label.padEnd(22) + row.join('') + '   mean ' + (sum / PANEL.length * 100).toFixed(1) +
              '   best ' + (best * 100).toFixed(1));
  return best;
}

console.log('sweeping ' + slot + ':' + id + ', ' + PANEL.length * MPG * 2 + ' matches per chassis\n');
console.log('variant'.padEnd(22) + PANEL.map(c => c.padStart(9)).join(''));

// the slot's other parts, for context: a variant has to earn its place among these
for (const p of list) {
  if (p.id === id) continue;
  const save = {};
  for (const k in orig) save[k] = orig[k];
  for (const k in p) if (k !== 'id' && k !== 'name' && k !== 'role') orig[k] = p[k];
  measure('  as ' + p.id);
  for (const k in save) orig[k] = save[k];
}
console.log('');
measure('CURRENT');
for (let i = 0; i < variants.length; i++) {
  const save = {};
  for (const k in orig) save[k] = orig[k];
  Object.assign(orig, variants[i]);
  measure('variant ' + (i + 1) + ' ' + JSON.stringify(variants[i]).slice(0, 60));
  for (const k in orig) delete orig[k];
  Object.assign(orig, save);
}
