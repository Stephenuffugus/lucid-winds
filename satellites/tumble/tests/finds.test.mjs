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

done();
