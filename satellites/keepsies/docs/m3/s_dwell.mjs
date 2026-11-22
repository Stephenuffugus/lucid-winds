import { makeGame, playTouch, useKnuckle } from './harness.mjs';
const mj = (s) => (s <= 0 ? 0 : s >= 1 ? 1 : 10 * s ** 3 - 15 * s ** 4 + 6 * s ** 5);
for (const which of ['real', 'ts', 'peak']) for (const dwell of [0, 30, 60, 100, 200]) {
  useKnuckle(which);
  const pw = []; let canc = 0;
  for (let k = 0; k < 24; k++) {
    const g = makeGame({ w: 412, h: 839, phase: 'aim' });
    for (let i = 0; i < 120; i++) g.frame(1 / 60);
    const ts = g.tawOnScreen();
    playTouch(g, (t) => ({ x: ts.x, y: ts.y - 220 * (t > 400 ? mj((t - 400) / 70) : 0) }), 470 + dwell, { fps: 120, touchHz: 240, t0: 1000 + k * 0.35, preFrames: 5 });
    const a = g.G.log.aims[0]; if (a) pw.push(a.power01); else canc++;
  }
  console.log(`${which.padEnd(5)} hard flick 220 px/70 ms, thumb rests ${String(dwell).padStart(3)} ms before lifting: cancelled ${canc}/24, power ${pw.length ? Math.min(...pw).toFixed(2) + '..' + Math.max(...pw).toFixed(2) : '-'}`);
}
