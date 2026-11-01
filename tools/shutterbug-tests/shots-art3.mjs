#!/usr/bin/env node
/* ART3's shots (Astra's rounds 2 and 3, Q98), against the local test server only (the gates' server, rooted at this
 * worktree): each at 412x915, 360x780 and 320x568, dpr 3, touch on, the loop held, the reveal skipped but where it is
 * the subject. The stick idle with its hint, under a thumb, pushed left and right; Pause normal and pressed; each
 * biome's air with its badge (saturated-blobs built under each biome through SB_DEV.loadRecord) and its reveal badge; a
 * three cell crusher column in each phase (trap-pattern under Frost, the phase set by hand); the elites on Magenta
 * (saturated-blobs, SB_DEV.goto('elite')); the speck's two beats; the HUD with J1 and D1 (the gear set by hand).
 *
 *   flock /home/codespace/sb-drafts/browser.lock node tools/shutterbug-tests/shots-art3.mjs <outdir>
 *
 * Each moment writes a full shot and, where the subject is small, a clip (3x crop). THEN OPEN EVERY IMAGE AND LOOK:
 * name three things wrong in each. */
import { serve, launch, gotoGame, ready, tap, landStick, stickAt, GAME } from '../../satellites/shutterbug/test/harness.mjs';
import { mkdirSync, readFileSync } from 'node:fs';

