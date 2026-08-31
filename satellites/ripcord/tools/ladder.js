/* RIPCORD ladder builder.
 *
 * Twenty opponents on a difficulty curve that is measured, not asserted. For
 * each rung we sample builds, score each one against a fixed reference panel,
 * and keep the build whose measured strength lands closest to that rung's
 * target. Then we verify the curve is monotonic before writing it out.
 *
 * Every rung also drops a part. Parts come from winning — there is no currency
 * in this game and there is never going to be one.
 *
 *   node ladder.js          print the table
 *   node ladder.js --json   write ladder.json
 */
const SIM = require('../src/sim2.js');
const fs = require('fs');
const path = require('path');
const LADDER_JSON = path.join(__dirname, '..', 'src', 'ladder.json');

/* Twenty ordinary opponents, named after market stalls, tools, weekdays and
   relatives, which is how the people who actually play these games name each
   other. Five bosses sit on top of them, one per league. */
const NAMES = [
  'Chalkline',   'Bat Handler',  'Post Keeper',  'Knot',
  'Riverstone',  'Tin Whistle',  'Marketside',   'The Cousin',
  'Nine Teeth',  'Long Tuesday', 'Barrel Boy',   'Quiet Hands',
  'Gasing',      'Ash Wednesday','The Uncle',    'Half Crown',
  'Ironmonger',  'Old Cord',     'Saltseller',   'Rope Walk'
];

/* THE FIVE BOSSES. Each one teaches a single mechanic by making it the only way
   through, and each is expressed entirely as flags read in the match loop:
   nothing here reaches into stepTop or collide, which is the test of whether a
   gimmick is the right gimmick.

   Every number below was measured, not asserted. The measurements are in the
   comments beside them. */
