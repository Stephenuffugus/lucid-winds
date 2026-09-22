// The tester switch (?unlockall=1): Stephen asked to see everything on his own device (Sep 21 2026).
// It must do nothing for a player, never grant without a backup, never clobber the backup, and come back exactly.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { freshSave, migrate, Store, memoryAdapter } from '../src/save.js';
import { owns, canBuy, sizesUnlocked, tierNow, grantEverything } from '../src/economy.js';
import { runUnlockAll, unlockNow, backupData, hasBackup, isTester, BACKUP_KEY } from '../src/unlockall.js';

const { ok, done } = suite('unlockall');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const heroFile = read('hero-socks.json');
const ctx = { unlocks: read('unlocks.json'), lore: read('lore.json'), clothesline: read('clothesline.json'), heroes: heroFile.heroes };

function storage(initial = {}, opts = {}) {
  const m = new Map(Object.entries(initial));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { if (opts.full) throw new Error('quota'); m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    map: m,
  };
}
// a save with some real history in it, so "unchanged" and "comes back exactly" mean something
function played() {
  const s = freshSave(1700000000000);
  s.economy = { lint: 321, quarters: 4, reunions: 2 };
  s.unlocks = ['basket-plastic'];
  s.clothesline = ['warm-hands'];
  s.lore = [1];
  s.drawer = [{ sockSeed: '1a2b3c', foundAt: 1700000001000, count: 2, odd: false }];
  s.stats.loadsByMode = { laundry: 5, rush: 1 };
  s.stats.loads = 6;
  return migrate(s);
}
const P = (q) => new URLSearchParams(q);
const strip = (s) => { const c = JSON.parse(JSON.stringify(s)); delete c.savedAt; return JSON.stringify(c); };

