import { open, startMatch, rectIn, sleep, done } from './probe.mjs';
const page = await open(412, 915);
await startMatch(page, {});
for (const nudges of [0, 3, -6]) {
  await page.evaluate((n) => { const D = window.KEEPSIES_DEV; for (let i = 0; i < Math.abs(n); i++) D.nudge(n > 0 ? 1 : -1); }, nudges);
  await sleep(1800);
  const o = await page.evaluate(`(() => { const rect = ${rectIn}; const D = window.KEEPSIES_DEV, u = D.aimUi(), c = rect('aimcap'), l = rect('aimline'); return { line: u.line, info: u.lineInfo, cap: c, l, ks: D.state().knuckle.bracing }; })()`);
  const cx = o.cap ? o.cap.l + o.cap.w / 2 : null, cy = o.cap ? o.cap.t + o.cap.h / 2 : null;
  console.log('nudges', nudges, 'braced', o.ks, 'line', o.line, 'cap centre', cx, cy, 'end', o.info && o.info.endX.toFixed(1), o.info && o.info.endY.toFixed(1), 'range', o.info && o.info.range.toFixed(2), 'off', o.cap && o.info ? Math.hypot(cx - o.info.endX, cy - o.info.endY).toFixed(1) : '-');
}
console.log('match errors', page.errors.length, page.errors.slice(0, 2).join(' | ').slice(0, 200));
await page.close();
const p2 = await open(412, 839);
await p2.evaluate(() => window.KEEPSIES_DEV.calibrate()); await p2.waitForFunction(() => window.KEEPSIES_DEV.state().match, { timeout: 40000 }); await sleep(2000);
const c = await p2.evaluate(`(() => { const rect = ${rectIn}; const D = window.KEEPSIES_DEV, u = D.aimUi(); const gd = D.groundTarget ? D.groundTarget() : null; return { info: u.lineInfo, heading: rect('calibTitle') || rect('calibSay'), taw: D.tawScreen(), target: gd }; })()`);
console.log('calibration: line end', c.info && c.info.endX.toFixed(1), c.info && c.info.endY.toFixed(1), 'range', c.info && c.info.range, 'taw', c.taw && c.taw.y, 'heading', JSON.stringify(c.heading), 'target', JSON.stringify(c.target));
console.log('calib errors', p2.errors.length, p2.errors.slice(0, 2).join(' | ').slice(0, 200));
await done();
