// THE DRYERS IN THE ROOM (DESIGN-T2 6.1): every dryer in the shop equipped in turn, in the real room, from where she
// stands. For each it reads the machine's materials back from the page and holds them to src/dryerlook.js (the
// wiring, not just the data), checks the decal is on the machine, and crops the dryer out of the room shot into one
// contact sheet so all thirteen can be looked at side by side. Then: The One With the Radio routes the station
// through its speaker, and the Industrial still takes bigger Loads now that behaviour comes from data.
//   node dev/shots-dryers.mjs [w h]      (412 915 by default)
import { writeFileSync } from 'fs';
import { harness } from '../tools/harness.mjs';
import { dryerLook } from '../src/dryerlook.js';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8798, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1', 'room', 300000);
  ok(await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room'), 'the room settles');
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  const dryers = await D(() => window.TUMBLE.data.unlocks.items.filter((i) => i.cat === 'dryer').map((i) => ({ id: i.id, name: i.name, look: i.look })));
  ok(dryers.length === 15, `fifteen dryers in the shop (6.1 made thirteen, 6.2 the cart and the chute) (${dryers.length})`);
  const bad = [], crops = [];
  for (const d of dryers) {
    // equip it the way the shop does, and let the room redraw
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.screens.refresh(); app._beds(); }, d.id);
    await H.frames(4);
    const got = await D(() => {
      const R = window.TUMBLE.game.render, E = R.dryerEnamel, ring = R.dryerRing, hx = (c) => '#' + c.getHexString();
      const e = R.dryerGroup.matrixWorld.elements, P = (x, y, z) => R.project({ x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14] });
      const a = P(-0.4, 0.74, 0.03), b = P(0.4, 0.05, 0.03);
      return {
        body: hx(E.color), map: !!E.map, bm: E.metalness, br: E.roughness,
        trim: hx(R.dryerTrim.color), ring: hx(ring.material.color), glow: hx(ring.material.emissive), glowK: ring.material.emissiveIntensity,
        tube: ring.geometry.parameters.tube, strip: hx(R.dryerStrip.material.color),
        decal: R.dryerDecalMesh ? R.dryerDecalMesh.parent === R.dryerGroup : false, radio: !!R.dryerRadio,
        box: { x: Math.round(a.x), y: Math.round(a.y), w: Math.round(b.x - a.x), h: Math.round(b.y - a.y) },
      };
    });
    const L = dryerLook(d.look);
    const want = { body: L.bodyMap ? '#ffffff' : L.body, map: !!L.bodyMap, bm: L.bodyMetal, br: L.bodyRough, trim: L.trim, ring: L.ring, glow: L.ringGlow, glowK: L.ringGlowK, tube: L.ringTube, strip: L.strip, decal: !!L.decal, radio: L.radio };
    for (const [k, v] of Object.entries(want)) if (typeof v === 'number' ? Math.abs(got[k] - v) > 1e-6 : got[k] !== v) bad.push(`${d.name} ${k}: ${got[k]} (want ${v})`);
    crops.push({ name: d.name, box: got.box });
    const pad = 10, bx = got.box;
    const clip = { x: Math.max(0, bx.x - pad), y: Math.max(0, bx.y - pad), width: Math.min(W, bx.w + pad * 2), height: Math.min(H2, bx.h + pad * 2) };
    await H.page.screenshot({ path: `${H.out}/dryer-${d.id}-${W}.png`, clip });
    if (d.id === 'dryer-radio' || d.id === 'dryer-woodgrain') await H.shot(`dryers-room-${d.id}-${W}.png`);
  }
  ok(!bad.length, `every dryer's materials in the page are what its look says${bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''}`);
  // THE TAG LAW: no room tag over the dryer's door or its control strip, where a finish puts its plate. The ledge's
  // tag sat on the strip from phase 2 until the 6.1 pictures showed the Heat Pump's screen under it.
  await H.frames(4);
  const cover = await D(() => {
    const R = window.TUMBLE.game.render, F = R.dryerFront, e = R.dryerGroup.matrixWorld.elements;
    const P = (x, y, z) => R.project({ x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14] });
    const rect = (x0, y0, x1, y1) => { const a = P(x0, y1, 0.03), b = P(x1, y0, 0.03); return { l: a.x, t: a.y, r: b.x, b: b.y }; };
    const parts = { strip: rect(-F.W + 0.02, F.yt - 0.1025, F.W - 0.02, F.yt - 0.0175), door: rect(-0.194, 0.106, 0.194, F.doorTop) };
    const tags = [...document.querySelectorAll('#spots .hotspot .tag')].map((t) => ({ name: t.textContent, r: t.getBoundingClientRect() })).filter((t) => t.r.width > 0);
    const hits = [];
    for (const t of tags) for (const [k, p] of Object.entries(parts)) if (t.r.left < p.r && t.r.right > p.l && t.r.top < p.b && t.r.bottom > p.t) hits.push(`${t.name} over the ${k}`);
    return { hits, n: tags.length, strip: parts.strip };
  });
  ok(cover.n >= 5 && !cover.hits.length, `no room tag covers the dryer's door or control strip (${cover.n} tags${cover.hits.length ? ': ' + cover.hits.join(', ') : ''})`);

  // and from the TABLE, where she looks at the machine all through a Load: the dryer is big at the top of the frame
  // the room's title and wallet leave with the room, as they do when a Load starts
  await D(() => { window.TUMBLE.screens.showRoom(false); window.TUMBLE.game.render.setView('table'); });
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'table');
  for (const d of dryers) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.screens.refresh(); }, d.id);
    await H.frames(3);
    const box = await D(() => {
      const R = window.TUMBLE.game.render, e = R.dryerGroup.matrixWorld.elements, P = (x, y, z) => R.project({ x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14] });
      const a = P(-0.4, 0.74, 0.03), b = P(0.4, 0.1, 0.03);
      return { x: Math.max(0, Math.round(a.x)), y: Math.max(0, Math.round(a.y)), w: Math.round(b.x - a.x), h: Math.round(b.y - a.y) };
    });
    await H.page.screenshot({ path: `${H.out}/dryer-table-${d.id}-${W}.png`, clip: { x: box.x, y: box.y, width: Math.min(W - box.x, box.w), height: Math.min(H2 - box.y, box.h) } });
  }
  await D(() => window.TUMBLE.showRoom());
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  const box = crops[0].box;
  ok(box.x >= 0 && box.x + box.w <= W && box.y >= 0 && box.w > 80, `the dryer is in the room's frame (${JSON.stringify(box)})`);
  writeFileSync(`${H.out}/dryers-${W}.json`, JSON.stringify(crops.map((c) => ({ name: c.name, file: `dryer-${dryers[crops.indexOf(c)].id}-${W}.png` })), null, 1));

  // the radio: a station on, The One With the Radio equipped, and the station goes through its speaker
  const radioItem = await D(() => (window.TUMBLE.data.unlocks.items.find((i) => i.cat === 'radio') || {}).id);
  await D(() => window.TUMBLE.audio.unlock && window.TUMBLE.audio.unlock());
  const through = async (id) => {
    await D((id, r) => { const app = window.TUMBLE; app.save.equipped.radio = r; app.save.equipped.dryer = id; app.screens.refresh(); app._beds(); }, id, radioItem);
    return D(() => { const A = window.TUMBLE.audio; return { on: !!A.radioThrough, ctx: !!A.ctx, music: !!A.musicOn }; });
  };
  const withRadio = await through('dryer-radio'), without = await through('dryer-standard');
  ok(withRadio.on && !without.on, `a station plays through The One With the Radio and not through the standard dryer (${JSON.stringify(withRadio)}, ${JSON.stringify(without)})`);

  // behaviour comes from data now: the Industrial still takes bigger Loads, a finish takes a Regular one
  const sizes = {};
  for (const id of ['dryer-industrial', 'dryer-seaglass']) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.dryer = id; app.save.equipped.radio = null; app.screens.refresh(); app.start({ mode: 'laundry', size: 'regular', tier: 2, seed: 'dryers-' + id }); }, id);
    await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play');
    sizes[id] = await D(() => window.TUMBLE.game.load.pairs.length);
    await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.showRoom(); });
    await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  }
  ok(sizes['dryer-industrial'] === sizes['dryer-seaglass'] + 5, `the Industrial still takes bigger Loads and a finish a Regular one (${sizes['dryer-industrial']} and ${sizes['dryer-seaglass']} pairs)`);
  // the radio plays real files now (23 Sep) and this server has none: a song's 404 is not the game's fault
  const errs = H.errors.filter((e) => !/favicon|music\/v1/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'dryer shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `dryer shots: ${fails.length} FAILED` : `dryer shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
