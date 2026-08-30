/* RIPCORD asset manifest generator.
 *
 * Reads the live parts catalogue out of sim2.js and emits the art list, so the
 * list can never drift from the game. Re-run it after any catalogue change.
 *   node assets.js > ASSETS.md
 */
const SIM = require('../src/sim2.js');

const L = [];
const out = s => L.push(s);
const rule = () => out('');

// ---- budgets, in triangles. Two tops on screen on a mid-range phone.
const BUDGET = { core: 300, blade: 1200, assist: 600, ratchet: 500, bit: 400, weight: 120 };
const total = BUDGET.core + BUDGET.blade + BUDGET.assist + BUDGET.ratchet + BUDGET.bit + BUDGET.weight * 4;

out('# RIPCORD — Asset List');
out('');
out('Generated from the parts catalogue in `sim2.js`. Counts below are exact.');
rule();

// ---------------------------------------------------------------- 1. mount
out('## 1. The common mount');
out('');
out('Every part must interchange with every other part. One skeleton, N runtime');
out('attachments. Fix these dimensions before anyone models anything — a part that');
out('does not honour the mount is not an asset, it is a bug.');
out('');
out('```');
out('  axis            vertical, +Y up, origin at the FLOOR CONTACT POINT');
out('  core socket     bayonet, 3 lugs at 120 deg, boss dia 8.0mm, top face Y = 26mm');
out('  blade boss      bayonet ring dia 22.0mm, underside face Y = 18mm');
out('  assist clip     same bayonet, seats 3.0mm below the blade underside');
out('  ratchet thread  M16 x 1.0 into the blade underside, teeth ring dia 14.0mm');
out('  ratchet heights 30 / 40 / 50 / 60 / 70 / 80 / 90  (name encodes it)');
out('  bit shaft       press fit, dia 9.0mm, insertion depth 6.0mm');
out('  weight holes    12 blind holes, dia 3.5mm, depth 4.0mm, on the blade underside');
out('                  inner ring at 0.42 x blade radius, outer ring at 0.80');
out('                  6 per ring, 60 deg apart, hole 0 at +X');
out('```');
out('');
out('Model every part at real scale in millimetres, Y up, origin at the mount');
out('face rather than the mesh centre. The renderer stacks parts by mount face, so');
out('a mis-placed origin shows up as a floating blade.');
rule();

// ---------------------------------------------------------------- 2. meshes
out('## 2. Part meshes');
out('');
out('| Slot | Count | Tri budget each | Notes |');
out('|---|---|---|---|');
const slots = [
  ['Core (lock chip)', SIM.CORES.length, BUDGET.core, 'Sits on top; carries the ability tell. Readable from directly above.'],
  ['Blade (weapon)', SIM.BLADES.length, BUDGET.blade, 'The silhouette. Tooth count must read as sharpness at a glance.'],
  ['Assist (sub-blade)', SIM.ASSISTS.length, BUDGET.assist, 'Seen edge-on under the blade. Nine models plus one empty.'],
  ['Ratchet', SIM.RATCHETS.length, BUDGET.ratchet, 'Seven heights; teeth count visible on the ring.'],
  ['Bit (tip)', SIM.BITS.length, BUDGET.bit, 'Small but always in contact — the wear point.'],
  ['Weight', SIM.WEIGHTS.length - 1, BUDGET.weight, 'Three masses, one mesh each, scaled to fit both rings.']
];
for (const [n, c, b, note] of slots) out(`| ${n} | ${c} | ${b} | ${note} |`);
out('');
out(`**${slots.reduce((a, s) => a + s[1], 0)} part meshes total.** A fully dressed top is about ${total} triangles`);
out('with four weights fitted; two tops and a stadium should sit near 9k, which is');
out('comfortable on a mid-range phone at 60fps and leaves room for the trail effects.');
rule();

// ---------------------------------------------------------------- 3. per-part
out('## 3. Individual parts');
out('');
const table = (title, list, cols, rowf) => {
  out(`### ${title}`);
  out('');
  out('| ' + cols.join(' | ') + ' |');
  out('|' + cols.map(() => '---').join('|') + '|');
  for (const p of list) out('| ' + rowf(p).join(' | ') + ' |');
  out('');
};
table('Cores — ' + SIM.CORES.length, SIM.CORES,
  ['id', 'name', 'ability', 'spin', 'design note'],
  p => [p.id, p.name, p.ability, p.dir > 0 ? 'right' : 'left',
        'Ability tell must be legible at 40px while spinning.']);
