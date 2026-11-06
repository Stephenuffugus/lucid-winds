// The synthetic thumb matrix. Every sample's AIM: the aim line (camera forward) for an orbit pointer, and for a
// pointer the Knuckle owns, the shot a release at that sample would fire (camera forward + the flick's fine angle),
// computed by a shadow Knuckle fed the same samples with the same handler times. Jumps over 10 degrees are classified.
import { makeGame, playTouch, rng, gauss, useKnuckle } from './harness.mjs';
useKnuckle('real');
const D = 180 / Math.PI;
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
function motionFor(kind, tx, ty, start) {
  // returns path(t) and duration; start is the offset of the first touch from the shooter
  const sx = tx + start.x, sy = ty + start.y;
  switch (kind) {
    case 'arc around the marble': return { dur: 900, f: (t) => { const a = (t / 900) * Math.PI * 1.5; const R = Math.max(10, Math.hypot(start.x, start.y)); const a0 = Math.atan2(start.y, start.x); return { x: tx + R * Math.cos(a0 + a), y: ty + R * Math.sin(a0 + a) }; } };
    case 'across the marble': return { dur: 500, f: (t) => ({ x: sx - 120 * (t / 500), y: sy }) };
    case 'slow drift': return { dur: 1500, f: (t) => ({ x: sx - 0.03 * t, y: sy - 0.01 * t }) };
    case 'fast swipe': return { dur: 120, f: (t) => ({ x: sx - 300 * (t / 120), y: sy }) };
  }
}
const results = [];
for (const phase of ['place', 'aim']) for (const startName of ['on the centre (4 px off)', 'just outside grabR (34 px right)', 'mid screen (120 px up, 90 right)'])
for (const kind of ['arc around the marble', 'across the marble', 'slow drift', 'fast swipe']) for (const sigma of [1, 3]) for (const hz of [60, 120]) {
  const start = startName.startsWith('on') ? { x: 4, y: 0 } : startName.startsWith('just') ? { x: 34, y: 0 } : { x: 90, y: -120 };
  const g = makeGame({ w: 412, h: 839, phase });
  for (let i = 0; i < 120; i++) g.frame(1 / 60);
  const ts0 = g.tawOnScreen();
  const m = motionFor(kind, ts0.x, ts0.y, start);
  const r = rng(hz * 7 + sigma * 13 + kind.length);
  const noise = new Map();
  const path = (t) => { const p = m.f(Math.min(t, m.dur)); const k = Math.round(t * 1000); if (!noise.has(k)) noise.set(k, [gauss(r) * sigma, gauss(r) * sigma]); const n = noise.get(k); return { x: p.x + n[0], y: p.y + n[1] }; };
  // per frame: the camera aim; also the samples as delivered, for the shadow
  const frames = [];
  let owner = null;
  playTouch(g, path, m.dur, { fps: 60, touchHz: hz, t0: 1000, preFrames: 0, postFrames: 40, each: ({ t, game, post }) => {
    if (owner === null) owner = game.G.knuckle.state().bracing ? 'knuckle' : (game.G.placeDrag != null ? 'placement+camera' : 'camera');
    frames.push({ t, aim: wrap(game.rig.state.azimuth + Math.PI), ts: game.tawOnScreen(), post: !!post });
  } });
  const braced = owner === 'knuckle';
  let jumps = [], maxJ = 0, offscreen = frames.filter(f => !f.ts).length;
  for (let i = 1; i < frames.length; i++) { const j = Math.abs(wrap(frames[i].aim - frames[i - 1].aim)) * D; if (j > maxJ) maxJ = j; if (j > 10) jumps.push(+j.toFixed(1)); }
  // the shadow: what a release would fire at each sample (only meaningful when the Knuckle owns the pointer)
  let wouldJumps = [], wouldMax = 0, wouldCancelFrac = 0, wouldCauses = {};
  if (braced) {
    useKnuckle('real');
    const sh = makeGame({ w: 412, h: 839, phase: 'aim' });
    for (let i = 0; i < 120; i++) sh.frame(1 / 60);
    const sampleMs = 1000 / hz, frameMs = 1000 / 60;
    const samples = [];
    for (let ts = 0; ts <= m.dur + 1e-9; ts += sampleMs) {
      const p = path(ts);
      const handler = ts === 0 ? 0 : Math.min(Math.ceil((1000 + ts) / frameMs) * frameMs - 1000, m.dur);  // delivered on the next frame
      samples.push({ x: p.x, y: p.y, t: 1000 + handler });
    }
    let prev = null, n = 0, cancels = 0;
    for (let k = 2; k <= samples.length; k++) {
      const pre = samples.slice(0, k);
      sh.G.log.aims.length = 0; sh.G.log.cancels.length = 0;
      const a = sh.G.knuckle._feed(pre, sh.tawOnScreen());
      n++;
      if (!a) { cancels++; continue; }
      const fine = a.fineDeg;
      if (prev !== null) {
        const j = Math.abs(fine - prev);
        if (j > wouldMax) wouldMax = j;
        if (j > 10) {
          wouldJumps.push(+j.toFixed(1));
          const cause = (Math.abs(fine) >= 24.99 || Math.abs(prev) >= 24.99) ? 'into or out of the +-25 deg clamp' : (Math.abs(prev) < 1e-9 || Math.abs(fine) < 1e-9) ? 'the <4 px chord guard (0) then a short noisy chord' : 'chord direction of a short, noisy window';
          wouldCauses[cause] = (wouldCauses[cause] || 0) + 1;
        }
      }
      prev = fine;
    }
    wouldCancelFrac = cancels / n;
  }
  const row = { phase, start: startName, kind, sigma, hz, owner, aimLineJumps: jumps.length, aimLineMaxDeg: +maxJ.toFixed(1), shooterOffscreenFrames: offscreen,
    finalAimTurnDeg: +(wrap(frames[frames.length - 1].aim - frames[0].aim) * D).toFixed(1), shotFired: g.G.log.aims.length, shotFineDeg: g.G.log.aims[0] ? +g.G.log.aims[0].fineDeg.toFixed(1) : null,
    shotPower: g.G.log.aims[0] ? +g.G.log.aims[0].power01.toFixed(2) : null, cancelled: g.G.log.cancels[0] || null,
    releaseWouldJumps: braced ? wouldJumps.length : null, releaseWouldMaxDeg: braced ? +wouldMax.toFixed(1) : null, releaseCancelledFrac: braced ? +wouldCancelFrac.toFixed(2) : null, causes: braced ? wouldCauses : null };
  results.push(row);
}
for (const r of results) console.log(JSON.stringify(r));
