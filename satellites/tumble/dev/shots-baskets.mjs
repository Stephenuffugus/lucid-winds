// THE BASKETS ON THE TABLE (DESIGN-T2 phase 8): every basket in the shop equipped in turn, in the real room. For each
// it reads back what the page DREW and holds four things the Node test cannot see:
//   · the room shows the basket she has equipped (until 23 Sep it kept the last Load's until the next Load began)
//   · it is drawn at all (a style the renderer does not know draws NOTHING: an invisible basket)
//   · its front half stays inside R + 5.2 cm, the widest basket (the floatie's ring), which the hotel cart's clearance
//     law is built on (tests/arrivals.test.mjs); nothing leaves the table
//   · nothing stands in the ball's path: no part of it inside the middle of the opening, above the floor
// then plays one Load with the Enamel Wash Tub to prove the landing sound is wired, and crops every basket from the
// table camera and from the room for the contact sheet.
//   node dev/shots-baskets.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
import { BASKET, TABLE } from '../src/config.js';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8797, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const settle = (fn, arg, ms = 240000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);

// what the page drew for the basket: every vertex of every mesh in the basket group, relative to the basket's middle
const MEASURE = (C) => {
  const R = window.TUMBLE.game.render, g = R.basketGroup, r = R.basketRadius;
  g.updateMatrixWorld(true);
  let meshes = 0, verts = 0, front = 0, column = 0, off = 0, top = 0;
  const colR = r * 0.7;
  g.traverse((m) => {
    if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.position) return;
    if (m.material && (Array.isArray(m.material) ? m.material.every((x) => x.visible === false) : m.material.visible === false)) return;
    meshes++;
    const a = m.geometry.attributes.position.array, e = m.matrixWorld.elements;
    for (let i = 0; i < a.length; i += 3) {
      const x = a[i], y = a[i + 1], z = a[i + 2];
      const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
      const dx = wx - C.bx, dz = wz - C.bz, h = Math.hypot(dx, dz);
      verts++;
      if (dz > 0) front = Math.max(front, h);
      if (h < colR && wy > 0.03 && wy < C.bh + 0.15) column++;
      // off the table = beyond the rail's outer edge, or down inside the rail itself (overhanging the edge in the air,
      // like the floatie's ring over the rail, is fine)
      if (Math.abs(wx) > C.halfW + C.railT || (Math.abs(wx) > C.halfW && wy < C.railH) || wz < C.back) off++;
      top = Math.max(top, wy);
    }
  });
  return { meshes, verts, front: +front.toFixed(4), column, off, top: +top.toFixed(3), r, look: R.basketLook ? R.basketLook.style : null };
};

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1', 'room', 300000);
  ok(await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room'), 'the room settles');
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });
  const baskets = await D(() => window.TUMBLE.data.unlocks.items.filter((i) => i.cat === 'basket').map((i) => ({ id: i.id, name: i.name, look: i.look })));
  ok(baskets.length === 20, `twenty baskets in the shop (${baskets.length})`);
  const C = { bx: BASKET.x, bz: BASKET.z, bh: BASKET.height, halfW: TABLE.halfW, railT: TABLE.railT, railH: TABLE.railH, back: TABLE.back };
  const shown = [], empty = [], wide = [], inPath = [], offTable = [], sizes = [];
  for (const b of baskets) {
    // equip it the way the shop does, and let the room redraw
    await D((id) => { const app = window.TUMBLE; app.save.equipped.basket = id; app.screens.refresh(); }, b.id);
    await H.frames(3);
    const m = await D(MEASURE, C);
    sizes.push(`${b.name}: ${m.meshes} meshes, front ${(m.front * 100).toFixed(1)} cm`);
    if (m.look !== b.look.style) shown.push(`${b.name} (the room shows ${m.look})`);
    if (!m.meshes || !m.verts) empty.push(b.name);
    if (m.front > m.r + 0.052 + 0.002) wide.push(`${b.name} ${(m.front * 100).toFixed(1)} cm against ${((m.r + 0.052) * 100).toFixed(1)}`);
    if (m.column) inPath.push(`${b.name} (${m.column} points)`);
    if (m.off) offTable.push(`${b.name} (${m.off} points)`);
    const clip = await D((c) => {
      const R = window.TUMBLE.game.render, P = (x, y, z) => R.project({ x, y, z });
      const a = P(c.bx - 0.24, 0.42, c.bz), b = P(c.bx + 0.24, -0.02, c.bz + 0.2);
      return { x: Math.max(0, Math.round(a.x)), y: Math.max(0, Math.round(a.y)), w: Math.round(b.x - a.x), h: Math.round(b.y - a.y) };
    }, C);
    if (process.env.BASKETS_ONLY !== 'measure') await H.page.screenshot({ path: `${H.out}/basket-room-${b.id}-${W}.png`, clip: { x: clip.x, y: clip.y, width: Math.max(8, Math.min(W - clip.x, clip.w)), height: Math.max(8, Math.min(H2 - clip.y, clip.h)) } });
  }
  console.log('  info  ' + sizes.join(' · '));
  ok(!shown.length, `the room shows the basket she has equipped${shown.length ? ': ' + shown.slice(0, 5).join('; ') : ''}`);
  ok(!empty.length, `every basket is drawn${empty.length ? ': NOTHING drawn for ' + empty.join(', ') : ''}`);
  ok(!wide.length, `every basket's front half stays inside the widest basket's reach, R + 5.2 cm (the hotel cart's clearance)${wide.length ? ': ' + wide.join('; ') : ''}`);
  ok(!inPath.length, `nothing stands in the ball's path in any basket${inPath.length ? ': ' + inPath.join('; ') : ''}`);
  ok(!offTable.length, `no basket reaches off the table${offTable.length ? ': ' + offTable.join('; ') : ''}`);

  if (process.env.BASKETS_ONLY === 'measure') throw new Error('measure only (BASKETS_ONLY=measure): no crops, no Load');
  // from the TABLE, where she aims at it all through a Load
  await D(() => { window.TUMBLE.screens.showRoom(false); window.TUMBLE.game.render.setView('table'); });
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'table');
  for (const b of baskets) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.basket = id; app.screens.refresh(); }, b.id);
    await H.frames(3);
    const clip = await D((c) => {
      const R = window.TUMBLE.game.render, P = (x, y, z) => R.project({ x, y, z });
      const a = P(c.bx - 0.24, 0.42, c.bz - 0.2), b = P(c.bx + 0.24, -0.02, c.bz + 0.22);
      return { x: Math.max(0, Math.round(a.x)), y: Math.max(0, Math.round(a.y)), w: Math.round(b.x - a.x), h: Math.round(b.y - a.y) };
    }, C);
    await H.page.screenshot({ path: `${H.out}/basket-table-${b.id}-${W}.png`, clip: { x: clip.x, y: clip.y, width: Math.max(8, Math.min(W - clip.x, clip.w)), height: Math.max(8, Math.min(H2 - clip.y, clip.h)) } });
  }
  await D(() => window.TUMBLE.showRoom());
  await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');

  // the sound is wired: a Load with the Enamel Wash Tub lands in enamel, and the wicker one still in wicker
  const mats = {};
  for (const id of ['basket-tub', 'basket-wicker']) {
    await D((id) => { const app = window.TUMBLE; app.save.equipped.basket = id; app.screens.refresh(); app.start({ mode: 'laundry', size: 'small', tier: 1, seed: 'baskets-' + id }); }, id);
    await settle(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play');
    mats[id] = await D(() => window.TUMBLE.game.basketMat);
    await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.showRoom(); });
    await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
  }
  ok(mats['basket-tub'] === 'enamel' && mats['basket-wicker'] === 'wicker', `a Load with the Enamel Wash Tub lands in enamel, the wicker basket in wicker (${JSON.stringify(mats)})`);
  // THE SHOP, where she meets them: every new basket has its card, its name whole on the phone. The sheet slides
  // in over seconds on this renderer, and a sheet WAITING to slide is still too (the Drawer gate's lesson), so a
  // card counts as settled only when it is on screen AND has not moved between two looks.
  await D(() => { window.__shopAt = null; window.TUMBLE.screens.door('basket'); });
  const onScreen = (name = null) => H.page.waitForFunction((name) => {
    const bs = [...document.querySelectorAll('#sheetBody .txt b')], b = name ? bs.find((x) => x.textContent === name) : bs[0];
    if (!b) return false;
    const r = b.getBoundingClientRect(), k = Math.round(r.x) + ',' + Math.round(r.y);
    const still = window.__shopAt === k; window.__shopAt = k;
    return still && r.top >= 0 && r.bottom <= innerHeight;
  }, { timeout: 60000, polling: 500 }, name).then(() => true, () => false);
  ok(await onScreen(), 'the shop opens on the Baskets tab');
  await H.shot(`basket-shop-top-${W}.png`);
  const EIGHT = ['Enamel Wash Tub', 'Rope Coil Basket', 'The Open Suitcase', 'Little Red Wagon', 'Upside Down Umbrella', 'Brown Paper Grocery Bag', 'Wool Felt Bin', 'Sunday Bread Basket'];
  const cards = await D((names) => {
    const bs = [...document.querySelectorAll('#sheetBody .txt b')];
    return names.map((n) => { const b = bs.find((x) => x.textContent === n); if (!b) return { n, found: false }; const r = b.getBoundingClientRect(); return { n, found: true, whole: b.scrollWidth <= b.clientWidth + 1 && r.right <= innerWidth + 0.5 && r.left >= -0.5 }; });
  }, EIGHT);
  const bad = cards.filter((c) => !c.found || !c.whole);
  ok(!bad.length, `all eight new baskets have a card in the shop with the name whole at ${W} wide${bad.length ? ': ' + bad.map((c) => c.n + (c.found ? ' (cut)' : ' (missing)')).join(', ') : ''}`);
  await D(() => { window.__shopAt = null; const b = [...document.querySelectorAll('#sheetBody .txt b')].find((x) => x.textContent === 'Enamel Wash Tub'); if (b) b.scrollIntoView({ block: 'start' }); });
  ok(await onScreen('Enamel Wash Tub'), 'the new baskets scroll into view');
  await H.shot(`basket-shop-new-${W}.png`);
  await D(() => { window.__shopAt = null; const body = document.getElementById('sheetBody'); body.scrollTop = body.scrollHeight; });
  const last = await D(() => { const bs = [...document.querySelectorAll('#sheetBody .txt b')]; return bs.length ? bs[bs.length - 1].textContent : null; });
  ok(await onScreen(last), `the end of the Baskets tab settles (${last})`);
  await H.shot(`basket-shop-end-${W}.png`);
  await D(() => window.TUMBLE.ui.closeSheet && window.TUMBLE.ui.closeSheet());

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'basket shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `basket shots: ${fails.length} FAILED` : `basket shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
