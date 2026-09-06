/* THE CRANK, TURNED BY A REAL FINGER.
 *
 *   node test/crank.mjs
 *
 * ⛔ THE STRIP IS THE CLOCK, and this is the gate that holds it to that. Nothing
 * in here calls the player or sets a position: a pointer goes down on the hub,
 * travels round it in a circle the way a thumb does, and what the game does with
 * that is measured. A crank that advances the paper by wall time instead of by
 * angle passes every other gate in this folder and fails this one.
 */
import { serve, open, reporter, waitFrames, tapAt, centre } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

/* a real circular drag about the hub: down, a run of moves round it, up */
async function turn(revs, steps = 48) {
  const hub = await T(() => {
    const h = window.WINDUP_TEST.layout().hub;
    return { x: h.x, y: h.y };
  });
  const r = 46;
  const put = (type, x, y) => T((type, x, y) => {
    const el = document.getElementById('stage');
    el.dispatchEvent(new PointerEvent(type, { pointerId: 11, pointerType: 'touch',
      isPrimary: true, bubbles: true, cancelable: true, clientX: x, clientY: y }));
  }, type, x, y);
  const at = (f) => {
    const a = -Math.PI / 2 + f * revs * 2 * Math.PI;
    return { x: hub.x + Math.cos(a) * r, y: hub.y + Math.sin(a) * r };
  };
  let p = at(0);
  await put('pointerdown', p.x, p.y);
  for (let i = 1; i <= steps; i++) {
    p = at(i / steps);
    await put('pointermove', p.x, p.y);
  }
  await put('pointerup', p.x, p.y);
  return hub;
}