table('Blades — ' + SIM.BLADES.length, SIM.BLADES,
  ['id', 'name', 'sharp', 'radius mm', 'design note'],
  p => [p.id, p.name, p.sharp.toFixed(2), (p.radius * 1000).toFixed(1),
        p.sharp > 0.7 ? 'Aggressive: few deep teeth, hard shadow line.'
      : p.sharp < 0.3 ? 'Round: continuous rim, no catch points.'
                      : 'Mixed: shallow scallops.']);
table('Assists — ' + SIM.ASSISTS.length, SIM.ASSISTS,
  ['id', 'name', 'rim friction', 'design note'],
  p => [p.id, p.name, p.gearMul.toFixed(2),
        p.gearMul > 1.3 ? 'Toothed, bites — visible knurl.'
      : p.gearMul < 0.7 ? 'Smooth, sheds contact — polished band.'
                        : 'Neutral profile.']);
table('Ratchets — ' + SIM.RATCHETS.length, SIM.RATCHETS,
  ['id', 'height mm', 'lock teeth', 'design note'],
  p => [p.id, String(p.height), p.lock.toFixed(2),
        'Teeth count on the ring must match the name.']);
table('Bits — ' + SIM.BITS.length, SIM.BITS,
  ['id', 'name', 'rail gear', 'design note'],
  p => [p.id, p.name, p.dash.toFixed(2),
        p.dash > 1.2 ? 'Geared: visible cogs that catch the rail.'
      : p.dash < 0.5 ? 'Sharp or narrow: no rail engagement.'
                     : 'Rounded.']);

// ---------------------------------------------------------------- 4. cosmetics
out('## 4. Cosmetics');
out('');
out('None of these touch the simulation. They are the reward currency, and they');
out('are cheap: finishes are two material sliders rather than textures, so the');
out('whole cosmetic layer costs a handful of kilobytes.');
out('');
out('| Type | Count | Delivery |');
out('|---|---|---|');
out(`| Finishes | ${SIM.FINISHES.length} | metalness + roughness pair, no texture |`);
out(`| Decals | ${SIM.DECALS.length - 1} | 256px alpha mask, projected onto the blade |`);
out(`| Spin trails | ${SIM.TRAILS.length - 1} | gradient ramp, 64x4 |`);
out(`| Launcher skins | ${SIM.LAUNCHERS.length} | full mesh, 400 tris, seen only on the wind screen |`);
out('');
out('Finish list: ' + SIM.FINISHES.map(f => f.name).join(', ') + '.');
out('');
out('Decal list: ' + SIM.DECALS.filter(d => d !== 'none').join(', ') + '.');
out('');
out(`Cosmetic combinations per top: **${(SIM.FINISHES.length * SIM.DECALS.length * SIM.TRAILS.length).toLocaleString()}**.`);
rule();

// ---------------------------------------------------------------- 5. arenas
out('## 5. Stadiums');
out('');
out('Four, one per mode, all sharing the dish/ridge/pocket topology the physics');
out('already assumes. The rail is the loudest feature and needs to read as a');
out('machined surface distinct from the dish floor.');
out('');
out('| Stadium | Mode | Needs |');
out('|---|---|---|');
out('| Chalk Ring | Pangkah (default duel) | dish, rail, 3 pockets, chalk-on-dirt floor |');
out('| The Post | Uri (endurance) | dish plus a raised centre post to transfer onto |');
out('| Taya Circle | Taya (loser pinned as target) | flat ground ring, target marker, no rail |');
out('| Long Range | Tuj lub (target range) | lane, distance markers at 10-70 units |');
out('');
out('Each needs: floor albedo + roughness (1024), rail metal trim, pocket lip');
out('geometry, one ambient dust card, and a shadow-catcher plane.');
rule();

