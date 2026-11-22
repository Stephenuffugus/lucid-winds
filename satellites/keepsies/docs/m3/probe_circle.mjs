import { open, startMatch, rectIn, clearance, sleep, done } from './probe.mjs';
{
  for (const [w, h] of [[412, 915], [412, 839], [360, 780]]) {
    const page = await open(w, h);
    for (const scene of ['open', 'one', 'calib']) {
      if (scene === 'calib') { await page.evaluate(() => window.KEEPSIES_DEV.calibrate()); await page.waitForFunction(() => window.KEEPSIES_DEV.state().match, { timeout: 40000 }); await sleep(900); }
      else if (scene === 'open') await startMatch(page, {});
      else { await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.pocketAllBut(1); }); await sleep(900); }
      const out = await page.evaluate(`(() => { const rect = ${rectIn}; const t = window.KEEPSIES_DEV.tawScreen(); return { t, ring: rect('grabRing'), corners: rect('corners'), rules: rect('houseRules'), nudgeL: rect('nudgeL'), nudgeR: rect('nudgeR'), scope: rect('scopeBtn'), names: rect('names') }; })()`);
      const c = out.t ? { x: out.t.x, y: out.t.y, r: out.t.grabR } : null, R = out.ring;
      console.log(w + 'x' + h, scene, 'ring', R ? R.w + 'x' + R.h : 'hidden', 'centre off', c && R ? [+(R.l + R.w / 2 - c.x).toFixed(1), +(R.t + R.h / 2 - c.y).toFixed(1)].join(',') : '-', 'clear:', c ? ['corners', 'rules', 'nudgeL', 'nudgeR', 'scope', 'names'].map(k => k + ' ' + clearance(c, out[k])).join(' ') : '-');
    }
    console.log('  page errors', page.errors.length, page.errors.slice(0, 2).join(' | ').slice(0, 200));
    await page.close();
  }
}
await done();