try {
  /* a strip whose holes are easy to name, one every four steps */
  await T(() => window.WINDUP_TEST.setStrip([[4, 0], [8, 4], [12, 7], [20, 11], [40, 14]], 'Test'));
  await waitFrames(page, 3);
  const cfg = await T(() => window.WINDUP_TEST.config());
  const perTurn = 2 * Math.PI * cfg.MM_PER_RAD / cfg.MM_PER_STEP;

  const hub = await T(() => window.WINDUP_TEST.layout().hub);
  say(hub.x > 0 && hub.y > 0 && hub.r >= 100,
    'the crank has a hub a thumb can circle (' + hub.r.toFixed(0) + ' px)');
  const onCanvas = await T((x, y) => {
    const e = document.elementFromPoint(x, y);
    return e ? e.id : null;
  }, Math.round(hub.x), Math.round(hub.y));
  say(onCanvas === 'stage', 'and nothing is sitting on top of it (' + onCanvas + ')');

  /* ---- two turns forward ---- */
  await T(() => window.WINDUP_TEST.clearFired());
  await turn(2);
  await waitFrames(page, 4);
  const after = await T(() => ({ mm: window.WINDUP_TEST.advance(),
    read: window.WINDUP_TEST.readAt(), fired: window.WINDUP_TEST.fired() }));
  const wantSteps = perTurn * 2;
  const off = Math.abs(after.read - wantSteps) / wantSteps * 100;
  say(off < 10, 'two turns of the crank move the paper about ' + wantSteps.toFixed(1)
    + ' eighths (' + after.read.toFixed(1) + ', off by ' + off.toFixed(1) + ' percent)');
  const want = [4, 8, 12].filter(s => s <= after.read);
  const got = after.fired.map(f => f.step);
  say(JSON.stringify(got) === JSON.stringify(want),
    'and every hole the read line passed sounded, in order, and nothing else ('
    + JSON.stringify(got) + ' against ' + JSON.stringify(want) + ')');
  say(after.fired.every((f, i) => i === 0 || f.step > after.fired[i - 1].step),
    'the notes came out in the order they are punched');

  /* ---- and back ---- */
  await T(() => window.WINDUP_TEST.clearFired());
  const before = await T(() => window.WINDUP_TEST.advance());
  await turn(-1);
  await waitFrames(page, 4);
  const back = await T(() => ({ mm: window.WINDUP_TEST.advance(),
    fired: window.WINDUP_TEST.fired().length }));
  say(back.mm < before - 1, 'turning it back rewinds the paper ('
    + before.toFixed(0) + ' mm to ' + back.mm.toFixed(0) + ' mm)');
  say(back.fired === 0, 'and a music box played backwards says nothing (' + back.fired + ')');

  /* ---- the mechanism stops and the tines ring on ---- */
  await T(() => window.WINDUP_TEST.setStrip([[2, 0], [4, 2], [6, 4]], 'Ring'));
  await waitFrames(page, 2);
  await turn(1.2, 60);
  const justAfter = await T(() => ({ ringing: window.WINDUP_TEST.ringing(),
    bed: window.WINDUP_TEST.bedGain(), cranking: window.WINDUP_TEST.cranking() }));
  say(!justAfter.cranking, 'letting go stops the crank');
  say(justAfter.ringing > 0, 'and the tines are still ringing (' + justAfter.ringing + ')');
  await waitFrames(page, 20);
  const later = await T(() => ({ ringing: window.WINDUP_TEST.ringing(), bed: window.WINDUP_TEST.bedGain() }));
  say(later.bed >= 0 && later.bed < 0.004,
    'the mechanism goes quiet on its own (bed at ' + later.bed.toFixed(4) + ')');
  say(later.ringing > 0, 'while the comb is still going (' + later.ringing + ')');

  /* ---- the punch editor, tapped ---- */
  await T(() => window.WINDUP_TEST.setStrip([], 'Empty'));
  const punchBtn = await centre(page, '#btnPunch');
  say(!!punchBtn && punchBtn.onTop && punchBtn.h >= 55,
    'PUNCH is a 56 px target on the box screen (' + (punchBtn ? punchBtn.h.toFixed(0) : 0) + ' px)');
  await page.evaluate(() => document.getElementById('btnPunch').click());
  await waitFrames(page, 3);
  say(await T(() => window.WINDUP_TEST.screen()) === 'punch', 'and it opens the strip');

  const cell = await T(() => window.WINDUP_TEST.punchXY(4, 6));
  await tapAt(page, Math.round(cell.x), Math.round(cell.y));
  await waitFrames(page, 3);
  const one = await T(() => window.WINDUP_TEST.strip().holes.slice());
  say(one.length === 1 && one[0][0] === 4 && one[0][1] === 6,
    'a tap on the paper punches the cell it landed on (' + JSON.stringify(one) + ')');
  await tapAt(page, Math.round(cell.x), Math.round(cell.y));
  await waitFrames(page, 3);
  say((await T(() => window.WINDUP_TEST.strip().holes.length)) === 0,
    'and a second tap on it takes the hole out again');

  /* ---- the refusal ---- */
  await tapAt(page, Math.round(cell.x), Math.round(cell.y));
  await waitFrames(page, 2);
  const near = await T(() => window.WINDUP_TEST.punchXY(5, 6));
  await tapAt(page, Math.round(near.x), Math.round(near.y));
  await waitFrames(page, 3);
  const refused = await T(() => ({ holes: window.WINDUP_TEST.strip().holes.length,
    mark: window.WINDUP_TEST.punch().refused,
    toast: document.getElementById('toast').textContent }));
  say(refused.holes === 1, 'a hole one eighth from another in the same row is refused');
  say(!!refused.mark && refused.mark[0] === 5 && refused.mark[1] === 6,
    'and the paper shows where it would have gone (' + JSON.stringify(refused.mark) + ')');
  say(/tine/i.test(refused.toast), 'and it says why: "' + refused.toast + '"');
  /* two rows apart is fine, which is the other half of the rule */
  const other = await T(() => window.WINDUP_TEST.punchXY(5, 7));
  await tapAt(page, Math.round(other.x), Math.round(other.y));
  await waitFrames(page, 3);
  say((await T(() => window.WINDUP_TEST.strip().holes.length)) === 2,
    'while the same eighth in the row above is fine, because that is a different tine');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' CRANK FAILURE(S)'); process.exit(1); }
console.log('CRANK OK');