const BOSSES = [
  { rung: 5,  league: 0, name: 'The Post', role: 'stamina',
    build: { core: 'ember', blade: 'halo', assist: 'slick', ratchet: '5-60', bit: 'needle',
             weights: [{ id: 'chip', hole: 0, ring: 1 }, { id: 'chip', hole: 2, ring: 1 },
                       { id: 'chip', hole: 4, ring: 1 }], trigger: 'lowSpin' },
    boss: { limit: 40,
            // It parks in the middle and will outlast anything. Nothing in this
            // game wins on spin alone, and this is where you learn it.
            rig: { decay: 0.40, drive: 0.16, taken: 0.28, exitNeed: 0.85 } },
    teaches: 'Attack has a job; nothing here wins on spin alone.',
    relicSlot: 'bit' },

  { rung: 10, league: 1, name: 'Katis', role: 'attack',
    build: { core: 'lash', blade: 'cleaver', assist: 'rake', ratchet: '4-80', bit: 'rush',
             weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'brick', hole: 1, ring: 1 }],
             trigger: 'firstBlood' },
    // ⛔ The free strike is NOT spawned as a launch collision. Measured at every
    // speed from 0.45 to 1.10 m/s it was a guaranteed round loss, 0 to 2 percent
    // across ten chassis, because at t=0 the player has no velocity so Katis is
    // always the aggressor and one heavy side swing at the 2.10 clamp does 2.4
    // lock wear against a burst threshold of 1.0. It runs through the Taya
    // ceremony instead, which is already built, already tuned and already drawn.
    boss: { limit: 40, katis: { powerCoef: 0.40 } },
    teaches: 'Momentum, and what losing a round costs you. Win the first one.',
    relicSlot: 'blade' },

  { rung: 15, league: 2, name: 'The Pemangkin', role: 'defense',
    build: { core: 'iron', blade: 'anvil', assist: 'collar', ratchet: '9-60', bit: 'dome',
             weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'brick', hole: 1, ring: 1 },
                       { id: 'brick', hole: 3, ring: 1 }, { id: 'brick', hole: 4, ring: 1 }],
             trigger: 'thirdHit' },
    // Permanently anchored, so its lean pins at 0.0102 against a topple threshold
    // of 0.46 and its ringout requirement runs to 3.3 m/s against the 0.65 the
    // best legal hit delivers. It cannot be toppled and it cannot be thrown out.
    // The only thing left to attack is the teeth holding it together.
    boss: { limit: 40, anchor: true, specMul: { m: 2.2, I: 2.2 }, rig: { burstTake: 2.0 } },
    teaches: 'Burst exists, and it is the answer to the immovable.',
    relicSlot: 'assist' },

  { rung: 20, league: 3, name: 'Two Direction', role: 'utility',
    build: { core: 'hollow', blade: 'talon', assist: 'hook', ratchet: '5-60', bit: 'spool',
             weights: [{ id: 'slug', hole: 0, ring: 1 }, { id: 'slug', hole: 3, ring: 1 }],
             trigger: 'charged' },
    // Fires reversal on a repeating timer, so the matchup you built for is only
    // ever half the round. Three seconds rather than four: at four the flip
    // landed too rarely to have to plan around.
    boss: { limit: 40, abilityEvery: 3.0, rig: { jtCap: 1.25, taken: 0.70 } },
    teaches: 'Same spin against opposite spin is a matchup, not flavour.',
    relicSlot: 'core' },

  { rung: 25, league: 4, name: 'The Giant', role: 'defense',
    build: { core: 'lodest', blade: 'bulwark', assist: 'wing', ratchet: '8-30', bit: 'dome',
             weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'brick', hole: 1, ring: 1 },
                       { id: 'brick', hole: 3, ring: 1 }, { id: 'brick', hole: 4, ring: 1 }],
             trigger: 'late' },
    // A Kelantan scale top in a stadium half again as wide. bowlMul is required
    // rather than cosmetic: K.bowl is an acceleration of 12 times r, so widening
    // the dish scales the rim pull linearly and the rail walks out of reach.
    // 0.150/0.230 keeps bowl times arenaR constant, so the dish keeps its SHAPE.
    // spinTarget is its door: wear it below 0.90 of its launch spin before the
    // bell and it is yours.
    // ⛔ Twelve seconds, not twenty two, and the number came out of a sweep
    // rather than a preference. At twenty two the player's own top was gone
    // first in a hundred rounds out of a hundred and twenty, so the door might
    // as well not have been there. At twelve the finish mix is 61 percent worn
    // against 37 percent burst, and the panel spreads 32 points with defense at
    // 37, grinder at 29 and stamina at 24 against brawler 11 and breaker 4.
    // Attrition walks through; force does not. That is the lesson, in numbers.
    // ⛔ chargeRate 0, added in the x3 charge retune: with charge alive the
    // Giant reached its 'late' trigger from the strikes it absorbs and
    // LUNGED at t=8 — a 2.2x mass wrecking ball that un-taught its own
    // lesson (worn share fell 61 -> 36 and the best panel answer hit 15
    // percent, a wall). A giant does not need a move; it is the move.
    boss: { arenaR: 0.230, bowlMul: 0.652, limit: 12, spinTarget: 0.90,
            specMul: { m: 2.2, I: 2.2, chargeRate: 0 },
            rig: { taken: 0.35, burstTake: 0.70, decay: 0.45, drive: 1.80, exitNeed: 0.50 } },
    teaches: 'You do not out muscle a giant; you take its spin off it.',
    relicSlot: 'ratchet' }
];

// Rung n faces you with a role you have to answer. Cycling them means the
// ladder teaches the matchup triangle without a tutorial screen saying so.
const ROLE_ORDER = ['balance', 'stamina', 'attack', 'defense'];

// Measured strength targets. Rung 1 should lose to a competent build; the top
// of the ladder should beat one more often than not.
const target = i => 0.30 + (0.70 - 0.30) * Math.pow(i / 19, 0.92);

/* ⚖️ THE FIRST FOUR RUNGS ARE TUNED AGAINST THE STOCK BUILD, not the panel.
   The panel archetypes carry counterweights and tuned parts; the rung one
   player has iron/wheel/wing/3-60/point and nothing else, so a rung tuned
   to 30 percent against the panel measured 59 percent against the player
   actually standing there - Stephen felt it on his phone as lost right
   away, three times in a row. These targets are the OPPONENT'S win rate
   against stock: the player should take rung one about two matches in
   three and be at even money by rung four, converging with the panel
   curve as their case fills with parts. */
const STOCK_BUILD = { core: 'iron', blade: 'wheel', assist: 'wing',
                      ratchet: '3-60', bit: 'point', weights: [] };
