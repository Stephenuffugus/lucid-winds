import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, extname, normalize } from 'node:path';
const require = createRequire('/workspaces/lucid-winds/satellites/keepsies/tools/shots.mjs');
const puppeteer = require('puppeteer');
const ROOT = '/workspaces/lucid-winds/satellites/keepsies';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.wasm': 'application/wasm', '.glb': 'model/gltf-binary' };
const server = createServer((req, res) => {
  const p = join(ROOT, normalize(decodeURIComponent(req.url.split('?')[0])));
  if (!existsSync(p) || !p.startsWith(ROOT)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port + '/index.html?keepsiestest=1';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', e => errs.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/music\/v1|404/.test(m.text())) errs.push('console: ' + m.text().slice(0, 120)); });
await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => window.KEEPSIES_DEV && window.KEEPSIES_DEV.state().frames > 3, { timeout: 60000 });
await page.evaluate(() => window.KEEPSIES_DEV.go({ seed: 909090, forceFirst: 0 }));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(60));
const snap = (label) => page.evaluate((label) => {
  const d = window.KEEPSIES_DEV, c = d.debugCam(), R = d.state().match;
  const tw = R.taw || {}; return label + ': live ' + c.mibsLeft + ', phase ' + c.phase + ', dist ' + c.cam.dist + ' m, t ' + (c.frameInfo && c.frameInfo.t) + ' | taw world ' + JSON.stringify(c.tawWorld) + ' proj ' + JSON.stringify(c.proj) + ' match.taw ' + JSON.stringify(tw) + ' viewport ' + JSON.stringify(c.viewport);
}, label);
console.log(await snap('full'));
console.log('pocketAllBut(2) ->', await page.evaluate(() => window.KEEPSIES_DEV.pocketAllBut(2)));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
console.log(await snap('two'));
console.log('books:', await page.evaluate(() => { const M = window.KEEPSIES_DEV.state().match; return JSON.stringify({ refMibs: M.mibsLeft, pocketed: M.pocketed, phase: M.phase, over: M.over }); }));
console.log('pocketAllBut(1) ->', await page.evaluate(() => window.KEEPSIES_DEV.pocketAllBut(1)));
await page.evaluate(() => window.KEEPSIES_DEV.settleCamera(90));
console.log(await snap('one'));
await page.screenshot({ path: '/tmp/claude-1000/-workspaces-lucid-winds/87eed248-d269-4cb5-8ed6-32f3f64113fc/scratchpad/probe-one.png' });
await page.evaluate(() => window.KEEPSIES_DEV.setCam && window.KEEPSIES_DEV.setCam({ userZoom: 0.4 }));

console.log('errors:', errs.length ? errs.join('\n') : 'none');
await browser.close(); server.close();
