// THE ROOM in the real page (DESIGN-T2 phase 3): the four new surfaces, the camera safe box, and the
// tabletop honesty check the Node fixture leans on.
//
// 3.1's line is "every slot gets a camera safe box and a screenshot test: nothing may hide the dryer, the
// basket's arc or a table edge". A surface cannot hide anything GEOMETRICALLY, it replaces a material, so
// what "hide" means for one is CONTRAST: this reads the REAL pixels off the canvas at the dryer, the table's
// near rail and the basket rim, and fails a look that flattens one of them into whatever is behind it.
//
// Law 4: never a fixed wait, assert the change then wait for the settled value. Law 6: it shoots a contact
// sheet and the pictures get opened.  node dev/gate-room.mjs
import { harness } from '../tools/harness.mjs';
import { readFileSync, writeFileSync } from 'fs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const U = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url), 'utf8'));
const SURFACES = ['wallpaper', 'floor', 'curtains', 'tabletop'];
const ITEMS = U.items.filter((i) => i.cat === 'decor' && i.look && SURFACES.includes(i.look.slot));
const MIN_DE = 9;   // below this a thing and its background read as one thing

// a representative look per slot for the contact sheet: the loudest one of each
const SHOOT = ['decor-wall-bloom', 'decor-floor-lino', 'decor-curtain-gingham', 'decor-table-felt'];
const RUGS = U.items.filter((i) => i.cat === 'decor' && i.look && i.look.slot === 'rug').map((i) => i.id);
const MARGIN = 12;   // px of floor a rug keeps either side of the phone

