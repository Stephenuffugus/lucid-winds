// node tools/tofu-tests/eatshots.mjs <outdir>   Shots of THE EATERS from where the player stands (915x412 and 412x915), server on 8791.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/package.json'); const puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const OUT = process.argv[2]; const wait = ms => new Promise(r => setTimeout(r, ms));
const b = await puppeteer.launch({ args: ['--no-sandbox', '--disable-gpu'] });
// run the level with keys held by a tiny script until a moment, then freeze the loop (mode served keeps the HUD and stops the steps)
function until(lv, phases) {
  const T = window.TOFU, P = T.P, W = () => T.world, ea = k => W().eaters.find(e => e.kind === k); T.go(T.EAT_FROM + lv);
  for (const ph of phases) { let t = 0; const u = new Function('P', 'ea', 'W', 'return ' + ph.u);
    while (!u(P, ea, W) && t < ph.max) { T.input.move = ph.m; T.input.press = !!ph.pr; T.step(1 / 120); t += 1 / 120; } }
  T.input.move = 0; T.input.press = false; T.mode = 'served';
  return { x: P.x, bites: P.bites, eaters: W().eaters.map(e => e.kind + ':' + e.st).join(' ') };
}
const SHOTS = [
  ['e1-gulper-inhale', 0, [{ m: 1, u: 'P.x>=8.2', max: 5 }, { m: 0, u: 'P.frozen', max: 4 }, { m: 1, u: "ea('gulper').st==='tell'&&ea('gulper').t>0.5", max: 8 }]],
  ['e1-brain-freeze', 0, [{ m: 1, u: 'P.x>=8.2', max: 5 }, { m: 0, u: 'P.frozen', max: 4 }, { m: 1, u: "ea('gulper').st==='beaten'&&ea('gulper').t>0.3", max: 8 }]],
  ['e1-wrong-bite', 0, [{ m: 1, u: "ea('gulper').st==='happy'&&ea('gulper').t>0.2", max: 8 }]],
  ['e2-bird-dive', 1, [{ m: 0, pr: 1, u: 'P.f>=0.95', max: 3 }, { m: 1, u: 'P.x>=8.5', max: 4 }, { m: 0, u: "ea('pecker').st==='eat'&&ea('pecker').t>0.12", max: 6 }]],
  ['e2-toad-tongue', 1, [{ m: 0, pr: 1, u: 'P.f>=0.95', max: 3 }, { m: 1, u: 'P.x>=8.5', max: 4 }, { m: 0, u: "ea('pecker').st==='beaten'", max: 6 }, { m: 1, u: "P.zone==='o'&&P.onGround", max: 5 }, { m: 0, u: 'P.fried', max: 2 }, { m: 1, u: 'P.x>=18.6', max: 5 }, { m: 0, u: "ea('tongue').st==='eat'&&ea('tongue').tip>2.5", max: 4 }]],
  ['e3-slug-and-hound', 2, [{ m: 1, u: "P.zone==='s'", max: 4 }, { m: 0, u: 'P.soy>=0.9', max: 4 }, { m: 1, u: "P.zone==='f'", max: 4 }, { m: 0, u: 'P.stink>=0.9', max: 4 }, { m: 1, u: "ea('sniffer').st==='eat'", max: 12 }]],
  ['e4-end-small', 3, [{ m: 1, u: 'P.inWater', max: 4 }, { m: 0, u: "ea('chopsticks').st==='beaten'", max: 8 }, { m: 1, u: "P.zone==='*'&&P.x>=18", max: 8 }, { m: 0, u: 'P.frozen', max: 4 }, { m: 1, u: "ea('gulper').st==='beaten'", max: 8 }, { m: 1, u: "P.zone==='o'&&P.onGround", max: 6 }, { m: 0, u: 'P.fried', max: 2 }, { m: 1, u: "ea('tongue').st==='beaten'&&ea('tongue').t>0.5", max: 8 }]],
];
const errs = [];
for (const [vw, vh, tag] of [[915, 412, 'land'], [412, 915, 'port']]) {
  const p = await b.newPage(); p.on('pageerror', e => errs.push(e.message)); const bad = []; p.on('response', r => { if (r.status() >= 400 && /assets\//.test(r.url())) bad.push(r.url().split('/').pop()); });
  await p.setViewport({ width: vw, height: vh, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:8791/?eat=1', { waitUntil: 'networkidle0' }); await wait(500);
  await p.screenshot({ path: `${OUT}/${tag}-card-e1.png` });
  for (const [name, lv, ph] of (tag === 'land' ? SHOTS : SHOTS.slice(0, 2))) {
    const r = await p.evaluate(until, lv, ph); await wait(900); const r2 = await p.evaluate(until, lv, ph); await wait(500);   // twice: the first pass loads the art
    await p.screenshot({ path: `${OUT}/${tag}-${name}.png` });
    const lay = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }; return { top: q('.top'), chips: q('#chips'), hint: q('#hint'), status: q('.status'), w: innerWidth, h: innerHeight, ts: 0 }; });
    console.log(tag, name, JSON.stringify(r2), JSON.stringify(lay));
  }
  await p.evaluate(() => { window.TOFU.mode = 'title'; }); 
  console.log(tag, 'missing art:', bad.join(',') || 'none'); await p.close();
}
// the second level's card (two meet cards) and a served card with stars
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await p.goto('http://localhost:8791/?eat=1&level=9', { waitUntil: 'networkidle0' }); await wait(600); await p.screenshot({ path: `${OUT}/port-card-e2.png` });
await b.close(); console.log('errors:', errs.join(' ; ') || 'none');
