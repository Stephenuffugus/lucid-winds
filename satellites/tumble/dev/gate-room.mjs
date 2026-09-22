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
import { readFileSync } from 'fs';

const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const U = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url), 'utf8'));
const SURFACES = ['wallpaper', 'floor', 'curtains', 'tabletop'];
const ITEMS = U.items.filter((i) => i.cat === 'decor' && i.look && SURFACES.includes(i.look.slot));
const MIN_DE = 9;   // below this a thing and its background read as one thing

// a representative look per slot for the contact sheet: the loudest one of each
const SHOOT = ['decor-wall-bloom', 'decor-floor-lino', 'decor-curtain-gingham', 'decor-table-felt'];

async function run(w, h, tag) {
  const H = await harness({ w, h });
  const D = (f, ...a) => H.page.evaluate(f, ...a);
  const settle = (fn, arg, ms = 120000) => H.page.waitForFunction(fn, { timeout: ms, polling: 400 }, arg).then(() => true, () => false);
  try {
    // ?shots gives the renderer preserveDrawingBuffer, which is the only way to read what it actually drew
    await H.open('?nosw&turbo=1&shots&skipdump=1&load=laundry&size=small&tier=2&seed=roomgate', 'play', 300000);
    await D(() => { TUMBLE.game.abandonLoad(); TUMBLE.showRoom(); });
    const inRoom = await settle(() => !TUMBLE.game.render.camAnim && TUMBLE.game.render.view === 'room' && !document.getElementById('roomWallet').hidden, null, 240000);
    ok(inRoom, `${tag}: the room is up and the camera has settled`);

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

    // 1. THE CAMERA SAFE BOX, for every one of the 24 surfaces
    const bad = [];
    const seen = [];
    let worst = { d: 1e9 };
    for (const it of ITEMS) {
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
    ok(seen.length === ITEMS.length, `${tag}: all ${seen.length} surfaces put up and read`);
    ok(!bad.length, `${tag}: no surface hides the dryer, a table edge or the basket rim${bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ` (closest: ${worst.look} vs the ${worst.what}, dE ${worst.d.toFixed(1)}, floor ${MIN_DE})`}`);

    // 2. THE HONESTY CHECK the Node fixture leans on: its MAT_MARK says how much `line` a pattern mixes over
    //    `base`. If the painter and that constant drift apart, the contrast fixture is measuring a fiction.
    const src = readFileSync(new URL('../src/textures.js', import.meta.url), 'utf8');
    const mm = src.match(/export const MAT_MARK = \{([^}]*)\}/);
    const MARK = {};
    for (const part of mm[1].split(',')) { const [k, v] = part.split(':').map((x) => x.trim()); if (k) MARK[k] = Number(v); }
    const drift = [];
    let maxDrift = 0;
    for (const r of seen.filter((x) => x.slot === 'tabletop')) {
      const look = U.items.find((i) => i.id === r.id).look;
      const k = MARK[look.pattern] || 0;
      const predicted = look.base.map((q, i) => q + (look.line[i] - q) * k);
      const off = Math.max(...predicted.map((q, i) => Math.abs(q - r.mat[i])));
      maxDrift = Math.max(maxDrift, off);
      if (off > 14) drift.push(`${r.name}: MAT_MARK says ${predicted.map(Math.round)}, the painter drew ${r.mat}`);
    }
    ok(!drift.length, `${tag}: MAT_MARK matches what the painter really draws${drift.length ? ': ' + drift.join(' | ') : ` (worst channel off by ${maxDrift.toFixed(1)} of 255)`}`);

    // 3. the contact sheet: one loud look per slot, put up together, then each on its own
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

    // 4. the curtains sway, and reduceMotion stops them dead
    const sway = await D(async () => {
      const room = window.TUMBLE.screens.room;
      const cur = [];
      room.group.traverse((o) => { if (o.userData && o.userData.side !== undefined) cur.push(o); });
      if (cur.length !== 2) return { n: cur.length };
      const a = cur.map((c) => c.rotation.z);
      await new Promise((res) => setTimeout(res, 900));
      const b = cur.map((c) => c.rotation.z);
      window.TUMBLE.game.settings.reduceMotion = true;
      await new Promise((res) => setTimeout(res, 700));
      const c0 = cur.map((c) => c.rotation.z);
      await new Promise((res) => setTimeout(res, 500));
      const c1 = cur.map((c) => c.rotation.z);
      window.TUMBLE.game.settings.reduceMotion = false;
      return { n: cur.length, moved: Math.max(...a.map((v, i) => Math.abs(v - b[i]))), still: Math.max(...c0.map((v, i) => Math.abs(v - c1[i]))), rest: Math.max(...c1.map(Math.abs)) };
    });
    ok(sway.n === 2, `${tag}: there are two curtains (${sway.n})`);
    ok(sway.moved > 0.002, `${tag}: they sway (moved ${(sway.moved || 0).toFixed(4)} rad in under a second)`);
    ok(sway.still < 0.0005 && sway.rest < 0.0005, `${tag}: and reduceMotion stops them dead and square (drift ${(sway.still || 0).toFixed(5)}, rest ${(sway.rest || 0).toFixed(5)})`);

    const errs = H.errors.filter((e) => !/favicon/.test(e));
    ok(errs.length === 0, `${tag}: no console errors ` + errs.join(' | '));
  } catch (e) {
    ok(false, `${tag}: gate crashed: ${e.message}`);
  }
  await H.close();
}

await run(412, 915, '412');
await run(360, 740, '360');
console.log(fails.length ? `room gate: ${fails.length} FAILED` : 'room gate: all passed');
process.exitCode = fails.length ? 1 : 0;