// 1. a player who types the parameter gets nothing
{
  const save = played(), before = JSON.stringify(save), st = storage();
  const r = runUnlockAll({ params: P('unlockall=1'), storage: st, save, ctx, now: 1 });
  ok(r.did === 'none' && JSON.stringify(save) === before, 'without the tester flag the save is untouched');
  ok(st.map.size === 0, 'without the tester flag nothing is written to storage');
}
// 2. a tester who does not ask gets nothing
{
  const save = played(), before = JSON.stringify(save), st = storage({ sws_dev_ok: '1' });
  const r = runUnlockAll({ params: P('debug=1'), storage: st, save, ctx, now: 1 });
  ok(r.did === 'none' && JSON.stringify(save) === before && !st.map.has(BACKUP_KEY), 'a tester without the parameter is untouched');
}
// 3. the grant
{
  const save = played(), before = JSON.stringify(save), st = storage({ sws_dev_ok: '1' });
  const r = runUnlockAll({ params: P('unlockall=1'), storage: st, save, ctx, now: 1700000002000 });
  ok(r.did === 'unlocked', 'a tester with the parameter is unlocked');
  ok(st.getItem(BACKUP_KEY) === before, 'the backup is the save exactly as it was before the grant');
  const items = ctx.unlocks.items;
  ok(items.length >= 100 && items.every((it) => owns(save, it)), `every one of the ${items.length} catalog items is owned`);
  ok(items.every((it) => canBuy(save, it).why === 'owned'), 'the shop reads every item as owned');
  ok(['impossible-1', 'impossible-2', 'impossible-3'].every((id) => save.unlocks.includes(id)), 'the three impossible socks are marked found');
  ok(ctx.lore.pages.length === 12 && ctx.lore.pages.every((p) => save.lore.includes(p.id)), 'all 12 Odd Bin pages are in');
  ok(ctx.clothesline.pegs.length === 20 && ctx.clothesline.pegs.every((p) => save.clothesline.includes(p.id)), 'all 20 pegs are on the line');
  ok(sizesUnlocked(save, ctx.clothesline).join() === 'small,regular,heavy,mountain', 'every Load size is open');
  const heroRows = save.drawer.filter((d) => d.heroId);
  ok(ctx.heroes.length === 53 && ctx.heroes.every((h) => heroRows.some((d) => d.heroId === h.id && d.count >= 1 && d.odd === false)), `all ${ctx.heroes.length} hero socks are in the Drawer, as found pairs`);
  ok(save.drawer.some((d) => d.sockSeed === '1a2b3c' && d.count === 2), 'his own Drawer finds are still there');
  ok(save.economy.lint >= 99999 && save.economy.quarters >= 999 && save.economy.reunions === 2, 'Lint and Quarters are topped up, Reunions are not faked');
  // law 13: when the save grows new fields, the tester switch grows with it
  ok(save.economy.cents === 24, `the jar is full at ${save.economy.cents} cents, one short of rolling, so the roll can be watched`);
  ok(Object.values(save.stats.coins).every((n) => n >= 1), `a coin of each kind is on the record (${JSON.stringify(save.stats.coins)})`);
  ok(Array.isArray(save.finds) && Array.isArray(save.sets), 'finds and sets are there to be filled (phase 2 puts a catalogue behind them)');
  {
    // with a finds catalogue in hand it grants every find, and the sets they complete
    const s2 = freshSave(1);
    const finds = { items: [{ id: 'coat-button', set: 'tall-man' }, { id: 'tape-measure', set: 'tall-man' }, { id: 'lone-die', set: 'child-here' }], sets: [{ id: 'tall-man' }, { id: 'child-here' }, { id: 'empty-set' }] };
    grantEverything(s2, { ...ctx, finds }, { now: 1 });
    ok(s2.finds.length === 3 && s2.finds.includes('tape-measure'), `every find in the catalogue is hers (${s2.finds.length})`);
    ok(s2.sets.length === 2 && s2.sets.includes('tall-man') && !s2.sets.includes('empty-set'), `and every set they finish (${s2.sets.join(', ')}), never one with nothing in it`);
    grantEverything(s2, { ...ctx, finds }, { now: 1 });
    ok(s2.finds.length === 3 && s2.sets.length === 2, 'a second run changes nothing');
  }
  {
    // and against the catalogue that actually ships (DESIGN-T2 2.1): the tester switch must never fall behind it
    const real = read('finds.json');
    const s3 = freshSave(1);
    grantEverything(s3, { ...ctx, finds: real }, { now: 1 });
    ok(s3.finds.length === real.items.length, `the shipped catalogue: all ${s3.finds.length} finds are his`);
    ok(s3.sets.length === real.sets.length, `and all ${s3.sets.length} sets are complete`);
  }
  ok(save.stats.loadsByMode.laundry === 5 && save.stats.loadsByMode.rush === 1, 'without &tier his own Load count (his difficulty) is untouched');
  const dup = (a) => new Set(a).size !== a.length;
  ok(!dup(save.unlocks) && !dup(save.lore) && !dup(save.clothesline), 'no id is listed twice');
  // the next boot validates the save: nothing granted may be filtered out
  const again = migrate(JSON.parse(JSON.stringify(save)));
  ok(strip(again) === strip(save), 'the granted save survives the load time validation unchanged');

  // 4. a second visit to the same URL
  const mid = JSON.stringify(save);
  const r2 = runUnlockAll({ params: P('unlockall=1'), storage: st, save, ctx, now: 1700000003000 });
  ok(r2.did === 'unlocked' && st.getItem(BACKUP_KEY) === before, 'a second run never overwrites the backup');
  ok(JSON.stringify(save) === mid, 'a second run changes nothing (idempotent)');

  // 6. and back again, through the real Store
  const r3 = runUnlockAll({ params: P('unlockall=restore'), storage: st, save, ctx, now: 1 });
  ok(r3.did === 'restored', 'restore finds the backup');
  const store = new Store(memoryAdapter());
  await store.load();
  const back = await store.replace(r3.data);
  ok(strip(back) === strip(JSON.parse(before)), 'restore brings his own save back exactly');
}
// 5. looking at a chosen difficulty
{
  // DESIGN 5: the tier is capped at Eyes pegs + 2 and six pegs are Eyes, so 8 is the ceiling any player can reach
  // (tier 9 waits for a post launch Eyes peg). The switch shows him the real game, so &tier=9 lands on 8.
  for (const [ask, get] of [[0, 0], [4, 4], [8, 8], [9, 8]]) {
    const save = played(), st = storage({ sws_dev_ok: '1' });
    runUnlockAll({ params: P('unlockall=1&tier=' + ask), storage: st, save, ctx, now: 1 });
    ok(tierNow(save, ctx.clothesline, 'laundry') === get && tierNow(save, ctx.clothesline, 'rush') === get && save.stats.tierByMode.laundry === get, `&tier=${ask} puts both modes on tier ${get}`);
  }
  const save = played(), st = storage({ sws_dev_ok: '1' });
  runUnlockAll({ params: P('unlockall=1&tier=banana'), storage: st, save, ctx, now: 1 });
  ok(save.stats.loadsByMode.laundry === 5, 'a nonsense &tier is ignored');
}
// 7. no backup, no grant
{
  const save = played(), before = JSON.stringify(save), st = storage({ sws_dev_ok: '1' }, { full: true });
  const r = runUnlockAll({ params: P('unlockall=1'), storage: st, save, ctx, now: 1 });
  ok(r.did === 'none' && JSON.stringify(save) === before, 'when the backup cannot be written, nothing is granted');
}
// 8. restore with nothing to restore
{
  const save = played(), before = JSON.stringify(save), st = storage({ sws_dev_ok: '1' });
  const r = runUnlockAll({ params: P('unlockall=restore'), storage: st, save, ctx, now: 1 });
  ok(r.did === 'none' && JSON.stringify(save) === before, 'restore without a backup does nothing');
}
// 9. the button in Settings runs the same code, with no link at all
{
  const save = played(), before = JSON.stringify(save);
  const player = storage();
  ok(!isTester(player) && !unlockNow({ storage: player, save, ctx, now: 1 }) && JSON.stringify(save) === before && !hasBackup(player), 'the button does nothing for a player (and Settings never shows it)');
  ok(backupData(player) === null, 'a player has no backup to put back, even if one were planted');
  const st = storage({ sws_dev_ok: '1' });
  ok(isTester(st) && !hasBackup(st), 'a tester with no backup yet sees only Open everything');
  ok(unlockNow({ storage: st, save, ctx, now: 1700000002000 }) === true && ctx.unlocks.items.every((it) => owns(save, it)), 'Open everything owns the whole catalog');
  ok(hasBackup(st) && st.getItem(BACKUP_KEY) === before, 'and the backup is his save as it was');
  const data = backupData(st);
  const store = new Store(memoryAdapter());
  await store.load();
  ok(strip(await store.replace(data)) === strip(JSON.parse(before)), 'Put my save back brings it back exactly');
}
done();
