// GLB gate: the Meshy drop-in path (src/geo.js loadGlb) with real GLB + mask files (tools/make-test-glb.mjs makes them from
// the placeholders into dev/glbtest/). Loaded through ?base=, so production keeps its manifest.
// node dev/gate-glb.mjs            real fixture, all green
// GLB_BASE=dev/glbtest-missing/ node dev/gate-glb.mjs   the plant: the manifest names files that are not there
import { harness } from '../tools/harness.mjs';
const base = process.env.GLB_BASE || 'dev/glbtest/';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
try {
  await H.open(`?base=${base}&skipdump=1&smoke=43&debug=1&nosw&turbo=1`);
  await H.frames(3);
  const src = await D(() => TUMBLE.game.sils.map((s) => s.key + ':' + s.source));
  const listed = await D(async (b) => (await (await fetch(b + 'assets/geo/manifest.json')).json()).glb, base);
  ok(listed.every((k) => src.includes(k + ':glb')), `every silhouette the manifest lists comes from a GLB file (${src.join(' ')})`);
  ok(src.filter((s) => s.endsWith(':placeholder')).length === 8 - listed.length, `the ${8 - listed.length} silhouettes without a GLB keep the placeholder`);
  const fit = await D(() => {
    const g = TUMBLE.game.sils[1];
    let mnx = Infinity, mxx = -Infinity, mny = Infinity;
    for (let i = 0; i < g.positions.length; i += 3) { mnx = Math.min(mnx, g.positions[i]); mxx = Math.max(mxx, g.positions[i]); mny = Math.min(mny, g.positions[i + 1]); }
    return { verts: g.positions.length / 3, tris: g.indices.length / 3, spanX: mxx - mnx, minY: mny, uvs: g.uvs.length / 2, shade: g.shade.length };
  });
  // the crew placeholder is 0.150 leg + 0.170 foot with a rounded heel: about 0.30 m end to end along X after the loader's recentre and rescale
  // the placeholder fixture is 632 vertices and 1176 triangles; another base (a fitted Meshy mesh) only has to arrive
  const fixture = base === 'dev/glbtest/';
  ok(fixture ? fit.verts === 632 && fit.tris === 1176 : fit.verts > 100 && fit.tris > 100, `the GLB mesh arrives whole (${fit.verts} vertices, ${fit.tris} triangles)`);
  ok(Math.abs(fit.minY) < 0.002 && fit.spanX > 0.2 && fit.spanX < 0.4, `the loader sets the sock on the table and to size (min y ${fit.minY.toFixed(4)} m, span x ${fit.spanX.toFixed(3)} m)`);
  ok(fit.uvs === fit.verts && fit.shade === fit.verts, 'uvs and a shade value for every vertex');
  const mask = await D(() => { const m = TUMBLE.game.sils[1].mask; let r = 0, g = 0, b = 0; for (let i = 0; i < m.length; i += 4) { r += m[i] > 128; g += m[i + 1] > 128; b += m[i + 2] > 128; } return { n: m.length / 4, r, g, b }; });
  ok(mask.n === 256 * 256 && mask.r > 500 && mask.g > 500 && mask.b > 500, `the mask PNG decoded into heel, toe and cuff regions (${mask.r}, ${mask.g}, ${mask.b} px of ${mask.n})`);
  const c = await D(() => TUMBLE_DEV.counts());
  ok(c.total === 43 && c.awake === 0, `43 socks on the table with the GLB meshes, all asleep (awake ${c.awake})`);
  const onTable = await D(() => { let n = 0; for (const e of TUMBLE.game.table.ents.values()) if (e.kind === 'sock' && (e.sock.silId === 1 || e.sock.silId === 2)) n++; return n; });
  ok(onTable > 0, `${onTable} of the 43 socks are drawn with a GLB mesh`);
  await H.frames(2);
  const tag = fixture ? '' : '-' + base.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  await H.shot(`g-glb${tag}.png`);
  // the look that matters: a GLB sock held in the hand, large (DESIGN 3.1), and one dragged under the thumb
  const held = await D((k) => { for (const e of TUMBLE.game.table.ents.values()) if (e.kind === 'sock' && e.state === 'table' && e.sock.silId === TUMBLE.game.sils.findIndex((s) => s.key === k)) { TUMBLE.game.play.toPocket(e); return e.id; } return null; }, listed[0]);
  ok(held !== null, `a ${listed[0]} sock from the GLB went to the hand`);
  await H.page.waitForFunction((id) => TUMBLE_DEV.entState(id) === 'pocket', { timeout: 60000, polling: 250 }, held).catch(() => null);
  await H.frames(6);
  await H.shot(`g-glb${tag}-held.png`);
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `glb gate: ${fails.length} FAILED` : 'glb gate: all passed');
process.exitCode = fails.length ? 1 : 0;
