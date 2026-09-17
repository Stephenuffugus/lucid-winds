// Step 3 gate (OPUS_PROMPT): hold+tap matches, mismatches bounce, matched pairs roll into a ball,
// balls can be flicked or lobbed into a basket with real rim bounces, and misses stay on the table.
// Real pointer events on the canvas throughout. node dev/gate-step3.mjs
import { harness, sleep } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 90000) => H.page.waitForFunction(f, { timeout, polling: 200 }, arg).then(() => true, () => false);
const tapAt = (x, y) => H.page.evaluate((x, y) => {
  const el = document.elementFromPoint(x, y);
  const mk = (t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 11, pointerType: 'touch', isPrimary: true, buttons: t === 'pointerup' ? 0 : 1 });
  el.dispatchEvent(mk('pointerdown')); el.dispatchEvent(mk('pointerup'));
  return el.id;
}, x, y);

try {
  await H.open('?nosw&turbo=1&load=laundry&size=regular&tier=4&seed=gate3a&skipdump=1&debug=1');
  await H.frames(3);
  const s0 = await D(() => TUMBLE_DEV.session());
  ok(s0.phase === 'play' && s0.pairsLeft === 20, `a Regular Load is in play (${s0.pairsLeft} pairs, ${s0.oddLeft} odd)`);

  // ---- tap, tap: a pair rolls into a ball
  let socks = await D(() => TUMBLE_DEV.findPickable());
  const byKey = new Map();
  for (const s of socks) if (s.odd === null) byKey.set(s.key, [...(byKey.get(s.key) || []), s]);
  const pair = [...byKey.values()].find((v) => v.length === 2);
  ok(!!pair, `two twins are both visible and pickable (${socks.length} pickable socks)`);
  await tapAt(pair[0].x, pair[0].y);
  ok(await until((id) => TUMBLE_DEV.entState(id) === 'pocket', pair[0].id), 'a tap puts the first sock in the hand');
  await H.shot('g3-1-pocket.png');
  const pb = await D((id) => TUMBLE_DEV.screenOf(id), pair[1].id);
  await tapAt(pb.x, pb.y);
  ok(await until(() => TUMBLE_DEV.session().stats.matches === 1), 'tapping its twin matches them');
  ok(await until(() => { const h = TUMBLE_DEV.hand(); return h && h.kind === 'ball' && TUMBLE_DEV.entState(h.id) === 'pocket'; }), 'the pair rolled into a ball that sits in the hand');
  await H.shot('g3-2-ball.png');

  // ---- tap the basket: the ball is lobbed in
  const spots = await D(() => TUMBLE_DEV.spots());
  await tapAt(spots.basket.x, spots.basket.y);
  ok(await until(() => TUMBLE_DEV.session().stats.shotsMade === 1), 'tapping the basket lobs the ball in (made 1)');
  ok(!(await D(() => TUMBLE_DEV.hand())), 'the hand is empty again');

  // ---- mismatch: the second sock drops back, the first stays in hand
  socks = await D(() => TUMBLE_DEV.findPickable());
  const a = socks.find((s) => s.odd === null);
  const b = socks.find((s) => s.odd === null && s.key !== a.key && Math.hypot(s.x - a.x, s.y - a.y) > 40);
  await tapAt(a.x, a.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', a.id);
  const bpos = await D((id) => TUMBLE_DEV.screenOf(id), b.id);
  await tapAt(bpos.x, bpos.y);
  ok(await until(() => TUMBLE_DEV.session().stats.mismatches === 1), 'a wrong sock is a mismatch');
  ok(await until((id) => TUMBLE_DEV.entState(id) === 'table' && TUMBLE_DEV.busy() === 0, b.id), 'the wrong sock drops back onto the table');
  const hand = await D(() => TUMBLE_DEV.hand());
  ok(hand && hand.id === a.id, 'the first sock is still in the hand');
  await H.shot('g3-3-mismatch.png');
  // put it down by tapping an empty patch of table
  const spot = await D(() => TUMBLE_DEV.emptySpot());
  ok(!!spot, 'found an empty patch of table ' + JSON.stringify(spot));
  await tapAt(spot.x, spot.y);
  ok(await until(() => !TUMBLE_DEV.hand() && TUMBLE_DEV.busy() === 0), 'tapping empty table puts the sock down');

  // ---- hold + tap: drag one sock, tap its twin with a second finger, then flick the ball
  socks = await D(() => TUMBLE_DEV.findPickable());
  const km = new Map();
  for (const s of socks) if (s.odd === null) km.set(s.key, [...(km.get(s.key) || []), s]);
  const p2 = [...km.values()].find((v) => v.length === 2 && v[0].y > 380);
  ok(!!p2, 'another visible pair for hold and tap');
  if (p2) {
    const [e1, e2] = p2[0].y > p2[1].y ? p2 : [p2[1], p2[0]];
    await H.pointer('pointerdown', e1.x, e1.y, { id: 21 });
    await H.moveOver([e1.x, e1.y], [e1.x, e1.y + 14], 80, { id: 21 });
    await H.frames(2);
    const hh = await D(() => TUMBLE_DEV.hand());
    ok(hh && hh.mode === 'drag' && hh.id === e1.id, 'the first sock is held under the finger');
    const e2p = await D((id) => TUMBLE_DEV.screenOf(id), e2.id);
    await D((x, y) => {
      const el = document.getElementById('stage');
      const mk = (t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 22, pointerType: 'touch', isPrimary: false, buttons: t === 'pointerup' ? 0 : 1 });
      el.dispatchEvent(mk('pointerdown')); el.dispatchEvent(mk('pointerup'));
    }, e2p.x, e2p.y);
    ok(await until(() => TUMBLE_DEV.session().stats.matches === 2), 'a second finger tap on the twin matches it (hold + tap)');
    ok(await until(() => { const h = TUMBLE_DEV.hand(); return h && h.kind === 'ball' && h.mode === 'drag'; }), 'the ball stays under the holding finger');
    await H.frames(4);
    // flick toward the basket: from the finger up and to the right, one in-page gesture
    const bs = spots.basket;
    const fx = e1.x, fy = e1.y + 14;
    await D(async (fx, fy, bx, by) => {
      const el = document.getElementById('stage');
      const mk = (t, x, y) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 21, pointerType: 'touch', isPrimary: true, buttons: t === 'pointerup' ? 0 : 1 });
      // a brisk flick: about 45% of the way to the basket in 80 ms
      const dx = bx - fx, dy = by - fy, n = 5;
      const t0 = performance.now();
      for (let i = 1; i <= n; i++) {
        while (performance.now() < t0 + i * 16) await new Promise((r) => setTimeout(r, 1));
        el.dispatchEvent(mk('pointermove', fx + dx * 0.45 * (i / n), fy + dy * 0.45 * (i / n)));
      }
      el.dispatchEvent(mk('pointerup', fx + dx * 0.45, fy + dy * 0.45));
    }, fx, fy, bs.x, bs.y);
    ok(await until(() => { const s = TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed >= 2; }, null, 120000), 'the flicked ball flies and the shot resolves');
    const st = await D(() => TUMBLE_DEV.session().stats);
    console.log(`  info  flick result: made ${st.shotsMade}, missed ${st.shotsMissed}`);
    if (st.shotsMissed > 0) {
      const balls = await D(() => TUMBLE_DEV.session().balls);
      ok(balls.some((x) => x.state === 'table'), 'the missed ball stays on the table');
    }
    await H.shot('g3-4-flick.png');
  }

  // ---- the Odd Bin
  socks = await D(() => TUMBLE_DEV.findPickable());
  const odd = socks.find((s) => s.odd !== null);
  if (odd) {
    await tapAt(odd.x, odd.y);
    await until((id) => TUMBLE_DEV.entState(id) === 'pocket', odd.id);
    const sp = await D(() => TUMBLE_DEV.spots());
    await tapAt(sp.bin.x, sp.bin.y);
    ok(await until(() => TUMBLE_DEV.session().stats.binned === 1), 'an odd sock tapped into the Odd Bin is binned');
  } else console.log('  info  no odd sock visible on top of the pile; Bin check skipped this run');
  // a sock that has a twin is refused by the Bin
  socks = await D(() => TUMBLE_DEV.findPickable());
  const paired = socks.find((s) => s.odd === null);
  await tapAt(paired.x, paired.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', paired.id);
  const sp2 = await D(() => TUMBLE_DEV.spots());
  await tapAt(sp2.bin.x, sp2.bin.y);
  ok(await until(() => TUMBLE_DEV.session().stats.wrongBins === 1), 'a sock with a twin is refused by the Bin');
  ok(await until((id) => TUMBLE_DEV.entState(id) === 'table' && TUMBLE_DEV.busy() === 0, paired.id), 'and it pops back onto the table');

  // ---- double tap flips an inside out sock
  socks = await D(() => TUMBLE_DEV.findPickable());
  const io = socks.find((s) => s.insideOut);
  if (io) {
    await tapAt(io.x, io.y);
    await sleep(60);
    await tapAt(io.x, io.y);
    ok(await until(() => TUMBLE_DEV.session().stats.flips === 1), 'a double tap flips an inside out sock');
    await H.shot('g3-5-flip.png');
    const sp3 = await D(() => TUMBLE_DEV.emptySpot());
    await tapAt(sp3.x, sp3.y);
    await until(() => !TUMBLE_DEV.hand() && TUMBLE_DEV.busy() === 0);
  } else console.log('  info  no inside out sock visible; flip check skipped this run');

  const errs = H.errors.filter((e) => !/manifest|icon-192|favicon|404/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g3-crash.png');
}
await H.close();
console.log(fails.length ? `step 3 gate: ${fails.length} FAILED` : 'step 3 gate: all passed');
process.exitCode = fails.length ? 1 : 0;
