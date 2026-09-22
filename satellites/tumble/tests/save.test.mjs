// DESIGN 15.8: round-trip export/import; migration from version n-1.
import { suite } from './lib.mjs';
import { freshSave, migrate, exportJSON, importJSON, Store, memoryAdapter, SAVE_VERSION, validate } from '../src/save.js';

const { ok, done } = suite('save');
const s = freshSave(1000);
s.economy.lint = 345; s.economy.quarters = 7; s.economy.reunions = 3;
s.drawer.push({ sockSeed: 'a'.repeat(64), foundAt: 5, count: 2, odd: false });
s.oddBin.push({ sockSeed: 'b'.repeat(64), waitingSince: 6, loadsWaited: 4 });
s.clothesline.push('warm-hands');
s.unlocks.push('basket-plastic');
s.lore.push(1, 2);
s.stats.loads = 12; s.stats.tierByMode.rush = 3;
s.daily = { date: '2026-09-17', rushScore: 4200, played: true, laundryPlays: 2 };
const text = exportJSON(s);
const back = importJSON(text);
ok(JSON.stringify(back) === JSON.stringify(validate(s)), 'export then import gives back the same save');
ok(back.version === SAVE_VERSION, `the imported save is version ${SAVE_VERSION}`);

// v1 = DESIGN 13.6 exactly
const v1 = {
  profile: { version: 1, createdAt: 42, settings: { cvd: 'deutan' } },
  economy: { lint: 99, quarters: 2, reunions: 1 },
  drawer: [{ sockSeed: 'c'.repeat(64), foundAt: 1, count: 1 }, { heroId: 'hero_gas_001', foundAt: 2, count: 3 }],
  oddBin: [{ sockSeed: 'd'.repeat(64), waitingSince: 3, loadsWaited: 2 }],
  clothesline: ['warm-hands'],
  unlocks: ['basket-wire'],
  stats: { loads: 7, pairs: 80, shotsMade: 60, shotsMissed: 12, cleanLoads: 2, bestStreak: 9, tierByMode: { laundry: 2 } },
  lore: [1],
  daily: { date: '2026-09-16', rushScore: 1000, played: true },
};
const m = migrate(JSON.parse(JSON.stringify(v1)));
ok(m.version === 3, 'a version 1 save migrates all the way to version 3');
ok(m.economy.lint === 99 && m.economy.quarters === 2 && m.economy.reunions === 1, 'currencies survive the migration');
ok(m.drawer.length === 2 && m.drawer.every((d) => d.odd === false) && m.drawer[1].heroId === 'hero_gas_001', 'drawer survives, with the new odd flag');
ok(m.oddBin[0].loadsWaited === 2 && m.clothesline[0] === 'warm-hands' && m.lore[0] === 1, 'Odd Bin, Clothesline and lore survive');
ok(m.stats.loads === 7 && m.stats.tierByMode.laundry === 2 && m.stats.tierByMode.rush === 0 && m.stats.flips === 0, 'stats survive and new counters start at zero');
ok(m.profile.settings.cvd === 'deutan' && m.profile.createdAt === 42, 'settings and creation time survive');
ok(m.equipped && m.equipped.basket === 'basket-wicker', 'new equipment defaults are filled in');
ok(importJSON(JSON.stringify(v1)).version === 3, 'importing a raw v1 file migrates it too');
{
  const { tierFor } = await import('../src/loadgen.js');
  const { TIER_LOADS } = await import('../src/save.js');
  const v1b = JSON.parse(JSON.stringify(v1));
  v1b.stats.loads = 30; v1b.stats.tierByMode = { laundry: 6, rush: 3 };
  const mb = migrate(v1b);
  ok(tierFor(mb.stats.loadsByMode.laundry, 6) === 6 && tierFor(mb.stats.loadsByMode.rush, 6) === 3, `a v1 tier survives migration (laundry ${mb.stats.loadsByMode.laundry} Loads, rush ${mb.stats.loadsByMode.rush})`);
  ok(TIER_LOADS.every((n, t) => tierFor(n, 9) === t), 'the save module and the Load generator agree on the tier ladder');
}

