#!/usr/bin/env node
/* The thumb's path through a cave, in a real browser.
 *
 *   node test/play.mjs
 *
 * What it asserts, each watched to fail (the fail column is in the ledger):
 *   1. a real 80 px drag to the right moves the player right, in world units
 *   2. a drag NEVER throws: the slop rule is what lets one surface carry both
 *   3. a real tap spends exactly one stone and lights walls that were dark
 *   4. the light ARRIVES: more walls are lit later than a moment after the ping
 *   5. a second finger while the stick is live throws AT ONCE, no slop wait
 *   6. the stone count on the screen is the number the sim is holding
 *   7. the hum button spends no stone and refuses a second hum on its cooldown
 *   9. THE EMPTY HAND: a tap with no stone left is answered, seen and heard
 *
 * ⛔ Nothing here calls a handler. Every press is a real pointer event on the
 * element a thumb would land on, and every wait is on what the sim believes,
 * never on a clock: this rig runs at a few frames a second.
 */
import { serve, open, reporter, tap, centre, tapAt, drag, dragEnd, sleep , waitFrames} from './harness.mjs';

const { base, close } = await serve();
const { browser, page, errors } = await open(base);
const { fails, say } = reporter();
const dev = (fn, ...a) => page.evaluate(fn, ...a);

await tap(page, '#btnPlay');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'select', { timeout: 20000 });
await tap(page, '.card[data-lv="0"]');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play', { timeout: 20000 });
await waitFrames(page, 6);

const at = await dev(() => {
  const p = window.FATHOM_DEV.player();
  return window.FATHOM_DEV.screenOf(p.x, p.y);
});

/* 1 and 2. the drag moves you, and NEVER throws.
   Counted with the sim's own throw counter at three moments, because the first
   version of this inferred it from the stone count after the second finger had
   already thrown, and it stayed green with the slop rule broken. */
const before = await dev(() => ({ p: window.FATHOM_DEV.player(), s: window.FATHOM_DEV.state() }));
await drag(page, at.x - 60, at.y + 120, at.x + 20, at.y + 120, 8);
const moved = await page.waitForFunction((x0) => window.FATHOM_DEV.player().x > x0 + 8, { timeout: 25000 }, before.p.x)
  .then(() => true).catch(() => false);
const mid = await dev(() => ({ p: window.FATHOM_DEV.player(), s: window.FATHOM_DEV.state() }));
say(moved && mid.p.x > before.p.x + 8,
  'a real 80 px drag to the right moved the player right, world x ' + before.p.x.toFixed(1) + ' to ' + mid.p.x.toFixed(1));
say(mid.s.throws === before.s.throws,
  'and the drag threw nothing while it was held (' + before.s.throws + ' throws, still ' + mid.s.throws + ')');

/* 5. a second finger while the stick is live throws at once, no slop wait */
await tapAt(page, at.x + 40, at.y - 40);
const threwFast = await page.waitForFunction((n) => window.FATHOM_DEV.state().throws === n + 1, { timeout: 20000 }, mid.s.throws)
  .then(() => true).catch(() => false);
const afterSecond = await dev(() => window.FATHOM_DEV.state());
say(threwFast && afterSecond.throws === mid.s.throws + 1,
  'a second finger while the stick is live throws at once (' + mid.s.throws + ' throws to ' + afterSecond.throws + ')');
say(afterSecond.stones === mid.s.stones - 1, 'and that throw is the one stone that was spent');

await dragEnd(page, at.x + 20, at.y + 120);
await sleep(200);
const afterRelease = await dev(() => window.FATHOM_DEV.state());
say(afterRelease.throws === afterSecond.throws,
  'letting the stick go throws nothing either (' + afterSecond.throws + ' throws, still ' + afterRelease.throws + ')');

/* 3 and 4. a real tap lights the cave */
await page.waitForFunction(() => window.FATHOM_DEV.state().ripples.length === 0, { timeout: 40000 }).catch(() => {});
const litBefore = await dev(() => window.FATHOM_DEV.litWalls());
const stones0 = await dev(() => window.FATHOM_DEV.state().stones);
const throws0 = await dev(() => window.FATHOM_DEV.state().throws);
const here = await dev(() => { const p = window.FATHOM_DEV.player(); return window.FATHOM_DEV.screenOf(p.x, p.y); });
await tapAt(page, here.x + 30, here.y + 70);
const spent = await page.waitForFunction((n) => window.FATHOM_DEV.state().stones === n - 1, { timeout: 20000 }, stones0)
  .then(() => true).catch(() => false);
