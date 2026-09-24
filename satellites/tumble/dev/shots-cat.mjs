// LOAF'S CAT IN THE ROOM (24 Sep): each of its three days, clipped round the cat at a phone's width, after the file has
// landed (the blobs are gone). OPEN THEM.   node dev/shots-cat.mjs [w h]
import { harness } from '../tools/harness.mjs';
const W = Number(process.argv[2] || 412), H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8801, dpr: 2 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 200 }, arg).then(() => true, () => false);
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 240000);
  await D(() => { const app = window.TUMBLE, s = app.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; app.ui.hideHint(); s.equipped.decor = ['decor-laundry-cat']; app.store.save(); });
  for (const day of [0, 1, 2]) {
    await D((d) => { const app = window.TUMBLE; app.game.render._catDay = d; app.screens.refresh(); }, day);
    await until(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
    const landed = await until(() => !!TUMBLE.game.render.scene.getObjectByName('loafCat') && !TUMBLE.game.render.scene.getObjectByName('catBlob'), null, 30000);
    ok(landed, `day ${day}: the cat's file landed and the blobs are gone`);
    await new Promise((r) => setTimeout(r, day === 2 ? 1800 : 1200));   // a beat of its clip (and a step of its walk)
    await H.frames(2);
    const at = await D(() => { const R = TUMBLE.game.render, g = R.scene.getObjectByName('loafCat'); if (!g) return null; const p = g.getWorldPosition(new (Object.getPrototypeOf(g.position).constructor)()); const s = R.project(p); let calls = 0; return { x: s.x, y: s.y, calls: R.renderer ? R.renderer.info.render.calls : -1, sub: g.children.length }; });
    ok(!!at && at.x > 0 && at.x < W && at.y > 0 && at.y < H2, `day ${day}: the cat is on screen at ${at && Math.round(at.x)},${at && Math.round(at.y)} (${at && at.calls} draw calls in the room)`);
    if (at) await H.page.screenshot({ path: `${H.out}/cat-day${day}-${W}.png`, clip: { x: Math.max(0, at.x - 90), y: Math.max(0, at.y - 90), width: 180, height: 150 } });
    await H.shot(`cat-room-day${day}-${W}.png`);
  }
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `cat: ${fails.length} FAILED` : 'cat: all passed');
process.exitCode = fails.length ? 1 : 0;
