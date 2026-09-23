// THE FIVE STORE SCREENSHOTS (DESIGN-T2 phase 7, last line; GPT 1 #20 lists them):
// a full table · a Reunion · the room at night · the Drawer · the jar.
//
// These are the pictures the Play listing is made of, so they are shot at a PHONE's aspect and they are
// shot from where a player stands, never from a debug camera. Everything they show is real: the save is
// granted so the room has things in it, and then the game is simply played to the moment.
//   node dev/shots-store.mjs            1080x1920, the Play listing size
//   node dev/shots-store.mjs 412 915    a phone sized pass, for looking at quickly
//
// ⛔ 23 Sep, the first run that was LOOKED AT: all five checks could not fail and two of them did anyway.
// `?unlockall=1` only answers on a device that passed the workbench door, and a fresh headless profile has
// not, so the grant was a silent no-op: the room said 0 Lint, the Drawer "Empty for now", the Pockets
// "Nothing yet". The first Load's teaching card sat over the dryer in two shots, the Reunion shot caught
// the table a second after the word had faded, and "the room at night" had a dawn window in it. Every
// `settle` below is an assertion now, and each shot asserts the thing it claims to show BEFORE it is taken.
import { harness } from '../tools/harness.mjs';

// [w h dpr]: the Play listing takes 1080 x 1920 PIXELS, and a phone that fills that is 432 x 768 CSS at a pixel ratio of
// 2.5, which is what `node dev/shots-store.mjs 432 768 2.5` shoots (the old default, 1080 x 1920 at a ratio of 1, laid
// the game out as a 1080 wide TABLET: small buttons in a big room, not what a phone shows)
const W = Number(process.argv[2] || 1080);
const H2 = Number(process.argv[3] || 1920);
const DPR = Number(process.argv[4] || 1);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };

const H = await harness({ w: W, h: H2, port: 8799, dpr: DPR });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, ms = 180000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }).then(() => true, () => false);

