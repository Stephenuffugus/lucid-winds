/* RIPCORD asset manifest generator.
 *
 * Reads the live parts catalogue out of sim2.js and emits the art list, so the
 * list can never drift from the game. Re-run it after any catalogue change.
 *   node tools/assets.js            > docs/ASSETS.md   the repo copy
 *   node tools/assets.js --drive              the phone readable copy for Drive
 */
const SIM = require('../src/sim2.js');

/* ⛔ TWO RENDERINGS, ONE SOURCE. Stephen reads this on his phone out of Drive,
   and a pipe table with a hundred and thirteen rows is unreadable there: it wraps
   into pipe soup. --drive emits the same data as plain lines instead. Two
   generators would be two lists that drift, which is the mistake this project
   keeps catching itself making, so it is one generator with a flag. */
const DRIVE = process.argv.includes('--drive');

const L = [];
const out = s => L.push(
  DRIVE ? String(s).replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/`/g, '') : s);
const rule = () => out('');

// ---- budgets, in triangles. Two tops on screen on a mid-range phone.
const BUDGET = { core: 300, blade: 1200, assist: 600, ratchet: 500, bit: 400, weight: 120 };
const total = BUDGET.core + BUDGET.blade + BUDGET.assist + BUDGET.ratchet + BUDGET.bit + BUDGET.weight * 4;

out('# RIPCORD — Asset List');
out('');
if (!DRIVE) {
  // ⛔ The Drive copy is the one Stephen actually reads; he works from his phone
  // and does not open the repo. Keep the link here so the two never drift.
  out('**Drive copy:** https://docs.google.com/document/d/1poGxv8ypFCOq9SOvqCGrcMdtjIEYhvOsro_wK1a9sGU/edit');
  out('');
  out('My Drive → stevie weedseed → business materials → Github → Ripcord.');
  out('Regenerate it with `node tools/assets.js --drive` and paste the result in.');
  out('');
}
out('Generated from the parts catalogue in `sim2.js`. Counts below are exact.');
rule();

// ---------------------------------------------------------------- 1. mount
out('## 0. What Ripcord needs painted today');
out('');
out('**Nothing.** The game ships with no image assets at all: every pixel in it is');
out('drawn by code, including the tops, the dish, the twelve decals, the six');
out('launchers and the four stadiums. The only bitmaps in the whole build are the');
out('three app icons and the portal thumbnail, and a script generates those.');
rule();
out('So this is not a queue. It is the list for the 3D build, which the brief puts');
out('last and gates on the workshop already being fun, plus a short wants list at');
out('the bottom if you would rather hand paint something sooner.');
rule();

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
if (!DRIVE) { out('| Slot | Count | Tri budget each | Notes |'); out('|---|---|---|---|'); }
const slots = [
  ['Core (lock chip)', SIM.CORES.length, BUDGET.core, 'Sits on top; carries the ability tell. Readable from directly above.'],
  ['Blade (weapon)', SIM.BLADES.length, BUDGET.blade, 'The silhouette. Tooth count must read as sharpness at a glance.'],
  ['Assist (sub-blade)', SIM.ASSISTS.length, BUDGET.assist,
   'Seen edge-on under the blade. One of them is the empty slot and needs no mesh.'],
  ['Ratchet', SIM.RATCHETS.length, BUDGET.ratchet, 'Seven heights; teeth count visible on the ring.'],
  ['Bit (tip)', SIM.BITS.length, BUDGET.bit, 'Small but always in contact — the wear point.'],
  ['Weight', SIM.WEIGHTS.length - 1, BUDGET.weight, 'Three masses, one mesh each, scaled to fit both rings.']
];
for (const [n, c, b, note] of slots)
  out(DRIVE ? `  ${n}: ${c} meshes, ${b} triangles each\n    ${note}`
            : `| ${n} | ${c} | ${b} | ${note} |`);
out('');
out(`**${slots.reduce((a, s) => a + s[1], 0)} part meshes total.** A fully dressed top is about ${total} triangles`);
out('with four weights fitted; two tops and a stadium should sit near 9k, which is');
out('comfortable on a mid-range phone at 60fps and leaves room for the trail effects.');
rule();

// ---------------------------------------------------------------- 3. per-part
out('## 3. Individual parts');
out('');
const table = (title, list, cols, rowf, rule) => {
  if (DRIVE) {
    out(title.toUpperCase());
    if (rule) out(rule);
    out('');
    for (const p of list) {
      const r = rowf(p);
      // name and the defining numbers on one line, then what it is
      out('  ' + r.slice(0, cols.length - 1)
            .map((v, i) => cols[i] === 'id' ? '' : v).filter(Boolean).join('   '));
      out('    ' + r[cols.length - 1]);
      out('');
    }
    return;
  }
  out(`### ${title}`);
  out('');
  if (rule) { out('*' + rule + '*'); out(''); }
  out('| ' + cols.join(' | ') + ' |');
  out('|' + cols.map(() => '---').join('|') + '|');
  for (const p of list) out('| ' + rowf(p).join(' | ') + ' |');
  out('');
};
const TIER = p => ['', 'Stock', 'Forged', 'Relic'][p.tier || 1];
const NOTE = (p, extra) => (p.desc || '') + (extra ? ' ' + extra : '');