// ---------- v2 to v3: pocket change (DESIGN-T2 phase 1.4) ----------
// ONE migration for the whole of Build 2. Every Quarter she had is hers; the jar starts empty.
{
  const v2 = migrate(JSON.parse(JSON.stringify(v1)));
  delete v2.version; v2.profile.version = 2;
  delete v2.economy.cents; delete v2.stats.coins; delete v2.finds; delete v2.sets; delete v2.findSeen; delete v2.genVersion;
  v2.economy.quarters = 14;
  v2.equipped.basket = 'basket-wire';
  const m3 = migrate(v2);
  ok(m3.version === 3 && m3.profile.version === 3, 'a version 2 save migrates to version 3');
  ok(m3.economy.quarters === 14 && m3.economy.cents === 0, 'she keeps every Quarter she had and the jar starts empty');
  ok(m3.economy.lint === 99 && m3.economy.reunions === 1, 'Lint and Reunions are untouched by the coin jar');
  ok(JSON.stringify(m3.stats.coins) === '{"penny":0,"nickel":0,"dime":0,"quarter":0}', 'the coins she has found start at none of each');
  ok(Array.isArray(m3.finds) && m3.finds.length === 0 && Array.isArray(m3.sets) && m3.sets.length === 0, 'finds and sets start empty (phase 2 fills them)');
  ok(m3.findSeen && typeof m3.findSeen === 'object' && !Array.isArray(m3.findSeen), 'findSeen is an object');
  ok(m3.genVersion === 2, 'her new seeds will carry generator version 2');
  ok(m3.equipped.wallpaper === null && m3.equipped.floor === null && m3.equipped.curtains === null && m3.equipped.tabletop === null, 'the four new room slots are empty');
  ok(m3.equipped.basket === 'basket-wire' && m3.drawer.length === 2 && m3.clothesline[0] === 'warm-hands', 'her basket, Drawer and Clothesline come through');
  ok(migrate(JSON.parse(JSON.stringify(v2))).version === 3, 'migrating twice from the same v2 file gives the same v3');
}
// the jar can only ever hold 0 to 24 cents, whatever a file claims
{
  const s3 = freshSave();
  const over = validate({ ...s3, economy: { lint: 0, reunions: 0, quarters: 3, cents: 87 } });
  ok(over.economy.cents === 12 && over.economy.quarters === 6, '87 cents in the jar rolls into 3 Quarters and keeps 12 (never thrown away)');
  const junk = validate({ ...s3, economy: { lint: 0, reunions: 0, quarters: -2, cents: 'lots' } });
  ok(junk.economy.cents === 0 && junk.economy.quarters === 0, 'a junk jar reads as empty');
  const dirty = validate({ ...s3, finds: ['coat-button', { x: 1 }, 'bad id!', 'tape-measure'], sets: ['tall-man', 7], findSeen: { 'coat-button': true, 'no!': true, other: false } });
  ok(dirty.finds.join(',') === 'coat-button,tape-measure' && dirty.sets.join(',') === 'tall-man', 'an imported save keeps only well formed find and set ids');
  ok(JSON.stringify(dirty.findSeen) === '{"coat-button":true}', 'findSeen keeps only ids she really looked at');
}

let threw = 0;
for (const bad of ['not json', '{"hello":1}', '[]', JSON.stringify({ version: 99, economy: {}, stats: {} })]) { try { importJSON(bad); } catch (e) { threw++; } }
ok(threw === 4, 'garbage and saves from the future are refused with a message');
const neg = validate({ ...freshSave(), economy: { lint: -5, quarters: 'x', reunions: 2.7 } });
ok(neg.economy.lint === 0 && neg.economy.quarters === 0 && neg.economy.reunions === 2, 'currencies are clamped to whole non negative numbers');

// the store round trip through an adapter (IndexedDB is the same code path in the browser)
const mem = memoryAdapter();
const st = new Store(mem);
await st.load();
st.data.economy.lint = 777;
await st.save();
const st2 = new Store(mem);
await st2.load();
ok(st2.data.economy.lint === 777, 'a saved store loads back');
await st2.replace(m);
const st3 = new Store(mem);
await st3.load();
ok(st3.data.economy.lint === 99, 'replace (import) persists');
done();
