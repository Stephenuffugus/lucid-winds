// THE BALLS AND THE TRAILS IN THE GAME (DESIGN-T2 phase 8). tests/balltrail.test.mjs holds the shapes and the numbers;
// this holds what the page DRAWS from them, in a real Load:
//   · every trail has a sprite of its own (a kind textures.js does not know draws the SPARKLE: a silent twin)
//   · every trail leaves sprites behind a flying ball (caught mid flight, paused, counted, shot)
//   · every ball style's mesh is built from src/balls.js (its reach read back from the page against Node's)
//   · every ball style and trail has an icon of its own in the shop (an unknown one gets the shared ball or trail)
// and it shoots each ball style on the table and in her hand, and each trail in the air.
//   node dev/shots-balls.mjs [w h]      (412 915 by default)
import { harness } from '../tools/harness.mjs';
import { BALL_STYLES, ballVertex } from '../src/balls.js';
import { TRAILS, trailPerShot } from '../src/trails.js';
import { PHYS } from '../src/config.js';

const W = Number(process.argv[2] || 412);
const H2 = Number(process.argv[3] || 915);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const H = await harness({ w: W, h: H2, port: 8796, dpr: 1 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 60000) => H.page.waitForFunction(f, { timeout: ms, polling: 150 }, arg).then(() => true, () => false);
const r = PHYS.ball.radius;
// what Node says each style reaches: the furthest point of its mesh from the middle, as a fraction of r
const REACH = Object.fromEntries(BALL_STYLES.map((k) => {
  let m = 0;
  for (let a = 0; a < 36; a++) for (let b = 0; b <= 24; b++) {
    const th = (a / 36) * Math.PI * 2, ph = (b / 24) * Math.PI;
    const v = ballVertex(k, r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th), r);
    m = Math.max(m, Math.hypot(v[0], v[1], v[2]) / r);
  }
  return [k, m];
}));
const clip = (b, pad = 0) => ({ x: Math.max(0, Math.round(b.x - pad)), y: Math.max(0, Math.round(b.y - pad)), width: Math.max(8, Math.round(Math.min(W - Math.max(0, b.x - pad), b.w + 2 * pad))), height: Math.max(8, Math.round(Math.min(H2 - Math.max(0, b.y - pad), b.h + 2 * pad))) });