const STOCK_TARGETS = [0.35, 0.40, 0.45, 0.50];
/* ⛔ Tuned on MATCHES, not rounds. The first stock-relative pass tuned on
   rounds and the felt rates came out 42/46/24/33 instead of 65/60/55/50:
   the stock build's wins are spinouts worth ONE point while a tuned
   opponent's wins are ringouts and bursts worth TWO, so a player winning
   62 percent of rounds was still losing the match. The player experiences
   first-to-four points; that is the statistic, so that is what is tuned. */
const PTS = { spinout: 1, ringout: 2, knockout: 2, burst: 2, timeout: 1, worn: 2, double: 0 };
function matchVsStock(cfg, seed, matches) {
  let w = 0;
  for (let m = 0; m < matches; m++) {
    const rnd = SIM.mulberry(seed + m * 131);
    let po = 0, ps = 0;
    while (po < 4 && ps < 4) {
      const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
      const foe = SIM.build(Object.assign({}, STOCK_BUILD, { dir: rnd() < 0.5 ? 1 : -1 }));
      const r = SIM.resolveMatch(me, foe, { rnd,
        a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283, trigger: cfg.trigger },
        b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
      const p = PTS[r.cause] || 1;
      if (r.winner === 'a') po += p; else if (r.winner === 'b') ps += p;
    }
    if (po > ps) w++;
  }
  return w / matches;
}

const PANEL = Object.keys(SIM.ARCHETYPES);
const rnd0 = SIM.mulberry(4242);
const pickR = a => a[Math.floor(rnd0() * a.length)];

function strength(cfg, seed, reps) {
  let w = 0, n = 0;
  for (const g of PANEL) for (let i = 0; i < reps; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(seed + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
    const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283, trigger: cfg.trigger },
      b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  return w / n;
}

/* The sampler moved into sim2.js so that Field mode, which builds an opponent on
 * the player's phone, and this generator, which builds twenty five ahead of
 * time, cannot drift into being two different games. */
function sample(role, rung) {
  return SIM.sampleOpponent(rnd0, role, rung / 19);
}

/* Drops. The arithmetic has to come out exactly, because a part nobody can win
   is a part that does not exist.
     110 parts, 10 in the starter kit, 20 of them Relics.
     90 non Relic parts still to win, over 20 ordinary rungs, is four a rung
     once you subtract the 10 starters: 80 dropped plus 10 starting is 90.
   Relics never appear here. Bosses are their only source and each boss hands
   out the Relics of its own slot, one per win, so finishing a set means going
   back and beating it again.
   The pools are interleaved by slot so a player gets a spread rather than five
   bits in a row, and sorted so the Forged parts arrive after the Stock ones. */
const STARTER = ['iron', 'moth', 'wheel', 'crest', 'none', 'wing', '3-60', '4-80', 'point', 'spool'];

function dropTable() {
  const pools = [
    ['blade', SIM.BLADES], ['bit', SIM.BITS], ['ratchet', SIM.RATCHETS],
    ['assist', SIM.ASSISTS], ['core', SIM.CORES]
  ].map(([slot, list]) => ({
    slot,
    queue: list.filter(p => (p.tier || 1) < 3 && STARTER.indexOf(p.id) < 0)
               .sort((a, b) => (a.tier || 1) - (b.tier || 1))
  }));
  const total = pools.reduce((n, p) => n + p.queue.length, 0);
  const drops = [];
  let k = 0;
  for (let rung = 0; rung < 20; rung++) {
    const four = [];
    for (let j = 0; j < 4; j++) {
      // round robin the slots, skipping any that has run dry
      for (let t = 0; t < pools.length; t++) {
        const p = pools[(k + t) % pools.length];
        if (p.queue.length) { four.push({ slot: p.slot, id: p.queue.shift().id }); k = (k + t + 1) % pools.length; break; }
      }
    }
    drops.push(four);
  }
  const left = pools.reduce((n, p) => n + p.queue.length, 0);
  if (left) console.log('WARNING: ' + left + ' non Relic parts are unreachable');
  return { drops, total };
}

const CANDIDATES = 40, REPS = 2;
const ordinary = [];
const { drops, total } = dropTable();

for (let i = 0; i < 20; i++) {
  const role = ROLE_ORDER[i % ROLE_ORDER.length];
  const vsStock = i < STOCK_TARGETS.length;
  const want = vsStock ? STOCK_TARGETS[i] : target(i);
  let best = null;
  for (let c = 0; c < CANDIDATES; c++) {
    const cfg = sample(role, i);
    const s = vsStock ? matchVsStock(cfg, i * 1013 + c * 17, 24)
                      : strength(cfg, i * 1013 + c * 17, REPS);
    const err = Math.abs(s - want);
    if (!best || err < best.err) best = { cfg, s, err };
  }
  ordinary.push({
    name: NAMES[i], role, basis: vsStock ? 'stock' : 'panel',
    target: +want.toFixed(3), measured: +best.s.toFixed(3),
    build: best.cfg, drops: drops[i]
  });
}

/* Interleave: four ordinary rungs then a boss, five times over. */
const ladder = [];
let oi = 0;
for (let lg = 0; lg < 5; lg++) {
  for (let r = 0; r < 4; r++) {
    const o = ordinary[oi++];
    ladder.push({ rung: ladder.length + 1, league: lg, name: o.name, role: o.role,
                  target: o.target, measured: o.measured, build: o.build, drops: o.drops });
  }
  const b = BOSSES[lg];
  const relics = { core: SIM.CORES, blade: SIM.BLADES, assist: SIM.ASSISTS,
                   ratchet: SIM.RATCHETS, bit: SIM.BITS }[b.relicSlot]
    .filter(p => p.tier === 3).map(p => p.id);
  ladder.push({
    rung: ladder.length + 1, league: lg, name: b.name, role: b.role,
    target: 0.5, measured: +strength(b.build, 90210 + lg * 7, REPS).toFixed(3),
    build: b.build, boss: b.boss, teaches: b.teaches,
    relicSlot: b.relicSlot, relics
  });
}

/* Verify the curve actually rises, across the ORDINARY rungs only. A boss is
   deliberately off the curve; that is what makes it a boss, and folding it in
   would report an inversion every fifth step forever. */
let inversions = 0, worst = 0;
const curve = ladder.filter(r => !r.boss);
for (let i = 1; i < curve.length; i++) {
  // the first four rungs measure against the stock build, the rest against
  // the panel - two statistics, so the seam between them is not a step on
  // one curve and is never compared (the same-statistic law, inside one tool)
  if (curve[i].basis === curve[i - 1].basis &&
      curve[i].measured < curve[i - 1].measured) inversions++;
  worst = Math.max(worst, Math.abs(curve[i].measured - curve[i].target));
}

/* And verify every part is reachable, which is the whole point of the drop
   table and the one thing a silent bug here would hide. */
const reachable = new Set(STARTER);
for (const r of ladder) {
  for (const d of (r.drops || [])) reachable.add(d.id);
  for (const id of (r.relics || [])) reachable.add(id);
}
const every = [].concat(SIM.CORES, SIM.BLADES, SIM.ASSISTS, SIM.RATCHETS, SIM.BITS);
const missing = every.filter(p => !reachable.has(p.id)).map(p => p.id);

if (process.argv.includes('--json')) {
  fs.writeFileSync(LADDER_JSON, JSON.stringify(ladder, null, 1));
  console.log('wrote ladder.json');
}

console.log('rung  name            role      target  measured  build                                 drops');
for (const r of ladder) {
  const b = r.build;
  const parts = [b.core, b.blade, b.assist, b.ratchet, b.bit].join('/');
  console.log(
    String(r.rung).padStart(4) + '  ' + (r.boss ? '* ' : '  ') + r.name.padEnd(14) + r.role.padEnd(9) +
    (r.target * 100).toFixed(0).padStart(5) + '%' +
    (r.measured * 100).toFixed(0).padStart(9) + '%  ' +
    parts.padEnd(36) + ' ' +
    (r.boss ? r.relics.length + ' ' + r.relicSlot + ' relics'
            : (r.drops || []).map(d => d.id).join(' '))
  );
}
console.log('\ncurve: ' + inversions + ' inversions across ' + (curve.length - 1) +
            ' ordinary steps, worst miss ' + (worst * 100).toFixed(1) + ' pts');
console.log('parts: ' + reachable.size + ' of ' + every.length + ' reachable' +
            (missing.length ? ', MISSING ' + missing.join(' ') : ''));
const ok = inversions <= 2 && worst < 0.09 && missing.length === 0;
console.log(ok
  ? 'LADDER OK — difficulty rises, every rung is in tolerance and every part can be won'
  : 'LADDER NEEDS ANOTHER PASS');
process.exit(ok ? 0 : 1);
