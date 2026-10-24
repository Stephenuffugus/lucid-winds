// node oldworker.mjs <origin> <prime|check>: deploy proof for Pop N Lock from a PERSISTENT profile. prime = load the live
// build and let its worker install (BEFORE a deploy); check = reload after the deploy and read the build stamp, the worker
// URL and the caches. Rerun check once if the old worker is still handing over.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [origin, phase] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const prof = '/tmp/claude-1000/pnl/profile-' + origin.replace(/[^a-z]/g, '');
const b = await puppeteer.launch({ headless: 'new', userDataDir: prof, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto(origin + '/satellites/chaff-wars/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(phase === 'prime' ? 9000 : 6000);
const r = await p.evaluate(async () => {
  const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
  const sw = regs.map(g => (g.active && g.active.scriptURL) || (g.waiting && g.waiting.scriptURL) || (g.installing && g.installing.scriptURL));
  return { ver: (document.getElementById('buildstamp') || {}).textContent, sw, keys: await caches.keys(), controlled: !!navigator.serviceWorker.controller };
});
console.log(phase, origin, JSON.stringify(r), 'errs', JSON.stringify(errs));
await b.close();