table('Cores — ' + SIM.CORES.length, SIM.CORES,
  ['id', 'name', 'tier', 'move', 'spin', 'what it is'],
  p => [p.id, p.name, TIER(p), p.ability, p.dir > 0 ? 'right' : 'left',
        NOTE(p)],
  'A core sits on top and is seen from directly above, so whatever tells you which move it carries has to read at 40px while the top is spinning.');
table('Blades — ' + SIM.BLADES.length, SIM.BLADES,
  ['id', 'name', 'tier', 'sharp', 'radius mm', 'what it is'],
  p => [p.id, p.name, TIER(p), p.sharp.toFixed(2), (p.radius * 1000).toFixed(1),
        NOTE(p, p.sharp > 0.7 ? 'Few deep teeth and a hard shadow line.'
             : p.sharp < 0.3 ? 'Continuous rim, no catch points.'
                             : 'Shallow scallops.')],
  'The blade is the silhouette, and its tooth count has to read as sharpness at a glance from across a dish.');
table('Assists — ' + SIM.ASSISTS.length, SIM.ASSISTS,
  ['id', 'name', 'tier', 'rim friction', 'what it is'],
  p => [p.id, p.name, TIER(p), p.gearMul.toFixed(2),
        NOTE(p, p.gearMul > 1.3 ? 'Toothed, with a visible knurl.'
             : p.gearMul < 0.7 ? 'Smooth, a polished band.'
                               : 'Neutral profile.')],
  'An assist is only ever seen edge on, in the shadow under the blade. One of them is the empty slot and needs no mesh.');
table('Ratchets — ' + SIM.RATCHETS.length, SIM.RATCHETS,
  ['name', 'tier', 'height mm', 'lock', 'what it is'],
  p => [p.id, TIER(p), String(p.height), p.lock.toFixed(2),
        NOTE(p)],
  'The name IS the geometry. The number before the dash is the tooth count on the ring and the one after it is the height in millimetres; both have to match the model.');
table('Bits — ' + SIM.BITS.length, SIM.BITS,
  ['id', 'name', 'tier', 'rail gear', 'what it is'],
  p => [p.id, p.name, TIER(p), p.dash.toFixed(2),
        NOTE(p, p.dash > 1.2 ? 'Visible cogs that catch the rail.'
             : p.dash < 0.5 ? 'Sharp or narrow, with no rail engagement.'
                            : 'Rounded.')],
  'The bit is small and always in contact, so it is the wear point and the one part that is never hidden.');

