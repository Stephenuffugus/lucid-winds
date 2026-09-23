// THE SAME FINAL HEAP, IN THE RUNNING GAME (DESIGN-T2 6.2). tests/arrivals.test.mjs proves an arrival cannot touch
// the recorded heap; this proves the game wires it that way. One Load seed, four machines (the dryer door, the
// Backyard Clothesline, the Hotel Laundry Cart, the Apartment Laundry Chute): the heap she starts playing on must be
// the same heap, sock for sock, to the micrometre, and the door's coins moment must pay the same for all four. The
// door runs twice first, as the control: if the door does not match itself, a difference elsewhere means nothing.
// It pauses each arrival at its busiest moment and shoots it, then shoots the settled heap.
//   node dev/shots-arrivals.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8799, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 200 }, arg).then(() => true, () => false);
// the moment worth a picture: the pour half done, the second burst, the spill under way
const BUSY = { door: 1.0, above: 1.0, cart: 1.05, chute: 1.12 };

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 300000);
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  const runs = [];
  for (const [label, id] of [['door', 'dryer-standard'], ['door again', 'dryer-standard'], ['above', 'dryer-clothesline'], ['cart', 'dryer-cart'], ['chute', 'dryer-chute']]) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.screens.refresh(); app.start({ mode: 'laundry', size: 'regular', tier: 3, seed: 'arrivals-same-heap' }); }, id);
    // catch the arrival at its busiest moment, freeze it, shoot it
    const busy = BUSY[label.split(' ')[0]];
    const caught = await settle((b) => { const g = window.TUMBLE.game, pb = g.table.playback; if (g.state === 'dump' && pb && pb.t >= b) { g.paused = true; return true; } return g.state === 'play'; }, busy);
    const mid = await D(() => { const g = window.TUMBLE.game, pb = g.table.playback; return { state: g.state, t: pb ? +pb.t.toFixed(2) : null, arrival: pb ? pb.arrival : null, cart: !!(g.render.cartProp && g.render.cartProp.visible), chute: !!(g.render.chuteProp && g.render.chuteProp.visible) }; });
    if (caught && mid.state === 'dump' && label !== 'door again') await H.shot(`arrival-${label}-busy-${W}.png`);
    await D(() => { window.TUMBLE.game.paused = false; });
    ok(await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play'), `${label}: play begins`);
    await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
    const heap = await D(() => {
      const g = window.TUMBLE.game, T = g.table, S = g.session;
      const socks = [...T.ents.values()].filter((e) => e.kind === 'sock').sort((a, b) => a.id - b.id);
      const r6 = (v) => Math.round(v * 1e6);
      const poses = socks.map((e) => { const p = g.physics.pose(e.id); return [e.sock.seed.slice(0, 12), r6(p.x), r6(p.y), r6(p.z), r6(p.qx), r6(p.qy), r6(p.qz), r6(p.qw)].join(','); });
      return {
        n: socks.length, poses, dumping: socks.filter((e) => e.state === 'dumping').length, playback: !!T.playback,
        doorMoment: S._momentSeen.door || 0, coins: S.events.filter((e) => e.type === 'coin').map((e) => e.kind + '@' + e.moment).join(' '),
        props: [g.render.cartProp && g.render.cartProp.visible, g.render.chuteProp && g.render.chuteProp.visible].some(Boolean),
      };
    });
    runs.push({ label, mid, ...heap });
    console.log(`  info  ${label}: ${heap.n} socks, caught at t ${mid.t} (${mid.arrival}; cart shown ${mid.cart}, chute shown ${mid.chute}), coins [${heap.coins}]`);
    if (label !== 'door again') await H.shot(`arrival-${label}-heap-${W}.png`);
    await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.showRoom(); });
    await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  }
  const base = runs[0], diff = (a) => a.poses.filter((p, i) => p !== base.poses[i]).length;
  ok(runs[1].n === base.n && diff(runs[1]) === 0, `the control: the door matches itself, sock for sock (${diff(runs[1])} of ${base.n} differ)`);
  for (const r of runs.slice(2)) ok(r.n === base.n && diff(r) === 0, `${r.label}: play begins on the SAME heap as the dryer door, sock for sock to the micrometre (${diff(r)} of ${r.n} differ)`);
  ok(runs.every((r) => r.dumping === 0 && !r.playback && !r.props), 'play begins only once every sock is down: none still arriving, the playback gone, no cart or chute left standing');
  ok(runs.every((r) => r.doorMoment === 1 && r.coins === base.coins), `every arrival fires the door's coins moment once and pays the same coins (${base.coins || 'none this Load'})`);
  const cart = runs.find((r) => r.label === 'cart'), chute = runs.find((r) => r.label === 'chute');
  ok(cart.mid.arrival === 'cart' && cart.mid.cart && chute.mid.arrival === 'chute' && chute.mid.chute, `the cart and the chute are on screen while they bring the heap (cart ${cart.mid.cart} at ${cart.mid.t} s, chute ${chute.mid.chute} at ${chute.mid.t} s)`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'arrival shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `arrival shots: ${fails.length} FAILED` : `arrival shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
