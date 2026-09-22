// POCKET FINDS (DESIGN-T2 phase 2): the catalogue, the painter, the roll, the sets and the comforts.
//
// A find is a recipe, not a model (2.1): the hero emblem vocabulary painted on a plain round tile.
// Named finds are UNIQUE and never duplicate (2.2). Every comfort obeys THE LAW OF A COMFORT: it may reduce
// motor or visibility friction and may never point at the twin, touch a clock or a payout, or work in Rush
// or the Daily.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { paintFind, findFleck } from '../engine/sockgen.js';

const { ok, done } = suite('finds');
const F = JSON.parse(readFileSync(new URL('../data/finds.json', import.meta.url), 'utf8'));
const items = F.items, sets = F.sets;

// ---------- the catalogue ----------
ok(items.length === 30, `thirty finds (${items.length})`);
ok(sets.length === 5, `five sets (${sets.length})`);
{
  const ids = new Set(items.map((f) => f.id));
  ok(ids.size === items.length, `every find id is unique (${ids.size})`);
  const names = new Set(items.map((f) => f.name));
  ok(names.size === items.length, `every find name is unique (${names.size})`);
  const bad = items.filter((f) => !/^find-[a-z0-9-]+$/.test(f.id));
  ok(!bad.length, `every id is a plain find id${bad.length ? ': ' + bad.map((f) => f.id).join(', ') : ''}`);
}
{
  const setIds = new Set(sets.map((s) => s.id));
  const orphan = items.filter((f) => !setIds.has(f.set));
  ok(!orphan.length, `every find belongs to a named set${orphan.length ? ': ' + orphan.map((f) => f.id) : ''}`);
  const counts = sets.map((s) => items.filter((f) => f.set === s.id).length);
  ok(counts.every((n) => n === 6), `six finds in each set (${counts.join(', ')})`);
  const unlabelled = sets.filter((s) => !s.name || !s.label);
  ok(!unlabelled.length, 'every set has a name and the hand written label its shadow box gets');
}
{
  const RAR = ['common', 'uncommon', 'rare', 'once'];
  const bad = items.filter((f) => !RAR.includes(f.rarity));
  ok(!bad.length, `every rarity is one of ${RAR.join(', ')}`);
  const by = {};
  for (const f of items) by[f.rarity] = (by[f.rarity] || 0) + 1;
  ok(by.once === 2, `two finds arrive on their own Load and are never rolled (${by.once})`);
  ok(by.common >= by.uncommon && by.uncommon >= by.rare, `the ladder runs down: ${RAR.map((r) => r + ' ' + (by[r] || 0)).join(', ')}`);
}
{
  const MOMENTS = ['door', 'flip', 'trap', 'allFlipped', 'clean', 'spotless', 'big', 'reunion', 'pull'];
  const bad = items.filter((f) => !MOMENTS.includes(f.comesOut));
  ok(!bad.length, `every find comes out at a coin moment or a pull${bad.length ? ': ' + bad.map((f) => f.id + '=' + f.comesOut) : ''}`);
  const early = items.filter((f) => !Number.isInteger(f.fromLoad) || f.fromLoad < 1);
  ok(!early.length, 'every find names the Load it can first appear at');
  ok(items.filter((f) => f.fromLoad === 1).length >= 4, `something can turn up on the very first Load (${items.filter((f) => f.fromLoad === 1).length} of them)`);
}

