// HIS SECOND NOTES OF 24 SEP, LOOKED AT (HANDOFF §11 and §12): a FRESH save's first Load played to its end, with the
// first Load's song gift and its button to the radio on the result sheet, and the Sorter level line; the radio the
// button opens (his titles, the first song on); the dryer door with the locked size's count line; the room with the
// Shop button, the wagon on the table, the four mugs and the cat; the shop opened from the rug hotspot at the rugs.
// At a phone's width. OPEN THEM.
//   node dev/shots-sep24.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
const W = Number(process.argv[2] || 412), H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8799, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 150 }, arg).then(() => true, () => false);
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  // ---- a FRESH save (no tester grant): the radio is on the first song before she has done anything
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&seed=first', 'play', 240000);
  await D(() => { const app = window.TUMBLE; for (const k of Object.keys(app.save.seen || {})) app.save.seen[k] = true; app.ui.hideHint(); });
  const fresh = await D(() => { const s = TUMBLE.save, items = TUMBLE.data.unlocks.items; const first = items.find((i) => i.cat === 'radio'); return { radio: s.equipped.radio, first: first.id, start: first.start, name: first.name, loads: s.stats.loads, owned: s.unlocks.filter((id) => /^radio-/.test(id)).length }; });
  ok(fresh.radio === fresh.first && fresh.start === true && fresh.loads === 0 && fresh.owned === 0, `a fresh save: the radio is on the first song, which is hers from the start (${fresh.name})`);
  // play the Small Load to its end: every pair lobbed, the odd socks binned
  for (let i = 0; i < 40; i++) { const b = await D(() => TUMBLE_DEV.matchPair()); if (b === null) break; await D((id) => TUMBLE_DEV.lobBall(id), b); await until((n) => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= n; }, i + 1, 20000); }
  await D(() => { const g = TUMBLE.game, S = g.session; for (const s of S.socks.values()) if (s.state === 'table' && s.odd !== null && s.odd !== undefined) { S.bin(s.id); g.table.remove(s.id); } });
  ok(await until(() => TUMBLE_DEV.state === 'results', null, 120000), 'the first Load ends by itself');
  await H.frames(2);
  const res = await D(() => { const s = TUMBLE.save; const body = document.querySelector('.sheet'); return { loads: s.stats.loads, owned: s.unlocks.filter((id) => /^radio-/.test(id)), gifts: s.tierGifts, text: body ? body.innerText : '', btn: !!document.getElementById('rRadio'), level: !!(body && /Level 1 Sorter/.test(body.innerText)) }; });
  ok(res.loads === 1 && res.gifts.includes('first-load') && res.owned.length === 1, `the first Load gives the second song (${res.owned.join(', ')})`);
  ok(res.btn && /Your first Load, done/.test(res.text) && /Hear it on the radio/.test(res.text), 'the result sheet says so, with the button to the radio');
  ok(res.level && /Level 2 at 2 Loads/.test(res.text), 'and the Sorter level line: level 1, level 2 at 2 Loads');
  await H.shot(`first-load-result-${W}.png`);
  // ---- the button opens the radio: his titles, the first song on, the second in the loop
  await D(() => document.getElementById('rRadio').click());
  ok(await until(() => TUMBLE.ui.open && document.getElementById('sheetTitle').textContent === 'Behind the door' && !!document.querySelector('#shopList .radiohead'), null, 30000), 'Hear it on the radio opens the Radio tab');
  await H.frames(2);
  const radio = await D(() => ({ titles: [...document.querySelectorAll('#shopList .shopitem b')].map((b) => b.textContent), on: document.querySelector('#shopList .radiohead b').textContent }));
  ok(radio.titles.includes('Sock It to Me') && radio.titles.includes('Perfect Pair') && !radio.titles.some((t) => /Fold It Up/.test(t)), `the radio lists his titles (${radio.titles.slice(0, 3).join(', ')})`);
  ok(/on/i.test(radio.on), `the radio is on (${radio.on})`);
  await H.shot(`radio-after-first-load-${W}.png`);
  await D(() => TUMBLE.ui.closeSheet(true));
  // ---- the dryer door: a locked size says her count beside the count it needs
  await D(() => { TUMBLE.save.profile.seenHowTo = true; TUMBLE.openDryer(); });   // a fresh save sees How to play first; this is the door
  ok(await until(() => TUMBLE.ui.open && !!document.getElementById('sizes'), null, 20000), 'the dryer door opens');
  await D(() => { const b = document.querySelector('#sizes button[data-size="heavy"]'); b && b.click(); });
  await H.frames(1);
  const hint = await D(() => (document.getElementById('sizeHint') || {}).textContent || '');
  ok(/Heavy Loads open after 20 Loads\. You have played 1 Load so far\./.test(hint), `the locked size carries her count (${hint})`);
  await H.shot(`door-size-count-${W}.png`);
  await D(() => TUMBLE.ui.closeSheet(true));
  // ---- the room: the Shop button on the dock, the wagon on the table, the four mugs on the shelf, the cat
  await D(() => { const app = window.TUMBLE, s = app.save; for (const id of ['basket-wagon', 'decor-mug-chipped', 'decor-mug-diner', 'decor-mug-roses', 'decor-mug-twohandle', 'decor-laundry-cat']) if (!s.unlocks.includes(id)) s.unlocks.push(id); s.equipped.basket = 'basket-wagon'; s.equipped.decor = ['decor-mug-chipped', 'decor-mug-diner', 'decor-mug-roses', 'decor-mug-twohandle', 'decor-laundry-cat']; app.store.save(); app._refreshComforts(); app.screens.refresh(); });
  await until(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room', null, 60000);
  await new Promise((r) => setTimeout(r, 2500));   // the cat's file
  await H.frames(2);
  const dock = await D(() => ({ door: (document.getElementById('dockDoor') || {}).textContent || '', gear: !!document.querySelector('#dockDoor svg circle[r="3"]'), rug: !!document.querySelector('#spots .hotspot[data-spot="rug"]'), cat: !!(TUMBLE.game.render.scene.getObjectByName('decor-laundry-cat')), catGlb: !!(TUMBLE.game.render.scene.getObjectByName('loafCat')) }));
  ok(/Shop/.test(dock.door) && !dock.gear, `the dock's door button says Shop and does not wear the settings gear (${dock.door.trim()})`);
  ok(dock.rug, 'the rug is a hotspot');
  ok(dock.cat, 'the cat is in the room');
  await H.shot(`room-sep24-${W}.png`);
  // ---- the rug hotspot opens the shop's Room tab at the rugs
  const r = await D(() => { const b = document.querySelector('#spots .hotspot[data-spot="rug"]'); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
  await H.tap(r.x, r.y);
  ok(await until(() => TUMBLE.ui.open && document.getElementById('sheetTitle').textContent === 'Behind the door' && !!document.querySelector('#shopList .shophead[data-slot="rug"]'), null, 30000), 'a tap on the rug opens the shop at the Room tab');
  await new Promise((rs) => setTimeout(rs, 400));
  const shop = await D(() => { const sb = document.getElementById('sheetBody'), h = document.querySelector('#shopList .shophead[data-slot="rug"]'); const r2 = h.getBoundingClientRect(), r3 = sb.getBoundingClientRect(); return { top: r2.top - r3.top, money: /game money/.test(sb.innerText), tab: document.querySelector('.tabs button[aria-pressed="true"]').textContent }; });
  ok(shop.tab === 'Room' && shop.top >= -4 && shop.top < 160, `the Room tab, scrolled to the rugs (heading ${Math.round(shop.top)} px under the sheet's top)`);
  ok(shop.money, 'the shop says Lint and coins are game money');
  await H.shot(`shop-rugs-${W}.png`);
  await D(() => TUMBLE.ui.closeSheet(true));
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `sep24: ${fails.length} FAILED` : 'sep24: all passed');
process.exitCode = fails.length ? 1 : 0;
