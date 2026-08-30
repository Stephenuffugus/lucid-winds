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
      a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
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

/* The slot's other parts, for context: a variant has to earn its place among
 * these.
 * ⛔ THIS LEAKED, and a reviewer found it rather than I did. It used to copy
 * every key of the comparison part onto the part under test and then restore
 * only the keys the ORIGINAL had, so any key the original did not carry survived
 * the restore. Once the loop reached a Tier 3 entry, every later measurement,
 * including CURRENT and every variant, was silently wearing that Relic's
 * drawback: one part measured 32.5 percent while quietly carrying One Shot.
 * Delete every key and rebuild from a snapshot instead of patching over. */
function swapIn(target, source) {
  for (const k in target) delete target[k];
  for (const k in source) target[k] = source[k];
}
const ORIG = Object.assign({}, orig);
for (const p of list) {
  if (p.id === id) continue;
  swapIn(orig, Object.assign({}, p, { id: ORIG.id, name: ORIG.name, role: ORIG.role }));
  measure('  as ' + p.id);
  swapIn(orig, ORIG);
}
console.log('');
measure('CURRENT');
for (let i = 0; i < variants.length; i++) {
  swapIn(orig, Object.assign({}, ORIG, variants[i]));
  measure('variant ' + (i + 1) + ' ' + JSON.stringify(variants[i]).slice(0, 60));
  swapIn(orig, ORIG);
}