// ---------- the copy laws (studio law 11) ----------
{
  const strings = items.flatMap((f) => [f.name, f.flavor]).concat(sets.flatMap((s) => [s.name, s.label]))
    .concat(F.comforts.flatMap((c) => [c.name, c.effect]));
  ok(strings.length > 70, `${strings.length} player facing strings in the finds catalogue`);
  const dashed = strings.filter((s) => /[–—-]/.test(s));
  ok(!dashed.length, `no dashes of any kind${dashed.length ? ': ' + dashed.slice(0, 3).join(' | ') : ''}`);
  const shouty = strings.filter((s) => s.includes('!'));
  ok(!shouty.length, `no exclamation points${shouty.length ? ': ' + shouty.slice(0, 3).join(' | ') : ''}`);
  const long = items.filter((f) => f.flavor.split(/\s+/).length > 9);
  ok(!long.length, `every flavor line is nine words or fewer${long.length ? ': ' + long.map((f) => f.name) : ''}`);
  const nameless = items.filter((f) => !f.flavor || !f.flavor.trim());
  ok(!nameless.length, 'every find has a flavor line');
}
// law 4: no brand, team, band, character or near miss. The list below is the one the last build caught things
// with, plus the brands the outside answers walked into (a lip balm was proposed by its trademark).
{
  const BRANDS = /chapstick|band\s?aid|kleenex|velcro|sharpie|lego|barbie|nike|adidas|levis|hershey|tic\s?tac|altoid|post\s?it|q\s?tip|crayola|hot\s?wheels|matchbox|ziploc|tupperware|scotch\s?tape|bic|disney|pokemon|marvel|coke|pepsi/i;
  const hits = items.filter((f) => BRANDS.test(f.name) || BRANDS.test(f.flavor));
  ok(!hits.length, `no brand or near miss in any name or line${hits.length ? ': ' + hits.map((f) => f.name) : ''}`);
}

// ---------- THE LAW OF A COMFORT ----------
{
  const comforts = F.comforts;
  ok(comforts.length === 5, `five comforts ship and nothing else helps (${comforts.length})`);
  const helped = items.filter((f) => f.help);
  ok(helped.length === 5, `exactly five finds carry a comfort (${helped.length})`);
  const ids = new Set(comforts.map((c) => c.id));
  const dangling = helped.filter((f) => !ids.has(f.help));
  ok(!dangling.length, `every help points at a comfort that exists${dangling.length ? ': ' + dangling.map((f) => f.help) : ''}`);
  const unclaimed = comforts.filter((c) => !items.some((f) => f.help === c.id));
  ok(!unclaimed.length, `every comfort is carried by a find${unclaimed.length ? ': ' + unclaimed.map((c) => c.id) : ''}`);
  const twice = comforts.filter((c) => items.filter((f) => f.help === c.id).length > 1);
  ok(!twice.length, 'no comfort is carried by two finds');
  // the law, read off the words: nothing may point at a twin, touch a clock or a payout, or reach Rush
  const FORBIDDEN = /\btwin\b|\bmate\b|\bmatch(es|ing)?\b|\bglow|\bhighlight|\bclock\b|\btimer\b|\bseconds?\b|\bquarter|\bcents?\b|\blint\b|\bscore\b|\breward|\bRush\b|\bDaily\b|\bstreak\b/i;
  const crossed = comforts.filter((c) => FORBIDDEN.test(c.effect) && !/never marks the twin/i.test(c.effect));
  ok(!crossed.length, `no comfort points at a twin, touches a clock or a payout, or reaches Rush${crossed.length ? ': ' + crossed.map((c) => c.id) : ''}`);
  // GPT's own five "would not ship" objects still SHIP, as keepsakes: the thing is kept, the power is not
  const kept = ['find-pocket-screw', 'find-googly-eye', 'find-safety-pin', 'find-plastic-cap', 'find-brass-key'];
  const wrong = kept.filter((id) => { const f = items.find((x) => x.id === id); return !f || f.help; });
  ok(!wrong.length, `the five objects whose proposed powers crossed the line ship with no power at all${wrong.length ? ': ' + wrong : ''}`);
}

