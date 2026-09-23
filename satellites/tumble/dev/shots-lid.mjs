// THE SUITCASE LID, FILMED (23 Sep 2026): the Open Suitcase equipped, a Load, one ball placed on the long lob that
// clears an open basket's back rim (tests/lid.test.mjs), then frames of its flight from where the player stands, and
// the ball read back IN the basket at the end. The same lob against the wicker basket is the control: it must sail
// over. A cropped strip of the basket is written next to the full frames. OPEN THEM.
//   node dev/shots-lid.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
const W = Number(process.argv[2] || 412), H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8797, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 150 }, arg).then(() => true, () => false);
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  for (const [style, id, wantIn] of [['suitcase', 'basket-suitcase', true], ['wicker', 'basket-wicker', false]]) {
    await H.open('?nosw&unlockall=1&skipdump=1&load=laundry&size=small&tier=0&seed=lidfilm', 'play', 240000);
    const eq = await D((id) => { const app = window.TUMBLE; if (!app.save.unlocks.includes(id) && !(app.item(id) || {}).start) app.save.unlocks.push(id); app.save.equipped.basket = id; for (const k of Object.keys(app.save.seen || {})) app.save.seen[k] = true; app.ui.hideHint(); app.store.save(); return app.item(id) && app.item(id).look.style; }, id);
    ok(eq === style, `${style}: the ${id} basket is owned and equipped (${eq})`);
    // a fresh Load builds the physics with the equipped basket
    await D(() => window.TUMBLE.start({ mode: 'laundry', size: 'small', tier: 0, seed: 'lidfilm' }));
    ok(await until(() => TUMBLE_DEV.state === 'play', null, 240000), `${style}: a Small Load is in play`);
    const lid = await D(() => !!TUMBLE.game.physics.basketLid);
    ok(lid === wantIn, `${style}: the physics ${lid ? 'has' : 'has no'} lid`);
    const ball = await D(() => TUMBLE_DEV.matchPair());
    ok(ball !== null, `${style}: a pair rolled into a ball`);
    const spot = await D(() => TUMBLE_DEV.spots().basket);
    const clip = { x: Math.max(0, Math.round(spot.x - 110)), y: Math.max(0, Math.round(spot.y - 150)), width: 220, height: 220 };
    // the long lob from tests/lid.test.mjs, placed by hand. ⛔ FILM THE WHOLE MOTION: the loop is paused (it still
    // draws from the physics poses) and the physics is stepped BY HAND, three steps (a twentieth of a second) a
    // frame, so the flight, the lid and the bounce are all in the strip. The first film let the loop run and the
    // whole flight fell between two software frames: a before and an after, not a look.
    await D((id) => { const P = TUMBLE.game.physics, B = { x: 0.25, z: -0.74 }; P.place(id, { x: B.x, y: 0.26, z: B.z + 0.22 }, null, { x: 0, y: 0.9, z: -2.0 }); TUMBLE.game.session.dropBall(id); TUMBLE.game.paused = true; }, ball);
    let minZ = Infinity, frames = 0;
    for (let i = 0; i < 16; i++) {
      const p = await D((id) => { const P = TUMBLE.game.physics; for (let k = 0; k < 3; k++) P.step(); return P.pose(id); }, ball);
      if (!p) break;
      minZ = Math.min(minZ, p.z);
      await H.frames(2);
      await H.page.screenshot({ path: `${H.out}/lid-${style}-${String(i).padStart(2, '0')}-${W}.png`, clip });
      frames++;
    }
    await D(() => { TUMBLE.game.paused = false; });
    await H.frames(30);
    const end = await D((id) => { const P = TUMBLE.game.physics, p = P.pose(id); return p ? { x: +p.x.toFixed(3), y: +p.y.toFixed(3), z: +p.z.toFixed(3), inB: P.inBasket(p) } : null; }, ball);
    ok(end && end.inB === wantIn, `${style}: the long lob ends ${end && end.inB ? 'IN the basket' : 'outside it'} (${JSON.stringify(end)}, nearest the wall z ${minZ.toFixed(3)}, ${frames} frames filmed)`);
    if (wantIn) ok(minZ > -0.74 - 0.125 - 0.08, `${style}: it never passed through the lid (z ${minZ.toFixed(3)})`);
    await H.shot(`lid-${style}-end-${W}.png`);
  }
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `lid shots: ${fails.length} FAILED` : 'lid shots: all passed');
process.exitCode = fails.length ? 1 : 0;
