/* The captures for Astra's round 3: this build, at high quality, 412x915 at 2x, JPEG: the shot and statue screens on the real frame. KP_QUALITY=high node docs/m3/shots_r3.mjs <outdir> */
import { open, startMatch, sleep, done } from './probe.mjs';
import { mkdirSync, statSync } from 'node:fs';
const OUT = process.argv[2] || '/home/codespace/kp-drafts/round3/shots';
mkdirSync(OUT, { recursive: true });
const page = await open(412, 915);
let n = 0;
const shot = async (name) => { const f = OUT + '/' + String(++n).padStart(2, '0') + '-' + name + '.jpg'; await page.screenshot({ path: f, type: 'jpeg', quality: 82 }); console.log(f.split('/').pop(), statSync(f).size); };
const frames = async (k) => { const f0 = await page.evaluate(() => window.KEEPSIES_DEV.state().frames); await page.waitForFunction((t) => window.KEEPSIES_DEV.state().frames >= t, { timeout: 90000 }, f0 + (k || 2)); };
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.skipOnboarding(); D.grantSunbeams(20000); D.grantMarble('bloodstone_aggie'); });
await startMatch(page, { houseRules: { ringSizeFt: 5, statues: false } });
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await frames(); await shot('aim-five-foot-opening');
/* a held brace: a synthetic finger that stays down, so the reticle shows */
const t0 = await page.evaluate(() => window.KEEPSIES_DEV.tawScreen());
await page.evaluate((x, y) => { const c = document.getElementById('stage'); const ev = (ty) => c.dispatchEvent(new PointerEvent(ty, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: 1 })); ev('pointerdown'); }, t0.x, t0.y);
await frames(); await shot('braced-settling');
await sleep(3500); await frames(); await shot('braced-settled');
await page.evaluate((x, y) => { const c = document.getElementById('stage'); c.dispatchEvent(new PointerEvent('pointerup', { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true })); }, t0.x, t0.y);
await frames();
await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(true)); await frames(2); await shot('zoom-scope'); await page.evaluate(() => window.KEEPSIES_DEV.scopeHold(false));
/* the shot and the watch frame */
await page.evaluate(() => { const D = window.KEEPSIES_DEV, t = D.tawScreen(), c = document.getElementById('stage'); const ev = (ty, x, y) => c.dispatchEvent(new PointerEvent(ty, { pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: 1 })); ev('pointerdown', t.x, t.y); for (let k = 0; k < 20; k++) ev('pointermove', t.x + (k & 1 ? 0.3 : -0.3), t.y); for (let i = 1; i <= 9; i++) { ev('pointermove', t.x, t.y - 26 * i); const w = performance.now(); while (performance.now() - w < 5); } ev('pointerup', t.x, t.y - 234); });
await frames(4); await shot('watch-frame');
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.settle(1500); D.settleCamera(40); }); await frames(2);
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.pocketAllBut(2); }); await sleep(600); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await frames(2); await shot('two-mibs-left');
/* LOOK */
await startMatch(page, { seed: 515151, houseRules: { ringSizeFt: 5, statues: false } });
const lk = await page.evaluate(() => { const r = document.getElementById('topDown').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
await page.touchscreen.touchStart(lk.x, lk.y); await page.waitForFunction(() => window.KEEPSIES_DEV.debugCam().cam.el > 85, { timeout: 60000 }); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await frames(2); await shot('look-held'); await page.touchscreen.touchEnd();
/* ten foot */
await startMatch(page, { seed: 515151, houseRules: { ringSizeFt: 10, statues: false } }); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await frames(2); await shot('aim-ten-foot-opening');
/* statues: the tray, a ghost and Not here, a move */
await page.evaluate(() => window.KEEPSIES_DEV.start({ seed: 424242, forceFirst: 0, houseRules: { ringSizeFt: 5, statues: true } }));
await page.waitForFunction(() => !!window.KEEPSIES_DEV.placing(), { timeout: 40000 }); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(120)); await frames(2); await shot('statues-tray');
const tile = await page.evaluate(() => { const r = document.getElementById('st-arch').getBoundingClientRect(); return { x: r.left + 28, y: r.top + 28 }; });
const sp = await page.evaluate(() => { const D = window.KEEPSIES_DEV, s = D.spotsFor('arch'), q = s[Math.floor(s.length * 0.3)], p = D.projectGround(q.x, q.z, 0); return { x: p.x, y: p.y }; });
await page.touchscreen.touchStart(tile.x, tile.y); await sleep(80); await page.touchscreen.touchMove(sp.x, sp.y); await frames(2); await shot('statues-ghost-allowed');
await page.touchscreen.touchMove(206, 330); await frames(2); await shot('statues-ghost-not-here');
await page.touchscreen.touchEnd(); await sleep(200);
for (let k = 0; k < 2; k++) { await page.waitForFunction(() => { const p = window.KEEPSIES_DEV.placing(); return p && p.placed % 2 === 0; }, { timeout: 30000 }); await page.evaluate((k) => { const D = window.KEEPSIES_DEV, s = D.spotsFor(k ? 'loaf' : 'arch'), q = s[Math.floor(s.length * (k ? 0.75 : 0.25))]; D.placeStatueNow(k ? 'loaf' : 'arch', q.x, q.z); }, k); await sleep(200); }
await page.waitForFunction(() => !window.KEEPSIES_DEV.placing(), { timeout: 30000 });
await page.waitForFunction(() => { const D = window.KEEPSIES_DEV, s = D.state(); return s.match && !s.match.simulating && s.match.turn === 0 && D.aimUi().nudge; }, { timeout: 60000 });
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90)); await frames(2); await shot('statues-in-the-aim-frame');
await page.evaluate(() => document.getElementById('moveStatue').click()); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(120)); await frames(2);
const mv = await page.evaluate(() => { const D = window.KEEPSIES_DEV, s = D.statues().find(q => q.owner === 0), a = D.projectGround(s.x, s.z, 0.03), b = D.projectGround(s.x + 0.1, s.z - 0.08, 0.03); return { a, b }; });
await page.touchscreen.touchStart(mv.a.x, mv.a.y); await sleep(100); await page.touchscreen.touchMove(mv.b.x, mv.b.y); await frames(2); await shot('statues-move'); await page.touchscreen.touchEnd();
/* the plates */
await page.evaluate(() => document.getElementById('stUndo').click()); await sleep(200);
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.grantXp(1000); const p = D.progress(); D.grantXp(Math.max(0, p.needed - p.xp - 60)); D.setup(); D.stake('dirt_plain'); }); await frames(2); await shot('setup-pot-cloth');
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.go({ seed: 424242, forceFirst: 0 }); D.forceEnd(0); }); await sleep(800); await page.evaluate(() => window.KEEPSIES_DEV.ceremonySkip()); await sleep(1500); await frames(2); await shot('result-level-strip');
await page.evaluate(() => { const D = window.KEEPSIES_DEV; D.collection(); D.pouch('collector'); }); await sleep(1500); await frames(1); await shot('pouch-open');
await page.evaluate(() => document.getElementById('poKeep').click()); await sleep(300);
await page.evaluate(() => window.KEEPSIES_DEV.collection()); await sleep(1500); await frames(1); await shot('collection-tiles');
await page.evaluate(() => { window.KEEPSIES_DEV.tin(); }); await sleep(2500); await frames(1); await shot('tin-heirloom-cloth');
await page.evaluate(() => { document.getElementById('tin').hidden = true; window.KEEPSIES_DEV.title(); window.KEEPSIES_DEV.calibrate(); }); await page.waitForFunction(() => { const s = window.KEEPSIES_DEV.state(); return s.match && s.match.taw; }, { timeout: 60000 }); await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(60)); await frames(2); await shot('calibration');
console.log('page errors', page.errors.length, page.errors.slice(0, 3).join(' | ').slice(0, 300));
await done();