// ---------- the painter: a recipe on a plain round tile ----------
{
  const bad = items.filter((f) => !f.recipe || !f.recipe.colors || !f.recipe.colors.tile || !(f.recipe.layers || []).length);
  ok(!bad.length, `every find is a recipe with a tile colour and at least one layer${bad.length ? ': ' + bad.map((f) => f.id) : ''}`);
  const shapeless = items.filter((f) => !f.recipe.layers.every((l) => (l.shapes || []).length));
  ok(!shapeless.length, 'every layer carries shapes');
  const SDF = new Set(['circle', 'ellipse', 'box', 'seg', 'poly', 'ring', 'text', 'motif']);
  const alien = [];
  for (const f of items) for (const l of f.recipe.layers) for (const sh of l.shapes) if (!SDF.has(sh.sdf || 'motif')) alien.push(f.id + ':' + sh.sdf);
  ok(!alien.length, `every shape is one the hero painter already knows${alien.length ? ': ' + alien : ''}`);
}
{
  const a = paintFind(items[0].recipe, { size: 96 });
  const b = paintFind(items[0].recipe, { size: 96 });
  ok(a.length === 96 * 96 * 4 && a.every((v, i) => v === b[i]), 'the same recipe paints the same bytes twice');
  const corner = a[0 * 4 + 3];
  ok(corner === 0, `the tile is a disc: its corner is transparent (alpha ${corner})`);
  const mid = a[(48 * 96 + 48) * 4 + 3];
  ok(mid === 255, `and opaque in the middle (alpha ${mid})`);
}
// An emblem that paints nothing is a blank token. The measure runs only over the INNER disc, away from the
// tile's own rim: counting the whole disc let a find with one 0.02 dot on it pass at 30 percent ink, because
// the rim is not the tile colour either. A check that cannot fail is not a check (law 3).
const inkFraction = (recipe, size, mode) => {
  const t = paintFind(recipe, { size, mode });
  const tint = recipe.colors.tile.replace('#', '');
  const [tr, tg, tb] = [0, 2, 4].map((i) => parseInt(tint.slice(i, i + 2), 16));
  const R = size / 2, inner = R * 0.82;
  let ink = 0, seen = 0;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (Math.hypot(x + 0.5 - R, y + 0.5 - R) > inner) continue;
    const i = (y * size + x) * 4;
    if (!t[i + 3]) continue;
    seen++;
    if (Math.abs(t[i] - tr) + Math.abs(t[i + 1] - tg) + Math.abs(t[i + 2] - tb) > 60) ink++;
  }
  return ink / Math.max(1, seen);
};
{
  const flat = [];
  for (const f of items) {
    const frac = inkFraction(f.recipe, 64, 'normal');
    if (frac < 0.14) flat.push(`${f.name} ${(frac * 100).toFixed(0)}%`);
  }
  ok(!flat.length, `every find paints a readable emblem, neither blank nor solid${flat.length ? ': ' + flat.join(', ') : ''}`);
}
{
  const flecks = items.map((f) => findFleck(f.recipe));
  const bad = flecks.filter((c) => !/^#[0-9a-f]{6}$/.test(c));
  ok(!bad.length, `every find gives the room a colour fleck for its container${bad.length ? ': ' + bad : ''}`);
  ok(new Set(flecks).size >= 20, `the flecks are not all one colour (${new Set(flecks).size} of ${flecks.length})`);
}
// the four colour vision modes must not turn a find into its own tile
{
  const lost = [];
  for (const mode of ['deutan', 'protan', 'tritan']) for (const f of items) {
    if (inkFraction(f.recipe, 48, mode) < 0.14) lost.push(mode + ':' + f.id);
  }
  ok(!lost.length, `no find vanishes into its tile in any colour vision mode${lost.length ? ': ' + lost.slice(0, 3) : ''}`);
}

// ============ 2.2 FINDING: one a Load at most, at its own moment, and never twice ============
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';
import { freshSave } from '../src/save.js';
import { applyResults } from '../src/economy.js';
import { findForLoad, eligible, onceDue, chanceFor, completedSets, comfortsFrom, containerOf } from '../src/finds.js';

const CTX = { now: 1, hour: 12, clothesline: { pegs: [] }, lore: { pages: [] }, heroes: [], unlocks: { items: [] }, finds: F };

// Play a whole Load the way the table does, with the find the rules chose for it.
function playLoad(seed, { size = 'regular', mode = 'laundry', have = [], loads = 0, stats = null, pull = true, flip = true, miss = 0, tier = 4 } = {}) {
  const L = generateLoad({ seed, tier, size, mode });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, s));
  S.startClock();
  S.setFind(findForLoad(F, { loadSeed: L.seed, size, have, loads, stats }));
  S.fireMoment('door', { at: { x: 0, y: 0.5, z: -0.7 } });   // the game opens the door before the spill
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (pull) S.pull(s.id, { x: 0, y: 0.1, z: 0 });
    if (flip && s.insideOut) S.flip(s.id);
    if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  let n = 0;
  for (const [a, b] of byKey.values()) {
    if (!S.match(a, b).ok) continue;
    const ball = [...S.balls.values()].pop();
    S.shoot(ball.id, { distance: 0.6 });
    S.shotResult(ball.id, n >= miss);
    n++;
  }
  S.startSweep();
  for (const b of S.strays()) S.sweep(b.id);
  S.finish();
  return S;
}

