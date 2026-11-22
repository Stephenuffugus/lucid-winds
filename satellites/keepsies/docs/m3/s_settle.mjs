// The brace: does a real thumb's noise ever let the cone settle, and does the reticle pop?
import { makeGame, playTouch, rng, gauss, useKnuckle } from './harness.mjs';
useKnuckle('real');
for (const sigma of [0.3, 0.7, 1.0, 1.4, 2.0, 3.0]) for (const tremorHz of [0, 8]) {
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  for (let i = 0; i < 120; i++) g.frame(1 / 60);
  const ts = g.tawOnScreen();
  const r = rng(Math.round(sigma * 100) + tremorHz);
  const cache = new Map();
  // white noise sigma per axis per sample, plus (optionally) an 8 Hz physiological tremor of the same size
  const path = (t) => { const k = Math.round(t * 1000); if (!cache.has(k)) cache.set(k, [gauss(r) * sigma, gauss(r) * sigma]); const n = cache.get(k);
    const tr = tremorHz ? sigma * Math.sin(2 * Math.PI * tremorHz * t / 1000) : 0; return { x: ts.x + n[0] + tr, y: ts.y + n[1] + tr * 0.6 }; };
  const marks = {}; let pops = 0, prevPx = null, maxStep = 0;
  playTouch(g, path, 2500, { fps: 60, touchHz: 120, preFrames: 0, noUp: true, each: ({ t, game }) => {
    const st = game.G.knuckle.state();
    const px = 25.6 * (0.70 + st.coneDeg * 0.16);      // main.js:1589, the reticle ring radius
    if (prevPx !== null) { const d = Math.abs(px - prevPx); if (d > maxStep) maxStep = d; if (d > 3) pops++; }
    prevPx = px;
    for (const m of [600, 1200, 2000, 2500]) if (!(m in marks) && t >= m) marks[m] = st.settle01.toFixed(2) + '/' + st.coneDeg.toFixed(2) + 'deg';
  } });
  console.log(`noise ${sigma} px/axis${tremorHz ? ' + 8 Hz tremor' : ''}: settle/cone at 0.6 s ${marks[600]}, 1.2 s ${marks[1200]}, 2.0 s ${marks[2000]}, 2.5 s ${marks[2500]} | reticle pops >3 px: ${pops}, biggest ${maxStep.toFixed(1)} px`);
}
