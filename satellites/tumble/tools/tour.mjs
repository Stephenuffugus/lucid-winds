// A screenshot tour of every screen and moment, at a Pixel 9's CSS size (412 x 915), for a polish review.
// node tools/tour.mjs [outDir]   -> dev/out/tour/NN-name.png and tour.json (what each shot shows)
import { harness } from './harness.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = process.argv[2] || 'dev/out/tour';
const W = +(process.env.TOUR_W || 412), Hh = +(process.env.TOUR_H || 915);
const H = await harness({ w: W, h: Hh, port: 8796, outDir });
mkdirSync(H.out, { recursive: true });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 120000) => H.page.waitForFunction(f, { timeout, polling: 200 }, arg).then(() => true, () => false);
const shots = [];
let n = 0;
async function shot(name, what) {
  n++;
  const file = `${String(n).padStart(2, '0')}-${name}.png`;
  try { await H.frames(3); await H.shot(file); shots.push({ file, what }); console.log('shot', file); } catch (e) { console.log('shot failed', file, e.message); }
}
async function step(label, fn) {
  try { await fn(); } catch (e) { console.log('STEP FAILED', label, e.message); shots.push({ file: null, what: `${label} FAILED: ${e.message}` }); }
}
const ptr = (type, x, y, id = 51, primary = true) => D((type, x, y, id, primary) => {
  const el = document.getElementById('stage');
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: primary, buttons: type === 'pointerup' ? 0 : 1 }));
}, type, x, y, id, primary);
// a quick tap: both events stamped before either is handled (separate calls can be seconds apart on this rig)
const tapEv = (x, y, id = 61) => D((x, y, id) => {
  const el = document.getElementById('stage');
  const mk = (t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: true, buttons: t === 'pointerup' ? 0 : 1 });
  const d = mk('pointerdown'), u = mk('pointerup');
  el.dispatchEvent(d); el.dispatchEvent(u);
}, x, y, id);
const closeSheet = () => D(() => { if (TUMBLE.ui.open) TUMBLE.ui.closeSheet(true); });

