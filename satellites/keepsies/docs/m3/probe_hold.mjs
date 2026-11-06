import { open, startMatch, sleep, done } from './probe.mjs';
const page = await open(412, 915);
await startMatch(page, {});
const r = await page.evaluate(async () => {
  const D = window.KEEPSIES_DEV;
  const a0 = D.debugCam().azimuth; const t = D.tawScreen();
  const samples = []; for (let i = 0; i <= 8; i++) samples.push({ x: t.x, y: t.y - i * 30, t: performance.now() + i * 8 });
  const shot = D.flick(samples);
  const azs = [D.debugCam().azimuth]; let n = 0;
  await new Promise(res => { const tick = () => { n++; const s = D.state(); if (s.match.simulating) azs.push(D.debugCam().azimuth); if ((!s.match.simulating && n > 3) || n > 900) res(); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  let worst = 0, total = 0; for (let i = 1; i < azs.length; i++) { const d = Math.abs(azs[i] - azs[i - 1]) * 180 / Math.PI; worst = Math.max(worst, d); total += d; }
  return { shot: !!shot, frames: n, worst: +worst.toFixed(3), total: +total.toFixed(3) };
});
console.log('one break at 412x915: frames', r.frames, 'largest step', r.worst, 'degrees, total', r.total, 'degrees, shot', r.shot, 'errors', page.errors.length);
await done();
