// Reads the ?debug=1 overlay numbers in a few scenes (HANDOFF section 4). node dev/perf.mjs
// On this rig the GPU is software, so fps says little about a phone; draw calls, triangles and physics ms carry over.
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844, port: 8795 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const scenes = [
  ['Room', '?nosw&debug=1', 'room'],
  ['Regular Load (20 pairs)', '?nosw&debug=1&skipdump=1&load=laundry&size=regular&tier=4&seed=perf', 'play'],
  ['Mountain Load (50 pairs)', '?nosw&debug=1&skipdump=1&load=laundry&size=mountain&tier=4&seed=perf', 'play'],
  ['Smoke pile, 200 socks', '?nosw&debug=1&skipdump=1&smoke=200', null],
  ['Regular Load, ?low', '?nosw&debug=1&low&skipdump=1&load=laundry&size=regular&tier=4&seed=perf', 'play'],
];
const rows = [];
for (const [name, q, state] of scenes) {
  try {
    await H.open(q, state, 240000);
    if (!state) await H.page.waitForFunction(() => window.TUMBLE_DEV, { timeout: 240000 });
    await H.frames(4);
    // let the overlay collect about ten seconds of frames
    const t0 = Date.now();
    while (Date.now() - t0 < 10000) await H.frames(2);
    const s = await D(() => {
      const g = TUMBLE.game;
      const d = g.debug && g.debug.stats;
      const ld = g.lastDump;
      return { ...d, dumpN: ld ? ld.n : 0, presim: ld ? ld.simMs : 0, settled: ld ? ld.settledAt : 0 };
    });
    // Rapier alone, in this page, on this pile (the overlay's physics time includes a contended software GPU)
    s.rapier = await D(() => { const P = TUMBLE.game.physics; const t0 = performance.now(); for (let i = 0; i < 120; i++) P.step(); return (performance.now() - t0) / 120; });
    rows.push({ name, ...s });
    console.log(name, JSON.stringify(s));
  } catch (e) { console.log(name, 'failed', e.message); }
}
// ---------- THE PHASE 6 AND 8 THINGS THE SCENES ABOVE NEVER EQUIP (added 23 Sep, listing prep) ----------
// The scenes above play with the wicker basket and the dryer door. A basket is drawn in every frame of play, and the
// hotel cart and the chute are drawn during the SPILL, which is what 7.10's line is about ("no frame drops during the
// spill"). So: a Mountain Load with each of the busiest baskets on the table, and each arrival caught at its busiest
// moment of a Mountain spill. The overlay's draw calls, read after a few frames held still.
const extra = [];
try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&debug=1&turbo=1&unlockall=1', 'room', 300000);
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; });
  const calls = async () => { await H.frames(6); return D(() => window.TUMBLE.game.debug.stats.calls); };
  // the baskets, in play on a Mountain Load
  await D(() => window.TUMBLE.start({ mode: 'laundry', size: 'mountain', tier: 4, seed: 'perf' }));
  await H.page.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'play', { timeout: 300000, polling: 500 });
  for (const id of ['basket-wicker', 'basket-umbrella', 'basket-wagon', 'basket-bread', 'basket-suitcase', 'basket-floatie']) {
    await D((id) => { const app = window.TUMBLE; app.game.render.setBasketStyle(app.item(id).look); }, id);
    const n = await calls();
    extra.push({ name: 'Mountain, ' + id, calls: n });
    console.log('Mountain Load in play,', id, n, 'calls');
  }
  await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.game.render.setBasketStyle(app.item('basket-wicker').look); app.showRoom(); });
  // the arrivals, at their busiest moment of a Mountain spill
  const BUSY = { 'dryer-standard': 1.0, 'dryer-clothesline': 1.0, 'dryer-cart': 1.1, 'dryer-chute': 1.12 };
  for (const [id, at] of Object.entries(BUSY)) {
    await H.page.waitForFunction(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room', { timeout: 120000, polling: 300 });
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.screens.refresh(); app.start({ mode: 'laundry', size: 'mountain', tier: 4, seed: 'perf-spill' }); }, id);
    const caught = await H.page.waitForFunction((b) => { const g = window.TUMBLE.game, pb = g.table.playback; if (g.state === 'dump' && pb && pb.t >= b) { g.paused = true; return true; } return g.state === 'play'; }, { timeout: 300000, polling: 100 }, at).then(() => true, () => false);
    const n = caught ? await calls() : null;
    extra.push({ name: 'Mountain spill, ' + id, calls: n });
    console.log('Mountain spill,', id, n, 'calls');
    await D(() => { const app = window.TUMBLE; app.game.paused = false; app.game.abandonLoad(); app.showRoom(); });
  }
} catch (e) { console.log('the basket and arrival scenes failed', e.message); }