// ---------------------------------------------------------------- 4. cosmetics
out('## 4. If you want to paint something sooner');
out('');
out('None of this is needed and none of it is blocked on anybody. In rough order');
out('of what would show most:');
out('');
out('  1. The four stadium floors. They are drawn as chalk on dirt and would take a');
out('     painted texture well, one per mode, 1024 square, seen from straight above.');
out('  2. The twelve decals as painted 256px alpha masks instead of the drawn marks,');
out('     which would let them carry far more detail than four strokes of canvas.');
out('  3. A menu backdrop. The menu currently plays a live round behind itself, which');
out('     is doing the job, so this is the least useful of the three.');
out('');
out('What is deliberately NOT on this list: the tops themselves. They are drawn from');
out('their own stats, so a Cleaver has ten teeth because its sharpness is 1.00 and a');
out('Halo has three because its sharpness is 0.18. A painted sprite would have to be');
out('drawn a hundred and ten times and would still be lying about the numbers.');
rule();

out('## 5. Cosmetics');
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
out(`Cosmetic combinations per top: **${(SIM.FINISHES.length * SIM.DECALS.length *
      SIM.TRAILS.length * SIM.LAUNCHERS.length).toLocaleString()}**, launchers included.`);
rule();

// ---------------------------------------------------------------- 5. arenas
out('## 6. Stadiums');
out('');
out('Four, one per mode, all sharing the dish/ridge/pocket topology the physics');
out('already assumes. The rail is the loudest feature and needs to read as a');
out('machined surface distinct from the dish floor.');
out('');
out('| Stadium | Mode | Needs |');
out('|---|---|---|');
out('| Chalk Ring | Pangkah (default duel) | dish, rail, 3 pockets, chalk-on-dirt floor |');
out('| The Posts | Uri (endurance) | dish plus TWO raised posts, one per top, and no pockets |');
out('| Taya Circle | Taya (loser pinned as target) | the dish with a target mark stood in the middle of it |');
out('| Long Range | Tuj lub (target range) | a 340mm dish marked in five distance bands, no pockets |');
out('');
out('Each needs: floor albedo + roughness (1024), rail metal trim, pocket lip');
out('geometry, one ambient dust card, and a shadow-catcher plane.');
rule();

// ---------------------------------------------------------------- 6. vfx
out('## 7. Effects');
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
out(`| Ability tell | ability id | ${[...new Set(SIM.CORES.map(c => c.ability))].length} distinct, each under 0.4s, never blocks view |`);
out('');
{
  // ⛔ One tell per distinct MOVE, not one per core. Four moves are carried by
  // two cores each, so the old line listed overdrive, rebound and burrow twice
  // and told an artist to draw twenty two things when nineteen exist.
  const moves = [...new Set(SIM.CORES.map(c => c.ability))];
  out(`Ability tells needed, one per distinct move: **${moves.length}** — ${moves.join(', ')}.`);
}
rule();

// ---------------------------------------------------------------- 7. audio
out('## 8. Audio');
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
out('## 9. UI art');
out('');
out('The play field is the product. Chrome collapses during a round; the arena is');
out('edge to edge and nothing overlays it but the score.');
out('');
out('| Item | Count | Notes |');
out('|---|---|---|');
out(`| Part icons | ${SIM.CORES.length + SIM.BLADES.length + SIM.ASSISTS.length + SIM.RATCHETS.length + SIM.BITS.length + SIM.WEIGHTS.length - 1} | 96px silhouettes, generated from the meshes at build time |`);
out('| Slot glyphs | 6 | core, blade, assist, ratchet, bit, weight |');
out(`| Trigger glyphs | ${SIM.TRIGGERS.length} | ${SIM.TRIGGERS.join(', ')} |`);
out('| Finish result cards | 6 | spinout, ringout, knockout, burst, double, worn |');
out('| Grade letters | 6 | S A B C D E, one typeface weight |');
out('');
rule();

// ---------------------------------------------------------------- 9. totals
const meshCount = slots.reduce((a, s) => a + s[1], 0);
out('## 10. Totals');
out('');
out(`- **${meshCount} part meshes** + ${SIM.LAUNCHERS.length} launchers + 4 stadiums`);
out(`- **${SIM.DECALS.length - 1} decal masks**, ${SIM.TRAILS.length - 1} trail ramps, ${SIM.FINISHES.length} material presets`);
out(`- **${[...new Set(SIM.CORES.map(c => c.ability))].length} ability tells**, 7 physics-driven effects, 22 audio cues`);
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
