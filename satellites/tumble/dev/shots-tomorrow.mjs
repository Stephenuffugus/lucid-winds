// TOMORROW IN THE ROOM (DESIGN-T2 phase 8). tests/tomorrow.test.mjs holds the generator; this holds the page:
//   THE NOTE: with someone waiting in the Odd Bin and a next seed that brings a mate home, a note stands in the Bin and
//     its words head the Odd Bin's sheet; then the door starts the Load and it IS that seed and the mate DOES come home
//     (a new seed is rolled for the Load after); with a seed that does not, there is no note
//   THE FOLD: a finished Load leaves the pairs she put in the basket rolled on the dryer top, painted as themselves,
//     clear of the coin jar and the shelf; the next Load puts them away
//   THE CAT: each of its spots, day by day, stands clear of everything in the room and on the phone, not under a button
// and it shoots each of them from where she stands, at the phone's width.
//   node dev/shots-tomorrow.mjs [w h]      (412 915 by default)
import { harness, sleep } from '../tools/harness.mjs';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8794, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 120000) => H.page.waitForFunction(f, { timeout: ms, polling: 250 }, arg).then(() => true, () => false);
const roomSettled = () => until(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room');
// world boxes of the meshes of a group, and of everything else in the room, for "does it stand inside anything"
const BOXES = () => {
  window.__name = (m) => { const chain = []; let p = m; while (p && chain.length < 4) { if (p.name) chain.push(p.name); p = p.parent; } return (chain.join('<') || '') + '[' + (m.geometry && m.geometry.type) + (m.material && m.material.color ? ' #' + m.material.color.getHexString() : '') + ']'; };
  window.__box = (o) => {
    o.updateMatrixWorld(true);
    const out = [];
    o.traverse((m) => {
      if (!m.isMesh || !m.visible || !m.geometry || !m.geometry.attributes.position) return;
      const a = m.geometry.attributes.position.array, e = m.matrixWorld.elements;
      const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
      for (let i = 0; i < a.length; i += 3) {
        const x = a[i], y = a[i + 1], z = a[i + 2];
        const w = [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]];
        for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], w[k]); b[k + 3] = Math.max(b[k + 3], w[k]); }
      }
      out.push({ m, b });
    });
    return out;
  };
};
const project = (grp) => D((name) => {
  const R = window.TUMBLE.game.render, g = R.scene.getObjectByName(name);
  if (!g) return null;
  const bx = window.__box(g);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const { b } of bx) for (const x of [b[0], b[3]]) for (const y of [b[1], b[4]]) for (const z of [b[2], b[5]]) { const p = R.project({ x, y, z }); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}, grp);

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1', 'room', 300000);
  ok(await roomSettled(), 'the room settles');
  await D(BOXES);
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });

  // ---------- THE NOTE ----------
  // one sock waiting in the Bin, and the first next seed that brings it home, and the first that does not
  const found = await D(async () => {
    const app = window.TUMBLE, s = app.save;
    // a real sock: the first pair of a Load the game's own generator makes
    const { generateLoad } = await import('./src/loadgen.js');
    const sock = generateLoad({ seed: 'tomorrow-bin', mode: 'laundry', size: 'regular', tier: 2 }).pairs[0].seed;
    s.oddBin = [{ sockSeed: sock, waitingSince: Date.now(), loadsWaited: 1 }];
    let yes = null, no = null;
    for (let i = 0; i < 80 && (!yes || !no); i++) {
      s.nextSeed = 'load|tomorrow|' + i; app._noteKey = null;
      const n = app.oddBinNote();
      if (n && !yes) yes = { seed: s.nextSeed, note: n };
      if (!n && !no) no = s.nextSeed;
    }
    return { yes, no, sock: s.oddBin[0].sockSeed };
  });
  ok(!!(found.yes && found.no), `a next seed that brings a mate home (${found.yes && found.yes.seed}) and one that does not (${found.no})`);
  await D((seed) => { const app = window.TUMBLE; app.save.nextSeed = seed; app._noteKey = null; app.screens.refresh(); }, found.yes.seed);
  await H.frames(3);
  const inRoom = await D(() => { const R = window.TUMBLE.game.render; return R.binNote ? R.binNote.userData.text : null; });
  ok(inRoom === found.yes.note, `with a mate one Load away, a note stands in the Odd Bin ("${inRoom}")`);
  await H.shot(`tomorrow-note-room-${W}.png`);
  await D(() => window.TUMBLE.screens.open('oddbin'));
  const sheetNote = await until(() => { const p = document.querySelector('#sheetBody .binnote'); return !!p; }, null, 30000) && await D(() => document.querySelector('#sheetBody .binnote').textContent);
  ok(sheetNote === found.yes.note, `and its words head the Odd Bin's sheet ("${sheetNote}")`);
  await sleep(4000);
  await H.shot(`tomorrow-note-sheet-${W}.png`);
  await D(() => window.TUMBLE.ui.closeSheet && window.TUMBLE.ui.closeSheet(true));
  // the door starts the Load: it is the foretold seed, and the mate comes home
  await D(() => { const app = window.TUMBLE; app.start({ mode: 'laundry', size: app.save.profile.lastSize || 'regular' }); });
  ok(await until(() => window.TUMBLE_DEV && window.TUMBLE_DEV.state === 'play', null, 300000), 'the door starts the next Load');
  const played = await D(() => { const g = window.TUMBLE.game; return { seed: g.load.seed, reunion: g.load.odd.filter((o) => o.reunion).map((o) => o.seed), next: window.TUMBLE.save.nextSeed, note: !!g.render.binNote }; });
  ok(played.seed === found.yes.seed && played.reunion.includes(found.sock), `the Load the door starts IS the foretold one and brings the mate home (${JSON.stringify(played)})`);
  ok(played.next && played.next !== found.yes.seed && !played.note, 'a new seed is rolled for the Load after, and the note has gone');

  // ---------- THE FOLD ----------
  ok(await D(() => !window.TUMBLE.game.render.fold), 'no folded laundry on the dryer while a Load is on');
  const made = [];
  for (let i = 0; i < 4; i++) {
    const b = await D(() => window.TUMBLE_DEV.matchPair());
    if (b === null) break;
    const before = await D(() => { const s = window.TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed; });
    await D((id) => window.TUMBLE_DEV.lobBall(id), b);
    await until((n) => { const s = window.TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed > n; }, before);
    made.push(b);
  }
  await D(() => window.TUMBLE.game.beginSweep());
  ok(await until(() => window.TUMBLE.game.state === 'results' || window.TUMBLE.game.state === 'room', null, 120000), 'the Load ends');
  const last = await D(() => window.TUMBLE.save.lastLoad);
  ok(last && last.balls.length >= 1 && last.balls.length <= 5, `the pairs she put in the basket are kept for the dryer top (${last && last.balls.length})`);
  // back to the room the way she goes: the results' Room button, once it is on screen and still. ⛔ The first run
  // called showRoom() under the results sheet, the fold and cat checks passed on geometry, and every picture of them
  // was the results sheet (a green check is not a look)
  const roomBtn = await until(() => { const b = document.getElementById('rRoom'); if (!b) return false; const q = b.getBoundingClientRect(), k = Math.round(q.x) + ',' + Math.round(q.y), same = window.__rAt === k; window.__rAt = k; return same && q.bottom <= innerHeight && q.top >= 0; }, null, 120000);
  ok(roomBtn, 'the results offer the way back to the room');
  const rb = await D(() => { const q = document.getElementById('rRoom').getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; });
  await H.tap(rb.x, rb.y);
  await roomSettled();
  ok(await until(() => !window.TUMBLE.ui.open, null, 30000), 'the results sheet has closed');   // (a closed sheet keeps its buttons in the page)
  await D(() => window.TUMBLE.screens.refresh());
  await H.frames(4);
  const fold = await D(() => {
    const R = window.TUMBLE.game.render, f = R.fold;
    if (!f) return null;
    const mine = window.__box(f).map((x) => x.b), others = [];
    for (const { m, b } of window.__box(R.scene)) { let p = m; let inside = false; while (p) { if (p === f) inside = true; p = p.parent; } if (!inside && m.name !== 'baseRug') others.push({ name: window.__name(m), b }); }
    const hit = [];
    for (const a of mine) for (const o of others) { const s = 0.004; if (a[0] + s < o.b[3] && a[3] - s > o.b[0] && a[1] + s < o.b[4] && a[4] - s > o.b[1] && a[2] + s < o.b[5] && a[5] - s > o.b[2]) hit.push(o.name); }
    return { n: f.children.length, painted: f.children.every((c) => !!c.material.map), hit: [...new Set(hit)] };
  });
  ok(fold && fold.n === last.balls.length && fold.painted, `back in the room, her pairs are folded on the dryer top, each painted as itself (${JSON.stringify(fold)})`);
  // the slab they lie on is under them by design; anything ELSE they pass through is a fault
  const through = fold ? fold.hit.filter((n) => !/top|slab|dryer|trim/i.test(n)) : [];
  ok(fold && !through.length, `the fold stands clear of the coin jar and the shelf${through.length ? ': through ' + through.join(', ') : ''}`);
  await H.shot(`tomorrow-fold-room-${W}.png`);

  // ---------- THE CAT ----------
  const catId = await D(() => { const app = window.TUMBLE, it = app.data.unlocks.items.find((i) => i.cat === 'decor' && i.look && i.look.slot === 'cat'); if (!it) return null; if (!app.save.unlocks.includes(it.id)) app.save.unlocks.push(it.id); if (!app.save.equipped.decor.includes(it.id)) app.save.equipped.decor.push(it.id); return it.id; });
  ok(!!catId, `the cat is in the room (${catId})`);
  const spots = [];
  for (let day = 0; day < 3; day++) {
    const r = await D((day) => {
      const app = window.TUMBLE, R = app.game.render; R._catDay = day; app.screens.refresh();
      let cat = null; R.scene.traverse((o) => { if (!cat && o.userData && o.userData.catSpot !== undefined) cat = o; });
      if (!cat) return null;
      cat.name = 'theCat';
      const mine = window.__box(cat).map((x) => x.b), others = [];
      for (const { m, b } of window.__box(R.scene)) { let p = m, inside = false; while (p) { if (p === cat) inside = true; p = p.parent; } if (!inside && !['baseRug'].includes(m.name) && (b[3] - b[0]) < 3 && (b[5] - b[2]) < 3) others.push({ name: window.__name(m), b }); }
      const hit = [];
      // the cat's body, shrunk a centimetre: it may lie ON things, never IN them
      for (const a of mine) for (const o of others) { const s = 0.01; if (a[0] + s < o.b[3] && a[3] - s > o.b[0] && a[1] + s < o.b[4] && a[4] - s > o.b[1] && a[2] + s < o.b[5] && a[5] - s > o.b[2]) hit.push(o.name); }
      return { spot: cat.userData.catSpot, hit: [...new Set(hit)] };
    }, day);
    await H.frames(3);
    const box = await project('theCat');
    // the buttons she can SEE (the room's own tap spots over the furniture are invisible and are not in the way)
    const buttons = await D(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent && !b.closest('.hotspot, #spots')).map((b) => { const q = b.getBoundingClientRect(); return { l: q.left, t: q.top, r: q.right, b: q.bottom, id: b.id || b.className }; }));
    const under = box ? buttons.filter((q) => box.x < q.r && box.x + box.w > q.l && box.y < q.b && box.y + box.h > q.t).length : 0;
    spots.push({ day, ...r, box });
    ok(r && r.spot === day && !r.hit.length, `day ${day}: the cat is in its spot ${r && r.spot} and inside nothing${r && r.hit.length ? ': through ' + r.hit.join(', ') : ''}`);
    ok(box && box.x >= 0 && box.x + box.w <= W && box.y >= 0 && box.y + box.h <= H2 && !under, `day ${day}: the cat is on the phone and under no button (${box && JSON.stringify({ x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.w), h: Math.round(box.h) })})`);
    await H.shot(`tomorrow-cat-${day}-${W}.png`);
  }
  ok(new Set(spots.map((s) => s.box && Math.round(s.box.x / 10))).size === 3, 'the cat has moved: three different places on three days');
  await D(() => { delete window.TUMBLE.game.render._catDay; });
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'tomorrow shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `tomorrow shots: ${fails.length} FAILED` : `tomorrow shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
