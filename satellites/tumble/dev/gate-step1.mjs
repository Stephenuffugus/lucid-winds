// Step 1 gate (OPUS_PROMPT): the pile is settled and asleep, a real finger can drag a sock, a flick throws it,
// the debug overlay reads out. node dev/gate-step1.mjs
import { harness, sleep } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
try {
  await H.open('?skipdump=1&smoke=43&debug=1');
  await H.frames(3);
  const c = await D(() => TUMBLE_DEV.counts());
  ok(c.total === 43 && c.awake === 0, `43 socks on the table, all asleep (awake ${c.awake})`);
  const ld = await D(() => TUMBLE_DEV.lastDump());
  ok(ld.settledAt > 0 && ld.settledAt < 2, `the dump settled in ${ld.settledAt.toFixed(2)} s (< 2 s)`);
  const dbg = await D(() => document.getElementById('debug')?.textContent || '');
  ok(/fps \d+/.test(dbg) && /bodies 43/.test(dbg), 'the ?debug=1 overlay shows fps and the body count');

  // drag: a real pointer path, slow, with a stop before lifting (so it is a carry, not a throw)
  const s = await D(() => TUMBLE_DEV.findPickable());
  ok(!!s, 'found a sock a finger can pick ' + JSON.stringify(s));
  const before = await D((id) => TUMBLE_DEV.pose(id), s.id);
  await H.pointer('pointerdown', s.x, s.y);
  await H.moveOver([s.x, s.y], [s.x + 10, s.y - 20], 120);
  await H.frames(2);
  const hand = await D(() => TUMBLE_DEV.hand());
  ok(hand && hand.id === s.id && hand.mode === 'drag', 'the sock is in the hand while the finger is down ' + JSON.stringify(hand));
  await H.moveOver([s.x + 10, s.y - 20], [s.x + 60, s.y - 110], 500);
  await H.frames(4);
  const hs = await D(() => TUMBLE_DEV.heldScreen());
  ok(hs && hs.y < s.y - 110 - 40, `the held sock floats above the thumb (sock at y ${hs && hs.y.toFixed(0)}, finger at ${s.y - 110})`);
  await H.shot('g1-held.png');
  await sleep(250);
  await H.pointer('pointerup', s.x + 60, s.y - 110);
  await H.frames(30);
  const after = await D((id) => TUMBLE_DEV.pose(id), s.id);
  const moved = Math.hypot(after.x - before.x, after.z - before.z);
  ok(moved > 0.05, `the carried sock moved ${(moved * 100).toFixed(1)} cm`);
  ok(!(await D(() => TUMBLE_DEV.hand())), 'the hand is empty after lifting');

  // flick: fast swipe
  await H.frames(40);
  const f = await D(() => TUMBLE_DEV.findPickable());
  const fb = await D((id) => TUMBLE_DEV.pose(id), f.id);
  // one in-page gesture: the rig renders ~1 fps, so a lift sent in a separate call arrives late and
  // reads (correctly) as a finger that stopped before lifting
  const pts = [[f.x, f.y], [f.x + 2, f.y - 6], [f.x + 4, f.y - 12]];
  for (let i = 1; i <= 6; i++) pts.push([f.x + 4 + i * 6, f.y - 12 - i * 26]);
  await H.swipe(pts, 110, { hold: 40 });
  await H.frames(60);
  const fa = await D((id) => TUMBLE_DEV.pose(id), f.id);
  const flew = Math.hypot(fa.x - fb.x, fa.z - fb.z);
  ok(flew > 0.12, `a flick throws the sock ${(flew * 100).toFixed(1)} cm (the finger moved ~${Math.round(Math.hypot(40, 170))} px)`);
  ok(fa.z < fb.z, 'it went up the table, the way the finger went');
  await H.frames(10);
  await H.shot('g1-after.png');
  const errs = H.errors.filter((e) => !/manifest|icon-192|favicon|404/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g1-crash.png');
}
await H.close();
console.log(fails.length ? `step 1 gate: ${fails.length} FAILED` : 'step 1 gate: all passed');
process.exitCode = fails.length ? 1 : 0;