// ---------------------------------------------------------------- 6. vfx
out('## 6. Effects');
out('');
out('Hard rule from the competitor review: **no canned cutscenes**. Every effect');
out('is driven by a live simulation value, never a triggered animation.');
out('');
out('| Effect | Driven by | Notes |');
out('|---|---|---|');
out('| Spin blur ring | `abs(w) / launchSpin` | thickness IS remaining spin |');
out('| Wobble marker | `imb`, `phase` | the heavy side, visible before it lands |');
out('| Clash spark | collision impulse | three tiers by magnitude, not three animations |');
out('| Rail streak | dash event + speed | length scales with the actual boost |');
out('| Burst pop | wear crossing 1.0 | parts scatter using the real part meshes |');
out('| Scrape dust | tip speed on floor | continuous, not triggered |');
out('| Ability tell | ability id | 10 distinct, each under 0.4s, never blocks view |');
out('');
out(`Ability tells needed: ${SIM.CORES.map(c => c.ability).join(', ')}.`);
rule();

// ---------------------------------------------------------------- 7. audio
out('## 7. Audio');
out('');
out('| Cue | Variants | Notes |');
out('|---|---|---|');
out('| Wind / draw | 3 | pitch rises with drawing speed |');
out('| Launch | 3 | by launch power band |');
out('| Sustain hum | 1 loop | pitch follows spin, the whole match |');
out('| Clash | 5 | by impulse, plus a distinct metal-on-metal for sharp blades |');
out('| Rail grind | 1 loop | only while on the rail |');
out('| Burst | 2 | the payoff sound; must be the loudest thing in the game |');
out('| Ring out | 2 | includes the pocket exit |');
out('| Spin down | 1 | the wobble-and-die, pitch falls with spin |');
out('| Crowd | 4 beds | idle, tense, roar, disappointment |');
rule();

// ---------------------------------------------------------------- 8. ui
out('## 8. UI art');
out('');
out('The play field is the product. Chrome collapses during a round; the arena is');
out('edge to edge and nothing overlays it but the score.');
out('');
out('| Item | Count | Notes |');
out('|---|---|---|');
out(`| Part icons | ${SIM.CORES.length + SIM.BLADES.length + SIM.ASSISTS.length + SIM.RATCHETS.length + SIM.BITS.length + SIM.WEIGHTS.length - 1} | 96px silhouettes, generated from the meshes at build time |`);
out('| Slot glyphs | 6 | core, blade, assist, ratchet, bit, weight |');
out(`| Trigger glyphs | ${SIM.TRIGGERS.length} | ${SIM.TRIGGERS.join(', ')} |`);
out('| Finish result cards | 5 | spinout, ringout, knockout, burst, double |');
out('| Grade letters | 6 | S A B C D E, one typeface weight |');
out('');
rule();

// ---------------------------------------------------------------- 9. totals
const meshCount = slots.reduce((a, s) => a + s[1], 0);
out('## 9. Totals');
out('');
out(`- **${meshCount} part meshes** + ${SIM.LAUNCHERS.length} launchers + 4 stadiums`);
out(`- **${SIM.DECALS.length - 1} decal masks**, ${SIM.TRAILS.length - 1} trail ramps, ${SIM.FINISHES.length} material presets`);
out(`- **${SIM.CORES.length} ability tells**, 7 physics-driven effects, 22 audio cues`);
out('');
const chassis = SIM.CORES.length * SIM.BLADES.length * SIM.ASSISTS.length *
                SIM.RATCHETS.length * SIM.BITS.length;
const C = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return Math.round(r); };
let placements = 0;
for (let k = 0; k <= SIM.MAX_WEIGHTS; k++) placements += C(SIM.HOLES * SIM.RINGS.length, k) * Math.pow(SIM.WEIGHTS.length - 1, k);
out(`That set of ${meshCount} meshes yields **${chassis.toLocaleString()} chassis**, ` +
    `**${placements.toLocaleString()} weight configurations**, and ` +
    `**${(chassis * placements).toLocaleString()} functionally distinct tops** ` +
    `before a single cosmetic is applied.`);
out('');
out('Which is the argument for building the workshop first. If ' + meshCount +
    ' meshes cannot be made to feel like billions of choices, the problem is not');
out('the art budget.');

console.log(L.join('\n'));