say(spent, 'a real tap on the cave spends exactly one stone (' + stones0 + ' to ' + (await dev(() => window.FATHOM_DEV.state().stones)) + ')');
say((await dev(() => window.FATHOM_DEV.state().throws)) === throws0 + 1, 'a tap with no drag in it IS a throw, which is the other half of the slop rule');

const gotLight = await page.waitForFunction((n) => window.FATHOM_DEV.litWalls() > n, { timeout: 30000 }, litBefore)
  .then(() => true).catch(() => false);
const litEarly = await dev(() => window.FATHOM_DEV.litWalls());
say(gotLight && litEarly > litBefore, 'and the stone lights the cave: ' + litBefore + ' walls lit before it, ' + litEarly + ' after');

const litLate = await page.waitForFunction((n) => window.FATHOM_DEV.litWalls() > n + 3, { timeout: 30000 }, litEarly)
  .then(() => page.evaluate(() => window.FATHOM_DEV.litWalls())).catch(() => litEarly);
say(litLate > litEarly, 'and it ARRIVES rather than switching on: ' + litEarly + ' walls, then ' + litLate);

/* 6. what the screen says is what the sim holds */
const hud = await dev(() => window.FATHOM_DEV.hud());
const sim = await dev(() => window.FATHOM_DEV.state().stones);
say(String(sim) === String(hud.stones), 'the stone count on the screen is the sim count (screen ' + hud.stones + ', sim ' + sim + ')');

/* 7. the hum */
const bHum = await centre(page, '#btnHum');
say(!!bHum && bHum.w >= 48 && bHum.h >= 48 && bHum.onTop,
  'the hum button is ' + (bHum ? bHum.w.toFixed(0) + 'x' + bHum.h.toFixed(0) : 'missing') + ' px and a tap at its centre lands on it');
const stonesPreHum = await dev(() => window.FATHOM_DEV.state().stones);
const ripplesPre = await dev(() => window.FATHOM_DEV.state().ripples.length);
await tap(page, '#btnHum');
const hummed = await page.waitForFunction((n) => window.FATHOM_DEV.state().ripples.length > n, { timeout: 20000 }, ripplesPre)
  .then(() => true).catch(() => false);
say(hummed, 'the hum makes a ring');
say((await dev(() => window.FATHOM_DEV.state().stones)) === stonesPreHum, 'and it costs no stone');
/* counted, not inferred from the ripple list: a ripple that simply expired
   would have satisfied a `ripples.length did not grow` check on its own */
const humsAfter = await dev(() => window.FATHOM_DEV.state().hums);
await tap(page, '#btnHum');
await sleep(200);
const humsLater = await dev(() => window.FATHOM_DEV.state().hums);
say(humsLater === humsAfter, 'a second hum inside the cooldown is refused (' + humsAfter + ' hums, still ' + humsLater + ')');

/* 8. the audio budget. Silence is this game's instrument, so the mix is counted
   rather than hoped: at most twelve sounding nodes, with the ambient drone and
   one slither voice per lurker among them. */
say(await dev(() => window.FATHOM_DEV.audioReady()), 'the audio context opened on the first press');
let peak = 0;
for (let i = 0; i < 6; i++) {
  const p2 = await dev(() => { const q = window.FATHOM_DEV.player(); return window.FATHOM_DEV.screenOf(q.x, q.y); });
  await tapAt(page, Math.max(24, Math.min(340, p2.x + (i % 2 ? 60 : -60))), Math.max(30, Math.min(460, p2.y + 60)));
  await tap(page, '#btnHum');
  peak = Math.max(peak, await dev(() => window.FATHOM_DEV.voices()));
  await sleep(90);
}
peak = Math.max(peak, await dev(() => window.FATHOM_DEV.voices()));
say(peak > 0 && peak <= 12, 'six throws and six hums never put more than twelve voices in the air (peak ' + peak + ')');

/* 9. THE EMPTY HAND. Stephen, Sep 07, line 25: "I keep running out of stones
   and then it's basically impossible." The sort found the silent half of that
   (plan, SESSION STATE): a tap at zero drew the amber reticle and then nothing
   happened, no line, no sound, and the 0 STONES counter sat at a fifth of its
   brightness. Every assertion above is made with stones in hand, and the
   harness's own walker refuses to throw under two, so nothing here had ever
   tapped at zero. This restarts the cave from the pause (which is what the line
   at zero tells a player to do), spends the whole hand through real taps, and
   then taps once more with nothing to throw. Differentials throughout: the
   amber reticle is seen with a stone in hand before it is seen absent, and the
   HUD is seen dim before the tap wakes it. */