// ---------- the rate the design asks for ----------
{
  const rates = {};
  for (const size of ['small', 'regular', 'heavy', 'mountain']) {
    let hit = 0;
    const N = 4000;
    // a player who has nothing yet and has played enough that everything is in reach
    for (let i = 0; i < N; i++) if (findForLoad(F, { loadSeed: `rate|${size}|${i}`, size, have: [], loads: 200, stats: { cleanLoads: 9 } })) hit++;
    rates[size] = hit / N;
  }
  // the `once` finds are due for this player at loads 200, so they take the slot until they are hers: measure
  // the ROLL on a player who already has them
  const have = items.filter((f) => f.rarity === 'once').map((f) => f.id);
  const roll = {};
  for (const size of ['small', 'regular', 'heavy', 'mountain']) {
    let hit = 0; const N = 6000;
    for (let i = 0; i < N; i++) if (findForLoad(F, { loadSeed: `roll|${size}|${i}`, size, have, loads: 200, stats: { cleanLoads: 9 } })) hit++;
    roll[size] = hit / N;
  }
  const near = (a, b) => Math.abs(a - b) < 0.02;
  ok(near(roll.small, 0.12) && near(roll.regular, 0.22) && near(roll.heavy, 0.32) && near(roll.mountain, 0.45),
    `the roll is the rate the design asks for: small ${(roll.small * 100).toFixed(1)}, regular ${(roll.regular * 100).toFixed(1)}, heavy ${(roll.heavy * 100).toFixed(1)}, mountain ${(roll.mountain * 100).toFixed(1)}`);
  ok(rates.regular >= roll.regular, `a once find due takes the Load's one slot, so the rate never drops below the roll (${(rates.regular * 100).toFixed(1)} against ${(roll.regular * 100).toFixed(1)})`);
  const every = 1 / roll.regular;
  ok(every > 4 && every < 5, `unattended, a find about every ${every.toFixed(1)} Regular Loads (the design says four or five)`);
}

// ---------- pure: the same Load always turns up the same thing ----------
{
  const seeds = Array.from({ length: 300 }, (_, i) => 'pure|' + i);
  const first = seeds.map((sd) => findForLoad(F, { loadSeed: sd, size: 'regular', have: [], loads: 50 }));
  const again = seeds.map((sd) => findForLoad(F, { loadSeed: sd, size: 'regular', have: [], loads: 50 }));
  const same = first.every((f, i) => (f ? f.id : null) === (again[i] ? again[i].id : null));
  const hits = first.filter(Boolean);
  ok(same && hits.length > 20, `${seeds.length} Loads replayed turn up exactly the same ${hits.length} finds`);
  const picked = new Set(hits.map((f) => f.id));
  ok(picked.size > 5, `and they are not all the same thing (${picked.size} different finds)`);
  const heavier = findForLoad(F, { loadSeed: 'pure|0', size: 'mountain', have: [], loads: 50 });
  const lighter = findForLoad(F, { loadSeed: 'pure|0', size: 'small', have: [], loads: 50 });
  ok(!(lighter && !heavier), 'a Load that turns something up on Small turns it up on Mountain too: the size moves the odds, not the pick');
}

// ---------- unique, ever: the pool only shrinks ----------
{
  const have = [];
  let rolls = 0, dupes = 0;
  for (let i = 0; i < 4000 && have.length < 28; i++) {
    const f = findForLoad(F, { loadSeed: 'unique|' + i, size: 'mountain', have, loads: 200, stats: { cleanLoads: 9 } });
    if (!f) continue;
    rolls++;
    if (have.includes(f.id)) dupes++;
    have.push(f.id);
  }
  ok(dupes === 0, `no find ever turns up twice (${rolls} finds, ${dupes} duplicates)`);
  ok(have.length >= 28, `a determined player collects them (${have.length} of ${items.length} inside 4000 Loads)`);
  const dry = findForLoad(F, { loadSeed: 'dry', size: 'mountain', have: items.map((f) => f.id), loads: 999, stats: { cleanLoads: 9 } });
  ok(dry === null, 'with every find hers, a Load turns up nothing rather than repeating one');
}

