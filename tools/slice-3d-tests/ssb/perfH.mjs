// node tools/slice-3d-tests/ssb/perfH.mjs [pairs]   Part H's cost: paired frame time, Journey level 3 mid course, art on,
// v7.3 (the committed page, written as index-v73.html for the run and deleted after) against v7.4 (index.html).
// One fresh browser per run, alternating order; a sample = one dev step (update + render) + a 1 px readPixels.
// Pass: the median of medians rises by no more than 1 ms. Repo root served on 8777; one browser at a time.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DIR = '/workspaces/lucid-winds/satellites/slice-3d', OLD = DIR + '/index-v73.html';
fs.writeFileSync(OLD, execSync('git -C /workspaces/lucid-winds show HEAD:satellites/slice-3d/index.html'));
async function run(page) {
  const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
  const p = await b.newPage(); await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1 });
  await p.goto('http://127.0.0.1:8777/satellites/slice-3d/' + page + '?dev=1', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
  const settle = async () => { for (let i = 0; i < 60; i++) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } };
  await p.evaluate(() => { window._S3.salt(31); window._S3.newGame(3); }); await settle();
  await p.evaluate(() => { window._S3.salt(31); window._S3.newGame(3); }); await settle(); await sleep(500);
  const r = await p.evaluate(() => {
    const S = window._S3, cv = document.querySelector('canvas'), gl = cv.getContext('webgl2') || cv.getContext('webgl'), px = new Uint8Array(4);
    for (let i = 0; i < 40; i++) { const g = S.state(); if (g && g.grounded && i % 9 === 0) S.tap(1); S.stepN(1, 16); }
    const t = [];
    for (let i = 0; i < 120; i++) { const g = S.state(); if (g && g.grounded && i % 9 === 0) S.tap(1); const t0 = performance.now(); S.stepN(1, 16); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); t.push(performance.now() - t0); }
    t.sort((a, b) => a - b); return { med: t[60], p90: t[108] };
  });
  await b.close(); return r;
}
const N = +(process.argv[2] || 3), out = [];
try {
  for (let i = 0; i < N; i++) { let o, n; if (i % 2) { n = await run('index.html'); o = await run('index-v73.html'); } else { o = await run('index-v73.html'); n = await run('index.html'); } out.push({ v73: +o.med.toFixed(2), v74: +n.med.toFixed(2) }); console.log(JSON.stringify(out[out.length - 1])); }
} finally { fs.rmSync(OLD, { force: true }); }
const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
const a = med(out.map((o) => o.v73)), b2 = med(out.map((o) => o.v74));
console.log(`median of medians: v7.3 ${a.toFixed(2)} ms, v7.4 ${b2.toFixed(2)} ms, Part H adds ${(b2 - a).toFixed(2)} ms`);
console.log(b2 - a <= 1 ? 'PASS (no more than 1 ms)' : 'FAIL (over 1 ms)');
process.exit(b2 - a <= 1 ? 0 : 1);