console.log('| Scene | fps | worst frame ms | physics ms/step (overlay) | Rapier ms/step (isolated) | bodies (awake) | draw calls | triangles | dump |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.name} | ${r.fps} | ${Math.round(r.worstMs)} | ${(r.stepMs || 0).toFixed(2)} | ${(r.rapier || 0).toFixed(2)} | ${r.bodies} (${r.awake}) | ${r.calls} | ${Math.round(r.tris / 1000)}k | ${r.dumpN ? `${r.dumpN} socks, presim ${Math.round(r.presim)} ms, settled ${r.settled.toFixed(2)} s` : '-'} |`);

// ---------- THE BUDGET (DESIGN-T2 7.10) ----------
// ⛔ THE FPS ON THIS RIG IS NOT THE ANSWER TO "30 fps on a Pixel". The GPU here is SwiftShader, a software
// rasteriser sharing two cores with whatever else is building, and it runs near one frame a second on a
// Mountain Load. Reporting its fps as the budget would be a number that is confidently wrong in the player's
// favour or against it, and neither is worth having.
//
// What DOES carry over to a phone, because it is the same work on any GPU:
//   * draw calls and triangles: the renderer's own cost, unchanged by how fast the chip is
//   * Rapier ms/step measured in isolation: the physics, which is CPU and comparable
//   * and the ?low path being MEASURABLY lower than the normal one, which is the half of 7.10 that can be
//     proved here at all.
// The 30 fps claim itself stays UNMEASURED until it runs on a real phone, and this file says so out loud
// rather than printing a green number.
const by = (n) => rows.find((r) => r.name === n) || {};
const reg = by('Regular Load (20 pairs)');
const low = by('Regular Load, ?low');
const mtn = by('Mountain Load (50 pairs)');
const fails = [];
const say = (okv, m) => { console.log((okv ? '  PASS  ' : '  FAIL  ') + m); if (!okv) fails.push(m); };
console.log('\nTHE BUDGET (DESIGN-T2 7.10)');
if (reg.calls && low.calls) {
  say(low.calls <= reg.calls, `?low draws no more than the normal path (${low.calls} against ${reg.calls} calls)`);
  say(low.tris <= reg.tris, `and no more triangles (${Math.round(low.tris / 1000)}k against ${Math.round(reg.tris / 1000)}k)`);
  say(low.calls < reg.calls || low.tris < reg.tris, `and it really is LOWER, not just not higher (${reg.calls - low.calls} calls, ${Math.round((reg.tris - low.tris) / 1000)}k triangles saved)`);
} else say(false, 'the ?low scene did not report: the budget cannot be read');
if (mtn.calls) {
  // the renderer's own cost, which is what a phone pays too. These ceilings are this build's measurements
  // plus headroom, so a change that doubles the draw calls is caught here rather than on his phone.
  say(mtn.calls <= 120, `a Mountain Load stays under 120 draw calls (${mtn.calls})`);
  say(mtn.tris <= 900000, `and under 900k triangles (${Math.round(mtn.tris / 1000)}k)`);
  say((mtn.rapier || 0) < 8, `Rapier steps a Mountain pile in under 8 ms (${(mtn.rapier || 0).toFixed(2)} ms)`);
}
// the same 120 ceiling with every basket she can put on the table, and through every arrival's spill
const baskets = extra.filter((r) => r.name.startsWith('Mountain, '));
const spills = extra.filter((r) => r.name.startsWith('Mountain spill'));
say(baskets.length === 6 && baskets.every((r) => r.calls && r.calls <= 120), `a Mountain Load stays under 120 draw calls with the busiest baskets too (${baskets.map((r) => r.name.replace('Mountain, basket-', '') + ' ' + r.calls).join(', ')})`);
say(spills.length === 4 && spills.every((r) => r.calls && r.calls <= 120), `and through the busiest moment of every arrival's spill (${spills.map((r) => r.name.replace('Mountain spill, dryer-', '') + ' ' + r.calls).join(', ')})`);
console.log('\n⛔ "30 fps on a Pixel class phone" is NOT measured above and is NOT claimed. The GPU here is');
console.log('   software and shares two cores; its fps says nothing about a phone. That line needs a phone.');
await H.close();
process.exitCode = fails.length ? 1 : 0;
