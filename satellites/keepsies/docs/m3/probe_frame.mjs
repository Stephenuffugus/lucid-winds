/* m3 steps 8 and 9: the aim frame's sizes and clearances at both phones and rings, and LOOK held on a real touch. Numbers only. */
import { open, startMatch, rectIn, clearance, sleep, done } from './probe.mjs';
const rings = (process.argv[2] || '5,10').split(',').map(Number);
for (const [w, h] of [[412, 915], [360, 780]]) {
  const page = await open(w, h);
  for (const ft of rings) {
    await startMatch(page, { houseRules: { ringSizeFt: ft, statues: false } });
    const out = await page.evaluate(`(() => { const rect = ${rectIn}; return { t: window.KEEPSIES_DEV.tawScreen(), c: window.KEEPSIES_DEV.debugCam(), ring: rect('grabRing'), corners: rect('corners'), rules: rect('houseRules'), nudgeL: rect('nudgeL'), nudgeR: rect('nudgeR'), scope: rect('scopeBtn'), names: rect('scores'), look: rect('topDown') }; })()`);
    const { t, c } = out, ms = c.mibsOnScreen, v = ms.filter(m => m.x >= 0 && m.x <= w && m.y >= 0 && m.y <= h);
    const by = (a, b) => a.y - b.y, sorted = ms.slice().sort(by);
    const cc = { x: t.x, y: t.y, r: t.grabR };
    const clr = (rc) => clearance(cc, rc);
    console.log(w + 'x' + h, ft + ' ft', 'shooter', c.shooterPx, 'px at', t.x.toFixed(0) + ',' + t.y.toFixed(0), 'mibs far', sorted[0].px, 'mid', sorted[6].px, 'near', sorted[12].px, 'on screen', v.length + '/13', 'top mib y', sorted[0].y.toFixed(0), 'names foot', out.names && (out.names.t + out.names.h).toFixed(0));
    console.log('   circle', out.ring ? out.ring.w + 'x' + out.ring.h + ' at ' + out.ring.l.toFixed(0) + ',' + out.ring.t.toFixed(0) : 'hidden', 'clear: corners', clr(out.corners), 'rules', clr(out.rules), 'nudgeL', clr(out.nudgeL), 'nudgeR', clr(out.nudgeR), 'zoom', clr(out.scope), 'look', clr(out.look));
    if (out.look) {
      const X = out.look.l + out.look.w / 2, Y = out.look.t + out.look.h / 2;
      await page.touchscreen.touchStart(X, Y);
      await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el > 85, { timeout: 30000 }).catch(() => console.log('   LOOK never came'));
      await sleep(5000);
      const L = await page.evaluate(() => window.KEEPSIES_DEV.debugCam());
      console.log('   LOOK el', L.cam.el, 'dist', L.cam.dist, 'chalk x', L.ringRect.x0, 'to', L.ringRect.x1, 'y', L.ringRect.y0, 'to', L.ringRect.y1, 'of', w + 'x' + h);
      await page.touchscreen.touchEnd();
      await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el < 40, { timeout: 30000 }).catch(() => console.log('   LOOK never let go'));
    } else console.log('   no LOOK button');
  }
  console.log('  page errors', page.errors.length, page.errors.slice(0, 2).join(' | ').slice(0, 300));
  await page.close();
}
await done();