await tap(page, '#btnPause');
await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'pause', { timeout: 20000 });
await tap(page, '#btnRestart');
/* caught, not thrown: a RESTART that only resumed used to kill this gate with
   a TimeoutError stack instead of one red line naming the button */
const restarted = await page.waitForFunction(() => window.FATHOM_DEV.screen() === 'play' && window.FATHOM_DEV.state().stones > 0, { timeout: 20000 })
  .then(() => true).catch(() => false);
await waitFrames(page, 4);
const fresh = await dev(() => window.FATHOM_DEV.state());
say(restarted && fresh.stones > 0 && fresh.throws === 0, 'RESTART CAVE from the pause hands back a full hand (' + fresh.stones + ' stones, ' + fresh.throws + ' throws)');

/* a finger down, held for frames, then lifted: two events, so the reticle is
   DRAWN while it is down. tapAt lands both in one go and draws nothing. */
const press = (x, y) => drag(page, x, y, x, y, 0);
const lift = (x, y) => dragEnd(page, x, y);
const aimPoint = () => dev(() => {
  const p = window.FATHOM_DEV.player(); const s = window.FATHOM_DEV.screenOf(p.x, p.y);
  return { x: Math.max(24, Math.min(window.innerWidth - 24, s.x + 34)), y: Math.max(30, Math.min(window.innerHeight - 200, s.y + 72)) };
});
/* the pixels in a 28 px box round the reticle, sorted by what they are. Amber
   is the armed reticle and nothing else this close to the player (walls are
   cyan, the glow is teal, a ghost is red); grey is the reticle with no stone. */
const reticlePixels = () => dev(() => {
  const r = window.FATHOM_DEV.reticle(); if (!r) return null;
  const cv = document.getElementById('board'); const dpr = cv.width / window.innerWidth;
  const R = 14, d = cv.getContext('2d').getImageData(Math.round((r.x - R) * dpr), Math.round((r.y - R) * dpr), Math.round(2 * R * dpr), Math.round(2 * R * dpr)).data;
  let amber = 0, grey = 0;
  for (let i = 0; i < d.length; i += 4) {
    const rr = d[i], gg = d[i + 1], bb = d[i + 2];
    if (rr > 150 && gg > 110 && bb < 130 && rr > bb + 50) amber++;
    else if (rr > 20 && rr < 140 && Math.abs(rr - gg) < 30 && Math.abs(gg - bb) < 30) grey++;
  }
  return { amber, grey };
});

let aim = await aimPoint();
await press(aim.x, aim.y);
await waitFrames(page, 3);
const armed = await reticlePixels();
say(!!armed && armed.amber > 0, 'with a stone in hand the held finger draws the amber reticle (' + (armed ? armed.amber + ' amber px' : 'no reticle') + ')');
await lift(aim.x, aim.y);
const firstThrow = await page.waitForFunction((n) => window.FATHOM_DEV.state().throws === n + 1, { timeout: 20000 }, fresh.throws).then(() => true).catch(() => false);
say(firstThrow, 'and lifting it is the throw');

/* spend the rest through taps, and catch the last stone's line as it goes.
   Before the LAST throw the HUD is let dim ON THE SCREEN, so its waking is that
   throw's doing: board taps never wake the HUD and the hand is spent in under
   three seconds, so the HUD was never dim here and "wakes the HUD" stayed
   green with the wake removed from the last case (the reviewer's mutation,
   Sep 08). Seen dim before, seen woken after, or it is not an assertion. */
let lastLine = null, spentTaps = 1, dimBeforeLast = false, lastWoke = false, lastOpacity = '';
for (let k = 0; k < 40; k++) {
  const s = await dev(() => window.FATHOM_DEV.state());
  if (s.stones <= 0) break;
  if (s.stones === 1) dimBeforeLast = await page.waitForFunction(() => Number(window.FATHOM_DEV.hud().opacity) <= 0.21, { timeout: 120000 }).then(() => true).catch(() => false);
  aim = await aimPoint();
  await tapAt(page, aim.x + (k % 2 ? 40 : -40), aim.y);
  const threw = await page.waitForFunction((n) => window.FATHOM_DEV.state().throws === n + 1, { timeout: 20000 }, s.throws).then(() => true).catch(() => false);
  if (!threw) break;
  spentTaps++;
  if (s.stones === 1) {
    lastLine = await dev(() => ({ hint: window.FATHOM_DEV.hint(), hud: window.FATHOM_DEV.hud() }));
    lastWoke = await page.waitForFunction(() => Number(window.FATHOM_DEV.hud().opacity) >= 0.99, { timeout: 20000 }).then(() => true).catch(() => false);
    lastOpacity = await dev(() => window.FATHOM_DEV.hud().opacity);
  }
}
const empty0 = await dev(() => ({ s: window.FATHOM_DEV.state(), snd: window.FATHOM_DEV.sounds() }));
say(empty0.s.stones === 0, 'the thumb can spend the hand to nothing through its own taps (' + spentTaps + ' taps, ' + empty0.s.stones + ' left)');
say(!!lastLine && lastLine.hint.on && lastLine.hint.text === 'the last stone',
  'the throw that spends the last stone puts up its line: ' + (lastLine ? JSON.stringify(lastLine.hint.text) + (lastLine.hint.on ? '' : ' (not on)') : 'never seen'));
