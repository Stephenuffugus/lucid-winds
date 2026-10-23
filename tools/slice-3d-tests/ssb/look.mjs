// node look.mjs <outdir> <case...>   cases: title forge journey ff:<lvl> climb endless
// One fresh browser per case (the audit law: reuse exhausts the 2 core box). 412x915 at DPR 2, swiftshader GL.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const [out, ...cases] = process.argv.slice(2);
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function boot() {
  const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
  await p.setViewport({ width: +(process.env.VW || 412), height: +(process.env.VH || 915), deviceScaleFactor: +(process.env.DPR || 2), isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('rs_set', '{}'); localStorage.setItem('lwfb_explained', '1'); } catch (e) {} });
  const NOART = process.env.NOART === '1';
  await p.goto(BASE + '/satellites/slice-3d/' + (process.env.PAGE || '') + '?dev=1' + (NOART ? '&noart=1' : ''), { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(n => window._S3 && (n || (window._S3.art && window._S3.art().json)) && document.readyState === 'complete', { timeout: 30000 }, NOART);
  await sleep(1200);
  return { b, p, errs };
}
async function settleArt(p, ms = 20000) {   // wait until nothing asked for is still loading
  const t0 = Date.now(); let a;
  if (process.env.NOART === '1') { await sleep(800); return p.evaluate(() => window._S3.art ? window._S3.art() : null); }
  while (Date.now() - t0 < ms) { a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); }
  return a;
}
async function tapEl(p, sel) {
  const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel);
  if (!r) throw new Error('no ' + sel); await p.touchscreen.tap(r.x, r.y);
}
const report = {};
for (const c of cases) {
  const { b, p, errs } = await boot(); let a;
  try {
    if (c === 'title') { await sleep(1500); a = await settleArt(p); await sleep(600); }
    else if (c.startsWith('ffmid:')) {   // Freefall <lvl>, the knife put at <frac> of the shaft (the back wall's look down the dive)
      const [lvl, frac] = c.slice(6).split(':').map(Number);
      await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p); await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p);
      await p.evaluate(f => { const S = window._S3, G = S.g(), W = S.world(); G.x = 0; G.y = 4 - f * (4 - W.floorY); G.vx = 0; G.vy = 0;
        for (let i = 0; i < 40; i++) { S.hold(0); S.stepN(1, 16); G.x = 0; G.vx = 0; G.w = 0; } }, frac);
    }
    else if (c === 'crash' || c === 'crashrm') {   // a blade into the wall, shot inside the 350 ms hold: ring and cause words
      await p.evaluate(rm => { const S = window._S3; if (rm) S.set().rm = true; S.salt(5); S.newFF(3); }, c === 'crashrm'); a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3; S.salt(5); S.newFF(3); }); a = await settleArt(p);
      report[c + '-at'] = await p.evaluate(() => { const S = window._S3, G = S.g(); G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;
        let i = 0; for (; i < 200; i++) { S.stepN(1, 1000 / 120); if (S.g().failed) break; } S.stepN(8, 1000 / 120);
        return { i, failed: !!S.g().failed, freezeT: S.g().freezeT, rings: S.rings(), why: (document.querySelector('#multburst .why') || {}).textContent }; });
      await sleep(250);
    }
    else if (c === 'pit' || c === 'fail') {   // the end panel of a finished numbered dive (Pit conquered) or a crashed one
      await p.evaluate(() => { const S = window._S3; S.salt(5); S.newFF(2); }); a = await settleArt(p);
      await p.evaluate(fin => { const S = window._S3, go = document.getElementById('s-go'); S.salt(5); S.newFF(2); const G = S.g(), W = S.world();
        if (fin) { G.x = 0; G.y = W.floorY + 6; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; }
        else { G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI; }
        for (let i = 0; i < 3000 && !go.classList.contains('on'); i++) { S.hold(0); S.stepN(1, 16); } S.salt(null); }, c === 'pit');
      await sleep(1500);
    }
    else if (c === 'jcrash') {   // a Journey crystal crash, shot inside the 350 ms hold: the knife, the ring and the words framed where it happened
      await p.evaluate(() => window._S3.newGame(4)); a = await settleArt(p);
      report['jcrash-at'] = await p.evaluate(() => { const S = window._S3; S.newGame(4); const G = S.g(), W = S.world(), cr = W.crystals[0]; if (!cr) return null;
        for (let i = 0; i < 90; i++) { G.x = cr.x - 7; G.y = 0.6; G.vx = 0; G.vy = 0; G.w = 0; S.stepN(1, 1000 / 60); }
        G.x = cr.x - 1.2; G.y = cr.y + 1.5; G.vx = 8; G.vy = 0; S.stepN(1, 1000 / 60); S.stepN(+(window.JC_STEPS || 6), 1000 / 60);
        return { failed: !!G.failed, freezeT: G.freezeT, why: (document.querySelector('#multburst .why') || {}).textContent }; });
      await sleep(150);
    }
    else if (c.startsWith('seam:')) {   // Endless with the knife just above a 100 m chunk line, looking down across it
      const m = +c.slice(5);
      await p.evaluate(() => window._S3.newEndless()); a = await settleArt(p); await p.evaluate(() => window._S3.newEndless());
      await sleep(2500); a = await settleArt(p);
      await p.evaluate(m => { const S = window._S3, G = S.g(); for (let y = -100; y > 4 - m; y -= 100) { G.y = y; G.x = 0; G.vx = 0; G.vy = 0; G.w = 0; S.hold(0); S.stepN(1, 16); }
        G.x = 0; G.y = 4 - m; G.vx = 0; G.vy = 0; G.depth = m; for (let i = 0; i < 100; i++) { G.x = 0; G.vx = 0; G.vy = 0; S.hold(0); S.stepN(1, 16); G.y = 4 - m; } }, m);
      a = await settleArt(p);
    }
    else if (c.startsWith('verb:')) {   // Part D: a numbered dive's world verb (or Deep Tide's jellyfish bumper), the knife a little above it
      const lvl = +c.slice(5);
      await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, lvl); a = await settleArt(p);
      await p.evaluate(l => { window._S3.salt(77); window._S3.newFF(l); }, lvl); a = await settleArt(p);
      report[c] = await p.evaluate(() => { const S = window._S3, G = S.g(), V = S.verbs(); let tx, ty;
        if (V.length) { const v = V[0]; tx = v.x != null ? v.x : 0; ty = (v.top != null ? v.top : v.y) + 6; } else { const pd = S.world().pads[0]; tx = pd ? pd.x : 0; ty = pd ? pd.y + 6 : -50; }
        for (let i = 0; i < 90; i++) { G.x = tx * 0.6; G.y = ty; G.vx = 0; G.vy = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 16); }
        S.salt(null); return { verbs: V.map(v => v.kind).join(','), tx, ty }; });
    }
    else if (c === 'banner') {   // Wall Climb's first banner, the knife below it by the wall
      await p.evaluate(() => window._S3.newClimb(1)); a = await settleArt(p); await p.evaluate(() => window._S3.newClimb(1)); a = await settleArt(p);
      report[c] = await p.evaluate(() => { const S = window._S3, G = S.g(), bn = S.verbs()[0];
        for (let i = 0; i < 60; i++) { G.x = bn.x0 - 4; G.y = bn.y - 3; G.vx = 0; G.vy = 0; G.w = 0; G.ang = 0; S.stepN(1, 16); }
        return { y: bn.y, n: S.verbs().length }; });
    }
    else if (c.startsWith('ring:')) {   // a numbered dive's 100 m band, the knife just above it
      const lvl = +c.slice(5);
      await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p); await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3, G = S.g(); for (let i = 0; i < 90; i++) { G.x = 0; G.y = -88; G.vx = 0; G.vy = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 16); } });
    }
    else if (c === 'set') { a = await settleArt(p); await tapEl(p, '#b-set'); await sleep(900); }
    else if (c === 'how') { a = await settleArt(p); await tapEl(p, '#b-how'); await sleep(900); }
    else if (c.startsWith('thorn:')) {   // Freefall <lvl>, the knife put just above its first thorn (the hazard's look)
      const lvl = +c.slice(6);
      await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p); await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p);
      report['thorn-at'] = await p.evaluate(() => { const S = window._S3, G = S.g(), W = S.world(); const t = (W.thorns || [])[0]; if (!t) return null;
        G.x = t.x > 0 ? t.x - 4 : t.x + 4; G.y = t.y + 9; G.vx = 0; G.vy = 0; for (let i = 0; i < 20; i++) { S.hold(0); S.stepN(1, 16); } return { x: t.x, y: t.y, n: W.thorns.length }; });
    }
    else if (c === 'forge') { a = await settleArt(p); await tapEl(p, '#b-forge'); await sleep(900); a = await settleArt(p); await sleep(500); }
    else if (c === 'journey') {
      await p.evaluate(() => window._S3.newGame(1)); a = await settleArt(p); await p.evaluate(() => window._S3.newGame(1)); a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 170; i++) { const g = S.state(); if (g && g.grounded && i % 9 === 0) S.tap(1); S.stepN(1, 16); } });
    } else if (c.startsWith('ff:')) {
      const lvl = +c.slice(3);
      await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p); await p.evaluate(l => window._S3.newFF(l), lvl); a = await settleArt(p);
      await p.evaluate(n => { const S = window._S3; S.hold(0); for (let i = 0; i < n; i++) S.stepN(1, 16); }, +(process.env.FFSTEPS || 230));
    } else if (c === 'climb') {
      await p.evaluate(() => window._S3.newClimb(1)); a = await settleArt(p); await p.evaluate(() => window._S3.newClimb(1)); a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 70; i++) { const g = S.state(); if (g && g.grounded && i % 10 === 0) S.tap(1); S.stepN(1, 16); } });
    } else if (c.startsWith('deep:')) {   // Endless, teleported to <m> metres (the 300 m world bands)
      const m = +c.slice(5);
      await p.evaluate(() => window._S3.newEndless()); a = await settleArt(p); await p.evaluate(() => window._S3.newEndless());
      await sleep(2500); a = await settleArt(p);
      await p.evaluate(m => { const S = window._S3, G = S.g(); G.x = 0; G.y = 4 - m; G.vx = 0; G.vy = 0; G.depth = m; for (let i = 0; i < 100; i++) { S.hold(0); S.stepN(1, 16); } }, m);
    } else if (c === 'hud' || c === 'hudff') {   // the HUD with the bar past half and the combo up (layout, not play)
      if (c === 'hud') { await p.evaluate(() => window._S3.newGame(3)); a = await settleArt(p); await p.evaluate(() => window._S3.newGame(3)); }
      else { await p.evaluate(() => window._S3.newFF(12)); a = await settleArt(p); await p.evaluate(() => window._S3.newFF(12)); }
      a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 60; i++) S.stepN(1, 16);
        document.getElementById('progfill').style.width = '62%'; const cb = document.getElementById('h-combo'); cb.textContent = 'x12'; cb.classList.add('on'); });
    } else if (c === 'endless') {
      await p.evaluate(() => window._S3.newEndless()); a = await settleArt(p); await p.evaluate(() => window._S3.newEndless()); a = await settleArt(p);
      await p.evaluate(() => { const S = window._S3; for (let i = 0; i < 200; i++) { S.hold(i % 50 < 15 ? -1 : 0); S.stepN(1, 16); } S.hold(0); });
    }
    await sleep(300);
    await p.screenshot({ path: `${out}/${c.replace(':', '-')}.png` });
    report[c] = { art: await p.evaluate(() => window._S3.art ? window._S3.art() : null), errs };
  } catch (e) { report[c] = { error: String(e).slice(0, 300), errs }; }
  await b.close();
}
console.log(JSON.stringify(report, null, 1));
