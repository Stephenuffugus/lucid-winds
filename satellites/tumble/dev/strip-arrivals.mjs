// A FILMSTRIP OF AN ARRIVAL (DESIGN-T2 6.2). shots-arrivals.mjs proves every arrival ends on the same heap and
// shoots ONE busy moment; this one looks at the whole of it. It pauses a Load the moment its arrival begins and
// scrubs the playback clock by hand (the paused loop still draws the table at `pb.t`), so each frame is exactly
// the time asked for, not wherever a slow software frame happened to land. It crops the back of the table (the
// dryer, the Odd Bin, the basket and the air above them) and writes one picture per time.
//   node dev/strip-arrivals.mjs [w h] [kinds]      (412 915 cart,chute by default)
import { harness } from '../tools/harness.mjs';
import { join } from 'node:path';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const KINDS = (process.argv[4] || 'cart,chute').split(',');
const DRYERS = { door: 'dryer-standard', above: 'dryer-clothesline', cart: 'dryer-cart', chute: 'dryer-chute' };
const H = await harness({ w: W, h: H2, port: 8798, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 100 }, arg).then(() => true, () => false);
const frames = () => D(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
let bad = 0;

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 300000);
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  for (const kind of KINDS) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.screens.refresh(); app.start({ mode: 'laundry', size: 'regular', tier: 3, seed: 'arrivals-same-heap' }); }, DRYERS[kind]);
    // freeze it the first frame the playback exists
    const caught = await settle(() => { const g = window.TUMBLE.game, pb = g.table.playback; if (g.state === 'dump' && pb) { g.paused = true; return true; } return g.state === 'play'; });
    const info = await D(() => { const pb = window.TUMBLE.game.table.playback; return pb && { arrival: pb.arrival, end: pb.end, props: pb.props }; });
    if (!caught || !info || info.arrival !== kind) { console.log(`  FAIL  ${kind}: the arrival was not caught (${JSON.stringify(info)})`); bad++; continue; }
    const P = info.props || {};
    let times;
    if (kind === 'cart') times = [0.12, 0.3, P.tipAt, P.tipAt + P.tipDur * 0.6, P.tipAt + 0.45, P.tipAt + 0.75, P.untipAt - 0.1, P.untipAt + 0.2, P.rollOut + 0.15, P.rollOut + 0.35];
    else if (kind === 'chute') {
      const b = P.bursts, last = b[b.length - 1], leave = last.at + last.dur + 0.4;
      times = [0.08, 0.22, b[0].at + 0.05, b[0].at + 0.3, b[1].at + 0.05, b[1].at + 0.3, b[2].at + 0.05, b[2].at + 0.4, leave + 0.1, leave + 0.25];
    } else times = [0.2, 0.45, 0.7, 1.0, 1.3, 1.6, 2.0, 2.4];
    console.log(`  info  ${kind}: playback ends at ${info.end.toFixed(2)} s; frames at ${times.map((t) => t.toFixed(2)).join(' ')}`);
    for (let i = 0; i < times.length; i++) {
      await D((t) => { const g = window.TUMBLE.game, pb = g.table.playback; pb.t = t; g.render.stepArrival(pb.arrival, t, pb.props); }, times[i]);
      await frames();
      await H.page.screenshot({ path: join(H.out, `strip-${kind}-${String(i).padStart(2, '0')}-${W}.png`), clip: { x: 0, y: 0, width: W, height: Math.round(H2 * 0.55) } });
    }
    await D(() => { const app = window.TUMBLE; app.game.paused = false; app.game.abandonLoad(); app.showRoom(); });
    await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  }
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  if (errs.length) { console.log('  FAIL  console errors ' + errs.join(' | ')); bad++; }
} catch (e) {
  console.log('  FAIL  strip crashed: ' + e.message);
  bad++;
}
await H.close();
console.log(bad ? `arrival strip: ${bad} FAILED` : `arrival strip: taken at ${W}x${H2} (dev/out/strip-*)`);
process.exitCode = bad ? 1 : 0;
