// The finger picks the sock the player SEES, and what is in the hand can always be put back (Stephen, Sep 21 2026:
// "it just keep picks up socks under the one of clicking ... like my touch is going through it", and "i will try to
// put a sock i accidentally picked up back and it wont let me"). On a HEAVY Load, in the real page.
// node dev/gate-pick.mjs            (GATE_OLDPICK=1 runs the old pick, to watch the first check fail)
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 412, h: 915 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const OLD = process.env.GATE_OLDPICK ? '&oldpick=1' : '';
try {
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=heavy&seed=pickgate' + OLD, 'play', 300000);
  await wait(1500);
  // 1. tap the middle of every sock on the table (through the real camera, the real ray, the real poses):
  //    the sock picked must be the nearest footprint along that ray, never one further down the heap.
  const r = await D(async () => {
    const { pickBoxes, footprintPick } = await import('./src/pick.js');
    const { SILHOUETTES, centerline } = await import('./src/silhouettes.js');
    const g = TUMBLE.game, list = g.play._footprints().map((s) => ({ ...s }));
    let taps = 0, through = 0, self = 0;
    for (const sk of list) {
      const pts = centerline(SILHOUETTES[sk.silId], 40).pts, q = sk.pose;
      for (const k of [8, 30]) {
        const lp = [pts[k].x * sk.scale, SILHOUETTES[sk.silId].t * sk.scale, pts[k].z * sk.scale];
        const tx = 2 * (q.qy * lp[2] - q.qz * lp[1]), ty = 2 * (q.qz * lp[0] - q.qx * lp[2]), tz = 2 * (q.qx * lp[1] - q.qy * lp[0]);
        const w = { x: q.x + lp[0] + q.qw * tx + (q.qy * tz - q.qz * ty), y: q.y + lp[1] + q.qw * ty + (q.qz * tx - q.qx * tz), z: q.z + lp[2] + q.qw * tz + (q.qx * ty - q.qy * tx) };
        const s = g.render.project(w);
        if (s.x < 30 || s.x > g.render.w - 30 || s.y < 120 || s.y > g.render.h * 0.72) continue; // on the table, clear of the HUD and the pocket
        const ray = g.render.ray(s.x, s.y), seen = footprintPick(ray.origin, ray.dir, list), got = g.play.pickAt(s.x, s.y);
        taps++;
        if (got && got.kind === 'sock' && seen && got.id !== seen.id) through++;
        if (got && got.id === sk.id) self++;
      }
    }
    return { taps, through, self, socks: list.length };
  });
  ok(r.socks >= 60 && r.taps >= 40, `a Heavy Load is on the table (${r.socks} socks, ${r.taps} taps on the middle of a sock)`);
  ok(r.through === 0, `no tap picks a sock further down than the one under the finger (${r.through} of ${r.taps} did; ${r.self} picked the very sock aimed at)`);
  await H.shot('g-pick-heavy.png');

  // 2. PUT IT BACK, with a table that has no empty spot to tap
  const one = (await D(() => TUMBLE_DEV.findPickable('sock')))[0];
  ok(!!one, 'a sock to pick up');
  await H.tap(one.x, one.y);
  await wait(1800);
  const held = await D(() => TUMBLE.game.play.hand && { id: TUMBLE.game.play.hand.id, mode: TUMBLE.game.play.hand.mode });
  ok(held && held.id === one.id && held.mode === 'pocket', 'a tap picks it up into the hand');
  const measure = () => D(() => { const b = document.getElementById('btnPutBack'); if (!b || b.hidden) return null; const q = b.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, top = document.elementFromPoint(x, y); return { x, y, w: Math.round(q.width), h: Math.round(q.height), reach: top === b || b.contains(top) }; });
  let b = null, last = null;
  for (let k = 0; k < 16; k++) { await wait(400); b = await measure(); if (b && last && b.reach && Math.abs(b.y - last.y) < 1) break; last = b; }
  ok(b && b.reach && b.w >= 48 && b.h >= 48, `with a sock in the hand the Put it back button is on the screen, ${b ? b.w + 'x' + b.h : 'absent'}, under the finger`);
  await H.shot('g-pick-putback.png');
  const tapped = b ? await H.tap(b.x, b.y) : null;
  // the hand empties AT the tap; the flight home takes game time, and on this software renderer a frame can take
  // seconds. Assert the change at once, then WAIT for the settled state (never a fixed wait: Sep 17, and again today).
  ok(await D(() => !TUMBLE.game.play.hand), `the tap (it landed on "${tapped}") empties the hand at once`);
  await H.page.waitForFunction((id) => { const e = TUMBLE.game.table.ents.get(id); return e && e.state === 'table' && document.getElementById('btnPutBack').hidden; }, { timeout: 90000, polling: 500 }, one.id).catch(() => {});
  const after = await D((id) => { const g = TUMBLE.game, e = g.table.ents.get(id), s = g.session.sock(id), p = g.physics.pose(id); return { hand: !!g.play.hand, state: e && e.state, sstate: s && s.state, x: p && p.x, z: p && p.z, from: e && e.cameFrom, hidden: document.getElementById('btnPutBack').hidden }; }, one.id);
  ok(!after.hand && after.state === 'table' && after.sstate === 'table', `ONE TAP (it landed on "${tapped}") and the hand is empty and the sock is back on the table ${JSON.stringify({ hand: after.hand, state: after.state, sstate: after.sstate })}`);
  ok(after.from && Math.hypot(after.x - after.from.x, after.z - after.from.z) < 0.12, `it went back where it came from (${after.from ? (Math.hypot(after.x - after.from.x, after.z - after.from.z) * 100).toFixed(1) : '?'} cm away)`);
  ok(after.hidden, 'and the button goes away with nothing in the hand');
  // 3. THE ODD BIN still takes a sock. The footprint pick is a far bigger target than the old rails, and a ray through
  //    the Bin goes on to the table behind it: the first cut of this fix picked up a sock lying BEHIND the Bin instead
  //    of binning the one in hand (gate step 3 caught it). Settled states only, no timeouts that a busy machine fails.
  //    (The first version looked for an odd sock IN VIEW and skipped itself when there was none: a check that can
  //    skip itself is not a check. What is under test is the tap on the BIN, so any odd sock is put in the hand.)
  const odd = await D(() => { const g = TUMBLE.game; for (const e of g.table.ents.values()) { const sk = e.kind === 'sock' && e.state === 'table' && g.session.sock(e.id); if (sk && sk.state === 'table' && sk.odd !== null && sk.odd !== undefined) { g.play.toPocket(e); return { id: e.id }; } } return null; });
  ok(!!odd, 'a Heavy Load holds an odd sock, and it is put in the hand');
  if (odd) {
    const inHand = await H.page.waitForFunction((id) => { const h = TUMBLE.game.play.hand; return h && h.id === id && h.mode === 'pocket' && TUMBLE.game.table.ents.get(id).state === 'pocket'; }, { timeout: 120000, polling: 500 }, odd.id).then(() => true, () => false);
    ok(inHand, 'an odd sock is tapped into the hand');
    const bin = (await D(() => TUMBLE_DEV.spots())).bin;
    await H.tap(bin.x, bin.y);
    const binned = await H.page.waitForFunction((id) => { const g = TUMBLE.game, e = g.table.ents.get(id); return !g.play.hand && e && (e.inBin || e.state === 'bin' || (g.session.sock(id) || {}).state === 'bin'); }, { timeout: 120000, polling: 500 }, odd.id).then(() => true, () => false);
    ok(binned, 'a tap on the Odd Bin bins the sock in hand (it does not pick up a sock lying behind the Bin)');
  }
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `pick gate: ${fails.length} FAILED` : 'pick gate: all passed');
process.exitCode = fails.length ? 1 : 0;