// ---------- fromLoad, and the two that are never rolled ----------
{
  const early = eligible(F, { have: [], loads: 1 });
  ok(early.length > 0 && early.every((f) => f.fromLoad <= 1), `at Load 1 only the ${early.length} finds that say Load 1 are in reach`);
  ok(!early.some((f) => f.rarity === 'once'), 'a once find is never in the roll pool');
  const late = eligible(F, { have: [], loads: 999 });
  ok(late.length === items.length - 2, `by Load 999 every rolled find is in reach (${late.length})`);
  const photo = items.find((f) => f.id === 'find-photo-strip');
  ok(!onceDue(F, { have: [], loads: 99 }) || onceDue(F, { have: [], loads: 99 }).id !== photo.id, 'the Photo Booth Strip is not due at Load 99');
  ok(onceDue(F, { have: [], loads: 100 }), 'it is due at Load 100');
  const key = items.find((f) => f.id === 'find-brass-key');
  ok(key.needs && key.needs.stat === 'cleanLoads', 'the Brass Key asks for Clean Loads as well as its Load');
  ok(!onceDue(F, { have: [], loads: 80, stats: { cleanLoads: 2 } }) || onceDue(F, { have: [], loads: 80, stats: { cleanLoads: 2 } }).id !== key.id, 'and stays away until she has them');
  const due = onceDue(F, { have: [], loads: 80, stats: { cleanLoads: 3 } });
  ok(due && due.id === key.id, 'with three Clean Loads behind her, it is due');
}

// ---------- it ARRIVES, in a real Load, at its own moment ----------
{
  let played = 0, arrived = 0, fell = 0;
  const byMoment = {};
  for (let i = 0; i < 160; i++) {
    const S = playLoad('arrive|' + i, { size: 'mountain', have: items.filter((f) => f.rarity === 'once').map((f) => f.id), loads: 200, stats: { cleanLoads: 9 } });
    if (!S.find) continue;
    played++;
    if (S.found) { arrived++; byMoment[S.found.moment] = (byMoment[S.found.moment] || 0) + 1; if (S.found.moment !== S.find.comesOut) fell++; }
  }
  ok(played > 40, `${played} of 160 Loads were holding something`);
  ok(arrived === played, `every find a Load was holding actually turned up (${arrived} of ${played})`);
  ok(Object.keys(byMoment).length >= 4, `they come out at ${Object.keys(byMoment).length} different moments: ${Object.entries(byMoment).map(([k, v]) => k + ' ' + v).join(', ')}`);
  ok(fell / played < 0.25, `the lint trap catches only the few whose moment never came round (${fell} of ${played})`);
  // and the same 160 Loads played BADLY: never a flip, every shot missed, so no Clean and no Spotless Load
  let messy = 0, messyFell = 0;
  for (let i = 0; i < 160; i++) {
    const S = playLoad('arrive|' + i, { size: 'mountain', have: items.filter((f) => f.rarity === 'once').map((f) => f.id), loads: 200, stats: { cleanLoads: 9 }, flip: false, miss: 999 });
    if (!S.find) continue;
    messy++;
    if (S.found && S.found.moment !== S.find.comesOut) messyFell++;
  }
  ok(messy === played, `a player who never flips and misses every shot is holding the same ${messy} finds`);
  ok(messyFell > 0 && messyFell / messy < 0.35, `and still gets every one of them, ${messyFell} out of the lint trap (${(messyFell / messy * 100).toFixed(0)} percent)`);
}
// a Load with nothing inside out still turns out a find that comes from a cuff
{
  const flipFind = items.find((f) => f.comesOut === 'flip' && f.rarity !== 'once');
  const L = generateLoad({ seed: 'noflip', tier: 0, size: 'small' });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, { ...s, insideOut: false }));
  S.setFind(flipFind);
  for (const s of S.socks.values()) if (s.odd === null || s.odd === undefined) { const m = S.mateOf(s.id); if (m !== null) S.match(s.id, m); }
  S.startSweep(); S.finish();
  ok(S.found && S.found.id === flipFind.id, `a find from a cuff still turns up in a Load with no inside out socks (${S.found && S.found.moment})`);
}
// the lint trap fallback: a find that comes out of a Clean Load, in a Load that was not clean. Without this
// the rate the design asks for would quietly be lower than the rate she gets, for four of the thirty.
{
  const cleanFind = items.find((f) => f.comesOut === 'clean');
  const L = generateLoad({ seed: 'messy', tier: 4, size: 'regular' });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, s));
  S.setFind(cleanFind);
  const byKey = new Map();
  for (const s of S.socks.values()) {
    if (s.odd !== null && s.odd !== undefined) { S.bin(s.id); continue; }
    byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
  }
  for (const [a, b] of byKey.values()) {
    if (!S.match(a, b).ok) continue;
    const ball = [...S.balls.values()].pop();
    S.shoot(ball.id, { distance: 0.6 });
    S.shotResult(ball.id, false);      // every shot misses, so the Load is not Clean and not Spotless
  }
  S.startSweep();
  ok(!S.stats.cleanLoad && !S.found, 'the Load was not Clean, so the moment the find hangs on never came round');
  for (const b of S.strays()) S.sweep(b.id);
  S.finish();
  ok(S.found && S.found.id === cleanFind.id && S.found.moment === 'trap',
    `and the lint trap had it all along (${S.found && S.found.moment})`);
}