say(!!lastLine && dimBeforeLast && !lastLine.hud.dim && lastWoke,
  'and wakes the HUD, seen dim before that throw, so the 0 can be read (' + (dimBeforeLast ? 'dim before' : 'NEVER dim before') + ', class ' + (lastLine ? (lastLine.hud.dim ? 'still dim' : 'woken') : 'unread') + ', opacity ' + lastOpacity + ')');

/* let the HUD dim on its own clock, then the tap at zero */
const dimmed = await page.waitForFunction(() => window.FATHOM_DEV.hud().dim, { timeout: 120000 }).then(() => true).catch(() => false);
/* and the eye's version of it: the transition has actually reached 0.2. The
   first aim shot fired inside the 500 ms and showed a bright HUD over a dim
   class, which is the class being true and the look being false. */
const dimSeen = await page.waitForFunction(() => Number(window.FATHOM_DEV.hud().opacity) <= 0.21, { timeout: 20000 }).then(() => true).catch(() => false);
say(dimmed && dimSeen, 'the HUD dims on its own after the last touch, to a fifth on the screen (opacity ' + (await dev(() => window.FATHOM_DEV.hud().opacity)) + ')');
aim = await aimPoint();
await press(aim.x, aim.y);
await waitFrames(page, 3);
const unarmed = await reticlePixels();
say(!!unarmed && unarmed.amber === 0, 'with nothing to throw the held finger draws no amber (' + (unarmed ? unarmed.amber + ' amber px' : 'no reticle') + ')');
say(!!unarmed && unarmed.grey > 0, 'but the finger is acknowledged in grey (' + (unarmed ? unarmed.grey : 0) + ' grey px)');
await lift(aim.x, aim.y);
const refused = await page.waitForFunction((n) => window.FATHOM_DEV.state().empty === n + 1, { timeout: 20000 }, empty0.s.empty).then(() => true).catch(() => false);
const after = await dev(() => ({ s: window.FATHOM_DEV.state(), snd: window.FATHOM_DEV.sounds(), hud: window.FATHOM_DEV.hud() }));
say(refused && after.s.throws === empty0.s.throws && after.s.stones === 0,
  'a tap at zero is refused as an EVENT, not silently (' + empty0.s.empty + ' refusals to ' + after.s.empty + ', ' + after.s.throws + ' throws still)');
const line = await page.waitForFunction(() => { const t = window.FATHOM_DEV.toast(); return t.on && t.text.length > 0 && t.opacity === '1'; }, { timeout: 20000 })
  .then(() => dev(() => window.FATHOM_DEV.toast())).catch(() => null);
say(!!line, 'and a line is on the screen at full opacity: ' + (line ? JSON.stringify(line.text) : 'nothing came up'));
say(!!line && /hum/i.test(line.text) && /cache/i.test(line.text) && /restart/i.test(line.text),
  'the line names the three ways out, the hum, a cache and the restart, because HOW TO PLAY is three lines by law');
const woke = await page.waitForFunction(() => Number(window.FATHOM_DEV.hud().opacity) >= 0.99, { timeout: 20000 }).then(() => true).catch(() => false);
say(!after.hud.dim && woke, 'the tap at zero wakes the HUD, so 0 STONES and the HUM button the line points at are readable (opacity ' + (await dev(() => window.FATHOM_DEV.hud().opacity)) + ')');
say((after.snd.empty || 0) === (empty0.snd.empty || 0) + 1,
  'and the refusal is heard: the empty knock was scheduled once (' + (empty0.snd.empty || 0) + ' to ' + (after.snd.empty || 0) + ')');

say(errors.length === 0, 'nothing landed on the console' + (errors.length ? ': ' + errors.join(' | ') : ''));

await browser.close(); close();
console.log('');
if (fails.length) { console.log(fails.length + ' PLAY FAILURE(S)'); process.exit(1); }
console.log('PLAY OK');
