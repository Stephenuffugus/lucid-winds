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
    rows.push({ name, ...s });
    console.log(name, JSON.stringify(s));
  } catch (e) { console.log(name, 'failed', e.message); }
}
console.log('| Scene | fps | worst frame ms | physics ms/step | bodies (awake) | draw calls | triangles | dump |');
console.log('|---|---|---|---|---|---|---|---|');
for (const r of rows) console.log(`| ${r.name} | ${r.fps} | ${Math.round(r.worstMs)} | ${(r.stepMs || 0).toFixed(2)} | ${r.bodies} (${r.awake}) | ${r.calls} | ${Math.round(r.tris / 1000)}k | ${r.dumpN ? `${r.dumpN} socks, presim ${Math.round(r.presim)} ms, settled ${r.settled.toFixed(2)} s` : '-'} |`);
await H.close();
