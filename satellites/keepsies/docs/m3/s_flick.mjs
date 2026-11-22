// THE FLICK: the same physical flick, played through the real knuckle at different phases of the
// display clock, 60 and 120 Hz delivery, and what power, speed and direction come out.
import { makeGame, playTouch, rng, gauss } from './harness.mjs';
const D = 180 / Math.PI;
const MPX = 0.000264;
// minimum jerk displacement fraction
const mj = (s) => (s <= 0 ? 0 : s >= 1 ? 1 : 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
function flickPath(tx, ty, o) {
  // hold for o.hold ms at the taw (+offset, +noise), then move o.dist px along o.dirDeg (0 = straight up) over o.dur ms, then dwell o.dwell ms, then lift
  const r = rng(o.seed || 1);
  const th = (o.dirDeg || 0) / D;
  const ux = Math.sin(th), uy = -Math.cos(th);
  const noise = {};
  return (t) => {
    const k = Math.round(t * 10);
    if (!(k in noise)) noise[k] = [gauss(r) * (o.noise || 0), gauss(r) * (o.noise || 0)];
    const n = noise[k];
    let s = 0;
    if (t > o.hold) s = mj((t - o.hold) / o.dur);
    // a natural thumb arc: the path bows sideways by o.bow px at mid flick
    const bow = (o.bow || 0) * Math.sin(Math.PI * s);
    return { x: tx + (o.offX || 0) + ux * o.dist * s + (-uy) * bow + n[0], y: ty + (o.offY || 0) + uy * o.dist * s + ux * bow + n[1] };
  };
}
function oneFlick(o, phaseMs, fps, hz, calib) {
  const g = makeGame({ w: 412, h: 839, phase: 'aim', calib });
  for (let i = 0; i < 120; i++) g.frame(1 / 60);
  const ts = g.tawOnScreen();
  const path = flickPath(ts.x, ts.y, o);
  const total = o.hold + o.dur + (o.dwell || 0);
  playTouch(g, path, total, { fps, touchHz: hz, t0: 1000 + phaseMs, preFrames: 10 });
  const aim = g.G.log.aims[0] || null;
  return { aim, cancel: g.G.log.cancels[0] || null, ts };
}
const cases = [
  { name: 'brisk flick 120 px in 70 ms (true mean 1.71 px/ms = 0.45 m/s)', hold: 400, dist: 120, dur: 70 },
  { name: 'hard flick 220 px in 70 ms (true mean 3.14 px/ms = 0.83 m/s)', hold: 400, dist: 220, dur: 70 },
  { name: 'very hard 300 px in 55 ms (true mean 5.45 px/ms = 1.44 m/s)', hold: 400, dist: 300, dur: 55 },
  { name: 'short snap 60 px in 35 ms (true mean 1.71 px/ms)', hold: 400, dist: 60, dur: 35 },
  { name: 'push 160 px in 220 ms (true mean 0.73 px/ms)', hold: 400, dist: 160, dur: 220 },
  { name: 'hard flick 220 px/70 ms, thumb STOPS 60 ms then lifts', hold: 400, dist: 220, dur: 70, dwell: 60 },
  { name: 'hard flick 220 px/70 ms, thumb STOPS 100 ms then lifts', hold: 400, dist: 220, dur: 70, dwell: 100 },
];
const out = [];
for (const c of cases) {
  for (const [fps, hz] of [[60, 120], [120, 120], [120, 240]]) {
    const pw = [], sp = [], fine = [], why = [];
    for (let k = 0; k < 24; k++) {
      const phase = (k / 24) * (1000 / fps);
      const r = oneFlick(c, phase, fps, hz);
      if (r.aim) { pw.push(r.aim.power01); sp.push(r.aim.thumbSpeed); fine.push(r.aim.fineDeg); } else why.push(r.cancel);
    }
    const st = (a) => a.length ? `${Math.min(...a).toFixed(2)}..${Math.max(...a).toFixed(2)} (mean ${(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2)})` : '-';
    const line = `${c.name} | ${fps} fps, ${hz} Hz touch | measured speed m/s ${st(sp)} | power01 ${st(pw)} | cancelled ${why.length}/24 ${why.length ? '(' + why[0] + ')' : ''}`;
    console.log(line); out.push(line);
  }
}
