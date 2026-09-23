// Hints gate (Jessie, Sep 17: "the instructions move too fast ... she wants a click to continue"). A teaching hint stays
// until it is tapped and carries a Got it button of at least 48 px; a timed hint lasts long enough to read and can be
// tapped away early. node dev/gate-hints.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 390, h: 844 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hintState = () => D(() => { const h = document.getElementById('hint'); const b = document.getElementById('hintGo'); const r = b ? b.getBoundingClientRect() : null; return { on: h.classList.contains('on'), text: h.textContent.trim().slice(0, 80), pe: getComputedStyle(h).pointerEvents, btn: r ? { w: Math.round(r.width), h: Math.round(r.height), x: r.left + r.width / 2, y: r.top + r.height / 2 } : null }; });
try {
  // a fresh player's first Load: the first teaching hint
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&seed=hints', 'play', 240000);
  await H.frames(3);
  let s = await hintState();
  ok(s.on && /Tap a sock to pick it up/.test(s.text), `the first Load shows the first teaching hint ("${s.text}")`);
  ok(!!s.btn && s.btn.w >= 48 && s.btn.h >= 48, `the teaching hint carries a Got it button of at least 48 px (${s.btn ? s.btn.w + 'x' + s.btn.h : 'none'})`);
  await wait(6500);   // longer than the old 4.2 s timer
  s = await hintState();
  ok(s.on, 'the teaching hint is still up after 6.5 s (it waits for the tap)');
  await H.shot('g-hints-sticky.png');
  if (s.btn) await H.tap(s.btn.x, s.btn.y);
  await H.frames(3);
  s = await hintState();
  ok(!s.on, 'tapping Got it dismisses it');
  // a timed hint gets a reading floor: 60 characters need more than the old 2.6 s default
  await D(() => TUMBLE.ui.hint('A sixty character hint that a new player needs time to read fully.'));
  await wait(3200);
  s = await hintState();
  ok(s.on, 'a 60 character timed hint is still readable after 3.2 s (the old default faded at 2.6 s)');
  // (a timed hint's body lets taps through too, 23 Sep; a tap on it still clears it early, and reaches the game)
  const hb = await D(() => { const r = document.getElementById('hint').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await H.tap(hb.x, hb.y);
  await H.frames(3);
  s = await hintState();
  ok(!s.on, 'tapping a timed hint dismisses it early');
  await D(() => TUMBLE.ui.hint('Link copied.'));
  await wait(9000);
  s = await hintState();
  ok(!s.on, 'a timed hint still goes away on its own (Link copied gone within 9 s)');
  // ---------- A HINT NEVER EATS A GAME TAP (23 Sep, listing prep) ----------
  // step3 had been red since the Sep 17 hint change, and it was not the gate: the teaching card sits up top over the
  // dryer, the Odd Bin and the basket, and a new player's first basket tap landed ON THE CARD. So: the card's body lets a
  // tap through to what is under it (only Got it takes taps), a teaching card retires once she has done what it
  // teaches, and with a card up over the basket, a tap on the basket lobs the ball she holds.
  const until = (f, arg, ms = 120000) => H.page.waitForFunction(f, { timeout: ms, polling: 250 }, arg).then(() => true, () => false);
  await D(() => { const app = window.TUMBLE; app.game.abandonLoad(); app.save.seen.firstTapHint = false; app.start({ mode: 'laundry', size: 'regular', tier: 4, seed: 'hints-2' }); });
  ok(await until(() => TUMBLE_DEV.state === 'play' && document.getElementById('hint').classList.contains('on'), null, 300000), 'a fresh first Load shows the first tap card again');
  const pe = await D(() => { const h = document.getElementById('hint'), b = document.getElementById('hintGo'); return { card: getComputedStyle(h).pointerEvents, btn: b ? getComputedStyle(b).pointerEvents : null }; });
  ok(pe.card === 'none' && pe.btn === 'auto', `the teaching card lets a tap on its body through to the game, and only Got it takes taps (card ${pe.card}, Got it ${pe.btn})`);
  const socks = await D(() => TUMBLE_DEV.findPickable());
  const byKey = new Map();
  for (const x of socks) if (x.odd === null) byKey.set(x.key, [...(byKey.get(x.key) || []), x]);
  const pair = [...byKey.values()].find((v) => v.length === 2);
  if (!pair) throw new Error('no visible twin pair to work with');
  await H.tap(pair[0].x, pair[0].y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', pair[0].id);
  await H.tap(pair[1].x, pair[1].y);
  ok(await until(() => { const h = TUMBLE_DEV.hand(); return h && h.kind === 'ball'; }), 'tap a sock, tap its twin: a ball in the hand');
  ok(await until(() => !document.getElementById('hint').classList.contains('on'), null, 10000), 'and the first tap card has retired itself: she has done what it teaches');
  // a teaching card up over the basket, and the basket tapped where the card covers it
  await D(() => TUMBLE.ui.hint('Tap a sock to pick it up, then tap its twin.', 0, { sticky: true, id: 'test' }));
  await H.frames(3);
  const at = await D(() => { const s = TUMBLE_DEV.spots().basket, el = document.elementFromPoint(s.x, s.y), h = document.getElementById('hint').getBoundingClientRect(); return { x: s.x, y: s.y, under: !!el && el.closest && !!el.closest('#hint'), covered: s.x > h.left && s.x < h.right && s.y > h.top && s.y < h.bottom }; });
  const made0 = await D(() => TUMBLE_DEV.session().stats.shotsMade);
  await H.tap(at.x, at.y);
  ok(await until((n) => TUMBLE_DEV.session().stats.shotsMade > n, made0, 60000), `with a teaching card up, a tap on the basket lobs the ball in (the card covers the basket: ${at.covered}; the element there is the card: ${at.under})`);
  ok(await D(() => document.getElementById('hint').classList.contains('on')), 'and a teaching card stays up through a game tap (only Got it, or doing the lesson, takes it away)');
  await D(() => TUMBLE.ui.hideHint());

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.join(' | '));
} catch (e) { ok(false, 'gate crashed: ' + e.message); }
await H.close();
console.log(fails.length ? `hints gate: ${fails.length} FAILED` : 'hints gate: all passed');
process.exitCode = fails.length ? 1 : 0;
