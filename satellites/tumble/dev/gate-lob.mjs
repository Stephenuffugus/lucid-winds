// THE ONE THUMB LOB: a tap on the basket, with a ball in the hand, puts it in (DECISIONS, "Tap the basket").
//
// This gate exists because of a coverage hole found on 2026-09-22: step4, step5 and the basket gate ALL lob
// through TUMBLE_DEV.lobBall(), so none of them touches tap() or hitBasket(). gate-step3 was the only gate that
// tapped the basket for real, and when it went red there was nothing to tell a broken lob from a broken gate.
// Now the lob has a gate of its own that reports what the game decided at every point.
// node dev/gate-lob.mjs
import { harness } from '../tools/harness.mjs';

const H = await harness({ w: 412, h: 915 });
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, ms = 120000) => H.page.waitForFunction(f, { timeout: ms, polling: 300 }, arg).then(() => true, () => false);
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const say = (m) => console.log('  info  ' + m);

try {
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=regular&tier=4&seed=lobprobe', 'play', 300000);

  // 1. a ball in the hand, by the same route step3 takes: tap a sock, tap its twin
  const socks = await D(() => TUMBLE_DEV.findPickable());
  const byKey = new Map();
  for (const s of socks) if (s.odd === null) byKey.set(s.key, [...(byKey.get(s.key) || []), s]);
  const pair = [...byKey.values()].find((v) => v.length === 2);
  say(`socks pickable: ${socks.length}; a visible twin pair: ${pair ? pair[0].id + ' and ' + pair[1].id : 'none'}`);
  ok(!!pair, `two twins are visible and pickable (${socks.length} pickable socks)`);
  if (!pair) throw new Error('no visible twin pair to work with');
  const [a, twin] = pair;
  await H.tap(a.x, a.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', a.id);
  await H.tap(twin.x, twin.y);
  const gotBall = await until(() => { const h = TUMBLE_DEV.hand(); return h && h.kind === 'ball'; });
  ok(gotBall, 'tap, tap its twin: a ball sits in the hand');

  // 2. everything the game knows at the basket point, BEFORE the tap
  const before = await D(() => {
    const g = TUMBLE.game, p = g.play;
    const s = TUMBLE_DEV.spots().basket;
    const el = document.elementFromPoint(s.x, s.y);
    const hit = p.pickAt(s.x, s.y);
    return {
      spot: { x: Math.round(s.x), y: Math.round(s.y) },
      hitBasket: p.hitBasket(s),
      hitBin: p.hitBin(s),
      hitPocket: p.hitPocket(s),
      elementAtPoint: el ? (el.id || el.className || el.tagName) : null,
      pickAt: hit ? { kind: hit.kind, id: hit.id } : null,
      hand: p.hand ? { kind: p.hand.kind, id: p.hand.id, mode: p.hand.mode } : null,
      state: g.state,
      shotsMade: g.session.stats.shotsMade,
    };
  });
  ok(before.hitBasket === true, `the basket's own tap zone answers to the point the game projects for it (${before.spot.x},${before.spot.y})`);
  ok(before.pickAt === null, `and nothing on the table is picked through it (${JSON.stringify(before.pickAt)}), so a tap there means the basket`);
  say('at the basket point: ' + JSON.stringify(before));

  // 3. the tap itself, then what changed
  const landedOn = await H.tap(before.spot.x, before.spot.y);
  say(`the tap was dispatched on: ${landedOn}`);
  const settled = await until(() => TUMBLE.game.session.stats.shotsMade >= 1, null, 60000);
  const after = await D(() => {
    const g = TUMBLE.game, p = g.play;
    return {
      shotsMade: g.session.stats.shotsMade,
      shotsMissed: g.session.stats.shotsMissed,
      hand: p.hand ? { kind: p.hand.kind, id: p.hand.id, mode: p.hand.mode } : null,
      busy: p.busy,
      hint: (document.getElementById('hint') || {}).textContent,
      balls: [...g.session.balls.values()].map((b) => b.state),
    };
  });
  ok(settled, `ONE TAP on the basket registers a made shot (it landed on "${landedOn}")`);
  ok(after.hand === null, `and the hand is empty again (${JSON.stringify(after.hand)})`);
  ok(after.balls.includes('basket'), `and the ball is in the basket (${after.balls.join(',')})`);
  ok(after.shotsMissed === 0, `and nothing was counted as a miss (${after.shotsMissed})`);
  say('after the tap: ' + JSON.stringify(after));
  await H.shot('probe-lob.png');

  // 4. and the same tap through the game's own handler, to separate "the tap never arrived" from "the lob refused"
  if (!settled) {
    const direct = await D(() => {
      const g = TUMBLE.game, p = g.play;
      const s = TUMBLE_DEV.spots().basket;
      const had = p.hand ? { kind: p.hand.kind, id: p.hand.id } : null;
      p.tap({ x: s.x, y: s.y });
      return { had, handAfter: p.hand ? p.hand.kind : null, shotsMade: g.session.stats.shotsMade };
    });
    say('the same point through play.tap() directly: ' + JSON.stringify(direct));
    const ok2 = await until(() => TUMBLE.game.session.stats.shotsMade >= 1, null, 60000);
    say(`...and THAT registered a made shot: ${ok2} (true here and false above means the tap never reached the game)`);
  }

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
}
await H.close();
console.log(fails.length ? `lob gate: ${fails.length} FAILED` : 'lob gate: all passed');
process.exitCode = fails.length ? 1 : 0;