// a Load she walked away from gives nothing
{
  const L = generateLoad({ seed: 'walked', tier: 2, size: 'small' });
  const S = new Session(L);
  let id = 1;
  L.socks.forEach((s) => S.addSock(id++, s));
  S.setFind(items[0]);
  S.startSweep(); S.finish();
  ok(!S.found || S.found.moment !== 'trap', 'a Load with no pair matched does not hand her a find out of the lint trap');
}

// ---------- the results write it down, once ----------
{
  const s = freshSave(1);
  const S = playLoad('write', { size: 'mountain', have: [], loads: 200, stats: { cleanLoads: 9 } });
  ok(!!S.found, 'the Load turned something up');
  const lintBefore = s.economy.lint, qBefore = s.economy.quarters;
  const out = applyResults(s, S, CTX);
  ok(s.finds.length === 1 && s.finds[0] === S.found.id, `it is written into the save (${s.finds[0]})`);
  ok(out.find && out.find.id === S.found.id, 'and handed to the results screen');
  ok(s.economy.lint > lintBefore || lintBefore === 0, 'Lint is untouched by it');
  const s2 = freshSave(1);
  s2.finds = [S.found.id];
  const out2 = applyResults(s2, S, CTX);
  ok(s2.finds.length === 1 && !out2.find, 'a find she already has is never written twice');
}

// ---------- sets ----------
{
  const set = sets[0];
  const need = items.filter((f) => f.set === set.id).map((f) => f.id);
  ok(completedSets(F, need.slice(0, need.length - 1)).length === 0, 'a set five of six through is not complete');
  ok(completedSets(F, need).includes(set.id), `the sixth completes ${set.name}`);
  ok(completedSets(F, []).length === 0, 'an empty collection completes nothing');
  const containers = new Set(items.map((f) => containerOf(F, f.id)));
  ok(containers.size >= 4, `the finds are spread across ${containers.size} containers on the ledge`);
}

// ---------- comforts come from the finds she has, and a toggle turns one off ----------
{
  const lace = items.find((f) => f.id === 'find-spare-shoelace');
  ok(comfortsFrom(F, []).size === 0, 'a player with no finds has no comforts');
  ok(comfortsFrom(F, [lace.id]).has('nearEdge'), 'the Spare Shoelace brings the table edge');
  ok(!comfortsFrom(F, [lace.id], ['nearEdge']).has('nearEdge'), 'and the toggle on the Clothesline page turns it off');
  const all = comfortsFrom(F, items.map((f) => f.id));
  ok(all.size === 5, `every find she could have brings exactly five comforts (${[...all].join(', ')})`);
}

done();
