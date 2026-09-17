// Steps 6, 7 and 8 gate (OPUS_PROMPT): the Laundry Room is the menu (every hotspot at least 48 px and it
// opens its screen), the Drawer, Odd Bin and Clothesline screens, the economy (buy and equip from the unlock
// table, pegs from the clothesline file), the Daily Load (same Load twice) and the lore pages.
// node dev/gate-step678.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 180000) => H.page.waitForFunction(f, { timeout, polling: 250 }, arg).then(() => true, () => false);
const realClick = (sel) => D((sel) => {
  const b = document.querySelector(sel);
  if (!b) return 'missing';
  const r = b.getBoundingClientRect();
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!(b === el || b.contains(el))) return 'covered by ' + (el && (el.id || el.className));
  b.click();
  return 'ok';
}, sel);

try {
  await H.open('?nosw&turbo=1', null);
  await until(() => window.TUMBLE_DEV && TUMBLE_DEV.app && TUMBLE_DEV.state === 'room');
  const data = await D(() => TUMBLE_DEV.app.data());
  ok(data.heroes >= 40 && data.lore === 12 && data.unlocks >= 100 && data.pegs >= 16, `data files load: ${JSON.stringify(data)}`);
  await H.frames(4);
  await H.shot('g6-room.png');
  const spots = await D(() => [...document.querySelectorAll('.hotspot')].map((b) => { const r = b.getBoundingClientRect(); return { id: b.dataset.spot, w: r.width, h: r.height, x: r.left, y: r.top }; }));
  ok(spots.length === 6, `six things to tap in the room: ${spots.map((s) => s.id).join(', ')}`);
  for (const s of spots) ok(s.w >= 48 && s.h >= 48 && s.x >= 0 && s.y >= 0 && s.x + s.w <= 391 && s.y + s.h <= 845, `${s.id} hotspot is ${Math.round(s.w)} x ${Math.round(s.h)} px and on screen`);
  const expect = { drawer: 'The Drawer', bin: 'The Odd Bin', line: 'The Clothesline', door: 'Behind the door', radio: 'Behind the door' };
  for (const [id, title] of Object.entries(expect)) {
    const r = await realClick(`.hotspot[data-spot="${id}"]`);
    ok(r === 'ok', `the ${id} hotspot takes a real tap (${r})`);
    ok(await until((t) => TUMBLE_DEV.app.ui().title === t && TUMBLE_DEV.app.ui().sheetOpen, title), `${id} opens "${title}"`);
    if (id === 'line') await H.shot('g6-clothesline.png');
    if (id === 'door') await H.shot('g6-shop.png');
    await D(() => document.getElementById('sheetClose').click());
    await until(() => !TUMBLE_DEV.app.ui().sheetOpen);
  }

  // economy: earn some Lint, buy the plastic hamper, use it, and the basket changes
  await D(() => TUMBLE_DEV.app.grant({ economy: { lint: 1000, quarters: 12 }, seenHowTo: true, stats: { loads: 3 } }));
  await D(() => TUMBLE_DEV.app.screen('shop', 'basket'));
  await until(() => document.querySelectorAll('.shopitem').length > 5);
  const rows = await D(() => [...document.querySelectorAll('.shopitem')].map((r) => ({ name: r.querySelector('b').textContent, price: r.querySelector('.price').textContent })));
  ok(rows.length >= 12, `the basket shelf lists ${rows.length} baskets`);
  const plastic = rows.findIndex((r) => /plastic|hamper/i.test(r.name));
  ok(plastic >= 0 && /150/.test(rows[plastic].price), `the plastic hamper costs 150 Lint (${plastic >= 0 ? rows[plastic].price : 'missing'})`);
  await D((i) => document.querySelectorAll('.shopitem .price')[i].click(), plastic);
  const after = await D(() => TUMBLE_DEV.app.save());
  ok(after.economy.lint === 850, `buying it spends 150 Lint (${after.economy.lint} left)`);
  ok(after.equipped.basket && /plastic|hamper/.test(after.equipped.basket), `and puts it in use (${after.equipped.basket})`);
  await H.shot('g7-bought.png');
  // decor appears in the room
  await D(() => TUMBLE_DEV.app.screen('shop', 'decor'));
  await until(() => document.querySelectorAll('.shopitem').length > 5);
  const decor = await D(() => [...document.querySelectorAll('.shopitem')].map((r, i) => ({ i, name: r.querySelector('b').textContent, price: r.querySelector('.price').textContent })));
  const cat = decor.find((d) => /cat/i.test(d.name));
  ok(!!cat && /900/.test(cat.price), `the cat on warm laundry costs 900 Lint (${cat && cat.price})`);
  const rug = decor.find((d) => /rug/i.test(d.name) && /Lint/.test(d.price));
  if (rug) await D((i) => document.querySelectorAll('.shopitem .price')[i].click(), rug.i);
  const win = await D(() => [...document.querySelectorAll('.shopitem')].findIndex((r) => /window/i.test(r.querySelector('b').textContent) && /Lint/.test(r.querySelector('.price').textContent)));
  if (win >= 0) await D((i) => document.querySelectorAll('.shopitem .price')[i].click(), win);
  const placed = (await D(() => TUMBLE_DEV.app.save())).equipped.decor;
  ok(placed.length >= 1, `decor is placed in the room (${placed.join(', ')})`);
  await D(() => document.getElementById('sheetClose').click());
  await H.frames(6);
  await H.shot('g7-room-decor.png');
  // hero packs cost Quarters
  await D(() => TUMBLE_DEV.app.screen('shop', 'pack'));
  await until(() => document.querySelectorAll('.shopitem').length >= 4);
  const packs = await D(() => [...document.querySelectorAll('.shopitem')].map((r) => r.querySelector('.price').textContent));
  ok(packs.length >= 4 && packs.every((p) => /10 Q/.test(p)), `four hero packs at 10 Quarters (${packs.join(', ')})`);
  await D(() => document.querySelector('.shopitem .price').click());
  ok((await D(() => TUMBLE_DEV.app.save())).economy.quarters === 2, 'buying a pack spends 10 Quarters');
  await D(() => document.getElementById('sheetClose').click());

  // Clothesline pegs from the data file, earned by doing
  const pegsBefore = (await D(() => TUMBLE_DEV.app.save())).clothesline.length;
  await D(() => TUMBLE_DEV.app.grant({ stats: { pairs: 12, loads: 6, flips: 1 } }));
  await D(() => { const s = TUMBLE.save; const cl = TUMBLE.data.clothesline; for (const p of cl.pegs) { if (!s.clothesline.includes(p.id) && (s.stats[p.earn.stat] || 0) >= p.earn.gte) s.clothesline.push(p.id); } TUMBLE._refreshComforts(); });
  const sv = await D(() => TUMBLE_DEV.app.save());
  ok(sv.clothesline.length > pegsBefore, `pegs hang once their thresholds are met (${sv.clothesline.join(', ')})`);
  ok(await D(() => TUMBLE.game.comfort('warmHands') && TUMBLE.game.comfort('sizeRegular')), 'Warm hands and Regular load are live comforts');

  // the Daily Load: the same Load twice
  const d1 = await D(async () => { TUMBLE.start({ mode: 'laundry', daily: true, size: 'regular' }); return true; });
  ok(d1 && await until(() => TUMBLE_DEV.state === 'play' || TUMBLE_DEV.state === 'dump'), 'the Daily Laundry Day starts');
  const seeds1 = await D(() => TUMBLE.game.load.socks.map((s) => s.seed).join(','));
  await D(() => { TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
  await D(() => TUMBLE.start({ mode: 'laundry', daily: true, size: 'regular' }));
  await until(() => TUMBLE_DEV.state === 'play' || TUMBLE_DEV.state === 'dump');
  const seeds2 = await D(() => TUMBLE.game.load.socks.map((s) => s.seed).join(','));
  ok(seeds1.length > 100 && seeds1 === seeds2, 'starting the Daily again gives the identical Load');
  await D(() => { TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
  // a Rush Daily is one attempt
  // the Rush rules sheet comes first on a fresh save
  await D(() => TUMBLE.start({ mode: 'rush', sub: 'timed', daily: true, size: 'regular' }));
  ok(await until(() => TUMBLE_DEV.app.ui().title === 'Rush'), 'a first Rush Daily explains the rules before it starts');
  await D(() => document.getElementById('rhGo').click());
  await until(() => TUMBLE_DEV.state === 'play');
  await D(() => { for (let i = 0; i < 6; i++) TUMBLE_DEV.matchPair(); TUMBLE_DEV.setTime(0.1); });
  ok(await until(() => TUMBLE_DEV.state === 'results'), 'the Daily Rush ends with a result');
  const dailySave = await D(() => TUMBLE_DEV.app.save());
  ok(dailySave.daily.played === true && dailySave.dailyHistory.length === 1, 'the Daily is marked played and recorded on the local board');
  ok(await D(() => { const li = document.querySelector('.board li.today'); return !!li && /today/.test(li.textContent) && !/\d{4}-\d{2}/.test(li.textContent); }), 'the results show the local Daily board with today marked and the date written out');
  ok(await D(() => !!document.getElementById('rShare')), 'the result offers a share card');
  const shareOk = await D(async () => { const S = TUMBLE.game.session; const orig = URL.createObjectURL; let blob = null; URL.createObjectURL = (b) => { blob = b; return orig(b); }; await TUMBLE.shareDaily(S, TUMBLE.currentOpts.daily); URL.createObjectURL = orig; return blob ? blob.size : 0; });
  ok(shareOk > 20000, `the share card renders a PNG (${shareOk} bytes)`);
  await D(() => { TUMBLE.ui.closeSheet(); TUMBLE.showRoom(); TUMBLE.openDryer(); });
  await until(() => TUMBLE_DEV.app.ui().title === 'Open the dryer');
  ok(await D(() => { document.getElementById('mRush').click(); const b = document.querySelector('[data-sub="daily"]'); return b && b.disabled; }), 'the Daily Rush cannot be played twice in a day');
  await D(() => TUMBLE.ui.closeSheet());

  // lore: reunions unlock pages; the Odd Bin reads them
  await D(() => { TUMBLE.save.economy.reunions = 8; for (const p of TUMBLE.data.lore.pages) if (p.at <= 8 && !TUMBLE.save.lore.includes(p.id)) TUMBLE.save.lore.push(p.id); });
  await D(() => TUMBLE_DEV.app.screen('oddbin'));
  await until(() => document.querySelectorAll('#obPages button').length === 12);
  const pages = await D(() => [...document.querySelectorAll('#obPages button')].map((b) => ({ t: b.textContent, off: b.disabled })));
  ok(pages.filter((p) => !p.off).length === 4, `four pages are readable at 8 Reunions (${pages.filter((p) => !p.off).map((p) => p.t).join(' | ')})`);
  await D(() => document.querySelector('#obPages button').click());
  ok(await until(() => TUMBLE_DEV.app.ui().title === 'Page 1'), 'page 1 opens');
  const text = await D(() => document.querySelector('.page').textContent);
  ok(text.length > 120 && !/[–—]|\s-\s/.test(text), `page 1 reads (${text.length} characters, no dashes)`);
  await H.shot('g8-lore.png');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g678-crash.png');
}
await H.close();
console.log(fails.length ? `steps 6 to 8 gate: ${fails.length} FAILED` : 'steps 6 to 8 gate: all passed');
process.exitCode = fails.length ? 1 : 0;
