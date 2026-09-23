// THE PLAY FEATURE GRAPHIC (1024 x 500), rendered from the real game: three candidates to look at and choose from.
// Rendered at twice the size (2048 x 1000) and saved at that size; the store copy is scaled down from it.
//   A  the room by day, the title as the game shows it, no wallet, no buttons, no tags
//   B  the room at night (the lamp and the pendant on)
//   C  the table with a Regular heap on it, no HUD
//   node dev/shots-feature.mjs
import { harness } from '../tools/harness.mjs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: 1024, h: 500, port: 8793, dpr: 2 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 240000) => H.page.waitForFunction(f, { timeout: ms, polling: 300 }, arg).then(() => true, () => false);
const bare = () => D(() => {
  // only the art (and, in the room, its title): the wallet, the dock, the tags and every hint go
  for (const id of ['roomWallet', 'dock', 'spots', 'hud', 'bottombar', 'hint', 'sweepbar']) { const el = document.getElementById(id); if (el) el.style.visibility = 'hidden'; }
});

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1', 'room', 300000);
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  ok(await until(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room'), 'the room settles at 1024 x 500');
  for (const [name, hour] of [['A-room-day', 13], ['B-room-night', 21.5]]) {
    await D((h) => { const app = window.TUMBLE; app.game.render._hour = h; app.screens.refresh(); }, hour);
    await bare();
    await H.frames(6);
    await H.shot(`feature-${name}.png`);
  }
  await D(() => { delete window.TUMBLE.game.render._hour; window.TUMBLE.screens.refresh(); window.TUMBLE.start({ mode: 'laundry', size: 'regular', tier: 3, seed: 'feature-heap' }); });
  ok(await until(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play'), 'a Regular heap settles on the table');
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  await bare();
  await H.frames(8);
  await H.shot('feature-C-table.png');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'feature shots crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `feature shots: ${fails.length} FAILED` : 'feature shots: three candidates in dev/out/feature-*.png');
process.exitCode = fails.length ? 1 : 0;