try {
  await H.page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private mode */ } });
  await H.open('?nosw&turbo=1&unlockall=1&skipdump=1&load=laundry&size=regular&tier=0&seed=balls1', 'play', 300000);
  await D(() => { const s = window.TUMBLE.save; for (const k of Object.keys(s.seen || {})) s.seen[k] = true; window.TUMBLE.ui.hideHint(); });

  // ---------- a sprite of its own for every trail ----------
  const kinds = Object.keys(TRAILS);
  const sprites = await D((kinds) => {
    const R = window.TUMBLE.game.render, out = {};
    for (const k of kinds) {
      R.setTrail(k);
      const img = R.trail.material.uniforms.uMap.value.image, d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
      let h = 2166136261; for (let i = 3; i < d.length; i += 4) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; }
      out[k] = h;
    }
    R.setTrail(null);
    return out;
  }, kinds);
  const twins = kinds.filter((k) => k !== 'sparkle' && sprites[k] === sprites.sparkle);
  ok(!twins.length && new Set(Object.values(sprites)).size === kinds.length, `every trail has a sprite of its own (${kinds.length})${twins.length ? ': the SPARKLE is drawn for ' + twins.join(', ') : ''}`);

  // ---------- every ball style is built from src/balls.js ----------
  const built = {}, badMesh = [];
  for (const k of BALL_STYLES) {
    built[k] = await D(([k, rr]) => {
      const R = window.TUMBLE.game.render; R.setBallStyle(k);
      const a = R.ballPool.mesh.geometry.attributes.position.array;
      let m = 0; for (let i = 0; i < a.length; i += 3) m = Math.max(m, Math.hypot(a[i], a[i + 1], a[i + 2]) / rr);
      return m;
    }, [k, r]);
    if (Math.abs(built[k] - REACH[k]) > 0.01) badMesh.push(`${k} reaches ${built[k].toFixed(3)} in the page, ${REACH[k].toFixed(3)} in Node`);
  }
  ok(!badMesh.length, `every ball style's mesh in the page is the shape src/balls.js says (${BALL_STYLES.length})${badMesh.length ? ': ' + badMesh.join('; ') : ''}`);

  // ---------- each ball style on the table and in her hand ----------
  const ballId = await D(() => window.TUMBLE_DEV.matchPair());
  ok(ballId !== null, 'a pair rolls into a ball');
  await until((id) => window.TUMBLE_DEV.entState(id) === 'table', ballId);
  for (const k of BALL_STYLES) {
    await D((k) => window.TUMBLE.game.render.setBallStyle(k), k);
    await H.frames(3);
    const b = await D((id) => { const R = window.TUMBLE.game.render, e = window.TUMBLE.game.table.ents.get(id), p = R.project(e.drawn); return { x: p.x - 60, y: p.y - 60, w: 120, h: 120 }; }, ballId);
    await H.page.screenshot({ path: `${H.out}/ball-table-${k}-${W}.png`, clip: clip(b) });
    await D((id) => window.TUMBLE.game.play.toPocket(window.TUMBLE.game.table.ents.get(id)), ballId);
    await until((id) => window.TUMBLE_DEV.entState(id) === 'pocket', ballId);
    await H.frames(4);
    const hb = await D((id) => { const R = window.TUMBLE.game.render, e = window.TUMBLE.game.table.ents.get(id); const p = R.project(e.viewPose || e.drawn); return { x: p.x - 160, y: p.y - 160, w: 320, h: 320 }; }, ballId);
    await H.page.screenshot({ path: `${H.out}/ball-held-${k}-${W}.png`, clip: clip(hb) });
    await D(() => window.TUMBLE.game.play.putDown({ x: 0, z: 0.2 }));
    await until((id) => window.TUMBLE_DEV.entState(id) === 'table', ballId);
  }
  await D(() => window.TUMBLE.game.render.setBallStyle('tight'));
  if (process.env.BALLS_ONLY === 'balls') throw new Error('balls only (BALLS_ONLY=balls): no trails, no shop');

  // ---------- each trail behind a ball in the air ----------
  // at a phone's frame rate, not the gate's: turbo lets one slow software frame carry a quarter second, which leaves a
  // per frame trail a sprite or two where a phone leaves twenty
  await D(() => { const g = window.TUMBLE.game; g.params.delete('turbo'); g.turbo = 0; });
  const counts = {};
  for (const k of kinds) {
    await D((k) => window.TUMBLE.game.render.setTrail(k), k);
    const id = await D(() => window.TUMBLE_DEV.matchPair());
    if (id === null) { ok(false, `no pair left for the ${k} trail`); break; }
    const before = await D(() => { const s = window.TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed; });
    await D((id) => { window.__lobId = id; window.TUMBLE_DEV.lobBall(id); }, id);
    // mid flight, 0.45 s into the shot's own clock (every scheduled sprite has left by then), then hold still
    const caught = await until(() => { const g = window.TUMBLE.game, sh = g.play.shots.get(window.__lobId); if (sh && sh.t >= 0.45) { g.paused = true; return true; } return false; }, null, 120000);
    if (!caught) { ok(false, `the ${k} shot was never caught in the air`); continue; }
    await H.frames(2);
    counts[k] = await D(() => { const a = window.TUMBLE.game.render.trail.geometry.attributes.alpha.array; let n = 0; for (const v of a) if (v > 0.02) n++; return n; });
    await H.shot(`trail-${k}-${W}.png`);
    await D(() => { window.TUMBLE.game.paused = false; });
    await until((n) => { const s = window.TUMBLE_DEV.session().stats; return s.shotsMade + s.shotsMissed > n; }, before);
  }
  // a trail counted per shot shows all of its count by then; one counted per frame at least a couple
  const quiet = kinds.filter((k) => !(counts[k] >= (trailPerShot(k) || 2)));
  ok(!quiet.length, `every trail leaves its sprites behind a ball in the air (${kinds.map((k) => k + ' ' + counts[k]).join(', ')})${quiet.length ? ': too few from ' + quiet.join(', ') : ''}`);

  // ---------- an icon of its own in the shop ----------
  for (const [cat, key, list] of [['ball', 'roll', BALL_STYLES], ['trail', 'trail', kinds]]) {
    const icons = await D(([cat, key]) => {
      const app = window.TUMBLE; app.screens.door(cat);
      const out = {};
      for (const it of app.data.unlocks.items.filter((i) => i.cat === cat)) out[it.look[key]] = app.screens._swatch(it).icon;
      return out;
    }, [cat, key]);
    const generic = await D((cat) => window.TUMBLE.screens._swatch({ cat, look: {} }).icon, cat);
    const shared = list.filter((k) => !icons[k] || icons[k] === generic);
    ok(!shared.length && new Set(list.map((k) => icons[k])).size === list.length, `every ${cat === 'ball' ? 'ball style' : 'trail'} has its own icon in the shop${shared.length ? ': the shared icon for ' + shared.join(', ') : ''}`);
    // the sheet slides in over seconds here, and a sheet waiting to slide is still too: on screen AND unmoved
    const still = (last) => until((last) => {
      const bs = [...document.querySelectorAll('#sheetBody .txt b')], b = last ? bs[bs.length - 1] : bs[0];
      if (!b) return false;
      const q = b.getBoundingClientRect(), key = Math.round(q.x) + ',' + Math.round(q.y), same = window.__shopAt === key;
      window.__shopAt = key; return same && q.top >= 0 && q.bottom <= innerHeight;
    }, last, 60000);
    await D(() => { window.__shopAt = null; });
    ok(await still(false), `the ${cat} tab of the shop settles`);
    await H.shot(`shop-${cat}-${W}.png`);
    await D(() => { window.__shopAt = null; const body = document.getElementById('sheetBody'); if (body) body.scrollTop = body.scrollHeight; });
    await still(true);
    await H.shot(`shop-${cat}-end-${W}.png`);
    await D(() => window.TUMBLE.ui.closeSheet && window.TUMBLE.ui.closeSheet(true));
  }
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'ball shots crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `ball shots: ${fails.length} FAILED` : `ball shots: all taken at ${W}x${H2}`);
process.exitCode = fails.length ? 1 : 0;