// THE ROOM'S LAYOUT, measured rather than looked for (added 23 Sep, after the first pictures of phase 3 were
// opened). Every one of these was IN a picture and no check had asked:
//   · the lamp came on at half past seven and the window went dark at eight, and the window never heard the
//     hour the room was given, so "the room at night" was shot with a dawn window in it;
//   · the Picnic Blanket and the runner ran off both sides of the phone;
//   · a rug she bought was laid ON the braided one, which showed round its edge;
//   · the radio shelf and its plant, the window sill, a ledge jar and a little shelf passed THROUGH a curtain,
//     the cork strip and two frame spots hid BEHIND one, and a second poster hung half off the phone.
async function layout(D, tag) {
  // 1. ONE CLOCK. The design's line is "a warm lamp after 8 pm", so quarter to eight is still day.
  const clock = await D(async () => {
    const app = window.TUMBLE, R = app.game.render;
    const out = [];
    for (const hr of [12, 19.75, 20.5, 2]) {
      const r = R.setHour(hr);
      app.screens.refresh();
      out.push({ hr, lamp: r.evening, win: R.windowNight });
    }
    app._applyHour();
    app.screens.refresh();
    return out;
  });
  const want = { 12: false, 19.75: false, 20.5: true, 2: true };
  ok(clock.every((c) => c.lamp === want[c.hr] && c.win === want[c.hr]), `${tag}: one clock, the lamp and the window agree (${clock.map((c) => `${c.hr}h lamp ${c.lamp} window ${c.win}`).join(', ')})`);

  // 1b. A CONTACT SHADOW FADES AS ITS SOCK RISES (7.7). The fade was once worked out and thrown away, so a
  //     falling sock cast a full dark shadow that grew and then vanished at 16 cm. Read back what the pool wrote.
  const sh = await D(() => {
    const R = window.TUMBLE.game.render, P = R.shadowPool;
    const n0 = P.n;
    P.n = 0;
    R.contact(0, 0.0, 0, 0.1); R.contact(0, 0.1, 0, 0.1); R.contact(0, 0.2, 0, 0.1);
    const a = P.mesh.instanceColor ? P.mesh.instanceColor.array : null;
    const out = { rest: a ? a[0] : null, lifted: a ? a[3] : null, n: P.n };
    P.n = n0;
    return out;
  });
  ok(sh.rest > 0.95 && sh.lifted > 0.3 && sh.lifted < 0.5 && sh.n === 2, `${tag}: a shadow fades as its sock rises (at rest ${sh.rest}, 10 cm up ${sh.lifted && sh.lifted.toFixed(2)}, 20 cm up casts none: ${sh.n === 2})`);

  // 2. EVERY RUG STAYS ON THE PHONE, measured on the real mesh, and replaces the braided one while it is down
  const rugs = await D((ids) => {
    const app = window.TUMBLE, R = app.game.render, s = app.save;
    const find = (f) => { let hit = null; R.room.traverse((o) => { if (!hit && f(o)) hit = o; }); return hit; };
    const base = () => find((o) => o.name === 'baseRug');
    const clearRugs = () => { s.equipped.decor = s.equipped.decor.filter((q) => { const o = app.item(q); return !(o && o.look && o.look.slot === 'rug'); }); };
    clearRugs();
    app.screens.refresh();
    const before = base() ? base().visible : null;
    const out = [];
    for (const id of ids) {
      if (!s.unlocks.includes(id)) s.unlocks.push(id);
      clearRugs();
      s.equipped.decor.push(id);
      app.screens.refresh();
      const mesh = find((o) => o.userData && o.userData.rug && o.visible);
      if (!mesh) { out.push({ id, missing: true }); continue; }
      mesh.updateWorldMatrix(true, false);
      const pos = mesh.geometry.attributes.position;
      const v = new mesh.position.constructor();
      let x0 = 1e9, x1 = -1e9;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
        const p = R.project(v);
        x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x);
      }
      out.push({ id, shape: mesh.userData.rug, x0: Math.round(x0), x1: Math.round(x1), base: base() ? base().visible : null });
    }
    clearRugs();
    app.screens.refresh();
    return { before, out, after: base() ? base().visible : null, w: R.w };
  }, RUGS);
  const off = rugs.out.filter((r) => r.missing || r.x0 < MARGIN || r.x1 > rugs.w - MARGIN);
  const widest = rugs.out.filter((r) => !r.missing).sort((a, b) => (a.x0 - (rugs.w - a.x1)) - (b.x0 - (rugs.w - b.x1)))[0];
  ok(rugs.out.length === RUGS.length && !off.length, `${tag}: all ${rugs.out.length} rugs keep ${MARGIN} px of floor either side${off.length ? ': ' + off.map((r) => r.missing ? `${r.id} has no mesh` : `${r.id} (${r.shape}) spans ${r.x0} to ${r.x1} of ${rugs.w}`).join(' | ') : ` (tightest ${widest.id}, ${widest.x0} to ${widest.x1} of ${rugs.w})`}`);
  ok(rugs.before === true && rugs.after === true && rugs.out.every((r) => r.base === false), `${tag}: a bought rug replaces the braided one and it comes back after (before ${rugs.before}, with a rug ${[...new Set(rugs.out.map((r) => r.base))].join('/')}, after ${rugs.after})`);

  // 3. THE ROOM'S LAYOUT LAW: nothing passes through another piece, nothing hides behind a curtain, and
  //    nothing hangs off the phone. The room is filled slot by slot to each slot's real cap, pass after pass
  //    until every item has stood in every spot it can take, with the finds ledge up in both of its states
  //    (loose things in its containers, then every set finished in its shadow box). A PIECE is one bought
  //    thing (its group is named with its item id) or one named fixture; a piece's own parts are never
  //    compared with each other, and a box shrunk by 3 mm lets a mug stand ON a shelf without counting.
  const lay = await D(async () => {
    const app = window.TUMBLE, R = app.game.render, s = app.save, THREE = await import('three');
    const { SLOT_CAP } = await import(new URL('src/screens.js', location.href).href);
    const keep = JSON.stringify({ decor: s.equipped.decor, finds: s.finds, sets: s.sets, unlocks: s.unlocks });
    // the Reunion gifts that stand in the room (DESIGN 9.6) are in every pass: they share the wall and the dresser
    for (const it of app.data.unlocks.items) if (it.cat === 'reunion' && it.look && ['oddEye', 'frame', 'portal'].includes(it.look.kind) && !s.unlocks.includes(it.id)) s.unlocks.push(it.id);
    const bySlot = {};
    for (const it of app.data.unlocks.items) {
      const L = it.look;
      if (it.cat !== 'decor' || !L || !L.slot || !SLOT_CAP[L.slot] || L.slot === 'rug' || L.slot === 'window') continue;
      (bySlot[L.slot] = bySlot[L.slot] || []).push(it.id);
    }
    const passes = Math.max(...Object.entries(bySlot).map(([k, v]) => Math.ceil(v.length / SLOT_CAP[k])));
    const F = app.data.finds;
    const ledges = [{ finds: F.items.slice(0, 9).map((f) => f.id), sets: [] }, { finds: F.items.map((f) => f.id), sets: F.sets.map((x) => x.id) }];
    app.game.settings.reduceMotion = true;   // the curtains hang square
    const through = new Set(), behind = new Set(), offscreen = new Set();
    let placed = 0;
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const v = new THREE.Vector3();
    for (let k = 0; k < passes; k++) {
      for (const L of ledges) {
        s.equipped.decor = [];
        for (const [slot, ids] of Object.entries(bySlot)) {
          const cap = SLOT_CAP[slot];
          for (const id of ids.slice(k * cap, k * cap + cap)) { if (!s.unlocks.includes(id)) s.unlocks.push(id); s.equipped.decor.push(id); }
        }
        placed = Math.max(placed, s.equipped.decor.length);
        s.finds = L.finds.slice(); s.sets = L.sets.slice();
        app.screens.refresh();
        R.room.traverse((o) => { if (o.userData && o.userData.side !== undefined) o.rotation.z = 0; });
        R.room.updateMatrixWorld(true);
        // the pieces: every child of the decor group (a bought thing or a Reunion gift, named with its item id),
        // the finds ledge's parts (one owner), the dryer, the radio shelf and the two curtains
        const pieces = [];
        const add = (o, name, owner, f = {}) => { const box = new THREE.Box3().setFromObject(o); if (!box.isEmpty()) pieces.push({ name, owner, box, ...f }); };
        let decorG = null, ledgeG = null;
        R.room.traverse((o) => {
          if (o.name === 'decorGroup') decorG = o;
          else if (o.name === 'findsLedge') ledgeG = o;
          else if ((o.name === 'dryer' || o.name === 'radioShelf') && shown(o)) add(o, o.name, o.name);
          else if (o.userData && o.userData.side !== undefined && shown(o)) { const n = o.userData.side < 0 ? 'left curtain' : 'right curtain'; add(o, n, n, { curtain: true }); }
        });
        if (decorG) for (const c of decorG.children) if (c.name && shown(c)) add(c, c.name, c.name, { decor: true });
        if (ledgeG && shown(ledgeG)) for (const c of ledgeG.children) if (shown(c)) add(c, 'findsLedge ' + (c.name || c.type), 'findsLedge', { decor: true });
        const inner = (b) => b.clone().expandByScalar(-0.003);
        for (let i = 0; i < pieces.length; i++) {
          for (let j = i + 1; j < pieces.length; j++) {
            const A = pieces[i], B = pieces[j];
            if (A.owner !== B.owner && inner(A.box).intersectsBox(inner(B.box))) through.add(`${A.name} through ${B.name}`);
          }
        }
        for (const c of pieces.filter((p) => p.curtain)) {
          for (const P of pieces) {
            if (P.curtain || P.box.max.z > c.box.min.z) continue;
            const ox = Math.min(P.box.max.x, c.box.max.x) - Math.max(P.box.min.x, c.box.min.x);
            const oy = Math.min(P.box.max.y, c.box.max.y) - Math.max(P.box.min.y, c.box.min.y);
            if (ox > 0.01 && oy > 0.01) behind.add(`${P.name} behind the ${c.name}`);
          }
        }
        for (const P of pieces.filter((p) => p.decor)) {
          const b = P.box;
          for (const x of [b.min.x, b.max.x]) for (const y of [b.min.y, b.max.y]) for (const z of [b.min.z, b.max.z]) {
            const q = R.project(v.set(x, y, z));
            if (q.x < 0 || q.x > R.w || q.y < 0 || q.y > R.h) { offscreen.add(`${P.name} (${Math.round(q.x)},${Math.round(q.y)} of ${R.w}x${R.h})`); break; }
          }
        }
      }
    }
    const k0 = JSON.parse(keep);
    s.equipped.decor = k0.decor; s.finds = k0.finds; s.sets = k0.sets; s.unlocks = k0.unlocks;
    app.game.settings.reduceMotion = false;
    app.screens.refresh();
    return { passes, placed, through: [...through], behind: [...behind], offscreen: [...offscreen] };
  });
  ok(lay.passes > 0 && lay.placed > 20, `${tag}: the room was filled (${lay.passes} passes, up to ${lay.placed} things at once)`);
  ok(!lay.through.length, `${tag}: nothing passes through anything${lay.through.length ? ': ' + lay.through.join(' | ') : ''}`);
  ok(!lay.behind.length, `${tag}: nothing hides behind a curtain${lay.behind.length ? ': ' + lay.behind.join(' | ') : ''}`);
  ok(!lay.offscreen.length, `${tag}: nothing bought hangs off the phone${lay.offscreen.length ? ': ' + lay.offscreen.join(' | ') : ''}`);
}

