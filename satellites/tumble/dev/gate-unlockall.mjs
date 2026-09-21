// The tester switch in the real page (Stephen, Sep 21 2026: "i want to have everything in tumble unlocked on my
// account"). A player who types ?unlockall=1 gets nothing; a device that passed the workbench door gets everything,
// the save on DISK carries it (read back from IndexedDB, not from memory), and ?unlockall=restore brings his own
// save back. node dev/gate-unlockall.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 412, h: 915 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// what is really on disk: the IndexedDB record the next launch will load
const onDisk = () => D(() => new Promise((res) => {
  const rq = indexedDB.open('tumble', 1);
  rq.onsuccess = () => { const g = rq.result.transaction('save', 'readonly').objectStore('save').get('main'); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); };
  rq.onerror = () => res(null);
}));
const hint = () => D(() => { const h = document.getElementById('hint'); return { on: h.classList.contains('on'), text: h.textContent.trim(), sticky: h.classList.contains('sticky') }; });
const Q = '?nosw&turbo=1';
try {
  // 1. a player: some real progress first, then the parameter, with no tester flag
  await H.open(Q, 'room', 240000);
  await D(() => TUMBLE_DEV.app.grant({ economy: { lint: 321, quarters: 4 }, unlocks: ['basket-plastic'], seenHowTo: true }));
  await wait(400);
  const mine = await onDisk();
  ok(mine && mine.economy.lint === 321 && mine.unlocks.length === 1, 'his own save is on disk (321 Lint, one basket)');
  await H.open(Q + '&unlockall=1', 'room', 240000);
  await wait(1500);
  let disk = await onDisk(), h = await hint();
  ok(disk.unlocks.length === 1 && disk.economy.lint === 321, 'a player who types ?unlockall=1 gets nothing');
  ok(!h.on && !(await D(() => localStorage.getItem('tumble-save-backup-unlockall'))), 'and sees nothing, and no backup is written');

  // 2. the same device after the workbench door
  await D(() => localStorage.setItem('sws_dev_ok', '1'));
  await H.open(Q + '&unlockall=1', 'room', 240000);
  await wait(1800);
  disk = await onDisk(); h = await hint();
  const counts = await D(() => TUMBLE_DEV.app.data());
  ok(disk.unlocks.length >= counts.unlocks && disk.lore.length === counts.lore && disk.clothesline.length === counts.pegs, `the save ON DISK owns everything (${disk.unlocks.length} items, ${disk.lore.length} pages, ${disk.clothesline.length} pegs)`);
  ok(disk.drawer.filter((d) => d.heroId).length === counts.heroes, `all ${counts.heroes} hero socks are in the Drawer on disk`);
  ok(disk.economy.lint >= 99999 && disk.economy.quarters >= 999, 'Lint and Quarters are topped up');
  ok(h.on && h.sticky && /Everything is open on this device/.test(h.text), `he is told, and it waits for his tap ("${h.text.slice(0, 60)}")`);
  const backup = JSON.parse(await D(() => localStorage.getItem('tumble-save-backup-unlockall')) || 'null');
  ok(backup && backup.economy.lint === 321 && backup.unlocks.length === 1, 'the backup holds his own save');
  ok(!/unlockall/.test(await D(() => location.search)), 'the parameter is gone from the address, so a reload is an ordinary launch');
  await H.shot('g-unlockall-room.png');
  const gb = await D(() => { const b = document.getElementById('hintGo'); const r = b && b.getBoundingClientRect(); return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; });
  if (gb) await H.tap(gb.x, gb.y);
  // the screens he will look at
  for (const [name, arg] of [['shop', 'basket'], ['shop', 'decor'], ['radio'], ['clothesline'], ['drawer'], ['oddbin']]) {
    await D((n, a) => TUMBLE_DEV.app.screen(n, a), name, arg);
    await wait(1200);
    await H.shot(`g-unlockall-${name}${arg ? '-' + arg : ''}.png`);
    const ui = await D(() => TUMBLE_DEV.app.ui());
    ok(ui.sheetOpen, `the ${name}${arg ? ' ' + arg : ''} screen opens with everything owned ("${ui.title}")`);
    await D(() => TUMBLE.ui.closeSheet && TUMBLE.ui.closeSheet());
    await wait(500);
  }

  // 3. an ordinary relaunch keeps it, a second ?unlockall=1 keeps the FIRST backup
  await H.open(Q + '&unlockall=1', 'room', 240000);
  await wait(1200);
  const b2 = JSON.parse(await D(() => localStorage.getItem('tumble-save-backup-unlockall')) || 'null');
  ok(b2 && b2.economy.lint === 321, 'a second ?unlockall=1 never overwrites the backup of his real save');

  // 4. and back
  await H.open(Q + '&unlockall=restore', 'room', 240000);
  await wait(1800);
  disk = await onDisk(); h = await hint();
  ok(disk.economy.lint === 321 && disk.unlocks.length === 1 && disk.lore.length === 0 && disk.drawer.length === 0, 'restore puts his own save back on disk');
  ok(h.on && /Your own save is back/.test(h.text), 'and says so');
  ok(!(await D(() => localStorage.getItem('tumble-save-backup-unlockall'))), 'the backup is removed once the save is back');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `unlockall gate: ${fails.length} FAILED` : 'unlockall gate: all passed');
process.exitCode = fails.length ? 1 : 0;
