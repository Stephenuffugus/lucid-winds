// Regression gate for the 2026-09-17 review: the fixes that need a browser.
//   a tap during the Sweep pops a stray in; a sock put down mid flight does not hold the Load open;
//   a real still hold + tap matches; leaving a Load hides the HUD; Start over during a Load lands in the room.
// node dev/gate-review.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 300, h: 650, port: 8792 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 120000) => H.page.waitForFunction(f, { timeout, polling: 150 }, arg).then(() => true, () => false);
const ptr = (type, x, y, id, primary = true) => D((type, x, y, id, primary) => {
  const el = document.getElementById('stage');
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: 'touch', isPrimary: primary, buttons: type === 'pointerup' ? 0 : 1 }));
}, type, x, y, id, primary);

try {
  // 1. the Sweep: a tap on a stray pops it in before the automatic sweep
  await H.open('?nosw&turbo=1&skipdump=1&load=laundry&size=small&tier=0&seed=review1', 'play');
  await D(() => TUMBLE_DEV.cheatSolve());
  ok(await until(() => TUMBLE_DEV.state === 'sweep'), 'the Load reaches the Sweep with strays on the table');
  const target = await D(() => { const b = TUMBLE_DEV.session().balls.find((x) => x.state === 'table'); return b ? { id: b.id, ...TUMBLE_DEV.tapPoint(b.id) } : null; });
  if (target) {
    await ptr('pointerdown', target.x, target.y, 41);
    await ptr('pointerup', target.x, target.y, 41);
    const st = await D((id) => ({ state: TUMBLE_DEV.session().balls.find((b) => b.id === id).state, t: TUMBLE.game.sweepT, auto: TUMBLE.game.sweepAuto }), target.id);
    ok(st.state !== 'table' && !st.auto, `a tap on a stray sweeps it at once (ball ${st.state}, sweep ${st.t.toFixed(2)} s, auto ${st.auto})`);
  } else ok(false, 'no stray to tap');
  const bar = await D(() => { const b = document.getElementById('sweepbar'); return { on: b.classList.contains('on'), text: b.textContent }; });
  ok(bar.on && /made/.test(bar.text) && /stray|swept|Clean/.test(bar.text), `the Sweep banner shows the shots and the strays ("${bar.text}")`);
  await H.shot('g-review-sweep.png');
  ok(await until(() => TUMBLE_DEV.state === 'results'), 'the Sweep ends in results');

  // 2. a sock tapped and put down before its flight lands: the Load still ends
  await D(() => TUMBLE_DEV.app.start({ mode: 'laundry', size: 'small', tier: 0, seed: 'review2' }));
  ok(await until(() => TUMBLE_DEV.state === 'play'), 'a second Load is in play');
  const socks = await D(() => TUMBLE_DEV.findPickable(null, 30));
  const s = socks.find((x) => x.odd === null) || socks[0];
  await ptr('pointerdown', s.x, s.y, 42);
  await ptr('pointerup', s.x, s.y, 42);
  // straight away (the flight to the hand takes 0.22 s): put it down through the controller
  await D(() => TUMBLE.game.play.putDown({ x: 0, z: 0.2 }));
  await H.frames(4);
  await D(() => TUMBLE_DEV.cheatSolve());
  ok(await until(() => TUMBLE_DEV.state === 'results', null, 90000), `putting a sock down mid flight does not hold the Load open (busy ${await D(() => TUMBLE_DEV.busy())})`);

  // 3. a still thumb and a second finger tap: hold + tap matches
  await D(() => TUMBLE_DEV.app.start({ mode: 'laundry', size: 'small', tier: 0, seed: 'review3' }));
  ok(await until(() => TUMBLE_DEV.state === 'play'), 'a third Load is in play');
  const pair = await D(() => {
    const p = TUMBLE_DEV.findPickable(null, 30);
    for (const a of p) { if (a.odd !== null) continue; const m = TUMBLE_DEV.mateOf(a.id); const b = p.find((x) => x.id === m); if (b && Math.hypot(a.x - b.x, a.y - b.y) > 60) return [a, b]; }
    return null;
  });
  if (pair) {
    const before = (await D(() => TUMBLE_DEV.session())).stats.matches;
    await ptr('pointerdown', pair[0].x, pair[0].y, 43);
    await ptr('pointerdown', pair[1].x, pair[1].y, 44, false);
    await ptr('pointerup', pair[1].x, pair[1].y, 44, false);
    ok(await until((n) => TUMBLE_DEV.session().stats.matches === n + 1, before, 60000), 'a still hold + tap matches the pair');
    await H.frames(12);
    await ptr('pointerup', pair[0].x, pair[0].y, 43);
    ok(await until(() => { const h = TUMBLE_DEV.hand(); return !h || h.kind === 'ball'; }), 'lifting the thumb leaves a ball, never a stuck sock');
  } else console.log('  info  no pair far enough apart for hold + tap this seed');

  // 4. pause, leave: the room has no play HUD
  await D(() => TUMBLE.pause());
  await H.frames(2);
  await D(() => [...document.querySelectorAll('#ui button')].find((b) => /Leave/.test(b.textContent)).click());
  ok(await until(() => TUMBLE_DEV.state === 'room'), 'leaving the Load returns to the room');
  await H.frames(4);
  const hud = await D(() => ({ hud: getComputedStyle(document.getElementById('hud')).opacity, timer: document.getElementById('timer').hidden, glow: document.getElementById('handGlow').classList.contains('on') }));
  ok(Number(hud.hud) < 0.1 && !hud.glow, `no play HUD in the room (${JSON.stringify(hud)})`);
  await H.shot('g-review-room.png');

  // 5. Start over during a Load: the Load ends, settings stay
  await D(() => { TUMBLE.setSetting('cvd', 'tritan'); TUMBLE_DEV.app.start({ mode: 'laundry', size: 'small', tier: 0, seed: 'review4' }); });
  ok(await until(() => TUMBLE_DEV.state === 'play'), 'a fourth Load is in play');
  await D(() => { window.confirm = () => true; TUMBLE.pause(); });
  await D(() => [...document.querySelectorAll('#ui button')].find((b) => b.textContent.trim() === 'Settings').click());
  await H.frames(2);
  await D(() => document.getElementById('sReset').click());
  ok(await until(() => TUMBLE_DEV.state === 'room' && !TUMBLE_DEV.app.ui().sheetOpen), 'Start over during a Load ends it and lands in the room with no sheet open');
  const sv = await D(() => TUMBLE_DEV.app.save());
  ok(sv.stats.loads === 0 && sv.profile.settings.cvd === 'tritan', `the progress is cleared and the colour vision setting stays (${sv.stats.loads} Loads, ${sv.profile.settings.cvd})`);
  ok(await D(() => TUMBLE.game.paused === false), 'the game is not left paused');

  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g-review-crash.png');
}
await H.close();
console.log(fails.length ? `review gate: ${fails.length} FAILED` : 'review gate: all passed');
process.exitCode = fails.length ? 1 : 0;