async function run(w, h, tag, { sweep = true, sheet = true, lay = false, only = false } = {}) {
  const H = await harness({ w, h });
  const D = (f, ...a) => H.page.evaluate(f, ...a);
  const settle = (fn, arg, ms = 120000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);
  try {
    // ?shots gives the renderer preserveDrawingBuffer, which is the only way to read what it actually drew
    await H.open('?nosw&turbo=1&shots&skipdump=1&load=laundry&size=small&tier=2&seed=roomgate', 'play', 300000);
    await D(() => { TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
    const inRoom = await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room' && !document.getElementById('roomWallet').hidden, null, 240000);
    ok(inRoom, `${tag}: the room is up and the camera has settled`);
    if (lay) await layout(D, tag);
    if (only) { await H.close(); return; }

    // the probe, and the three pairs the safe box is about
    await D(() => {
      window.__probe = (pts) => {
        const R = TUMBLE.game.render;
        const cv = R.r.domElement;
        const c2 = document.createElement('canvas');
        c2.width = cv.width; c2.height = cv.height;
        const g = c2.getContext('2d');
        g.drawImage(cv, 0, 0);
        const sx = cv.width / R.w, sy = cv.height / R.h;
        return pts.map((p) => {
          const s = R.project(p);
          const x = Math.round(s.x * sx), y = Math.round(s.y * sy);
          if (x < 2 || y < 2 || x >= cv.width - 2 || y >= cv.height - 2) return null;
          const d = g.getImageData(x - 2, y - 2, 5, 5).data;
          let r = 0, gg = 0, b = 0;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
          const n = d.length / 4;
          return [Math.round(r / n), Math.round(gg / n), Math.round(b / n)];
        });
      };
      // each pair is a THING and the surface right behind or under it, in world coordinates read from the
      // game's own config so a moved basket moves the probe with it
      const T = { halfW: 0.42, front: 0.60, back: -0.98 };
      window.__PAIRS = [
        // the dryer's face, and the wall a hand's width beside it
        ['dryer', { x: 0, y: 0.52, z: T.back + 0.02 }, { x: 0.62, y: 0.52, z: T.back }],
        // the table's near rail, and the floor just in front of it
        ['table edge', { x: -0.1, y: 0.02, z: T.front - 0.01 }, { x: -0.1, y: -0.76, z: T.front + 0.5 }],
        // the basket's rim, and the tabletop behind it
        ['basket rim', { x: 0.25, y: 0.20, z: -0.74 }, { x: 0.25, y: 0.001, z: -0.30 }],
      ];
      // the tabletop's painted average, for the honesty check against MAT_MARK
      window.__matAvg = () => {
        const R = TUMBLE.game.render;
        const m = R.matMat && R.matMat.map && R.matMat.map.image;
        if (!m) return null;
        const c2 = document.createElement('canvas');
        c2.width = 64; c2.height = 64;
        const g = c2.getContext('2d');
        g.drawImage(m, 0, 0, 64, 64);
        const d = g.getImageData(0, 0, 64, 64).data;
        let r = 0, gg = 0, b = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
        return [r / 4096, gg / 4096, b / 4096].map(Math.round);
      };
    });

    // 1. THE CAMERA SAFE BOX, for every one of the 24 surfaces. This is a COLOUR measurement and colour does
    //    not change with the viewport, so it runs at one width only: at both it timed the protocol out, 24
    //    round trips each waiting on a frame, on a renderer that draws about one a second.
    const bad = [];
    const seen = [];
    let worst = { d: 1e9 };
    for (const it of (sweep ? ITEMS : [])) {
      const r = await D(async (id) => {
        const app = window.TUMBLE;
        const s = app.save;
        if (!s.unlocks.includes(id)) s.unlocks.push(id);
        const item = app.item(id);
        s.equipped[item.look.slot] = id;
        app.screens.refresh();
        // the room repaints on the next frame; two of them, so the swap has certainly landed
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        const cols = window.__probe(window.__PAIRS.flatMap((p) => [p[1], p[2]]));
        return { id, slot: item.look.slot, name: item.name, cols, names: window.__PAIRS.map((p) => p[0]), mat: window.__matAvg() };
      }, it.id);
      // CIEDE2000 between each thing and its background, computed here rather than in the page
      const { deltaE } = await import('../engine/color.js');
      for (let k = 0; k < r.names.length; k++) {
        const a = r.cols[k * 2], b = r.cols[k * 2 + 1];
        if (!a || !b) { bad.push(`${r.name}: ${r.names[k]} is off screen`); continue; }
        const d = deltaE(a, b);
        if (d < worst.d) worst = { d, what: r.names[k], look: r.name };
        if (d < MIN_DE) bad.push(`${r.name} hides the ${r.names[k]} (dE ${d.toFixed(1)})`);
      }
      seen.push(r);
    }
    if (sweep) {
      ok(seen.length === ITEMS.length, `${tag}: all ${seen.length} surfaces put up and read`);
      ok(!bad.length, `${tag}: no surface hides the dryer, a table edge or the basket rim${bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ` (closest: ${worst.look} vs the ${worst.what}, dE ${worst.d.toFixed(1)}, floor ${MIN_DE})`}`);
    }

    // 2. THE TABLETOP AVERAGES ARE MEASURED HERE AND RECORDED. `tests/room.test.mjs` measures a sock's
    //    contrast against these numbers, so they have to be what the painter really draws, not a formula.
    //    Same shape as tests/golden-seeds.json: the gate re-measures every run and a drift is a red.
    if (sweep) {
      const measured = {};
      for (const r of seen.filter((x) => x.slot === 'tabletop')) {
        const look = U.items.find((i) => i.id === r.id).look;
        measured[look.pattern] = r.mat;
      }
      ok(Object.keys(measured).length === 6, `${tag}: every tabletop's painted average measured (${Object.entries(measured).map(([k, v]) => k + ' ' + v.join('/')).join(', ')})`);
      const recPath = new URL('../tests/mat-average.json', import.meta.url);
      let rec = null;
      try { rec = JSON.parse(readFileSync(recPath, 'utf8')); } catch (e) { rec = null; }
      if (!rec || process.env.RERECORD) {
        writeFileSync(recPath, JSON.stringify(measured, null, 1) + '\n');
        ok(true, `${tag}: recorded tests/mat-average.json for the first time (rerun to check it holds)`);
      } else {
        const drift = [];
        let maxOff = 0;
        for (const k of Object.keys(measured)) {
          const was = rec[k];
          if (!was) { drift.push(`${k} is new`); continue; }
          const off = Math.max(...measured[k].map((q, i) => Math.abs(q - was[i])));
          maxOff = Math.max(maxOff, off);
          if (off > 4) drift.push(`${k}: recorded ${was.join('/')}, painted ${measured[k].join('/')}`);
        }
        const gone = Object.keys(rec).filter((k) => !measured[k]);
        ok(!drift.length && !gone.length, `${tag}: the recorded tabletop averages still hold${drift.length || gone.length ? ': ' + drift.concat(gone.map((k) => k + ' is gone')).join(' | ') : ` (worst channel moved ${maxOff})`}`);
      }
    }

    // 3. the contact sheet: one loud look per slot, put up together, then each on its own
    if (!sheet) { /* the narrow run still shoots, see below */ }
    for (const id of SHOOT) {
      await D((x) => { const app = window.TUMBLE; app.save.equipped[app.item(x).look.slot] = x; app.screens.refresh(); }, id);
    }
    await settle(() => !TUMBLE.game.render.camAnim, null, 60000);
    await H.frames(4);
    await H.shot(`g-room-${tag}-loud.png`);
    // and back to nothing bought, which must look like the room she has always had
    await D(() => { const s = window.TUMBLE.save; for (const k of ['wallpaper', 'floor', 'curtains', 'tabletop']) s.equipped[k] = null; window.TUMBLE.screens.refresh(); });
    await H.frames(4);
    await H.shot(`g-room-${tag}-default.png`);
    // a quiet set, the kind a player actually lives with
    for (const id of ['decor-wall-ticking', 'decor-floor-cork', 'decor-curtain-lace', 'decor-table-linen']) {
      await D((x) => { const app = window.TUMBLE; app.save.equipped[app.item(x).look.slot] = x; app.screens.refresh(); }, id);
    }
    await H.frames(4);
    await H.shot(`g-room-${tag}-quiet.png`);

    // 3b. THE RUGS AND THE WINDOWS (3.2, 3.3), looked at. One rug per SHAPE, because the shape is the thing
    //     this line added and a picture is the only way to see a mesh follow it. Three windows: the one that
    //     moves, the one that is all sky, and the one that is all dark.
    if (sheet) {
      const clearSurfaces = () => D(() => { const s2 = window.TUMBLE.save; for (const k of ['wallpaper', 'floor', 'curtains', 'tabletop']) s2.equipped[k] = null; });
      await clearSurfaces();
      const put = (id) => D((x) => {
        const app = window.TUMBLE, s2 = app.save;
        if (!s2.unlocks.includes(x)) s2.unlocks.push(x);
        const it = app.item(x);
        s2.equipped.decor = s2.equipped.decor.filter((q) => { const o = app.item(q); return !(o && o.look && o.look.slot === it.look.slot); });
        s2.equipped.decor.push(x);
        app.screens.refresh();
      }, id);
      for (const [id, tagn] of [['decor-rug-shag', 'round'], ['decor-rug-medallion', 'oval'], ['decor-rug-picnic', 'rect'], ['decor-rug-moon', 'runner']]) {
        await put(id);
        await H.frames(3);
        await H.shot(`g-room-${tag}-rug-${tagn}.png`);
      }
      for (const [id, tagn] of [['decor-window-train', 'train'], ['decor-window-dawn', 'dawn'], ['decor-window-porch', 'porch']]) {
        await put(id);
        await H.frames(3);
        await H.shot(`g-room-${tag}-win-${tagn}.png`);
      }
      // the two that move really have a mover mesh in the room, and it is in the window.
      // ⛔ The moving window has to be the one that is UP when this is read. The first version checked after
      // the loop, by which time the porch window was up, and read a hidden mover with a stale kind on it.
      await put('decor-window-train');
      await H.frames(3);
      const mv = await D(() => {
        const R = window.TUMBLE.game.render;
        let found = null;
        window.TUMBLE.screens.room.group.traverse((o) => { if (o.userData && o.userData.kind) found = o; });
        if (!found) return null;
        found.updateWorldMatrix(true, false);
        const m = found.matrixWorld.elements;
        const p = R.project({ x: m[12], y: m[13], z: m[14] });
        return { kind: found.userData.kind, visible: found.visible, x: Math.round(p.x), y: Math.round(p.y), w: R.w, h: R.h };
      });
      ok(!!mv && mv.visible, `${tag}: the moving window has a mover in the room (${mv ? mv.kind : 'none'})`);
      ok(mv && mv.x > 0 && mv.x < mv.w && mv.y > 0 && mv.y < mv.h, `${tag}: and it is in frame at ${mv ? mv.x + ',' + mv.y + ' of ' + mv.w + 'x' + mv.h : 'nowhere'}`);
    }

    // 4. The curtains sway, and reduceMotion stops them dead. ⛔ The first version of this slept 900 ms and
    //    compared: on this renderer that is ZERO frames, so it measured nothing and reported "moved 0.0000".
    //    Law 4, broken by the gate that quotes it. Frames are DRIVEN now.
    const curN = await D(() => {
      const cur = [];
      window.TUMBLE.screens.room.group.traverse((o) => { if (o.userData && o.userData.side !== undefined) cur.push(o); });
      window.__cur = cur;
      return cur.length;
    });
    ok(curN === 2, `${tag}: there are two curtains (${curN})`);
    const readZ = () => D(() => window.__cur.map((c) => c.rotation.z));
    const z0 = await readZ();
    await H.frames(12);
    const z1 = await readZ();
    const moved = Math.max(...z0.map((v, i) => Math.abs(v - z1[i])));
    ok(moved > 0.002, `${tag}: they sway (moved ${moved.toFixed(4)} rad over twelve frames, from ${z0.map((v) => v.toFixed(3)).join(' and ')})`);
    ok(Math.max(...z1.map(Math.abs)) < 0.06, `${tag}: and never lean more than a curtain leans (max ${Math.max(...z1.map(Math.abs)).toFixed(3)} rad)`);
    await D(() => { window.TUMBLE.game.settings.reduceMotion = true; });
    await H.frames(6);
    const zA = await readZ();
    await H.frames(6);
    const zB = await readZ();
    const drift2 = Math.max(...zA.map((v, i) => Math.abs(v - zB[i])));
    ok(drift2 < 0.0005 && Math.max(...zB.map(Math.abs)) < 0.0005, `${tag}: reduceMotion stops them dead and square (drift ${drift2.toFixed(5)}, rest ${Math.max(...zB.map(Math.abs)).toFixed(5)})`);
    await D(() => { window.TUMBLE.game.settings.reduceMotion = false; });

    const errs = H.errors.filter((e) => !/favicon/.test(e));
    ok(errs.length === 0, `${tag}: no console errors ` + errs.join(' | '));
  } catch (e) {
    ok(false, `${tag}: gate crashed: ${e.message}`);
  }
  await H.close();
}

// ⛔ THREE SHORT PAGE SESSIONS, NOT ONE LONG ONE. Doing the 24 surface sweep and the seven shots in one
// session timed the devtools protocol out at 412: on this renderer each `evaluate` that waits for a frame
// can take seconds, and the harness gives the protocol four minutes for any one call. Each run below opens
// its own page and does one job.
// `ROOM_ONLY=layout node dev/gate-room.mjs` runs just the layout checks at both widths (two short sessions)
if (process.env.ROOM_ONLY === 'layout') {
  await run(412, 915, '412', { sweep: false, sheet: false, lay: true, only: true });
  await run(360, 740, '360', { sweep: false, sheet: false, lay: true, only: true });
} else {
  await run(412, 915, '412', { sweep: true, sheet: false });              // the safe box, and the recorded mat averages
  await run(412, 915, '412s', { sweep: false, sheet: true, lay: true });  // the layout, the rugs, the windows and the contact sheet
  await run(360, 740, '360', { sweep: false, sheet: false, lay: true });  // the narrow width: the layout, the room, and the curtains
}
console.log(fails.length ? `room gate: ${fails.length} FAILED` : 'room gate: all passed');
process.exitCode = fails.length ? 1 : 0;
