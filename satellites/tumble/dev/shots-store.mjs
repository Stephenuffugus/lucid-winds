// THE FIVE STORE SCREENSHOTS (DESIGN-T2 phase 7, last line; GPT 1 #20 lists them):
// a full table · a Reunion · the room at night · the Drawer · the jar.
//
// These are the pictures the Play listing is made of, so they are shot at a PHONE's aspect and they are
// shot from where a player stands, never from a debug camera. Everything they show is real: the save is
// granted so the room has things in it, and then the game is simply played to the moment.
//   node dev/shots-store.mjs            1080x1920, the Play listing size
//   node dev/shots-store.mjs 412 915    a phone sized pass, for looking at quickly
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 1080);
const H2 = Number(process.argv[3] || 1920);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

const H = await harness({ w: W, h: H2, port: 8799, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, ms = 180000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }).then(() => true, () => false);

try {
  // a lived in save: every item owned, a room she has decorated, and a Drawer with socks in it
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1&load=laundry&size=heavy&tier=6&seed=store', 'play', 300000);
  await D(() => {
    const s = window.TUMBLE.save;
    s.equipped.wallpaper = 'decor-wall-ticking';
    s.equipped.floor = 'decor-floor-cork';
    s.equipped.curtains = 'decor-curtain-gingham';
    s.equipped.tabletop = 'decor-table-linen';
    s.equipped.decor = ['decor-rug-medallion', 'decor-window-dawn', 'decor-plant-ivy', 'decor-lamp-mushroom', 'decor-mug-enamel', 'decor-poster-seedcat'];
    window.TUMBLE.screens.refresh();
  });

  // 1. A FULL TABLE. The heap, mid play, with a sock in her hand: the game's own picture of itself.
  await D(() => {
    const g = window.TUMBLE.game;
    for (const e of [...g.table.ents.values()]) { const sk = g.session.sock(e.id); if (sk && sk.state === 'table') { g.play.toPocket(e); break; } }
  });
  await settle(() => !TUMBLE.game.play.busy);
  await H.frames(6);
  await H.shot(`store-1-table-${W}.png`);
  ok(true, `1. a full table (${W}x${H2})`);

  // 2. A REUNION. Played for real: an odd sock is put in the Bin whose twin is already waiting.
  const reu = await D(async () => {
    const g = window.TUMBLE.game, S = g.session;
    if (g.play.hand) g.play.putBack();
    for (const s of S.socks.values()) {
      if (s.odd === null || s.odd === undefined) continue;
      s.reunion = true;                       // the twin has been waiting in the Bin (DESIGN 9.3)
      const e = g.table.ents.get(s.id);
      if (!e) continue;
      g.play.toBin(e);
      return true;
    }
    return false;
  });
  await settle(() => document.querySelector('.popup') || TUMBLE.game.session.stats.reunions.length > 0);
  await H.frames(4);
  await H.shot(`store-2-reunion-${W}.png`);
  ok(reu, '2. a Reunion');

  // 3. THE ROOM AT NIGHT. The hour light is real (7.3), so the room is told it is half past nine.
  await D(() => { window.TUMBLE.game.abandonLoad(); window.TUMBLE.showRoom(); });
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  const night = await D(() => window.TUMBLE.game.render.setHour(21.5));
  await H.frames(6);
  await H.shot(`store-3-room-night-${W}.png`);
  ok(night && night.evening, `3. the room at night (the lamp is on: day curve ${night ? night.day : '?'})`);

  // 4. THE DRAWER, with socks in it
  await D(() => window.TUMBLE.screens.open('drawer'));
  await settle(() => !!document.querySelector('#dGrid .cell'));
  await H.frames(4);
  await H.shot(`store-4-drawer-${W}.png`);
  const cells = await D(() => document.querySelectorAll('#dGrid .cell').length);
  ok(cells > 6, `4. the Drawer, ${cells} designs in it`);

  // 5. THE JAR: the Pockets page, which is where the things she has found actually read
  await D(() => { window.TUMBLE.ui.closeSheet(); window.TUMBLE.screens.drawerTab = 'pockets'; window.TUMBLE.screens.drawer(); });
  await settle(() => !!document.querySelector('#pk .pc'));
  await H.frames(4);
  await H.shot(`store-5-pockets-${W}.png`);
  const pcs = await D(() => document.querySelectorAll('#pk .pc[data-find]').length);
  ok(pcs > 0, `5. her pockets, ${pcs} things found`);

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'store shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `store shots: ${fails.length} FAILED` : `store shots: all five taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