const SIZES = [[412, 915], [360, 780], [320, 568]];
const OUT = process.argv[2] || '/home/codespace/sb-drafts/weapons2/art3/shots';
mkdirSync(OUT, { recursive: true });
const BLOBS = readFileSync(GAME + '/fixtures/synthetic/saturated-blobs.json', 'utf8');
const TRAPS = readFileSync(GAME + '/fixtures/synthetic/trap-pattern.json', 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const srv = await serve();
const browser = await launch();
const errorsAll = [];
try {
  for (const [w, h] of SIZES) {
    const tg = w + 'x' + h;
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    page.on('pageerror', e => errorsAll.push(tg + ' pageerror: ' + e.message));
    await gotoGame(page, srv.base); await ready(page);
    await page.evaluate(() => window.SB_DEV.hold(true));
    const shot = async (name, clip) => { const f = OUT + '/' + name + '-' + tg + '.png'; await page.screenshot({ path: f }); if (clip) await page.screenshot({ path: OUT + '/' + name + '-' + tg + '-clip.png', clip }); console.log(f); };
    /* a clip around a canvas box (canvas px), in CSS px */
    const clipAt = (x, y, bw, bh, pad = 8) => page.evaluate((x, y, bw, bh, pad) => { const cv = document.getElementById('view'), v = cv.getBoundingClientRect(), k = v.height / cv.height; const X = Math.max(0, v.left + (x - pad) * k), Y = Math.max(0, v.top + (y - pad) * k); return { x: X, y: Y, width: Math.min(innerWidth - X, (bw + 2 * pad) * k), height: Math.min(innerHeight - Y, (bh + 2 * pad) * k) }; }, x, y, bw, bh, pad);
    const topClip = () => page.evaluate(() => { const r = document.getElementById('top').getBoundingClientRect(); return { x: 0, y: r.top, width: innerWidth, height: r.height + 12 }; });

    /* the stick: idle with its hint (a fresh save, so the first standing moment's pulse plays), held, right, left */
    await page.evaluate(() => localStorage.clear()); await page.reload(); await ready(page); await page.evaluate(() => window.SB_DEV.hold(true));
    await tap(page, '#sample');
    await page.evaluate(() => { for (let k = 0; k < 200 && !document.getElementById('stick').classList.contains('hint'); k++) window.SB_DEV.step(1); });
    await sleep(350);
    await shot('stick-idle-hint');
    await sleep(1800);
    await shot('stick-idle');
    const c = await stickAt(page, 0.4, 0.55);
    const f = await landStick(page, c.x, c.y);
    await page.evaluate(() => window.SB_DEV.step(1));
    await shot('stick-held');
    await f.slide(24); await page.evaluate(() => window.SB_DEV.step(1));
    await shot('stick-right');
    await f.slide(-24); await page.evaluate(() => window.SB_DEV.step(1));
    await shot('stick-left');
    await f.end(); await page.evaluate(() => window.SB_DEV.step(5));
    /* Pause pressed under a held finger (its release opens the card: then Resume) */
    const pc = await page.evaluate(() => { const r = document.querySelector('#pause i').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.touchStart(pc.x, pc.y); await sleep(80);
    await shot('pause-pressed', await topClip());
    await page.touchscreen.touchEnd(); await sleep(120);
    await page.evaluate(() => { const b = document.getElementById('resume'); if (b) b.click(); });
    await shot('pause-normal', await topClip());

    /* each biome's air with its badge, then its reveal badge */
    for (let b = 0; b < 5; b++) {
      await page.evaluate((str, b) => { window.SB_DEV.loadRecord(str, b); window.SB_DEV.step(70); }, BLOBS, b);
      await shot('air-biome' + b, await topClip());
      await page.evaluate((str, b) => { window.SB_DEV.revealSkip(false); window.SB_DEV.loadRecord(str, b); window.SB_DEV.revealAt(1600); window.SB_DEV.revealSkip(true); }, BLOBS, b);
      await shot('reveal-biome' + b);
      await page.evaluate(() => { if (window.SB.ui.reveal.on) window.SB.ui.endReveal(); });
    }

    /* the elites on Magenta: saturated-blobs under the Attic and the Deep, the hero at the elite's home */
    for (const b of [0, 2]) {
      const e = await page.evaluate((str, b) => { window.SB_DEV.loadRecord(str, b); window.SB_DEV.step(1); window.SB_DEV.goto('elite'); window.SB_DEV.step(2); const m = window.SB.render.drawn.moths.find(q => q.w === 24) || window.SB.render.drawn.moths[0]; return m ? { x: m.x, y: m.y, w: m.w, h: m.h } : null; }, BLOBS, b);
      await shot('elite-biome' + b, e ? await clipAt(e.x, e.y, e.w, e.h, 20) : null);
    }

    /* a crusher column in each phase (trap-pattern under Frost) */
    const col = await page.evaluate(str => {
      window.SB_DEV.loadRecord(str, 1); window.SB_DEV.step(1);
      const G = window.SB.game, lv = G.level, w = lv.w, tf = Array.from(lv.features.trap || []); let best = null;
      for (const c of tf) if (!lv.trap[c - w]) { let n = 1; while (lv.trap[c + n * w]) n++; if (!best || n > best.n) best = { top: c, n }; }
      return { best, w, period: window.SB.K.TRAP_PERIOD_F };
    }, TRAPS);
    if (col.best) for (const [ph, tph] of [['a', 10], ['b', (col.period >> 1) + 1], ['c', (col.period >> 1) + 20]]) {
      const r = await page.evaluate((top, n, tph) => { const G = window.SB.game, lv = G.level, w = lv.w, C = 16, hh = G.state.hero; G.state.traps.phase = tph; hh.x = ((top % w) < 12 ? 20 : 2) * C * 256; hh.y = Math.floor(top / w) * C * 256; window.SB.render.draw(G.state, lv); const cam = window.SB.render.drawn.cam; return { x: (top % w) * C - 16, y: Math.floor(top / w) * C - cam, w: 48, h: n * C }; }, col.best.top, col.best.n, tph);
      await shot('crusher-' + ph, await clipAt(r.x, r.y, r.w, r.h, 16));
    }

    /* the speck's two beats in the sample room */
    for (const fr of ['a', 'b']) {
      const r = await page.evaluate(fr => { window.SB_DEV.goto('sample'); window.SB_DEV.step(1); const G = window.SB.game, lv = G.level, s = G.state; const L = s.loot.find(l => l.kind === 1 && !l.taken); if (!L) return null; s.frame = fr === 'a' ? 0 : 15; window.SB.render.draw(s, lv); const cam = window.SB.render.drawn.cam; return { x: (L.idx % lv.w) * 16, y: Math.floor(L.idx / lv.w) * 16 - cam }; }, fr);
      await shot('speck-' + fr, r ? await clipAt(r.x, r.y, 16, 16, 24) : null);
    }

    /* the HUD with J1 and D1 in the sample room */
    await page.evaluate(() => { window.SB.game.gear = [1, 9, 0]; window.SB_DEV.goto('sample'); window.SB_DEV.step(10); });
    await shot('hud-icons', await topClip());
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
console.log(errorsAll.length ? 'ERRORS\n' + errorsAll.join('\n') : 'no page errors');