await step('first run room', async () => {
  await H.open('?nosw&turbo=1', null);
  await until(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room');
  await H.frames(6);
  await shot('room-first-run', 'The Laundry Room on a first visit: nothing earned, dock, hotspot tags, wallet.');
});
await step('how to play', async () => {
  await D(() => document.querySelector('[data-spot="dryer"]').click());
  await until(() => TUMBLE_DEV.app.ui().title === 'How to play');
  await H.frames(4);
  await shot('how-to-play', 'How to play, shown on the first tap of the dryer.');
});
await step('dryer spin and dump', async () => {
  await D(() => [...document.querySelectorAll('#ui button')].find((b) => b.textContent.trim() === 'Start my first Load').click());
  await until(() => TUMBLE_DEV.state === 'drying');
  await H.frames(2);
  await shot('drying', 'The dryer spinning before the dump (camera flying to the table).');
  await until(() => TUMBLE_DEV.state === 'dump');
  await H.frames(4);
  await shot('dump-early', 'The dump: socks arcing out of the dryer door onto the table.');
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  await H.frames(4);
  await shot('play-small-first', 'The first Load (Small, tier 0) just after the dump, with the first hint.');
});
await step('tap to pocket', async () => {
  const s = (await D(() => TUMBLE_DEV.findPickable(null, 30))).find((x) => x.odd === null);
  await tapEv(s.x, s.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', s.id);
  await H.frames(4);
  await shot('sock-in-pocket', 'A tapped sock sitting large in the hand (pocket) at the bottom, with the hand glow.');
  const mate = await D((id) => TUMBLE_DEV.mateOf(id), s.id);
  const m = (await D(() => TUMBLE_DEV.findPickable(null, 10))).find((x) => x.id === mate);
  if (m) {
    await tapEv(m.x, m.y);
    await H.frames(3);
    await shot('twin-flying', 'The twin flying up to meet the held sock (mid flight or rolling).');
    await until(() => { const h = TUMBLE_DEV.hand(); return h && h.kind === 'ball'; });
    await H.frames(3);
    await shot('ball-in-pocket', 'The rolled ball in the hand.');
    const sp = await D(() => TUMBLE_DEV.spots());
    await tapEv(sp.basket.x, sp.basket.y);
    await H.frames(2);
    await shot('lob-in-flight', 'A tapped basket lob in flight.');
    await until(() => TUMBLE_DEV.session().stats.shotsMade >= 1);
    await H.frames(3);
    await shot('ball-in-basket', 'The ball landed in the basket (puff, bump).');
  }
});
await step('drag held', async () => {
  const s = (await D(() => TUMBLE_DEV.findPickable(null, 30))).sort((a, b) => b.y - a.y)[0];
  await H.pointer('pointerdown', s.x, s.y, { id: 52 });
  await H.moveOver([s.x, s.y], [s.x + 20, s.y - 60], 200, { id: 52 });
  await H.frames(4);
  await shot('sock-dragged', 'A sock lifted and dragged under the thumb (held above the finger).');
  await H.pointer('pointerup', s.x + 20, s.y - 60, { id: 52 });
  await H.frames(6);
});
await step('mismatch', async () => {
  const p = await D(() => TUMBLE_DEV.findPickable(null, 30));
  const a = p.find((x) => x.odd === null);
  const b = p.find((x) => x.id !== a.id && x.key !== a.key);
  await tapEv(a.x, a.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', a.id);
  await tapEv(b.x, b.y);
  await until(() => TUMBLE_DEV.session().stats.mismatches >= 1, null, 30000);
  await H.frames(2);
  await shot('mismatch', 'A mismatch: the wrong sock drops back with a jostle, hint text.');
  await H.frames(8);
});
await step('sweep and results', async () => {
  await D(() => { const P = TUMBLE.game.play; if (P.hand) P.putDown({ x: 0, z: 0.2 }); });
  await H.frames(6);
  await D(() => TUMBLE_DEV.cheatSolve());
  await until(() => TUMBLE_DEV.state === 'sweep');
  await H.frames(2);
  await shot('sweep', 'The Sweep: strays pulsing, the Sweep banner.');
  await until(() => TUMBLE_DEV.state === 'results', null, 200000);
  await H.frames(30);
  await shot('results-laundry', 'Results after the first Laundry Load (tidy rating, Lint, Quarters, Drawer cards, pegs).');
  await D(() => { const b = document.getElementById('sheetBody'); b.scrollTop = b.scrollHeight; });
  await H.frames(3);
  await shot('results-laundry-bottom', 'The bottom of the same results sheet (buttons).');
});
await step('room after progress', async () => {
  await D(() => TUMBLE_DEV.app.grant({ economy: { lint: 5000, quarters: 40, reunions: 80 }, stats: { loads: 60, pairs: 600, shotsMade: 40, flips: 5, cleanLoads: 3, nightLoads: 1, reunions: 80, bestStreak: 14, rushLoads: 12, rushPairs: 80 }, seenHowTo: true }));
  await D(() => {
    const A = TUMBLE;
    const want = ['decor-rug-braided', 'decor-window-snow', 'decor-frame-oak', 'decor-plant-monstera', 'decor-plant-fern', 'decor-lamp-seaglass', 'decor-calendar-streak', 'decor-shelf-walnut', 'decor-cat-loaf', 'decor-mug-tuesday', 'decor-garland-lights', 'decor-clock-sunburst', 'decor-poster-dryer', 'odd-eye-lamp', 'room-frame-lore', 'portal-glow-lint', 'portal-postcard', 'portal-welcome-mat', 'radio-lofi'];
    const items = A.data.unlocks.items;
    const ids = want.map((w) => items.find((i) => i.id === w) || items.find((i) => i.id.startsWith(w.split('-').slice(0, 2).join('-')))).filter(Boolean).map((i) => i.id);
    for (const id of ids) if (!A.save.unlocks.includes(id)) A.save.unlocks.push(id);
    A.save.equipped.decor = ids.filter((id) => (items.find((i) => i.id === id) || {}).cat === 'decor');
    const radio = items.find((i) => i.cat === 'radio');
    if (radio) A.save.equipped.radio = radio.id;
    A.save.dailyDays = ['2026-09-01', '2026-09-02', '2026-09-05', '2026-09-10', '2026-09-16'];
    A.save.lore = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    A.save.clothesline = A.data.clothesline.pegs.filter((p) => p.comfort !== 'blank').map((p) => p.id);
    A._refreshComforts(); A.store.save(); A.screens.refresh();
    return ids;
  });
  await closeSheet();
  await D(() => TUMBLE.showRoom());
  await until(() => TUMBLE_DEV.state === 'room');
  await H.frames(20);
  await shot('room-decorated', 'The room after long play: rug, window, frames, plants, lamp, calendar, shelf, cat, mug, garland, clock, poster, reunion gifts, radio on, clothesline full.');
});
await step('dryer door', async () => {
  await D(() => TUMBLE_DEV.app.openDryer());
  await H.frames(6);
  await shot('dryer-modes', 'The dryer door: Laundry Day and Rush cards, Load size, Daily.');
  await D(() => document.getElementById('mRush') && document.getElementById('mRush').click());
  await H.frames(4);
  await shot('dryer-rush', 'The dryer door with Rush opened (sub modes).');
  await closeSheet();
});
await step('rush how', async () => {
  await D(() => TUMBLE.ui.rushHow('timed', () => {}, () => {}));
  await H.frames(6);
  await shot('rush-how', 'The Rush rules sheet shown before the first Timed Rush.');
  await closeSheet();
});
await step('rush timed', async () => {
  await D(() => { TUMBLE.save.seen['rushHow-timed'] = true; TUMBLE.start({ mode: 'rush', sub: 'timed', size: 'regular', tier: 7, seed: 'tour-rush' }); });
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  for (let i = 0; i < 9; i++) await D(() => TUMBLE_DEV.matchPair());
  await H.frames(4);
  await shot('rush-timed', 'Timed Rush at tier 7: clock, x4 streak, dots, power buttons, lint fog, inside out socks.');
  await D(() => TUMBLE_DEV.app.usePower('spinCycle'));
  await H.frames(10);
  await shot('rush-spin-cycle', 'Spin Cycle: the pile lifted and laid out sorted by colour.');
  await D(() => TUMBLE_DEV.setTime(0.1));
  await until(() => TUMBLE_DEV.state === 'results', null, 200000);
  await H.frames(20);
  await shot('rush-result', 'The Timed Rush result.');
});
await step('pause and settings', async () => {
  await D(() => TUMBLE.start({ mode: 'laundry', size: 'mountain', tier: 8, seed: 'tour-mountain' }));
  await until(() => TUMBLE_DEV.state === 'play', null, 240000);
  await H.frames(4);
  await shot('play-mountain', 'A Mountain Load (50 pairs) at tier 8: the heap.');
  await D(() => TUMBLE.pause());
  await H.frames(5);
  await shot('pause', 'The pause menu over a Load.');
  await D(() => document.getElementById('pSettings').click());
  await H.frames(5);
  await shot('settings', 'Settings (colour vision, toggles, save export and import).');
  await D(() => { const b = document.getElementById('sheetBody'); b.scrollTop = b.scrollHeight; });
  await H.frames(2);
  await shot('settings-bottom', 'The bottom of Settings.');
  await D(() => TUMBLE.setSetting('cvd', 'deutan'));
  await closeSheet();
  await D(() => { TUMBLE.game.paused = false; });
  await H.frames(30);
  await shot('play-deutan', 'The same Mountain Load in the deuteranopia palette.');
  await D(() => TUMBLE.setSetting('cvd', 'normal'));
});
await step('inside out held', async () => {
  const io = (await D(() => TUMBLE_DEV.findPickable(null, 30))).find((x) => x.insideOut);
  if (!io) return;
  await tapEv(io.x, io.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', io.id);
  await H.frames(4);
  await shot('inside-out-held', 'An inside out sock held in the hand (muted, terry inside).');
  await D(() => TUMBLE.game.play.flip(TUMBLE.game.table.ents.get(TUMBLE.game.play.hand.id)));
  await H.frames(8);
  await shot('inside-out-flipped', 'The same sock after the flip.');
  await D(() => TUMBLE.game.play.putDown({ x: 0, z: 0.2 }));
});
await step('leave to room and screens', async () => {
  await D(() => TUMBLE.game.abandonLoad());
  await D(() => TUMBLE.showRoom());
  await H.frames(20);
  await D(() => TUMBLE_DEV.app.screen('drawer'));
  await H.frames(8);
  await shot('drawer', 'The Drawer grid with filters.');
  await D(() => { const c = document.querySelector('#dGrid .cell'); if (c) c.click(); });
  await H.frames(10);
  await shot('sock-card', 'A sock card from the Drawer (turning card, facts, share).');
  await closeSheet();
  await D(() => TUMBLE_DEV.app.screen('oddbin'));
  await H.frames(8);
  await shot('odd-bin', 'The Odd Bin with Reunions and pages.');
  await D(() => TUMBLE_DEV.app.screen('lore', 7));
  await H.frames(6);
  await shot('lore-7', 'Lore page 7.');
  await closeSheet();
  await D(() => TUMBLE_DEV.app.screen('clothesline'));
  await H.frames(6);
  await shot('clothesline', 'The Clothesline with pegs earned.');
  await closeSheet();
  for (const tab of ['basket', 'dryer', 'decor', 'radio', 'ball', 'trail', 'pack', 'reunion']) {
    await D((t) => TUMBLE_DEV.app.screen('shop', t), tab);
    await H.frames(5);
    await shot('door-' + tab, `Behind the door, the ${tab} tab.`);
  }
  await closeSheet();
});
await step('hero pack and daily', async () => {
  await D(() => {
    const A = TUMBLE;
    for (const p of A.data.unlocks.items.filter((i) => i.cat === 'pack')) if (!A.save.unlocks.includes(p.id)) A.save.unlocks.push(p.id);
    A._refreshComforts();
  });
  await D(() => TUMBLE.start({ mode: 'laundry', size: 'regular', tier: 4, seed: 'tour-heroes' }));
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  const hero = await D(() => { for (const e of TUMBLE.game.table.ents.values()) if (e.kind === 'sock' && e.sock.hero && e.state === 'table') { const s = TUMBLE_DEV.tapPoint(e.id); return { id: e.id, ...s }; } return null; });
  if (hero) {
    await D((id) => TUMBLE.game.play.toPocket(TUMBLE.game.table.ents.get(id)), hero.id);
    await H.frames(6);
    await shot('hero-held', 'A hero sock held, with its introduction hint.');
  }
  await D(() => TUMBLE.game.abandonLoad());
  await D(() => { TUMBLE.save.seen['rushHow-daily'] = true; TUMBLE.save.daily = { date: null, played: false, rushScore: null, laundryPlays: 0 }; TUMBLE.save.dailyHistory = [{ date: '2026-09-12', score: 4200, rare: [] }, { date: '2026-09-14', score: 3100, rare: [] }]; TUMBLE.start({ mode: 'rush', sub: 'timed', daily: true, size: 'regular' }); });
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  for (let i = 0; i < 6; i++) { const b = await D(() => TUMBLE_DEV.matchPair()); if (b) await D((id) => TUMBLE_DEV.lobBall(id), b); }
  await until(() => TUMBLE_DEV.session().stats.shotsMade >= 4, null, 60000);
  await D(() => TUMBLE_DEV.setTime(0.1));
  await until(() => TUMBLE_DEV.state === 'results', null, 200000);
  await H.frames(20);
  await shot('daily-result', 'The Daily Rush result with the local board.');
  await D(() => { const b = document.getElementById('sheetBody'); b.scrollTop = b.scrollHeight; });
  await H.frames(2);
  await shot('daily-result-bottom', 'The bottom of the Daily Rush result (board, share).');
  const png = await D(async () => {
    const orig = URL.createObjectURL; let blob = null;
    URL.createObjectURL = (b) => { blob = b; return orig(b); };
    HTMLAnchorElement.prototype._click = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () {};
    await TUMBLE.shareDaily(TUMBLE.game.session, TUMBLE.currentOpts.daily);
    URL.createObjectURL = orig; HTMLAnchorElement.prototype.click = HTMLAnchorElement.prototype._click;
    if (!blob) return null;
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return btoa(s);
  });
  if (png) { n++; const file = `${String(n).padStart(2, '0')}-share-card.png`; writeFileSync(join(H.out, file), Buffer.from(png, 'base64')); shots.push({ file, what: 'The Daily share card image (1080 wide).' }); }
  await closeSheet();
});
await step('endless and balance', async () => {
  await D(() => { TUMBLE.save.seen['rushHow-endless'] = true; TUMBLE.save.seen['rushHow-balance'] = true; TUMBLE.start({ mode: 'rush', sub: 'balance', size: 'small', tier: 2, seed: 'tour-bal' }); });
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  await D(() => { TUMBLE.game.session.tilt = 0.8; });
  await H.frames(20);
  await shot('balance-tilted', 'Basket Balance with the basket leaning (tilt meter?).');
  await D(() => TUMBLE.game.abandonLoad());
  await D(() => TUMBLE.start({ mode: 'rush', sub: 'endless', size: 'regular' }));
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  await H.frames(6);
  await shot('endless', 'Endless Rush.');
  await D(() => TUMBLE.game.abandonLoad());
});
await step('portal dryer and baskets', async () => {
  await D(() => { const A = TUMBLE; const it = A.data.unlocks.items; const portal = it.find((i) => i.cat === 'dryer' && i.look.model === 'portal'); const claw = it.find((i) => i.cat === 'basket' && i.look.style === 'claw'); for (const x of [portal, claw]) if (!A.save.unlocks.includes(x.id)) A.save.unlocks.push(x.id); A.save.equipped.dryer = portal.id; A.save.equipped.basket = claw.id; A.store.save(); });
  await D(() => TUMBLE.start({ mode: 'laundry', size: 'regular', tier: 2, seed: 'tour-portal' }));
  await until(() => TUMBLE_DEV.state === 'dump', null, 200000);
  await H.frames(6);
  await shot('portal-dump', 'The portal dryer and claw machine basket during a dump.');
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  await H.frames(4);
  await shot('portal-play', 'Play with the portal dryer and claw basket.');
  await D(() => TUMBLE.game.abandonLoad());
  await D(() => TUMBLE.showRoom());
  await H.frames(20);
  await shot('room-portal', 'The room with the portal dryer.');
});
await step('narrow phone', async () => {
  await H.page.setViewport({ width: 360, height: 740, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await H.frames(10);
  await shot('room-360', 'The room on a small 360 x 740 phone.');
  await D(() => TUMBLE.start({ mode: 'laundry', size: 'regular', tier: 3, seed: 'tour-small' }));
  await until(() => TUMBLE_DEV.state === 'play', null, 200000);
  await H.frames(4);
  await shot('play-360', 'A Regular Load on a 360 x 740 phone.');
});

writeFileSync(join(H.out, 'tour.json'), JSON.stringify({ size: `${W}x${Hh}`, shots, errors: H.errors }, null, 1));
console.log('errors:', H.errors.length ? H.errors.slice(0, 8).join('\n') : 'none');
await H.close();
