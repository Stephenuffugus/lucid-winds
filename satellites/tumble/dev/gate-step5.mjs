// Step 5 gate (OPUS_PROMPT): Rush. Timed (clock, streaks, x5, power dots, the four powers, lint fog at tier 6+),
// then Endless (the dryer feeds, baskets buy time), then Basket Balance (tilt, settle, tip).
// Runs at a small viewport so the software renderer keeps up. node dev/gate-step5.mjs
import { harness } from '../tools/harness.mjs';
const H = await harness({ w: 300, h: 650 });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => H.page.evaluate(f, ...a);
const until = (f, arg, timeout = 180000) => H.page.waitForFunction(f, { timeout, polling: 250 }, arg).then(() => true, () => false);
const tapAt = (x, y) => D((x, y) => {
  const el = document.elementFromPoint(x, y);
  const mk = (t) => new PointerEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 31, pointerType: 'touch', isPrimary: true, buttons: t === 'pointerup' ? 0 : 1 });
  el.dispatchEvent(mk('pointerdown')); el.dispatchEvent(mk('pointerup'));
  return el.id || el.className;
}, x, y);

try {
  await H.open('?nosw&turbo=1&skipdump=1&load=rush&sub=timed&size=regular&tier=6&seed=gate5a', 'play');
  await H.frames(3);
  const s0 = await D(() => TUMBLE_DEV.session());
  ok(s0.timeLeft > 60 && s0.timeLeft < 120, `Timed Rush at tier 6: ${s0.timeLeft.toFixed(1)} s for 20 pairs (4.2 s a pair plus odd socks)`);
  ok(await D(() => !document.getElementById('timer').hidden && !document.getElementById('rushbar').hidden), 'the clock and the streak bar show');
  ok((await D(() => TUMBLE_DEV.fogVisible())) >= 4, `lint fog drifts over the pile at tier 6 (${await D(() => TUMBLE_DEV.fogVisible())} puffs)`);
  await H.frames(6);
  const s1 = await D(() => TUMBLE_DEV.session());
  ok(s1.timeLeft < s0.timeLeft, `the clock runs (${s1.timeLeft.toFixed(2)} s left)`);
  // powers are Clothesline pegs; hang them for this run
  for (const k of ['powerStatic', 'powerDryerSheet', 'powerSockPuppet', 'powerSpinCycle']) await D((k) => TUMBLE_DEV.addComfort(k), k);
  await H.frames(2);
  ok(await D(() => document.querySelectorAll('.power:not([hidden])').length === 4), 'four power buttons show once their pegs hang');
  // twelve correct pairs in a row: x5 and two dots
  const mults = [];
  for (let i = 0; i < 12; i++) { await D(() => TUMBLE_DEV.matchPair()); mults.push((await D(() => TUMBLE_DEV.session())).mult); }
  ok(mults[mults.length - 1] === 5, `the multiplier climbs to x5 (${mults.join(',')})`);
  const s2 = await D(() => TUMBLE_DEV.session());
  ok(s2.dots === 2, `12 pairs in a row earn 2 power dots (${s2.dots})`);
  await H.frames(2);
  ok(await D(() => document.querySelector('.power[data-power="static"]').classList.contains('ready')), 'Static Cling lights up');
  await H.shot('g5-rush.png');

  // Static Cling: pick a sock up, the power pulls its twin into the hand
  const socks = await D(() => TUMBLE_DEV.findPickable(null, 30));
  const s = socks.find((x) => x.odd === null);
  await tapAt(s.x, s.y);
  await until((id) => TUMBLE_DEV.entState(id) === 'pocket', s.id);
  const before = (await D(() => TUMBLE_DEV.session())).stats.matches;
  await D(() => TUMBLE_DEV.app.usePower('static'));
  ok(await until((b) => TUMBLE_DEV.session().stats.matches === b + 1, before), 'Static Cling pulls the twin out of the pile and they match');
  ok((await D(() => TUMBLE_DEV.session())).dots === 0, 'it cost 2 dots');
  // Dryer Sheet clears the fog (earn two more dots first)
  for (let i = 0; i < 10; i++) await D(() => TUMBLE_DEV.matchPair());
  const d3 = (await D(() => TUMBLE_DEV.session())).dots;
  ok(d3 >= 2, `ten more pairs, ${d3} dots`);
  await D(() => TUMBLE_DEV.app.usePower('dryerSheet'));
  await H.frames(3);
  ok((await D(() => TUMBLE_DEV.fogVisible())) === 0, 'the Dryer Sheet clears the lint fog');
  // the ball in hand: lob it; a miss or a mismatch resets the streak (checked in Node); here: the clock ends the Load
  await D(() => { const h = TUMBLE_DEV.hand(); if (h) TUMBLE_DEV.lobBall(h.id); });
  await D(() => TUMBLE_DEV.setTime(0.2));
  ok(await until(() => TUMBLE_DEV.state === 'results'), 'when the clock runs out the Load sweeps and shows results');
  ok(await until(() => TUMBLE_DEV.app.ui().title === 'Rush result'), 'the Rush result sheet opens');
  await H.shot('g5-rush-result.png');
  const sv = await D(() => TUMBLE_DEV.app.save());
  ok(sv.stats.rushLoads === 1 && sv.stats.bestStreak >= 12, `the save counts the Rush Load and the best streak (${sv.stats.bestStreak})`);

  // Endless: the dryer feeds two socks every 5 s, a basket buys 4 s
  await D(() => TUMBLE_DEV.app.start({ mode: 'rush', sub: 'endless', size: 'regular' }));
  ok(await until(() => TUMBLE_DEV.state === 'play' && TUMBLE_DEV.session().pairsLeft === 12), 'Endless starts with 12 pairs');
  const e0 = await D(() => TUMBLE_DEV.session());
  ok(Math.abs(e0.timeLeft - 40) < 1, `Endless starts with 40 s (${e0.timeLeft.toFixed(1)})`);
  ok(await until(() => TUMBLE_DEV.session().stats.fed >= 2, null, 400000), 'the dryer fed two more socks');
  const ball = await D(() => TUMBLE_DEV.matchPair());
  const t1 = (await D(() => TUMBLE_DEV.session())).timeLeft;
  await D((id) => TUMBLE_DEV.lobBall(id), ball);
  ok(await until((t) => TUMBLE_DEV.session().stats.shotsMade >= 1, t1), 'a lobbed pair lands in the basket');
  const t2 = (await D(() => TUMBLE_DEV.session())).timeLeft;
  ok(t2 > t1 + 2, `a basket buys time (${t1.toFixed(1)} s then ${t2.toFixed(1)} s)`);
  await D(() => TUMBLE_DEV.setTime(0.1));
  ok(await until(() => TUMBLE_DEV.state === 'results'), 'Endless ends when the time runs out');

  // Basket Balance: made shots tilt the basket, a tap settles it, too much tips it
  await D(() => TUMBLE_DEV.app.start({ mode: 'rush', sub: 'balance', size: 'small', tier: 1, seed: 'gate5b' }));
  ok(await until(() => TUMBLE_DEV.state === 'play'), 'Basket Balance starts');
  await H.frames(3);
  ok(await D(() => !document.getElementById('sheet').classList.contains('on')), 'the Endless result sheet is gone once the next Load starts');
  let tilt = 0;
  for (let i = 0; i < 3; i++) {
    const b = await D(() => TUMBLE_DEV.matchPair());
    await D((id) => TUMBLE_DEV.lobBall(id), b);
    await until((n) => TUMBLE_DEV.session().stats.shotsMade >= n, i + 1);
  }
  await H.frames(10);
  tilt = await D(() => TUMBLE.game.session.tilt);
  ok(Math.abs(tilt) > 0.05, `three balls tilt the basket (${tilt.toFixed(2)})`);
  ok(Math.abs(await D(() => TUMBLE_DEV.basketTilt())) > 0.01, 'the basket model leans with it');
  await D(() => TUMBLE.settleBasket());
  const tilt2 = await D(() => TUMBLE.game.session.tilt);
  ok(Math.abs(tilt2) < Math.abs(tilt), `a tap on the basket settles it (${tilt2.toFixed(2)})`);
  await D(() => { TUMBLE.game.session.tilt = 0.95; TUMBLE.game.session.addTilt(0.4) && TUMBLE.tipBasket(); });
  ok(await until(() => TUMBLE.game.session.tips === 1), 'past the limit the basket tips');
  ok(await until(() => TUMBLE_DEV.session().balls.some((b) => b.state === 'table')), 'the spilled balls are back on the table to shoot again');
  await H.shot('g5-tipped.png');
  const errs = H.errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) {
  ok(false, 'gate crashed: ' + e.message);
  await H.shot('g5-crash.png');
}
await H.close();
console.log(fails.length ? `step 5 gate: ${fails.length} FAILED` : 'step 5 gate: all passed');
process.exitCode = fails.length ? 1 : 0;
