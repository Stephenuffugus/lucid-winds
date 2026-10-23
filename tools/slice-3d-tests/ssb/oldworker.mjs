// node oldworker.mjs <origin> <phase>   phase=prime (load live, let the worker install) | check (reload, read BUILD + art)
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [origin, phase] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const prof = '/tmp/claude-1000/ssb/profile-' + origin.replace(/[^a-z]/g, '');
const b = await puppeteer.launch({ headless: 'new', userDataDir: prof, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); await p.setViewport({ width: 412, height: 915 });
const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
await p.goto(origin + '/satellites/slice-3d/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(phase === 'prime' ? 9000 : 6000);
const r = await p.evaluate(async () => {
  const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : [];
  const sw = regs.map(g => (g.active && g.active.scriptURL) || (g.waiting && g.waiting.scriptURL) || (g.installing && g.installing.scriptURL));
  const keys = await caches.keys();
  const ver = (document.body.innerText.match(/Super Slice 3D v[0-9.]+/) || [''])[0];
  const art = window._S3 && window._S3.art ? window._S3.art() : null;
  return { ver, sw, keys, controlled: !!navigator.serviceWorker.controller, titlePainted: document.getElementById('s-title').classList.contains('painted'), art };
});
console.log(phase, origin, JSON.stringify(r), 'errs', JSON.stringify(errs));
await b.close();
