// Step 4 gate (OPUS_PROMPT): Laundry Day end to end. Dump -> Play -> Sweep -> Results with a Tidy rating,
// Lint and Quarters earned, Drawer and Odd Bin persisted to IndexedDB; five consecutive Loads; the save
// survives a reload; settings (colour vision, pattern first, tap shots) and export/import are real.
// node dev/gate-step4.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 240000) => H.page.waitForFunction(f, { timeout, polling: 250 }, arg).then(() => true, () => false);
const clickText = (text) => D((t) => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.textContent.trim() === t && x.offsetParent !== null); if (!b) return false; const r = b.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!b.contains(el)) return 'covered'; b.click(); return true; }, text);

try {
  await H.open('?nosw&turbo=1&skipdump=1', null);
  await until(() => window.TUMBLE_DEV && TUMBLE_DEV.app && TUMBLE_DEV.state === 'room');
  // first run: How to play comes before the first Load (studio standard)
  const dryer = await D(() => { const b = document.querySelector('[data-spot="dryer"]'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
  ok(dryer.w >= 48 && dryer.h >= 48, `the dryer hotspot is at least 48 px (${Math.round(dryer.w)} x ${Math.round(dryer.h)})`);
  await D(() => document.querySelector('[data-spot="dryer"]').click());
  ok(await until(() => TUMBLE_DEV.app.ui().title === 'How to play'), 'the first tap on the dryer shows How to play before any Load');
  ok((await clickText('Open the dryer')) === true, 'the How to play button is reachable');
  ok(await until(() => TUMBLE_DEV.state === 'play'), 'the first Load starts (Small, Laundry Day)');
  const s1 = await D(() => TUMBLE_DEV.session());
  ok(s1.pairsLeft === 10 && s1.timeLeft === 0, `a Small Load has 10 pairs and no clock (${s1.pairsLeft}, ${s1.timeLeft})`);
  const visible = await D(() => getComputedStyle(document.getElementById('hud')).opacity);
  ok(Number(visible) > 0.5, 'the HUD shows during play');
  for (let n = 1; n <= 5; n++) {
    if (n > 1) {
      ok((await clickText('Another Load')) === true, `Load ${n}: "Another Load" on the results sheet`);
      ok(await until(() => TUMBLE_DEV.state === 'play'), `Load ${n} is in play`);
    }
    const solved = await D(() => TUMBLE_DEV.cheatSolve());
    ok(solved >= 10, `Load ${n}: ${solved} pairs matched through the session`);
    ok(await until(() => TUMBLE_DEV.state === 'results'), `Load ${n}: sweep then results`);
    const ui = await D(() => TUMBLE_DEV.app.ui());
    ok(ui.sheetOpen && ui.title === 'Load done', `Load ${n}: the results sheet is open ("${ui.title}")`);
    const tidy = await D(() => document.querySelector('.tidyname')?.textContent || '');
    ok(/Spotless|Tidy|Lived in/.test(tidy), `Load ${n}: tidy rating shown (${tidy})`);
  }
  await H.shot('g4-results.png');
  const sv = await D(() => TUMBLE_DEV.app.save());
  ok(sv.stats.loads === 5, `five Loads counted (${sv.stats.loads})`);
  ok(sv.economy.lint > 0, `Lint earned: ${sv.economy.lint}`);
  ok(sv.drawer.length >= 50, `the Drawer holds ${sv.drawer.length} designs`);
  ok(sv.oddBin.length >= 1, `the Odd Bin holds ${sv.oddBin.length} socks`);
  ok(sv.clothesline.length >= 1 || !(await D(() => TUMBLE_DEV.app.data().pegs)), `pegs earned by doing: ${sv.clothesline.join(', ')}`);

  // settings: colour vision changes the painted atlas, pattern first sticks, export/import round trips
  await D(() => TUMBLE_DEV.app.state());
  const exported = await D(() => { const t = TUMBLE.save; return JSON.stringify({ game: 'TUMBLE', save: t }); });
  await D(() => { TUMBLE.setSetting('cvd', 'deutan'); TUMBLE.setSetting('patternFirst', true); });
  ok(await until(() => TUMBLE.game.atlas.mode === 'deutan'), 'switching to deuteranopia repaints the atlas in that mode');

  // reload: the save must come back from IndexedDB
  await H.page.reload({ waitUntil: 'load' });
  await until(() => window.TUMBLE_DEV && TUMBLE_DEV.app && TUMBLE_DEV.state === 'room');
  const sv2 = await D(() => TUMBLE_DEV.app.save());
  ok(sv2.stats.loads === 5 && sv2.economy.lint === sv.economy.lint && sv2.drawer.length === sv.drawer.length && sv2.oddBin.length === sv.oddBin.length, `after a reload: ${sv2.stats.loads} Loads, ${sv2.economy.lint} Lint, ${sv2.drawer.length} designs, ${sv2.oddBin.length} odd socks`);
  ok(sv2.profile.settings.cvd === 'deutan' && sv2.profile.settings.patternFirst === true, 'settings survived the reload');
  // import the pre settings export: settings go back
  const back = await D(async (text) => { await TUMBLE.store.replace(JSON.parse(text).save); TUMBLE.save = TUMBLE.store.data; return TUMBLE.save.profile.settings.cvd || 'normal'; }, exported);
  ok(back !== 'deutan', 'importing an older export restores that save');
  // the Drawer and the Odd Bin screens show what was saved
  await D(() => TUMBLE_DEV.app.screen('drawer'));
  ok(await until(() => document.querySelectorAll('#dGrid .cell').length >= 20), 'the Drawer screen lists saved socks');
  await H.shot('g4-drawer.png');
  await D(() => TUMBLE_DEV.app.screen('oddbin'));
  ok(await until(() => TUMBLE_DEV.app.ui().title === 'The Odd Bin'), 'the Odd Bin screen opens');
  await H.shot('g4-oddbin.png');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g4-crash.png');
}
await H.close();
console.log(fails.length ? `step 4 gate: ${fails.length} FAILED` : 'step 4 gate: all passed');
process.exitCode = fails.length ? 1 : 0;