try {
  // the workbench door, as the door itself sets it: without it `?unlockall` does nothing at all
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1&load=laundry&size=heavy&tier=6&seed=store', 'play', 300000);
  const grant = await D(() => ({ finds: window.TUMBLE.save.finds.length, drawer: window.TUMBLE.save.drawer.length, lint: window.TUMBLE.save.economy.lint }));
  ok(grant.finds > 0 && grant.drawer > 0, `the tester grant took (${grant.finds} finds, ${grant.drawer} in the Drawer, ${grant.lint} Lint)`);

  // A LIVED IN SAVE, NOT A TESTER'S. The grant is everything at once, and a store picture of 99,999 Lint
  // reads as a cheat. So: a wallet a real player has after a couple of weeks, and pockets part way through
  // (two sets finished, two started, one not begun), which is also the only way the Pockets page shows its
  // silhouettes of the things still to find.
  const kept = await D(() => {
    const app = window.TUMBLE, s = app.save, F = app.data.finds;
    s.economy.lint = 1240; s.economy.quarters = 7; s.economy.cents = 14;
    const bySet = (id) => F.items.filter((f) => f.set === id).map((f) => f.id);
    const sets = F.sets.map((st) => st.id);
    s.finds = [...bySet(sets[0]), ...bySet(sets[1]), ...bySet(sets[2]).slice(0, 3), ...bySet(sets[3]).slice(0, 2)];
    s.sets = [sets[0], sets[1]];
    s.equipped.wallpaper = 'decor-wall-ticking';
    s.equipped.floor = 'decor-floor-cork';
    s.equipped.curtains = 'decor-curtain-gingham';
    s.equipped.tabletop = 'decor-table-linen';
    s.equipped.decor = ['decor-rug-medallion', 'decor-window-dawn', 'decor-plant-ivy', 'decor-lamp-mushroom', 'decor-mug-enamel', 'decor-poster-seedcat'];
    // the first Load's teaching cards belong to a first Load, not to a picture of the game
    for (const k of ['firstTapHint', 'mismatchHint', 'missHint', 'fogHint']) s.seen[k] = true;
    app.ui.hideHint();
    app.screens.refresh();
    return s.finds.length;
  });

  // 1. A FULL TABLE. The heap, mid play, with a sock in her hand: the game's own picture of itself.
  await D(() => {
    const g = window.TUMBLE.game;
    for (const e of [...g.table.ents.values()]) { const sk = g.session.sock(e.id); if (sk && sk.state === 'table') { g.play.toPocket(e); break; } }
  });
  ok(await settle(() => !TUMBLE.game.play.busy && !!TUMBLE.game.play.hand), '1. a sock is in her hand and the table has settled');
  await H.frames(6);
  ok(await D(() => document.getElementById('hint').classList.contains('on') === false), '1. and no teaching card covers the table');
  await H.shot(`store-1-table-${W}.png`);

  // 2. A REUNION. Played for real: an odd sock is put in the Bin whose twin is already waiting. The word
  //    lives 1.2 s and this renderer draws about a frame a second, so the moment is caught as it happens:
  //    the first "Reunion" to arrive is copied, at its brightest (the 15 percent keyframe), and held still
  //    for the shot. It is the game's own element with its own text and place; only the clock is stopped.
  await D(() => {
    const pops = window.TUMBLE.ui.$('pops');
    window.__heldPop = null;
    const mo = new MutationObserver((ms) => {
      for (const m of ms) for (const n of m.addedNodes) {
        if (window.__heldPop || !n.classList || !n.classList.contains('pop') || n.textContent !== 'Reunion') continue;
        const c = n.cloneNode(true);
        c.style.animation = 'none';
        c.style.opacity = '1';
        c.style.transform = 'translate(-50%, -8px) scale(1.08)';
        c.dataset.held = '1';
        pops.appendChild(c);
        window.__heldPop = c;
        mo.disconnect();
      }
    });
    mo.observe(pops, { childList: true });
  });
  const reu = await D(() => {
    const g = window.TUMBLE.game, S = g.session;
    if (g.play.hand) g.play.putBack();
    for (const s of S.socks.values()) {
      if (s.odd === null || s.odd === undefined) continue;
      const e = g.table.ents.get(s.id);
      if (!e || s.state !== 'table') continue;
      s.reunion = true;                       // the twin has been waiting in the Bin (DESIGN 9.3)
      g.play.toBin(e);
      return true;
    }
    return false;
  });
  ok(reu, '2. an odd sock went to the Bin whose twin was waiting');
  ok(await settle(() => !!window.__heldPop), '2. and the word Reunion came up where it happened');
  await H.frames(3);
  await H.shot(`store-2-reunion-${W}.png`);
  await D(() => { if (window.__heldPop) window.__heldPop.remove(); });

  // 3. THE ROOM AT NIGHT. The hour light is real (7.3), so the room is told it is half past nine, and the
  //    window has to agree with the lamp: one clock for the whole room.
  await D(() => { window.TUMBLE.game.abandonLoad(); window.TUMBLE.showRoom(); });
  ok(await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room'), '3. the room is up and the camera has settled');
  const night = await D(() => { const r = window.TUMBLE.game.render.setHour(21.5); window.TUMBLE.screens.refresh(); return { ...r, win: window.TUMBLE.game.render.windowNight }; });
  await H.frames(6);
  ok(night && night.evening && night.win === true, `3. the lamp is on and the window is dark (evening ${night && night.evening}, window night ${night && night.win})`);
  await H.shot(`store-3-room-night-${W}.png`);

  // 4. THE DRAWER, with socks in it
  await D(() => window.TUMBLE.screens.open('drawer'));
  ok(await settle(() => document.querySelectorAll('#dGrid .cell').length > 6), '4. the Drawer is open with socks in it');
  await H.frames(4);
  const cells = await D(() => document.querySelectorAll('#dGrid .cell').length);
  await H.shot(`store-4-drawer-${W}.png`);
  ok(cells > 6, `4. the Drawer, ${cells} designs in it`);

  // 5. THE JAR: the Pockets page, which is where the things she has found actually read
  await D(() => { window.TUMBLE.ui.closeSheet(); window.TUMBLE.screens.drawerTab = 'pockets'; window.TUMBLE.screens.drawer(); });
  ok(await settle(() => document.querySelectorAll('#pk .pc[data-find]').length > 0), '5. the Pockets page is open');
  await H.frames(4);
  const pcs = await D(() => document.querySelectorAll('#pk .pc[data-find]').length);
  await H.shot(`store-5-pockets-${W}.png`);
  ok(pcs === kept, `5. her pockets show the ${kept} things she has found (${pcs})`);

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'store shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `store shots: ${fails.length} FAILED` : `store shots: all five taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
