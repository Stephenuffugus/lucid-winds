import { makeGame, playTouch, rng, gauss, useKnuckle } from './harness.mjs';
const mj = (s) => (s <= 0 ? 0 : s >= 1 ? 1 : 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
const launch = (p) => 0.5 + 5.5 * (1 - Math.pow(1 - p, 21 / 16));
function run(which, c, fps, hz) {
  useKnuckle(which);
  const pw = [], sp = [];
  for (let k = 0; k < 24; k++) {
    const g = makeGame({ w: 412, h: 839, phase: 'aim' });
    for (let i = 0; i < 120; i++) g.frame(1 / 60);
    const ts = g.tawOnScreen();
    const path = (t) => { const s = t > c.hold ? mj((t - c.hold) / c.dur) : 0; return { x: ts.x, y: ts.y - c.dist * s }; };
    playTouch(g, path, c.hold + c.dur, { fps, touchHz: hz, t0: 1000 + (k / 24) * (1000 / fps), preFrames: 10 });
    const a = g.G.log.aims[0]; if (a) { pw.push(a.power01); sp.push(a.thumbSpeed); }
  }
  const mn = Math.min(...pw), mx = Math.max(...pw);
  return `power ${mn.toFixed(2)}..${mx.toFixed(2)} => launch ${launch(mn).toFixed(2)}..${launch(mx).toFixed(2)} m/s (spread ${(launch(mx) - launch(mn)).toFixed(2)}) speed ${Math.min(...sp).toFixed(2)}..${Math.max(...sp).toFixed(2)}`;
}
for (const c of [{ n: 'short snap 60 px / 35 ms', hold: 400, dist: 60, dur: 35 }, { n: 'brisk 120 px / 70 ms', hold: 400, dist: 120, dur: 70 }, { n: 'hard 220 px / 70 ms', hold: 400, dist: 220, dur: 70 }]) {
  for (const [fps, hz] of (process.env.FPS ? [[+process.env.FPS, 120]] : [[60, 120], [120, 240]])) {
    console.log(`${c.n.padEnd(26)} ${fps}fps/${hz}Hz | LIVE (handler time): ${run('real', c, fps, hz)}`);
    console.log(`${''.padEnd(26)} ${fps}fps/${hz}Hz | ev.timeStamp:        ${run('ts', c, fps, hz)}`);
  }
}
