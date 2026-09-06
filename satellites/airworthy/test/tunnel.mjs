/* THE WIND TUNNEL, checked the way a thumb uses it.
 *
 *   node test/tunnel.mjs
 *
 * The one law of the room is that the tunnel cannot lie about the field, and a
 * slate is very easy to make lie: it can be fed by a second copy of the
 * physics, or by a number the flight ignores, and it will look perfectly
 * convincing while it does. So the central assertion here does not read a
 * variable. It takes the glide ratio the tunnel PRINTS, throws the same plane
 * in the field at its own trimmed speed, MEASURES the descent it actually flew,
 * and requires them to agree inside fifteen percent.
 *
 * The other one that matters is drawn, not meant: past the stall angle the lift
 * arrow on the glass must collapse. A slate that says STALLED over a lift arrow
 * that is still full height has taught the player nothing.
 */
import { serve, open, reporter, centre, tap, waitFrames } from './harness.mjs';

const site = await serve();
const { browser, page, errors } = await open(site.base, { width: 375, height: 667 });
const { fails, say } = reporter();
const T = (fn, ...a) => page.evaluate(fn, ...a);

try {
  /* ---- 1. the door ---- */
  const doorC = await centre(page, '#btnTunnel');
  say(!!doorC && doorC.onTop, 'the title screen offers the wind tunnel and a thumb lands on it');
  await tap(page, '#btnTunnel');
  await waitFrames(page, 3);
  say(await T(() => window.AIRWORTHY_TEST.screen()) === 'tunnel', 'and it opens the tunnel');
  const rect = await T(() => window.AIRWORTHY_TEST.tunnel().rect);
  say(!!rect && rect.w > 200 && rect.h > 120,
    'the chamber has real room on a 375 wide screen: ' + (rect ? Math.round(rect.w) + ' by ' + Math.round(rect.h) : 'none'));

  /* ---- 2. every control a thumb can reach ---- */
  for (const [sel, min] of [['#dialWind', 48], ['#dialAlpha', 48], ['#dialTunElev', 48],
    ['#dialTunAil', 48], ['#btnTunTrim', 48], ['#btnTunFly', 48]]) {
    const c = await centre(page, sel);
    say(!!c && c.onTop && c.h >= min - 0.5,
      sel + ' is reachable and ' + (c ? c.h.toFixed(1) : '0') + ' px tall (the floor is ' + min + ')');
  }

  /* ---- 3. the air moves ---- */
  const p0 = await T(() => window.AIRWORTHY_TEST.state() && window.AIRWORTHY_TEST.tunnel().parts);
  say(p0 === 200, 'two hundred streaks are pooled, not allocated in the frame (' + p0 + ')');
  const before = await T(() => window.AIRWORTHY_TEST.tunSample(8));
  await waitFrames(page, 6);
  const after = await T(() => window.AIRWORTHY_TEST.tunSample(8));
  let travel = 0;
  for (let i = 0; i < before.length; i++) travel += Math.abs(after[i].x - before[i].x);
  say(travel > 0.02, 'and the air in it moves: eight streaks travelled ' + travel.toFixed(3)
    + ' chamber widths in six frames');

  /* ---- 4. the stall collapses the lift arrow ---- */
  const setDial = async (sel, want) => {
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel), r = el.getBoundingClientRect();
      return { x: r.left, y: r.top + r.height / 2, w: r.width,
        min: Number(el.min), max: Number(el.max) };
    }, sel);
    const f = (want - box.min) / (box.max - box.min);
    /* a real press on the track, at the point a thumb would put it */
    await page.mouse.click(box.x + 8 + (box.w - 16) * f, box.y);
    await waitFrames(page, 3);
    return page.evaluate((sel) => Number(document.querySelector(sel).value), sel);
  };
  /* ⛔ the stall is measured from the PEAK, which is the stall angle itself,
     not from some shallower angle: a stalled wing at nineteen degrees still
     makes more lift than a clean one at four, and a gate that compares those
     two teaches the opposite of the lesson. */
  const stallDeg = await T(() => window.AIRWORTHY_TEST.tunnelReading(null, 0, 8).stallDeg);
  const peak = await setDial('#dialAlpha', stallDeg - 0.4);
  await waitFrames(page, 4);
  const tPeak = await T(() => window.AIRWORTHY_TEST.tunnel());
  const deep = await setDial('#dialAlpha', 27.5);
  await waitFrames(page, 4);
  const tDeep = await T(() => window.AIRWORTHY_TEST.tunnel());
  say(peak < stallDeg && deep > stallDeg + 8,
    'the dial really moved, onto the peak and then deep past it: ' + peak.toFixed(1) + ' then '
    + deep.toFixed(1) + ' degrees against a stall at ' + stallDeg.toFixed(1));
  say(tPeak.stalled === false && tDeep.stalled === true, 'and the tunnel knows which side it is on');
  say(tPeak.liftLen > 40, 'the lift arrow is at its longest on the peak (' + tPeak.liftLen.toFixed(1) + ' px)');
  say(tDeep.liftLen <= tPeak.liftLen * 0.5,
    'and past the stall it collapses by at least half: ' + tPeak.liftLen.toFixed(1) + ' px to '
    + tDeep.liftLen.toFixed(1) + ' px');
  /* the claim is the DIRECTION, which is the thing that was wrong: before post
     stall drag went into the model this arrow got SHORTER when the wing let go.
     A quarter longer is well past any rounding in the draw. */
  say(tDeep.dragLen >= tPeak.dragLen * 1.25,
    'while the drag arrow grows rather than shrinking: ' + tPeak.dragLen.toFixed(1) + ' px to '
    + tDeep.dragLen.toFixed(1) + ' px');

  /* ---- 5. the slate's colour is derive's opinion, not a mood ---- */
  const stab = await T(() => {
    const kids = document.getElementById('tunReadout').children;
    for (let i = 0; i < kids.length; i += 2) {
      if (kids[i].textContent === 'Balance') {
        return { text: kids[i + 1].textContent, cls: kids[i + 1].className.replace('v', '').trim() };
      }
    }
    return null;
  });
  const margin = await T(() => window.AIRWORTHY_TEST.tunnelReading(null, 4, 8).marginPct);
  const wantCls = margin > 5 ? 'good' : (margin >= 0 ? 'mid' : 'bad');
  say(!!stab && stab.cls === wantCls,
    'the stability row is coloured by derive: margin ' + margin.toFixed(2) + ' percent reads "'
    + (stab ? stab.cls : 'nothing') + '" and derive says "' + wantCls + '"');
  say(!!stab && !/[-‐-―−]/.test(stab.text) && stab.text.indexOf('!') < 0,
    'and it says it without a dash: "' + (stab ? stab.text : '') + '"');

  /* ---- 6. THE ONE THAT MATTERS. The slate against the measured field. ---- */
  const specs = [
    { nose: 'pointed', noseFolds: 3, wing: 0.5, elev: 0 },
    { nose: 'pointed', noseFolds: 3, wing: 0.35, elev: 2 },
    { nose: 'locked', noseFolds: 3, wing: 0.15, elev: 0 },
    { nose: 'blunt', noseFolds: 3, wing: 0.45, elev: 0, fins: 'up' },
    { nose: 'pointed', noseFolds: 2, wing: 0.25, elev: 0 }
  ];
  const cmp = await T((specs) => specs.map(over => {
    const A = window.AIRWORTHY_TEST;
    const spec = Object.assign(A.tunnelReading(null, 0, 8).derived.spec.constructor ? {} : {}, over);
    const full = Object.assign({ nose: 'pointed', noseFolds: 2, wing: 0.5, fins: 'none',
      dihedral: 0.4, precision: 1, elev: 0, ail: 0, clip: 'none' }, over);
    const L = A.trimLaunch(full);
    if (!L) return { over: over, skip: true };
    const R = A.tunnelReading(full, L.alpha0 / (Math.PI / 180), 8);
    const res = A.fly(full, { angle: L.angle, power: L.power, alpha0: L.alpha0, y0: 24 });
    const m = A.measuredGlide(res);
    return { over: over, slate: R.glide, field: m, airtime: res.airtime };
  }), specs);
  let ran = 0;
  for (const c of cmp) {
    if (c.skip) { console.log('  skip  no throw can start this one in its own glide: ' + JSON.stringify(c.over)); continue; }
    ran++;
    const off = Math.abs(c.slate - c.field) / Math.max(0.05, c.field) * 100;
    say(off <= 15, 'the slate says ' + c.slate.toFixed(2) + ' to 1 and the field flew '
      + c.field.toFixed(2) + ' to 1, off by ' + off.toFixed(1) + ' percent  ' + JSON.stringify(c.over));
  }
  say(ran >= 3, 'and it was measured on ' + ran + ' different planes, not one');

  /* ---- 7. the trim button, and the elevator that changes the answer ---- */
  await tap(page, '#btnTunTrim');
  await waitFrames(page, 3);
  const afterTrim = await T(() => ({
    dial: Number(document.getElementById('dialAlpha').value),
    t: window.AIRWORTHY_TEST.tunnel()
  }));
  say(Math.abs(afterTrim.dial - afterTrim.t.trimDeg) <= 0.6,
    'TRIMMED ANGLE puts the dial on the angle the plane settles at: dial '
    + afterTrim.dial.toFixed(1) + ', trim ' + afterTrim.t.trimDeg.toFixed(2));
  /* ⛔ the plane you start with trims AT its stall, which is the porpoise the
     whole game is about, and a trim angle sitting on that clamp cannot move up.
     So the elevator is tested the way the game teaches it: bend it DOWN and the
     nose comes down with it. */
  const elevBefore = await T(() => window.AIRWORTHY_TEST.tunnel().trimDeg);
  const elevSet = await (async () => {
    const box = await page.evaluate(() => {
      const el = document.getElementById('dialTunElev'), r = el.getBoundingClientRect();
      return { x: r.left, y: r.top + r.height / 2, w: r.width };
    });
    await page.mouse.click(box.x + 8 + (box.w - 16) * 0.08, box.y);
    await waitFrames(page, 3);
    return page.evaluate(() => ({
      elev: window.AIRWORTHY_TEST.spec().elev,
      trim: window.AIRWORTHY_TEST.tunnel().trimDeg
    }));
  })();
  say(elevSet.elev <= -6, 'a press near the low end of the elevator dial bends it down: ' + elevSet.elev);
  say(elevSet.trim < elevBefore - 1.5,
    'and the trimmed angle comes down with it: ' + elevBefore.toFixed(2) + ' to '
    + elevSet.trim.toFixed(2) + ' degrees');

  /* ---- 8. and out to the field with what you tuned ---- */
  await tap(page, '#btnTunFly');
  await waitFrames(page, 3);
  const out = await T(() => ({ screen: window.AIRWORTHY_TEST.screen(), elev: window.AIRWORTHY_TEST.spec().elev }));
  say(out.screen === 'field', 'FLY IT goes to the field');
  say(out.elev === elevSet.elev, 'and it takes the elevator you just bent with it (' + out.elev + ')');

  say(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
} finally {
  await browser.close();
  site.close();
}
console.log('');
if (fails.length) { console.log(fails.length + ' TUNNEL FAILURE(S)'); process.exit(1); }
console.log('TUNNEL OK');
