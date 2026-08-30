/* RIPCORD WIND — grades a hand-drawn winding gesture.
 *
 * The player draws laps around their top. How round, how even, how fast and
 * which way they draw becomes the launch. Nothing here touches the DOM; it
 * takes an array of {x, y, t} samples and returns launch parameters.
 *
 * Design rule: a bad wind is not simply weaker, it is WILDER. Sloppy laps put
 * metal in the wrong place, which means less spin but more travel and a bigger
 * heavy-side swing. A nine-year-old scribbling three fast ovals gets a wobbling
 * monster that sometimes deletes a perfect build. That is the whole brief.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WIND = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const W = {
    laps: 3,               // laps the player is asked for
    lapTol: 0.55,          // laps of slack before it hurts
    roundBand: 0.20,       // rms radial error / R at which roundness scores 0
    driftBand: 0.34,       // centre drift / R at which concentricity scores 0
    evenBand: 0.55,        // angular speed CV at which evenness scores 0
    fastAt: 9.5,           // rad/s of drawing that reads as a hard, fast wind
    slowAt: 2.2,           // below this the wind is too loose to matter
    minPts: 24,
    // how the grade maps onto the launch
    powLo: 0.95, powHi: 1.05,
    imbMax: 0.17,          // worst wind adds this much static imbalance
    leanLo: 0.030, leanHi: 0.078
  };

  // ---- least-squares circle fit (Kasa). Returns {cx, cy, r}.
  function fitCircle(pts) {
    let n = pts.length, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sz = 0, sxz = 0, syz = 0;
    for (const p of pts) {
      const z = p.x * p.x + p.y * p.y;
      sx += p.x; sy += p.y; sxx += p.x * p.x; syy += p.y * p.y; sxy += p.x * p.y;
      sz += z; sxz += p.x * z; syz += p.y * z;
    }
    // solve [ sxx sxy sx ; sxy syy sy ; sx sy n ] [A B C]^T = [sxz syz sz]^T
    const m = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]];
    const v = [sxz, syz, sz];
    const sol = solve3(m, v);
    if (!sol) {
      let cx = sx / n, cy = sy / n, r = 0;
      for (const p of pts) r += Math.hypot(p.x - cx, p.y - cy);
      return { cx, cy, r: r / n };
    }
    const cx = sol[0] / 2, cy = sol[1] / 2;
    const r = Math.sqrt(Math.max(1e-9, sol[2] + cx * cx + cy * cy));
    return { cx, cy, r };
  }

  function solve3(m, v) {
    const a = m.map((row, i) => row.concat([v[i]]));
    for (let i = 0; i < 3; i++) {
      let p = i;
      for (let k = i + 1; k < 3; k++) if (Math.abs(a[k][i]) > Math.abs(a[p][i])) p = k;
      if (Math.abs(a[p][i]) < 1e-12) return null;
      const tmp = a[i]; a[i] = a[p]; a[p] = tmp;
      for (let k = i + 1; k < 3; k++) {
        const f = a[k][i] / a[i][i];
        for (let j = i; j < 4; j++) a[k][j] -= f * a[i][j];
      }
    }
    const out = [0, 0, 0];
    for (let i = 2; i >= 0; i--) {
      let s = a[i][3];
      for (let j = i + 1; j < 3; j++) s -= a[i][j] * out[j];
      out[i] = s / a[i][i];
    }
    return out;
  }

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const band = (err, width) => clamp(1 - err / width, 0, 1);

  /* grade(points, opts) -> report
   * points: [{x, y, t}] in any consistent units, t in ms.
   */
  function grade(points, opts) {
    const o = opts || {};
    const want = o.laps || W.laps;
    const pts = dedupe(points);
    if (pts.length < W.minPts) return fail('too short');

    const fit = fitCircle(pts);
    if (!(fit.r > 1e-6)) return fail('no circle');

    // --- unwrap the angle so we can count laps and find direction
    let prev = Math.atan2(pts[0].y - fit.cy, pts[0].x - fit.cx);
    let total = 0;
    const ang = [prev];
    for (let i = 1; i < pts.length; i++) {
      let a = Math.atan2(pts[i].y - fit.cy, pts[i].x - fit.cx);
      let d = a - prev;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      total += d; prev = a; ang.push(ang[i - 1] + d);
    }
    const laps = Math.abs(total) / (Math.PI * 2);
    if (laps < 0.4) return fail('not a loop');
    const dir = total >= 0 ? 1 : -1;      // drawing direction IS spin direction

    // --- radii and roundness
    const rad = pts.map(p => Math.hypot(p.x - fit.cx, p.y - fit.cy));
    const rMean = rad.reduce((a, b) => a + b, 0) / rad.length;
    let ss = 0;
    for (const r of rad) ss += (r - rMean) * (r - rMean);
    const rErr = Math.sqrt(ss / rad.length) / rMean;
    const roundness = band(rErr, W.roundBand);

    // --- concentricity: do the laps stack on each other, or spiral away?
    //     Compare the mean radius of the first third and the last third.
    const third = Math.floor(rad.length / 3);
    const rFirst = mean(rad.slice(0, third)), rLast = mean(rad.slice(-third));
    const drift = Math.abs(rLast - rFirst) / rMean;
    const concentric = band(drift, W.driftBand);

    // --- lap count: short-changing the wind costs you
    const lapErr = Math.abs(laps - want) / want;
    const lapScore = band(Math.max(0, lapErr - W.lapTol / want), 0.55);

    // --- evenness and speed of the pull
    const dt = [], av = [];
    for (let i = 1; i < pts.length; i++) {
      const ms = Math.max(1, pts[i].t - pts[i - 1].t);
      dt.push(ms);
      av.push(Math.abs(ang[i] - ang[i - 1]) / (ms / 1000));
    }
    const avMean = mean(av);
    const avCv = std(av) / Math.max(avMean, 1e-6);
    const even = band(avCv, W.evenBand);
    const speed = clamp((avMean - W.slowAt) / (W.fastAt - W.slowAt), 0, 1);

    // --- WHERE the circle went wrong. The largest outward bulge marks the
    //     heavy side of the wind, and that becomes the top's imbalance phase.
    let worst = 0, worstAng = 0;
    for (let i = 0; i < pts.length; i++) {
      const dev = rad[i] - rMean;
      if (Math.abs(dev) > Math.abs(worst)) {
        worst = dev;
        worstAng = Math.atan2(pts[i].y - fit.cy, pts[i].x - fit.cx);
      }
    }

    // --- composite
    // Quality is craft: how round, how steady, how well the laps stack.
    const quality = clamp(
      0.52 * roundness + 0.24 * even + 0.24 * concentric, 0, 1);

    // Lap count is not craft, it is charge. Half a wind is half a wind, and
    // no amount of neatness fixes it.
    const lapRatio = clamp(laps / want, 0, 1.15);
    const charge = 0.72 + 0.28 * lapRatio;

    // Over-winding. Past 1.2x the ask the string starts binding on itself: no
    // extra spin, a growing lump of it on one side, and eventually less power
    // than a clean three laps would have given. There has to be a reason to
    // stop, or "wind forever" is the dominant strategy.
    const over = Math.max(0, laps / want - 1.20);
    const overImb = Math.min(0.16, over * 0.55);
    const overPow = 1 - Math.min(0.28, over * 0.62);

    // Power blends craft and effort, then scales by how much you actually wound.
    const power = (W.powLo + (W.powHi - W.powLo) *
                   clamp(0.62 * quality + 0.38 * speed, 0, 1)) * charge * overPow;
    const imb = Math.min(W.imbMax + 0.16,
                         W.imbMax * Math.pow(1 - quality, 1.35) + overImb);
    const lean = W.leanLo + (W.leanHi - W.leanLo) * (1 - quality);

    return {
      ok: true,
      grade: letter(clamp(quality * (0.50 + 0.50 * lapRatio) * overPow, 0, 1)),
      quality, roundness, even, concentric, lapScore, speed, charge, over,
      laps, dir, rErr, drift, avCv,
      fit,
      launch: {
        power,                       // multiplier on launch spin
        dir,                         // spin direction from drawing direction
        lean,                        // starting lean: sloppy wind starts tilted
        windImb: imb,                // static imbalance added by the wind
        windImbAng: worstAng,        // where the heavy side sits
        phase: worstAng              // rotational phase at launch
      },
      note: coach(roundness, even, concentric, clamp(lapRatio, 0, 1), speed, over)
    };
  }

  function fail(why) {
    return {
      ok: false, grade: '—', quality: 0, note: why,
      launch: { power: W.powLo, dir: 1, lean: W.leanHi, windImb: W.imbMax,
                windImbAng: 0, phase: 0 }
    };
  }

  function letter(q) {
    return q > 0.90 ? 'S' : q > 0.78 ? 'A' : q > 0.62 ? 'B'
         : q > 0.44 ? 'C' : q > 0.26 ? 'D' : 'E';
  }

  // One line, naming the biggest single problem. Never a list.
  function coach(round, even, conc, lap, speed, over) {
    if (over > 0.05) return 'Over-wound. Stop at three.';
    if (lap < 0.55) return 'Short wind. Finish the laps.';
    const worst = [['rounder laps', round], ['a steadier pull', even],
                   ['laps stacked on each other', conc]]
      .sort((a, b) => a[1] - b[1])[0];
    if (worst[1] > 0.85) return speed < 0.35 ? 'Clean wind. Pull faster.' : 'Clean, fast wind.';
    return 'Try ' + worst[0] + '.';
  }

  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(a.length, 1);
  function std(a) { const m = mean(a); return Math.sqrt(mean(a.map(v => (v - m) * (v - m)))); }

  function dedupe(points) {
    const out = [];
    for (const p of points) {
      const q = out[out.length - 1];
      if (!q || Math.hypot(p.x - q.x, p.y - q.y) > 0.5) out.push(p);
    }
    return out;
  }

  /* applyWind(spec, launch) -> spec
   * Folds the wind into a built top. The wind's imbalance stacks on top of the
   * imbalance the player built with counterweights, so a wild build wound badly
   * is genuinely feral.
   */
  function applyWind(SIM, spec, launch) {
    const imb = Math.min(0.42, spec.imb + launch.windImb);
    const base = { drive: spec.drive / (1 + SIM.K.imbDrive * spec.imb),
                   stamina: spec.stamina / (1 - 0.42 * spec.imb) };
    return Object.assign({}, spec, {
      imb,
      imbAng: launch.windImb > spec.imb ? launch.windImbAng : spec.imbAng,
      drive: base.drive * (1 + SIM.K.imbDrive * imb),
      stamina: base.stamina * (1 - 0.42 * imb),
      dir: launch.dir
    });
  }

  return { W, grade, fitCircle, applyWind };
});
