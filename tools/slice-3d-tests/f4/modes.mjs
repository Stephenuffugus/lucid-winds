// Part F4: Journey and Wall Climb scores and Slivers for a simple rhythm player (a tap every N frames when grounded, N
// varied), levels 1..12, in the real page with rendering skipped; time is the run's game clock plus 5 s of panel.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); });
await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded' });
await p.waitForFunction(() => window._S3 && document.readyState === 'complete'); await new Promise(r => setTimeout(r, 1500));
const r = await p.evaluate(() => { const S = window._S3, out = {}; window._S3skiprender = true;
  for (const mode of ['journey', 'climb']) { const rows = [];
    for (let lvl = 1; lvl <= 12; lvl++) for (const N of [9, 12, 15]) { if (mode === 'journey') S.newGame(lvl); else S.newClimb(lvl);
      for (let f = 0; f < 6000; f++) { const G = S.g(); if (!G || G.counted || (G.done && G.failed && G.doneT > 0.5)) break; if (G.grounded && f % N === 2) S.tap(1); S.stepN(1, 1000 / 120); }
      const G = S.g(); rows.push({ lvl, score: G.score, failed: !!G.failed, t: G.t, mult: G.mult || 0 }); }
    out[mode] = rows; }
  window._S3skiprender = false; return out; });
for (const m of Object.keys(r)) { const rows = r[m], ok = rows.filter(x => !x.failed); const avg = k => ok.reduce((a, x) => a + x[k], 0) / Math.max(1, ok.length);
  console.log(m, 'runs', rows.length, 'cleared', ok.length, 'score avg', Math.round(avg('score')), 'max', Math.max(...ok.map(x => x.score)), 'mult avg', avg('mult').toFixed(1), 'time avg', avg('t').toFixed(1) + 's');
  console.log('  scores', JSON.stringify(ok.map(x => x.score).sort((a, c) => a - c))); }
await b.close();
